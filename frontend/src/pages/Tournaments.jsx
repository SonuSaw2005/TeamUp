import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Trophy, Shield, Plus, Award, Calendar, Edit3, X, AlertCircle } from 'lucide-react';

const Tournaments = () => {
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTourney, setSelectedTourney] = useState(null);
  const [bracket, setBracket] = useState([]);
  const [sports] = useState([
    { id: 1, name: 'Football' },
    { id: 2, name: 'Basketball' },
    { id: 3, name: 'Cricket' },
    { id: 4, name: 'Badminton' },
    { id: 5, name: 'Tennis' },
  ]);

  // Create Tourney Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTourney, setNewTourney] = useState({
    name: '',
    description: '',
    sportId: 1,
  });

  // Score update state
  const [scoreUpdateMatch, setScoreUpdateMatch] = useState(null);
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/tournaments');
      setTournaments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTourney = async (tourney) => {
    try {
      setSelectedTourney(tourney);
      const res = await API.get(`/api/tournaments/${tourney.id}/bracket`);
      setBracket(res.data);
    } catch (err) {
      setError('Unable to load bracket tree.');
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await API.post('/api/tournaments', {
        ...newTourney,
        sportId: parseInt(newTourney.sportId, 10),
      });
      setSuccess('Tournament created successfully!');
      setShowCreateModal(false);
      fetchTournaments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tournament.');
    }
  };

  const handleOpenScoreModal = (tMatch) => {
    setScoreUpdateMatch(tMatch);
    setScoreHome(tMatch.scoreHome);
    setScoreAway(tMatch.scoreAway);
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/api/tournaments/match/${scoreUpdateMatch.id}/score`, {
        scoreHome: parseInt(scoreHome, 10),
        scoreAway: parseInt(scoreAway, 10),
        completed: true,
      });
      setSuccess('Score recorded and brackets updated!');
      setScoreUpdateMatch(null);
      // Reload bracket
      handleSelectTourney(selectedTourney);
    } catch (err) {
      setError('Could not update match scores.');
    }
  };

  // Group bracket matches by round for bracket tree view
  const roundsMap = bracket.reduce((acc, match) => {
    const r = match.round;
    if (!acc[r]) acc[r] = [];
    acc[r].push(match);
    return acc;
  }, {});

  const roundsKeys = Object.keys(roundsMap).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const getRoundName = (roundNum, totalRounds) => {
    const r = parseInt(roundNum, 10);
    if (r === totalRounds) return 'Finals';
    if (r === totalRounds - 1) return 'Semifinals';
    if (r === totalRounds - 2) return 'Quarterfinals';
    return `Round ${r}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black">Tournaments</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Organize leagues, track knockouts, and display single-elimination brackets.
          </p>
        </div>
        
        {user.role === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-primary-600/20 transition flex items-center space-x-1.5"
          >
            <Plus className="w-5 h-5" />
            <span>Create Tournament</span>
          </button>
        )}
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

      {/* Main panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Tournament list */}
        <div className="space-y-4">
          <h2 className="font-black text-base uppercase tracking-wider text-gray-400">Leagues & Cups</h2>
          
          {loading && tournaments.length === 0 ? (
            <div className="py-6 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="p-6 bg-white dark:bg-slate-800 text-center text-xs text-gray-400 rounded-2xl border border-gray-150">
              No tournaments running.
            </div>
          ) : (
            tournaments.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTourney(t)}
                className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
                  selectedTourney?.id === t.id
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 hover:border-primary-200 text-gray-800 dark:text-slate-100'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-black py-0.5 px-2 rounded-full uppercase ${
                    selectedTourney?.id === t.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 dark:bg-slate-900 text-gray-500'
                  }`}>
                    {t.sport.name}
                  </span>
                  <span className="text-[10px] font-bold uppercase">{t.status}</span>
                </div>
                <h3 className="font-extrabold text-base leading-tight mb-2">{t.name}</h3>
                <p className={`text-xs ${selectedTourney?.id === t.id ? 'text-gray-200' : 'text-gray-500 dark:text-slate-400'}`}>
                  {t.description || 'No description.'}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Bracket Tree visualizer */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm min-h-[400px]">
          {selectedTourney ? (
            <div>
              <div className="border-b border-gray-100 dark:border-slate-700/80 pb-4 mb-6">
                <h2 className="font-black text-xl flex items-center">
                  <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                  {selectedTourney.name} Bracket
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Single-elimination knockout standings. Select matches to update scores.
                </p>
              </div>

              {bracket.length === 0 ? (
                <div className="text-center py-16 text-xs text-gray-400">
                  No matches added to this tournament bracket yet.
                </div>
              ) : (
                <div className="flex flex-row overflow-x-auto gap-8 py-4">
                  {roundsKeys.map((roundKey) => {
                    const roundMatches = roundsMap[roundKey];
                    const roundName = getRoundName(roundKey, roundsKeys.length);
                    return (
                      <div key={roundKey} className="flex-1 min-w-[200px] flex flex-col justify-around">
                        <div className="text-center font-bold text-xs uppercase tracking-wider text-gray-400 mb-4 pb-2 border-b border-gray-100 dark:border-slate-700/30">
                          {roundName}
                        </div>

                        <div className="space-y-8 my-auto">
                          {roundMatches.map((m) => (
                            <div
                              key={m.id}
                              className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl relative shadow-sm hover:border-primary-400 transition"
                            >
                              {/* Participant 1 */}
                              <div className="flex justify-between items-center py-1 border-b border-gray-200/40 dark:border-slate-800/80 text-xs">
                                <span className="font-semibold truncate max-w-[120px]">
                                  {m.match.creator.name}
                                </span>
                                <span className="font-black font-mono text-primary-600">{m.scoreHome}</span>
                              </div>

                              {/* Participant 2 (Teammate / Challenger placeholder in mock context) */}
                              <div className="flex justify-between items-center py-1 text-xs">
                                <span className="text-gray-400 truncate max-w-[120px]">
                                  Challenger (TBD)
                                </span>
                                <span className="font-black font-mono text-primary-600">{m.scoreAway}</span>
                              </div>

                              {/* Edit scores trigger */}
                              {user.role === 'ADMIN' && m.match.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleOpenScoreModal(m)}
                                  className="absolute -top-2.5 -right-2.5 p-1 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow"
                                  title="Record Score"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-icons text-6xl text-gray-300 dark:text-slate-700 mb-3">bracket</span>
              <h3 className="font-bold text-sm text-gray-500">Select a Tournament</h3>
              <p className="text-xs text-gray-400 mt-1">Choose a tournament from the left panel to inspect bracket trees.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden p-8 relative">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black mb-1">Create Tournament</h2>
            <p className="text-xs text-gray-500 mb-6 font-semibold">Organize brackets and list matches.</p>

            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Tournament Name
                </label>
                <input
                  type="text"
                  required
                  value={newTourney.name}
                  onChange={(e) => setNewTourney({ ...newTourney, name: e.target.value })}
                  className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm"
                  placeholder="e.g. Summer Futsal Cup"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Description
                </label>
                <textarea
                  value={newTourney.description}
                  onChange={(e) => setNewTourney({ ...newTourney, description: e.target.value })}
                  className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm"
                  placeholder="Rules, dates, and schedule details"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  Sport Type
                </label>
                <select
                  value={newTourney.sportId}
                  onChange={(e) => setNewTourney({ ...newTourney, sportId: e.target.value })}
                  className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl shadow mt-6">
                Assemble Tournament
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Score Modal */}
      {scoreUpdateMatch && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden p-6 relative">
            <button onClick={() => setScoreUpdateMatch(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black mb-1">Record Match Score</h2>
            <p className="text-xs text-gray-500 mb-6">Update points and advance winning player/team.</p>

            <form onSubmit={handleUpdateScore} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-2 truncate">
                    {scoreUpdateMatch.match.creator.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={scoreHome}
                    onChange={(e) => setScoreHome(e.target.value)}
                    className="block w-full py-3 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-center font-bold font-mono text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-2">
                    Challenger
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={scoreAway}
                    onChange={(e) => setScoreAway(e.target.value)}
                    className="block w-full py-3 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-center font-bold font-mono text-lg"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl shadow mt-6">
                Record & Complete Match
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
