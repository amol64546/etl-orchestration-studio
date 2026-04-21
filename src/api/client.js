import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8080',
  // baseURL: 'https://seatunnel-orchestrator-1-0-0.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token helpers (must match App.jsx)
const TOKEN_KEY = 'jwt_token';
const REFRESH_KEY = 'refresh_token';
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function getRefreshToken() { return localStorage.getItem(REFRESH_KEY); }
function saveTokens(token, refreshToken) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}
function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// Add a response interceptor to handle token expiration
let isRefreshing = false;
let refreshSubscribers = [];
function subscribeTokenRefresh(cb) { refreshSubscribers.push(cb); }
function onRefreshed(token) { refreshSubscribers.forEach(cb => cb(token)); refreshSubscribers = []; }

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const res = await fetch(`http://localhost:8080/api/auth/refresh?refreshToken=${refreshToken}`, { method: 'POST' });
        if (!res.ok) throw new Error('Refresh failed');
        const data = await res.json();
        saveTokens(data.token, data.refreshToken);
        api.defaults.headers['Authorization'] = 'Bearer ' + data.token;
        onRefreshed(data.token);
        return api(originalRequest);
      } catch (err) {
        clearTokens();
        window.location.reload();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Attach token to all requests
api.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// Auth API helpers
export async function login(username, password) {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}
export async function refreshTokenApi(refreshToken) {
  const res = await fetch(`http://localhost:8080/api/auth/refresh?refreshToken=${refreshToken}`, { method: 'POST' });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json();
}

export const streamJobStatus = (jobId, signal) => {
  return fetch(`https://seatunnel-orchestrator-1-0-0.onrender.com/jobs/status/${jobId}/stream`, { signal });
};

export const fetchBrickById = (id) => {
  return api.get(`/connectors/${id}`).then(res => res.data);
};
export const fetchBricks = (page = 1, size = 10) =>
  api.get(`/connectors?page=${page - 1}&size=${size}`)
    .then(res => res.data);
export const createBrick = (data) => api.post('/connectors', data).then(res => res.data);
export const updateBrick = (id, data) => api.put(`/connectors/${id}`, data).then(res => res.data);
export const deleteBrick = (id) => api.delete(`/connectors/${id}`).then(res => res.data);

export const fetchPipelines = (page = 1, size = 10) =>
  api.get(`/pipelines?page=${page - 1}&size=${size}`)
    .then(res => res.data);
export const createPipeline = (data) => api.post('/pipelines', data).then(res => res.data);
export const deletePipeline = (id) => api.delete(`/pipelines/${id}`).then(res => res.data);
export const getPipelineById = (id) => api.get(`/pipelines/${id}`).then(res => res.data);

export const executePipelineWithEnv = (pipelineId, envConfig) =>
  api.post(`/pipelines/execute/${pipelineId}`, envConfig, { headers: { 'Content-Type': 'application/json' } }).then(res => res.data);
export const stopJob = (jobId, withSavePoint = false) => 
  api.post(`/jobs/stop/${jobId}?isStopWithSavePoint=${withSavePoint}`).then(res => res.data);
export const fetchJobById = (jobId) => api.get(`/jobs/${jobId}`).then(res => res.data);
export const fetchJobsByStatus = (status) => api.get(`/jobs?status=${status}`).then(res => res.data);
export const fetchJobsOverview = () => api.get('/jobs/overview').then(res => res.data);

export default api;
