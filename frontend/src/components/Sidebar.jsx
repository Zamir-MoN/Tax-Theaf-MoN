import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Server, FileText, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Accounts', icon: Users, path: '/accounts' },
    { name: 'Guild Requests', icon: Server, path: '/guilds' },
    { name: 'Logs', icon: FileText, path: '/logs' },
  ];

  return (
    <div className="w-64 bg-dark-800 h-screen border-r border-dark-700 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-500 tracking-wider">GAME BOT</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-700">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
