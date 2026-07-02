import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldAlert, Trash2, Edit3, Users, Calendar, Trophy, MapPin, X, AlertCircle } from 'lucide-react';

const Admin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    totalTeams: 0,
    totalGrounds: 0,
    activeOpenMatches: 0,
  });

  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  
  // Moderate Match Modal
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modDescription, setModDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchMatches();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await API.get('/api/matches');
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban and remove this user?')) return;
    try {
      await API.delete(`/api/admin/users/${userId}`);
      setSuccess('User has been banned.');
      fetchUsers();
      fetchStats();
    } catch (err) {
      setError('Could not ban user.');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    try {
      await API.delete(`/api/admin/matches/${matchId}`);
      setSuccess('Inappropriate match removed.');
      fetchMatches();
      fetchStats();
    } catch (err) {
      setError('Could not remove match.');
    }
  };

  const handleOpenModerate = (match) => {
    setSelectedMatch(match);
    setModDescription(match.description || '');
  };

  const handleModerateSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/api/admin/matches/${selectedMatch.id}/moderate`, {
        description: modDescription,
      });
      setSuccess('Match description moderated successfully!');
      setSelectedMatch(null);
      fetchMatches();
    } catch (err) {
      setError('Failed to moderate match.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-red-600 dark:text-red-500 flex items-center">
          <ShieldAlert className="w-8 h-8 mr-2" />
          Admin Moderation Panel
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor system metrics, review registered players, and moderate inappropriate match contents.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-xl flex items-center space-x-2 text-sm">
          <span className="material-icons text-green-500 text-base">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
          <Users className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">{stats.totalUsers}</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold">Total Players</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
          <Calendar className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">{stats.totalMatches}</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold">Total Matches</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
          <Trophy className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">{stats.totalTeams}</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold">Total Teams</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
          <MapPin className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">{stats.totalGrounds}</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold">Venues Registered</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm col-span-2 md:col-span-1 text-center">
          <span className="w-2.5 h-2.5 rounded-full bg-sports-green mx-auto mb-3.5 block animate-ping"></span>
          <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">{stats.activeOpenMatches}</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold">Active MatchRooms</span>
        </div>
      </div>

      {/* Tables Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Users Moderation */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <h3 className="font-black text-base mb-4">Player Directory Management</h3>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-500">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 font-semibold">{u.name}</td>
                    <td className="py-3 px-3 text-gray-500">{u.email}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold">{u.role}</td>
                    <td className="py-3 px-3 text-center">
                      {u.role !== 'ADMIN' ? (
                        <button
                          onClick={() => handleBanUser(u.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                          title="Ban User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-gray-400 font-bold text-[10px]">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Matches Moderation */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <h3 className="font-black text-base mb-4">Content Moderation (Match Postings)</h3>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-500">
                  <th className="py-2.5 px-3">Match Title</th>
                  <th className="py-2.5 px-3">Host</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 font-semibold truncate max-w-[140px]" title={m.title}>
                      {m.title}
                    </td>
                    <td className="py-3 px-3 text-gray-500">{m.creator.name}</td>
                    <td className="py-3 px-3 text-[10px] font-bold uppercase">{m.status}</td>
                    <td className="py-3 px-3 text-center space-x-1 flex justify-center">
                      <button
                        onClick={() => handleOpenModerate(m)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg transition"
                        title="Moderate Text"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(m.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                        title="Remove Match"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Moderate Description Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden p-6 relative">
            <button onClick={() => setSelectedMatch(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black mb-1">Moderate Match Details</h2>
            <p className="text-xs text-gray-500 mb-6">Modify descriptions flagging inappropriate contents.</p>

            <form onSubmit={handleModerateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  Match Title
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedMatch.title}
                  className="block w-full py-2 px-3 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  Edit Description
                </label>
                <textarea
                  value={modDescription}
                  onChange={(e) => setModDescription(e.target.value)}
                  rows="4"
                  required
                  className="block w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                  placeholder="Moderated match descriptions..."
                />
              </div>

              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl shadow mt-6">
                Apply Modifications
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
