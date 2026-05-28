import { describe, it, expect, beforeEach, vi } from 'vitest';

// Set up mock localStorage globally before importing auth.js
const localStorageStore = {};
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn((key) => localStorageStore[key] || null),
    setItem: vi.fn((key, val) => { localStorageStore[key] = String(val); }),
    removeItem: vi.fn((key) => { delete localStorageStore[key]; }),
    clear: vi.fn(() => { for (const k in localStorageStore) delete localStorageStore[k]; })
  },
  writable: true
});

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
}));

import { toast } from 'react-toastify';

// Import target files
import API from '../api';
import { 
  login, 
  logout, 
  getActiveRole, 
  getAllRoles, 
  setActiveRole, 
  register, 
  adminCreateStudent, 
  adminCreateFaculty 
} from '../auth';

describe('Auth Service (auth.js)', () => {
  let mockNetworkAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    for (const k in localStorageStore) delete localStorageStore[k];
    
    mockNetworkAdapter = vi.fn().mockImplementation((config) => {
      return Promise.resolve({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });
    });
    API.defaults.adapter = mockNetworkAdapter;
  });

  describe('login', () => {
    it('should store credentials and set auth header on successful response', async () => {
      mockNetworkAdapter.mockImplementation((config) => {
        return Promise.resolve({
          data: {
            token: 'success-token-123',
            profile: {
              collegeId: 'USER_001',
              name: 'John Doe',
              email: 'john@ucmp.edu',
              roles: ['STUDENT']
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      });

      const role = await login('USER_001', 'password');

      expect(role).toBe('STUDENT');
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'success-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('collegeId', 'USER_001');
      expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'John Doe');
      expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', 'john@ucmp.edu');
      expect(localStorage.setItem).toHaveBeenCalledWith('activeRole', 'STUDENT');
      expect(API.defaults.headers.common['Authorization']).toBe('Bearer success-token-123');
      expect(toast.success).toHaveBeenCalled();
    });

    it('should fail and return null when token or profile is missing', async () => {
      mockNetworkAdapter.mockImplementation((config) => {
        return Promise.resolve({
          data: { success: true }, // missing token and profile
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      });

      const role = await login('USER_001', 'password');

      expect(role).toBeNull();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid response'));
    });

    it('should handle network errors during login', async () => {
      mockNetworkAdapter.mockImplementation(() => {
        return Promise.reject({
          message: 'Network Error',
          response: {
            data: { message: 'Invalid credentials' }
          }
        });
      });

      const role = await login('USER_001', 'wrong-pwd');

      expect(role).toBeNull();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid credentials'));
    });
  });

  describe('logout', () => {
    it('should clear authentication storage items and remove auth header', () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('activeRole', 'STUDENT');
      API.defaults.headers.common['Authorization'] = 'Bearer some-token';

      logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('activeRole');
      expect(localStorageStore['token']).toBeUndefined();
      expect(localStorageStore['activeRole']).toBeUndefined();
      expect(API.defaults.headers.common['Authorization']).toBeUndefined();
      expect(toast.info).toHaveBeenCalledWith('Logged out successfully.');
    });
  });

  describe('role state helpers', () => {
    it('should get and set active role', () => {
      setActiveRole('FACULTY');
      expect(localStorage.setItem).toHaveBeenCalledWith('activeRole', 'FACULTY');
      expect(getActiveRole()).toBe('FACULTY');
    });

    it('should parse and return all roles', () => {
      localStorage.setItem('allRoles', JSON.stringify(['STUDENT', 'FACULTY']));
      expect(getAllRoles()).toEqual(['STUDENT', 'FACULTY']);
    });

    it('should return empty array for all roles if store is empty', () => {
      expect(getAllRoles()).toEqual([]);
    });
  });

  describe('mutating auth actions', () => {
    it('should request register with properly formatted fields', async () => {
      await register({
        collegeId: 'NEW_USER',
        password: 'password',
        name: 'Jane Smith',
        email: 'jane@ucmp.edu',
        roles: ['student']
      });

      expect(mockNetworkAdapter).toHaveBeenCalled();
      const lastCallConfig = mockNetworkAdapter.mock.calls[0][0];
      expect(lastCallConfig.url).toContain('/auth/register');
      const body = JSON.parse(lastCallConfig.data);
      expect(body.roles).toEqual(['STUDENT']);
      expect(body.name).toBe('Jane Smith');
    });

    it('should request adminCreateStudent with formatted fields', async () => {
      await adminCreateStudent({
        collegeId: 'STU_999',
        name: 'Student Name',
        email: 'student@ucmp.edu',
        rollNumber: 'R123',
        year: '3',
        batchId: '10',
        sectionId: '20'
      });

      expect(mockNetworkAdapter).toHaveBeenCalled();
      const lastCallConfig = mockNetworkAdapter.mock.calls[0][0];
      expect(lastCallConfig.url).toContain('/admin/student');
      const body = JSON.parse(lastCallConfig.data);
      expect(body.year).toBe(3);
      expect(body.batchId).toBe(10);
      expect(body.sectionId).toBe(20);
    });

    it('should request adminCreateFaculty with formatted fields', async () => {
      await adminCreateFaculty({
        collegeId: 'FAC_888',
        name: 'Faculty Name',
        email: 'faculty@ucmp.edu',
        department: 'CS',
        designation: 'Professor',
        sectionIds: [1, 2, 3]
      });

      expect(mockNetworkAdapter).toHaveBeenCalled();
      const lastCallConfig = mockNetworkAdapter.mock.calls[0][0];
      expect(lastCallConfig.url).toContain('/admin/faculty');
      const body = JSON.parse(lastCallConfig.data);
      expect(body.department).toBe('CS');
      expect(body.sectionIds).toEqual([1, 2, 3]);
    });
  });
});
