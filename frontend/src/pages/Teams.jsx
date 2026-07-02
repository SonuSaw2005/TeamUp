import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Plus, Users, Shield, ArrowRight, UserCheck, LogOut, AlertCircle, X } from 'lucide-react';

const Teams = () => {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [sports] = useState([
    { id: 1, name: 'Football' },
    { id: 2, name: 'Basketball' },
    { id: 3, name: 'Cricket' },
    { id: 4, name: 'Badminton' },
    { id: 5, name: 'Tennis' },
  ]);

  // Create Team Modal
  const [showModal, setShowModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    sportId: 1,
  });

  // Team Details Modal (Member list)
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/teams');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await API.post('/api/teams', {
        ...newTeam,
        sportId: parseInt(newTeam.sportId, 10),
      });
      setSuccess('Team created successfully!');
      setShowModal(false);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team.');
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      await API.post(`/api/teams/${teamId}/join`);
      setSuccess('You joined the team!');
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join team.');
    }
  };

  const handleLeaveTeam = async (teamId) => {
    try {
      await API.post(`/api/teams/${teamId}/leave`);
      setSuccess('You left the team.');
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave team.');
    }
  };

  const handleViewMembers = async (team) => {
    try {
      const res = await API.get(`/api/teams/${team.id}/members`);
      setMembers(res.data);
      setSelectedTeam(team);
    } catch (err) {
      setError('Failed to fetch team members.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black">Sports Teams</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Build permanent sports clubs, recruit players, and challenge other teams.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-primary-600/20 transition flex items-center space-x-1.5"
        >
          <Plus className="w-5 h-5" />
          <span>Create Team</span>
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-xl flex items-center space-x-2 text-sm">
          <span className="material-icons text-green-500 text-base">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
          <p className="text-gray-500 dark:text-slate-400 mb-3">No teams created yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline"
          >
            Create the first team!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const isCaptain = team.creator.id === user.id;
            return (
              <div
                key={team.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition active-hover"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-primary-50 dark:bg-slate-900 text-primary-700 dark:text-primary-400 text-[10px] font-black py-1 px-2.5 rounded-full uppercase tracking-wider">
                      {team.sport.name}
                    </span>
                    {isCaptain && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-slate-900 px-2 py-0.5 rounded-full flex items-center">
                        <Shield className="w-3 h-3 mr-0.5" />
                        Captain
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-lg text-gray-800 dark:text-slate-200 mb-2 leading-tight">
                    {team.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-3 mb-6">
                    {team.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
                  <button
                    onClick={() => handleViewMembers(team)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center space-x-1"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Roster</span>
                  </button>

                  <div className="flex space-x-2">
                    {!isCaptain && (
                      <button
                        onClick={() => handleJoinTeam(team.id)}
                        className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition"
                      >
                        Join Team
                      </button>
                    )}
                    {isCaptain && (
                      <button
                        disabled
                        className="bg-slate-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400 font-semibold text-xs py-2 px-4 rounded-xl cursor-not-allowed"
                      >
                        Owner
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden relative p-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black mb-1">Create Team</h2>
            <p className="text-xs text-gray-500 mb-6">Form a sports group and recruit local players.</p>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm"
                  placeholder="e.g. Bangalore Strikers"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Description
                </label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm"
                  placeholder="Tell players about your team rules or schedules"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Sport Type
                </label>
                <select
                  value={newTeam.sportId}
                  onChange={(e) => setNewTeam({ ...newTeam, sportId: e.target.value })}
                  className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-xl shadow transition"
              >
                Assemble Team
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Team Roster Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden relative p-8">
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black mb-1">{selectedTeam.name} Roster</h2>
            <p className="text-xs text-gray-500 mb-6">List of registered members for this club.</p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {members.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No players in this roster yet.</p>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-slate-700 flex items-center justify-center text-primary-700 font-bold text-sm">
                        {m.user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-800 dark:text-slate-200 block">{m.user.name}</span>
                        <span className="text-[10px] text-gray-400 capitalize">{m.role}</span>
                      </div>
                    </div>

                    {m.role === 'CREATOR' && (
                      <span className="bg-indigo-50 dark:bg-slate-850 text-indigo-600 text-[10px] font-bold py-1 px-2.5 rounded-full flex items-center">
                        <Shield className="w-3.5 h-3.5 mr-1" />
                        Captain
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Leave Team option */}
            {members.some(m => m.user.id === user.id && m.role !== 'CREATOR') && (
              <button
                onClick={() => {
                  handleLeaveTeam(selectedTeam.id);
                  setSelectedTeam(null);
                }}
                className="mt-6 w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl border border-red-200 transition flex items-center justify-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Team</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
