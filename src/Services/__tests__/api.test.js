import { describe, it, expect, beforeEach, vi } from 'vitest';

// Set up mock localStorage globally before importing api.js
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

// Import target file
import API, { setAuthHeader } from '../api';

describe('API Service (api.js)', () => {
  let mockNetworkAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    for (const k in localStorageStore) delete localStorageStore[k];
    
    // Setup a mock network adapter to intercept real HTTP calls
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

  describe('setAuthHeader', () => {
    it('should set Authorization header on defaults if token is provided', () => {
      setAuthHeader('test-jwt-token');
      expect(API.defaults.headers.common['Authorization']).toBe('Bearer test-jwt-token');
    });

    it('should delete Authorization header on defaults if token is null', () => {
      setAuthHeader(null);
      expect(API.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('Request Interceptor - Authorization Header Injection', () => {
    it('should attach token from localStorage if present', async () => {
      localStorage.setItem('token', 'local-storage-token');
      
      const response = await API.get('/test-endpoint');
      
      expect(response.config.headers.Authorization).toBe('Bearer local-storage-token');
      expect(mockNetworkAdapter).toHaveBeenCalled();
    });

    it('should not attach token if not present in localStorage', async () => {
      const response = await API.get('/test-endpoint');
      
      expect(response.config.headers.Authorization).toBeUndefined();
      expect(mockNetworkAdapter).toHaveBeenCalled();
    });
  });

  describe('Request Interceptor - Demo Mode Adapter', () => {
    it('should intercept and return mock data for DEMO_ login request', async () => {
      const response = await API.post('/auth/login', { collegeId: 'DEMO_STUDENT', password: 'password123' });
      
      expect(response.status).toBe(200);
      expect(response.data.token).toBe('demo-mock-jwt-token-xyz');
      expect(response.data.profile.roles).toContain('STUDENT');
      expect(mockNetworkAdapter).not.toHaveBeenCalled();
    });

    it('should intercept and return mock data for DEMO_ admin profile request', async () => {
      localStorage.setItem('collegeId', 'DEMO_ADMIN_001');
      
      const response = await API.get('/admin/users');
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(mockNetworkAdapter).not.toHaveBeenCalled();
    });

    it('should intercept and prevent mutating actions in Demo Mode returning 403 status', async () => {
      localStorage.setItem('collegeId', 'DEMO_STUDENT');
      
      const response = await API.post('/attendance/mark', { sessionId: 123, code: '123456' });
      
      expect(response.status).toBe(403);
      expect(response.data.error).toContain('disabled');
      expect(mockNetworkAdapter).not.toHaveBeenCalled();
    });
  });
});
