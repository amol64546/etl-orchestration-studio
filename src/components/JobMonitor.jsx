import React, { useState, useEffect, useRef } from 'react';
import { fetchJobsByStatus, fetchJobsOverview, stopJob, fetchJobById } from '../api/client';

export default function JobMonitor() {
  const [jobs, setJobs] = useState([]);
  const [overview, setOverview] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [streamStatus, setStreamStatus] = useState('');
  const eventSourceRef = useRef(null);
  const [streamingJobId, setStreamingJobId] = useState(null);

  const loadData = async () => {
    try {
      const [runningJobs, overviewData] = await Promise.all([
        fetchJobsByStatus('RUNNING'),
        fetchJobsOverview()
      ]);
      setJobs(runningJobs);
      setOverview(overviewData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => {
      clearInterval(interval);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  const startStream = (jobId) => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    const es = new EventSource(`/api/jobs/${jobId}/stream`);
    eventSourceRef.current = es;
    setStreamingJobId(jobId);
    setStreamStatus('Connecting...');
    es.onmessage = (event) => {
      setStreamStatus(event.data);
      if (event.data === 'FINISHED' || event.data === 'CANCELLED' || event.data === 'FAILED') {
        es.close();
        loadData();
      }
    };
    es.onerror = () => {
      es.close();
      setStreamStatus('Stream disconnected');
    };
  };

  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setStreamingJobId(null);
      setStreamStatus('');
    }
  };

  const handleStopJob = async (jobId, withSavePoint = false) => {
    if (window.confirm(`Stop job ${jobId}?`)) {
      await stopJob(jobId, withSavePoint);
      alert('Stop request sent');
      loadData();
      if (streamingJobId === jobId) stopStream();
    }
  };

  const viewJobDetails = async (jobId) => {
    const details = await fetchJobById(jobId);
    setSelectedJob(details);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{overview.runningJobs || 0}</div>
          <div className="text-sm text-gray-500">Running</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{overview.finishedJobs || 0}</div>
          <div className="text-sm text-gray-500">Finished</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{overview.failedJobs || 0}</div>
          <div className="text-sm text-gray-500">Failed</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{overview.cancelledJobs || 0}</div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-xl font-semibold mb-3">📡 Running Jobs & Lifecycle</h2>
        {jobs.length === 0 ? <p className="text-gray-400">No running jobs.</p> : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.jobId} className="border rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-sm">{job.jobId}</div>
                  <div className="text-sm">{job.jobName} | <span className="text-green-600">{job.jobStatus}</span></div>
                  <div className="text-xs text-gray-400">Created: {job.createTime}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startStream(job.jobId)} className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm">📡 Stream Status</button>
                  <button onClick={() => viewJobDetails(job.jobId)} className="bg-gray-100 px-3 py-1 rounded text-sm">Details</button>
                  <button onClick={() => handleStopJob(job.jobId)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm">⏹️ Stop</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {streamingJobId && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex justify-between">
              <span className="font-medium">Live stream for job {streamingJobId}</span>
              <button onClick={stopStream} className="text-xs bg-gray-300 px-2 rounded">Close</button>
            </div>
            <div className="font-mono text-sm mt-1">Status: <span className="font-bold">{streamStatus}</span></div>
          </div>
        )}

        {selectedJob && (
          <div className="mt-5 p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between">
              <h3 className="font-bold">Job Details: {selectedJob.jobId}</h3>
              <button onClick={() => setSelectedJob(null)} className="text-xs">✖ Close</button>
            </div>
            <pre className="text-xs overflow-auto max-h-80 mt-2 p-2 bg-gray-900 text-gray-100 rounded">
              {JSON.stringify(selectedJob, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
