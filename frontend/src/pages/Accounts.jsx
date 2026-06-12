import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Plus, Trash2, Edit, Download, Upload } from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ gameName: '', username: '', password: '', imageUrl: '' });
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      const res = await api.get('/accounts/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "accounts_backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error('Failed to export', error);
      alert('Failed to export accounts');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await api.post('/accounts/import', json);
        alert('Accounts imported successfully!');
        fetchAccounts();
      } catch (error) {
        console.error('Failed to import', error);
        alert('Failed to import accounts. Ensure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input so same file can be selected again
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdd = () => {
    setEditId(null);
    setFormData({ gameName: '', username: '', password: '', imageUrl: '' });
    setShowModal(true);
  };

  const handleEdit = (acc) => {
    setEditId(acc._id);
    setFormData({ gameName: acc.gameName, username: acc.username, password: acc.password, imageUrl: acc.imageUrl || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/accounts/${editId}`, formData);
      } else {
        await api.post('/accounts', formData);
      }
      setShowModal(false);
      setFormData({ gameName: '', username: '', password: '', imageUrl: '' });
      setEditId(null);
      fetchAccounts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await api.delete(`/accounts/${id}`);
        fetchAccounts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Accounts</h1>
        <div className="flex space-x-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button
            onClick={handleAdd}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-900 border-b border-dark-700 text-gray-400">
              <th className="p-4 font-medium">Game</th>
              <th className="p-4 font-medium">Username</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-center">Total Claims</th>
              <th className="p-4 font-medium text-center">Reviews</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc._id} className="border-b border-dark-700 last:border-0 hover:bg-dark-700/50 transition-colors">
                <td className="p-4 text-white">{acc.gameName}</td>
                <td className="p-4 text-gray-300">{acc.username}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    acc.status === 'available' ? 'bg-green-500/10 text-green-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {acc.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-center text-white font-bold">{acc.totalClaims || 0}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <span className="text-green-400 font-medium">✅ {acc.working || 0}</span>
                    <span className="text-red-400 font-medium">❌ {acc.notWorking || 0}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleEdit(acc)} className="text-blue-500 hover:text-blue-400 p-2" title="Edit">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(acc._id)} className="text-red-500 hover:text-red-400 p-2" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {accounts.length === 0 && (
          <div className="p-8 text-center text-gray-500">No accounts found.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">{editId ? 'Edit Account' : 'Add New Account'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Game Name</label>
                <input required type="text" value={formData.gameName} onChange={e => setFormData({...formData, gameName: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Username / Email</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL (Optional)</label>
                <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white" />
              </div>
              <div className="flex space-x-4 mt-8">
                <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-lg">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
