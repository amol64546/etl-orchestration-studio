import React, { useEffect, useState } from 'react';
import { fetchJobById } from '../api/client';

export default function JobDetails({ jobId, onBack }) {
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollInterval = null;

    async function loadJobAndMaybePoll() {
      setLoading(true);
      try {
        const data = await fetchJobById(jobId);
        if (!isMounted) return;
        setJob(data);
        // If job is running, start polling
        if (data.jobStatus === 'RUNNING') {
          pollInterval = setInterval(async () => {
            try {
              const updated = await fetchJobById(jobId);
              if (!isMounted) return;
              setJob(updated);
              if (updated.jobStatus !== 'RUNNING') {
                clearInterval(pollInterval);
              }
            } catch {}
          }, 2000);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load job details');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadJobAndMaybePoll();
    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [jobId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!job) return null;

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow p-8 mt-8 text-left">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">← Back to Jobs</button>
      <h2 className="text-2xl font-bold mb-2">Job Details</h2>
      <div className="space-y-2">
        <div><b>Job ID:</b> {job.jobId}</div>
        <div><b>Name:</b> {job.jobName}</div>
        <div><b>Status:</b> {job.jobStatus}</div>
        <div><b>Created:</b> {job.createTime}</div>
        {job.finishTime && <div><b>Finish Time:</b> {job.finishTime}</div>}
        {job.completionTimeSec && <div><b>Completion Time (sec):</b> {job.completionTimeSec}</div>}
        <div><b>Pipeline ID:</b> {job.pipelineId}</div>
        {typeof job.stoppedWithSavePoint !== 'undefined' && (
          <div><b>Stopped With SavePoint:</b> {job.stoppedWithSavePoint ? 'Yes' : 'No'}</div>
        )}
      </div>

      {job.envOptions && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Environment Options</h3>
          <pre className="job-details-pre rounded p-2 text-xs overflow-x-auto">{JSON.stringify(job.envOptions, null, 2)}</pre>
        </div>
      )}

      {job.jobInstance && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Job Instance</h3>
          {job.jobInstance.env && (
            <div className="mb-2">
              <b>Env:</b>
              <pre className="job-details-pre rounded p-2 text-xs overflow-x-auto">{JSON.stringify(job.jobInstance.env, null, 2)}</pre>
            </div>
          )}
          {job.jobInstance.source && job.jobInstance.source.length > 0 && (
            <div className="mb-2">
              <b>Source:</b>
              <pre className="job-details-pre rounded p-2 text-xs overflow-x-auto">{JSON.stringify(job.jobInstance.source, null, 2)}</pre>
            </div>
          )}
          {job.jobInstance.sink && job.jobInstance.sink.length > 0 && (
            <div className="mb-2">
              <b>Sink:</b>
              <pre className="job-details-pre rounded p-2 text-xs overflow-x-auto">{JSON.stringify(job.jobInstance.sink, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {job.metrics && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Metrics</h3>
          <pre className="job-details-pre rounded p-2 text-xs overflow-x-auto">{JSON.stringify(job.metrics, null, 2)}</pre>
        </div>
      )}

      {job.jobDag && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Job DAG</h3>
          <div className="mb-2">
            <b>Vertex Info Map:</b>
            <pre className="job-details-pre rounded p-2 text-xs overflow-x-auto">{JSON.stringify(job.jobDag.vertexInfoMap, null, 2)}</pre>
          </div>
          <div className="mb-2">
            <b>Pipeline Edges:</b>
            <pre className="job-details-pre rounded p-2 text-xs overflow-x-auto">{JSON.stringify(job.jobDag.pipelineEdges, null, 2)}</pre>
          </div>
          <div className="mb-2">
            <b>Env Options:</b>
            <pre className="job-details-pre rounded p-2 text-xs overflow-x-auto">{JSON.stringify(job.jobDag.envOptions, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
