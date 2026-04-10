import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchBricks = () => api.get('/bricks').then(res => res.data.content || []);
export const createBrick = (data) => api.post('/bricks', data).then(res => res.data);
export const updateBrick = (id, data) => api.put(`/bricks/${id}`, data).then(res => res.data);
export const deleteBrick = (id) => api.delete(`/bricks/${id}`).then(res => res.data);

export const fetchPipelines = () => api.get('/pipelines').then(res => res.data.content || []);
export const createPipeline = (data) => api.post('/pipelines', data).then(res => res.data);
export const updatePipeline = (id, data) => api.put(`/pipelines/${id}`, data).then(res => res.data);
export const deletePipeline = (id) => api.delete(`/pipelines/${id}`).then(res => res.data);
export const getPipelineById = (id) => api.get(`/pipelines/${id}`).then(res => res.data);

export const executePipeline = (pipelineId, jobMode = 'BATCH') => 
  api.post(`/pipelines/execute/${pipelineId}`, { 'job.mode': jobMode }).then(res => res.data);
export const stopJob = (jobId, withSavePoint = false) => 
  api.post(`/jobs/stop/${jobId}?isStopWithSavePoint=${withSavePoint}`).then(res => res.data);
export const fetchJobById = (jobId) => api.get(`/jobs/${jobId}`).then(res => res.data);
export const fetchJobsByStatus = (status) => api.get(`/jobs?status=${status}`).then(res => res.data);
export const fetchJobsOverview = () => api.get('/jobs/overview').then(res => res.data);

export default api;
