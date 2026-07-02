import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import MapView from '../components/MapView';
import { Plus, Search, Calendar, MapPin, Users, Award, AlertCircle, Compass, X, CheckSquare, DollarSign, Clock, ShieldCheck } from 'lucide-react';

const BrowseMatches = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [sports] = useState([
    { id: 1, name: 'Football' },
    { id: 2, name: 'Basketball' },
    { id: 3, name: 'Cricket' },
    { id: 4, name: 'Badminton' },
    { id: 5, name: 'Tennis' },
  ]);

  // Filters
  const [sportId, setSportId] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [useLocationFilter, setUseLocationFilter] = useState(false);
  const [radius, setRadius] = useState(15);

  // Trust Score filters for Captains to vet listings
  const [minAttendance, setMinAttendance] = useState('');
  const [maxCancellation, setMaxCancellation] = useState('');

  // Create Turf Booking & Match Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedGround, setSelectedGround] = useState(null);
  
  const [newBooking, setNewBooking] = useState({
    groundId: 1,
    sportId: 1,
    dateTime: '',
    timeSlot: '17:00-18:00',
    durationHours: 1,
    bookingType: 'PUBLIC', // PRIVATE, PUBLIC, FRIENDS_FIRST (Mandatory)
    splitCost: false,
    minPlayers: 8,
    maxPlayers: 12,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMatches();
    fetchGrounds();
  }, [sportId, skillLevel, useLocationFilter, radius, minAttendance, maxCancellation]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      let url = '/api/matches?status=OPEN';
      if (sportId) url += `&sportId=${sportId}`;
      if (skillLevel) url += `&skillLevel=${skillLevel}`;

      if (useLocationFilter && user.latitude && user.longitude) {
        url += `&lat=${user.latitude}&lon=${user.longitude}&radius=${radius}`;
      }

      const res = await API.get(url);
      
      // Perform local client-side trust filters
      let filtered = res.data;
      if (minAttendance) {
        filtered = filtered.filter(m => (m.creator.attendancePercentage || 100) >= parseInt(minAttendance, 10));
      }
      if (maxCancellation) {
        filtered = filtered.filter(m => (m.creator.cancellationPercentage || 0) <= parseInt(maxCancellation, 10));
      }

      setMatches(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrounds = async () => {
    try {
      const res = await API.get('/api/grounds');
      setGrounds(res.data);
      if (res.data.length > 0) {
        setSelectedGround(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectGroundId = (gId) => {
    const ground = grounds.find(g => g.id === parseInt(gId, 10));
    setSelectedGround(ground);
    setNewBooking(prev => ({ ...prev, groundId: ground.id }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create Booking (this triggers match creation in backend if PUBLIC or FRIENDS_FIRST)
      await API.post('/api/bookings', {
        ...newBooking,
        groundId: parseInt(newBooking.groundId, 10),
        sportId: parseInt(newBooking.sportId, 10),
        durationHours: parseInt(newBooking.durationHours, 10),
        minPlayers: parseInt(newBooking.minPlayers, 10),
        maxPlayers: parseInt(newBooking.maxPlayers, 10),
      });

      setSuccess('Turf booked successfully! Match room created.');
      setShowModal(false);
      fetchMatches();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking slot conflicted or unauthorized.');
    }
  };

  const handleSelectGroundOnMap = (ground) => {
    setSelectedGround(ground);
    setNewBooking(prev => ({ ...prev, groundId: ground.id }));
    setSuccess(`Selected Ground Pin: ${ground.name}`);
  };

  // Cost splitting math
  const hourlyPrice = selectedGround?.hourlyPrice || 1200;
  const totalTurfCost = hourlyPrice * newBooking.durationHours;
  const estCostPerPlayer = newBooking.splitCost 
    ? Math.round(totalTurfCost / newBooking.maxPlayers) 
    : totalTurfCost;

  // Check if a match is urgent (starts in < 8 hours)
  const isUrgent = (matchTimeStr) => {
    const diff = new Date(matchTimeStr) - new Date();
    const hoursLeft = diff / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft < 8;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black">Turf Bookings & Recruitment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Book slots, split rates, recruit players, and coordinate matches.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-primary-600/20 transition flex items-center space-x-1.5"
        >
          <Plus className="w-5 h-5" />
          <span>Book Turf Slot</span>
        </button>
      </div>

      {/* Map View Integration */}
      <div className="mb-8">
        <h3 className="font-bold text-sm text-gray-700 dark:text-slate-300 mb-3 flex items-center">
          <Compass className="w-4.5 h-4.5 mr-1.5 text-primary-500" />
          Interactive Turf Map Finder
        </h3>
        <MapView 
          grounds={grounds} 
          onSelectGround={handleSelectGroundOnMap}
          height="320px" 
        />
      </div>

      {/* Filter panel with trust metrics */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm mb-8 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Search Filters</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Sport */}
          <div>
            <select
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
              className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="">All Sports</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Skill Level */}
          <div>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          {/* Captain Attendance Rate */}
          <div>
            <select
              value={minAttendance}
              onChange={(e) => setMinAttendance(e.target.value)}
              className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="">Min Captain Attendance</option>
              <option value="90">90% Attendance+</option>
              <option value="80">80% Attendance+</option>
              <option value="70">70% Attendance+</option>
            </select>
          </div>

          {/* Captain Cancellation Rate */}
          <div>
            <select
              value={maxCancellation}
              onChange={(e) => setMaxCancellation(e.target.value)}
              className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="">Max Captain Cancellations</option>
              <option value="5">5% Cancellations max</option>
              <option value="10">10% Cancellations max</option>
              <option value="20">20% Cancellations max</option>
            </select>
          </div>

          {/* Near Me */}
          <div>
            <button
              onClick={() => setUseLocationFilter(!useLocationFilter)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center space-x-1.5 ${
                useLocationFilter
                  ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                  : 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{useLocationFilter ? 'Radius Filter On' : 'Filter Near Me'}</span>
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 text-green-700 rounded-xl flex items-center space-x-2 text-sm">
          <span className="material-icons text-green-500 text-base">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {/* Matches Grid List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
          <p className="text-gray-500 mb-3">No active turf recruitment matches found.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-primary-600 font-bold hover:underline"
          >
            Create a slot booking first!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => {
            const urgent = isUrgent(match.dateTime);
            const privacy = match.booking?.bookingType || 'PUBLIC';
            return (
              <div
                key={match.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 shadow-sm flex flex-col justify-between hover:shadow-md transition active-hover"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-primary-50 dark:bg-slate-900 text-primary-700 dark:text-primary-400 text-[10px] font-black py-1 px-2.5 rounded-full uppercase tracking-wider">
                      {match.sport.name}
                    </span>
                    <div className="flex space-x-1.5">
                      {urgent && (
                        <span className="bg-red-100 text-red-700 text-[9px] font-black py-1 px-2 rounded-full flex items-center">
                          🔥 Urgent Match
                        </span>
                      )}
                      <span className="bg-slate-100 dark:bg-slate-900 text-gray-500 text-[9px] font-black py-1 px-2 rounded-full uppercase">
                        {privacy === 'FRIENDS_FIRST' ? '👥 Friends First' : '🌍 Public'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg text-gray-800 dark:text-slate-200 mb-2 leading-tight">
                    {match.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                    {match.description}
                  </p>

                  {/* Trust indicator */}
                  <div className="flex items-center space-x-1 mb-4 p-2 bg-gray-50 dark:bg-slate-900 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-gray-500">
                      Captain Attendance: <b className="text-gray-800 dark:text-slate-200">{match.creator.attendancePercentage || 100}%</b>
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 dark:border-slate-700/50 pt-4 text-xs text-gray-600 dark:text-slate-300">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{new Date(match.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{match.ground ? match.ground.name : 'Unknown Venue'}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Min/Max Players Required: {match.booking?.minPlayers || 8}/{match.maxPlayers}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Est cost share:</span>
                    <span className="font-black text-xs text-emerald-600">
                      {match.booking?.splitCost ? `₹${Math.round(match.booking.totalCost / match.maxPlayers)} / player` : 'Paid by Captain'}
                    </span>
                  </div>
                  <Link
                    to={`/matches/${match.id}`}
                    className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                  >
                    View Lobby
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Turf Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-150 dark:border-slate-700 overflow-hidden relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-black mb-1">Book a Turf Ground</h2>
              <p className="text-xs text-gray-500 mb-6 font-semibold">Select slots, pricing options, and recruitment rules.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 text-red-600 rounded-xl flex items-center space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5">
                      Ground / Turf
                    </label>
                    <select
                      value={newBooking.groundId}
                      onChange={(e) => handleSelectGroundId(e.target.value)}
                      className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      {grounds.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5">
                      Sport
                    </label>
                    <select
                      value={newBooking.sportId}
                      onChange={(e) => setNewBooking({ ...newBooking, sportId: e.target.value })}
                      className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      {sports.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5">
                      Date & Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newBooking.dateTime}
                      onChange={(e) => setNewBooking({ ...newBooking, dateTime: e.target.value })}
                      className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5">
                      Time Slot
                    </label>
                    <select
                      value={newBooking.timeSlot}
                      onChange={(e) => setNewBooking({ ...newBooking, timeSlot: e.target.value })}
                      className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      {selectedGround?.availableSlots.split(',').map((slot, k) => (
                        <option key={k} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5">
                      Duration (Hours)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="4"
                      value={newBooking.durationHours}
                      onChange={(e) => setNewBooking({ ...newBooking, durationHours: e.target.value })}
                      className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5">
                      Min Players
                    </label>
                    <input
                      type="number"
                      required
                      min="2"
                      value={newBooking.minPlayers}
                      onChange={(e) => setNewBooking({ ...newBooking, minPlayers: e.target.value })}
                      className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5">
                      Max Players
                    </label>
                    <input
                      type="number"
                      required
                      min="2"
                      value={newBooking.maxPlayers}
                      onChange={(e) => setNewBooking({ ...newBooking, maxPlayers: e.target.value })}
                      className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Match Type (Mandatory during booking) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5">
                    Match Booking Privacy
                  </label>
                  <select
                    value={newBooking.bookingType}
                    onChange={(e) => setNewBooking({ ...newBooking, bookingType: e.target.value })}
                    className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="PRIVATE">🔒 Private Match (Locked, hidden from feed)</option>
                    <option value="PUBLIC">🌍 Public Match (Visible to nearby players)</option>
                    <option value="FRIENDS_FIRST">👥 Friends First (Prioritizes friends before opening)</option>
                  </select>
                </div>

                {/* Cost Splitting Option */}
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase">
                      Cost Cost-Sharing Option
                    </label>
                    <input
                      type="checkbox"
                      checked={newBooking.splitCost}
                      onChange={(e) => setNewBooking({ ...newBooking, splitCost: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center mt-3 pt-3 border-t border-gray-200/40">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Total Turf Price</span>
                      <span className="font-bold text-sm text-gray-800 dark:text-slate-200">₹{totalTurfCost}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Estimated Share / Player</span>
                      <span className="font-black text-sm text-emerald-600">₹{estCostPerPlayer}</span>
                    </div>
                  </div>
                </div>

                {/* Cancellation policy read-only block */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 leading-relaxed">
                  <p className="font-bold flex items-center mb-0.5">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Turf Cancellation Policy
                  </p>
                  <p>{selectedGround?.cancellationPolicy}</p>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow transition text-xs"
                >
                  Pay ₹{newBooking.splitCost ? estCostPerPlayer : totalTurfCost} & Confirm Booking
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseMatches;
