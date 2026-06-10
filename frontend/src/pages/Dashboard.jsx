import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Gamepad2, CheckCircle, Database, Server } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 flex items-center space-x-4">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    availableAccounts: 0,
    claimedAccounts: 0,
    approvedServers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Accounts" value={stats.totalAccounts} icon={Database} colorClass="bg-blue-500" />
        <StatCard title="Available Accounts" value={stats.availableAccounts} icon={Gamepad2} colorClass="bg-green-500" />
        <StatCard title="Claimed Accounts" value={stats.claimedAccounts} icon={CheckCircle} colorClass="bg-purple-500" />
        <StatCard title="Approved Servers" value={stats.approvedServers} icon={Server} colorClass="bg-orange-500" />
      </div>
      
      {/* Could add charts or recent activity here in future */}
    </div>
  );
};

export default Dashboard;
