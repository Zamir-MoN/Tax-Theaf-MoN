import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Logs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/logs');
        setLogs(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">System Logs</h1>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-900 border-b border-dark-700 text-gray-400">
              <th className="p-4 font-medium">Time</th>
              <th className="p-4 font-medium">Action</th>
              <th className="p-4 font-medium">Details</th>
              <th className="p-4 font-medium">User/System</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} className="border-b border-dark-700 last:border-0 hover:bg-dark-700/50 transition-colors text-sm">
                <td className="p-4 text-gray-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-4">
                    <span className="px-2 py-1 rounded bg-dark-900 border border-dark-700 text-gray-300 font-mono text-xs">
                        {log.action}
                    </span>
                </td>
                <td className="p-4 text-white">{log.details}</td>
                <td className="p-4 text-gray-400 font-mono text-xs">{log.userId || 'SYSTEM'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="p-8 text-center text-gray-500">No logs found.</div>
        )}
      </div>
    </div>
  );
};

export default Logs;
