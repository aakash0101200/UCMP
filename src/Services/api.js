import axios from 'axios';
import { toast } from 'react-toastify';
import * as mocks from './demoMocks';

// api.js for Vite
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Manually sets the authorization header for the API instance.
 * @param {string | null} token The JWT token to set, or null to remove it.
 */
export const setAuthHeader = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// Automatically attach token if available on every request, and apply Demo Mode adapter if active
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Check if current session is Demo Mode, OR if the request is a login attempt for a demo user
  const collegeId = localStorage.getItem("collegeId") || "";
  
  // Safe helper to extract login body collegeId
  let isDemoLogin = false;
  if (config.url && config.url.includes("/auth/login") && config.data) {
    try {
      const parsedData = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
      if (parsedData.collegeId && parsedData.collegeId.toUpperCase().startsWith("DEMO_")) {
        isDemoLogin = true;
      }
    } catch (e) {
      // Ignored
    }
  }

  const isDemo = collegeId.toUpperCase().startsWith("DEMO_") || isDemoLogin;

  if (isDemo) {
    // Override Axios default adapter to mock responses locally
    config.adapter = async (cfg) => {
      const url = cfg.url || "";
      const method = (cfg.method || "GET").toUpperCase();
      
      // Determine the relative path of the endpoint
      let path = url;
      if (url.startsWith("http")) {
        try {
          const urlObj = new URL(url);
          path = urlObj.pathname;
        } catch (e) {
          console.error("Invalid URL in adapter:", url);
        }
      }
      
      // Strip base prefix if it is there
      if (path.startsWith("/api")) {
        path = path.slice(4);
      }

      console.log(`[Demo Adapter Interceptor] ${method} ${path}`);

      let data = null;
      let status = 200;

      if (path.startsWith("/auth/login")) {
        let reqData = {};
        if (cfg.data) {
          try {
            reqData = typeof cfg.data === "string" ? JSON.parse(cfg.data) : cfg.data;
          } catch (e) {
            reqData = {};
          }
        }
        const loginCollegeId = reqData.collegeId || "DEMO_STUDENT";
        let role = "STUDENT";
        if (loginCollegeId.toUpperCase().includes("ADMIN")) role = "ADMIN";
        else if (loginCollegeId.toUpperCase().includes("FACULTY") || loginCollegeId.toUpperCase().includes("CLG00")) role = "FACULTY";

        data = {
          token: "demo-mock-jwt-token-xyz",
          profile: {
            collegeId: loginCollegeId,
            name: role === "ADMIN" ? "Demo Admin" : (role === "FACULTY" ? "Demo Faculty" : "Demo Student"),
            email: `${role.toLowerCase()}@demo.ucmp.edu`,
            roles: [role]
          }
        };
      } else if (method === "GET") {
        if (path.startsWith("/admin/users")) {
          data = mocks.mockUsersData.data;
        } else if (path.startsWith("/admin/stats")) {
          data = mocks.mockStatsData.data;
        } else if (path.startsWith("/profile")) {
          const params = new URLSearchParams(path.split("?")[1] || "");
          const paramCollegeId = params.get("collegeId") || collegeId;
          data = mocks.mockProfileData(paramCollegeId).data;
        } else if (path.startsWith("/timetable/metrics")) {
          data = mocks.mockTimetableMetrics.data;
        } else if (path.startsWith("/timetable/terms")) {
          data = ["2026-Spring", "2025-Fall"];
        } else if (path.startsWith("/rooms")) {
          data = mocks.mockRooms.data;
        } else if (path.startsWith("/subjects")) {
          data = mocks.mockSubjects.data;
        } else if (path.startsWith("/sections")) {
          data = mocks.mockSections.data;
        } else if (path.startsWith("/batches")) {
          data = mocks.mockBatches.data;
        } else if (path.startsWith("/announcements")) {
          data = mocks.mockAnnouncements.data;
        } else if (path.includes("/resolved") || path.startsWith("/timetable/section") || path.startsWith("/timetable/faculty") || path.startsWith("/timetable/room")) {
          data = mocks.mockScheduleData.data;
        } else if (path.startsWith("/timetable/assignment")) {
          data = mocks.mockAssignments.data;
        } else if (path.startsWith("/attendance/my-summary")) {
          data = mocks.mockAttendanceSummary.data;
        } else if (path.startsWith("/attendance/my-history")) {
          data = mocks.mockAttendanceHistory.data;
        } else if (path.startsWith("/attendance/active-session")) {
          data = null;
        }
      } else {
        // Any mutating actions (POST, PUT, DELETE, PATCH)
        status = 403;
        data = { error: "Demo Mode: Database modifications are disabled." };
        toast.error("Demo Mode: Database modifications and writes are disabled.");
      }

      // Return a standard Axios response object
      return {
        data,
        status,
        statusText: status === 200 ? "OK" : "Forbidden",
        headers: {},
        config: cfg,
        request: {}
      };
    };
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;