import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import API from '../services/api';
import { Bell, Sun, Moon, LogOut, Shield, Menu, X, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Polling or refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/api/notifications/unread');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.post('/api/notifications/read-all');
      setNotifications([]);
      setShowNotifDropdown(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (notif) => {
    try {
      await API.post(`/api/notifications/${notif.id}/read`);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      setShowNotifDropdown(false);
      if (notif.linkUrl) {
        navigate(notif.linkUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="material-icons text-primary-600 dark:text-primary-400 text-3xl">sports_soccer</span>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
                TeamUp
              </span>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/dashboard')
                      ? 'bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400'
                      : 'text-gray-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/matches"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/matches')
                      ? 'bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400'
                      : 'text-gray-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400'
                  }`}
                >
                  Matches
                </Link>
                <Link
                  to="/teams"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/teams')
                      ? 'bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400'
                      : 'text-gray-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400'
                  }`}
                >
                  Teams
                </Link>
                <Link
                  to="/tournaments"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/tournaments')
                      ? 'bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400'
                      : 'text-gray-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400'
                  }`}
                >
                  Tournaments
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1 transition-all ${
                      isActive('/admin')
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                        : 'text-red-500 hover:text-red-600 dark:text-red-400/80 dark:hover:text-red-400'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 transition relative"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                        <span className="font-bold text-sm">Notifications</span>
                        {notifications.length > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500 dark:text-slate-400">
                            No unread notifications
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotifClick(n)}
                              className="p-3 border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition text-xs"
                            >
                              <p className="font-medium text-gray-800 dark:text-slate-200">{n.content}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-slate-700 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold border border-primary-200 dark:border-slate-600 overflow-hidden">
                    {user.profilePictureUrl ? (
                      <img src={user.profilePictureUrl} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-semibold max-w-[100px] truncate">{user.name}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="hidden md:flex items-center space-x-1 p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 font-semibold text-sm px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/matches"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Matches
              </Link>
              <Link
                to="/teams"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Teams
              </Link>
              <Link
                to="/tournaments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Tournaments
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Profile
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-base font-semibold"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-primary-600 text-white px-4 py-2 rounded-lg text-base font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
