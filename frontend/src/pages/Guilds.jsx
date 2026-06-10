import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Check, X, Trash2 } from 'lucide-react';

const Guilds = () => {
  const [guilds, setGuilds] = useState([]);

  const fetchGuilds = async () => {
    try {
      const res = await api.get('/guilds');
      setGuilds(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGuilds();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/guilds/${id}/approve`);
      fetchGuilds();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/guilds/${id}/reject`);
      fetchGuilds();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this guild record?')) {
      try {
        await api.delete(`/guilds/${id}`);
        fetchGuilds();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Guild Requests</h1>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-900 border-b border-dark-700 text-gray-400">
              <th className="p-4 font-medium">Server Name</th>
              <th className="p-4 font-medium">Server ID</th>
              <th className="p-4 font-medium">Setup Code</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guilds.map(guild => (
              <tr key={guild._id} className="border-b border-dark-700 last:border-0 hover:bg-dark-700/50 transition-colors">
                <td className="p-4 text-white font-medium">{guild.guildName}</td>
                <td className="p-4 text-gray-400 text-sm">{guild.guildId}</td>
                <td className="p-4 text-primary-400 font-mono">{guild.setupCode}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    guild.approved ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {guild.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end space-x-2">
                  {!guild.approved && (
                    <>
                      <button onClick={() => handleApprove(guild._id)} className="text-green-500 bg-green-500/10 hover:bg-green-500/20 p-2 rounded-lg transition-colors" title="Approve">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleReject(guild._id)} className="text-red-500 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-colors" title="Reject">
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(guild._id)} className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {guilds.length === 0 && (
          <div className="p-8 text-center text-gray-500">No guild requests found.</div>
        )}
      </div>
    </div>
  );
};

export default Guilds;
