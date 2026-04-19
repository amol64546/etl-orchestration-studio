// Fetch connector details from port 8081 for editing pipeline


import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://seatunnel-orchestrator-1-0-0.onrender.com',
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
