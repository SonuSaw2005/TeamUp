import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Trophy, Calendar, Users, MapPin, Star, AlertCircle, ArrowRight, ShieldCheck, DollarSign, Percent, Ban, Check, X, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Player Dashboard States
  const [recommendations, setRecommendations] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Ground Owner Dashboard States
  const [ownerStats, setOwnerStats] = useState({
    todayBookings: 0,
    upcomingBookings: 0,
    revenue: 0.0,
    cancelledBookings: 0,
    occupancyRate: 0.0,
  });
  const [ownerBookings, setOwnerBookings] = useState([]);

  useEffect(() => {
    if (user) {
      if (user.role === 'OWNER') {
        fetchOwnerDashboardData();
      } else {
        fetchPlayerDashboardData();
      }
    }
  }, [user]);

  const fetchPlayerDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const recsRes = await API.get('/api/users/recommendations?limit=4');
      setRecommendations(recsRes.data);

      const bookingsRes = await API.get('/api/bookings');
      setMyBookings(bookingsRes.data);

      const paymentsRes = await API.get('/api/bookings/payments');
      setPaymentHistory(paymentsRes.data);

      // Fetch matches and filter by user participation
      const matchesRes = await API.get('/api/matches');
      setMyMatches(matchesRes.data.filter((m) => m.creator.id === user.id));

    } catch (err) {
      setError('Unable to fetch dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const statsRes = await API.get('/api/owner/stats');
      setOwnerStats(statsRes.data);

      const bookingsRes = await API.get('/api/owner/bookings');
      setOwnerBookings(bookingsRes.data);
    } catch (err) {
      setError('Unable to fetch owner stats.');
    } finally {
      setLoading(false);
    }
  };

  const handleModerateBooking = async (bookingId, accept) => {
    try {
      const endpoint = accept ? 'accept' : 'reject';
      await API.post(`/api/owner/bookings/${bookingId}/${endpoint}`);
      fetchOwnerDashboardData();
    } catch (err) {
      setError('Could not moderate booking request.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // --- RENDER GROUND OWNER DASHBOARD ---
  if (user.role === 'OWNER') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-3xl p-8 mb-8 shadow-md">
          <h1 className="text-3xl font-extrabold mb-1">Turf Owner Dashboard</h1>
          <p className="text-emerald-100 text-sm">
            Manage slot schedules, approve game bookings, and monitor turf earnings.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-150 text-red-600 rounded-xl flex items-center space-x-2 text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <DollarSign className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">₹{ownerStats.revenue}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Total Earnings</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <Calendar className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">{ownerStats.todayBookings}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Today's Games</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <Clock className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">{ownerStats.upcomingBookings}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Upcoming Slots</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <Percent className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">{ownerStats.occupancyRate}%</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Occupancy Rate</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center col-span-2 md:col-span-1">
            <Ban className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <span className="text-2xl font-black text-gray-800 dark:text-slate-100 block">{ownerStats.cancelledBookings}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Cancelled Bookings</span>
          </div>
        </div>

        {/* Bookings Queue */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-black text-lg mb-6">Turf Booking Calendar & Approval Queue</h3>
          
          <div className="overflow-x-auto">
            {ownerBookings.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-12">No bookings placed for your turf slots.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 bg-gray-50 dark:bg-slate-900/50 text-gray-500">
                    <th className="py-2.5 px-3">Turf Ground</th>
                    <th className="py-2.5 px-3">Captain</th>
                    <th className="py-2.5 px-3">Date & Slot</th>
                    <th className="py-2.5 px-3">Match Type</th>
                    <th className="py-2.5 px-3">Cost Split</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerBookings.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-3 font-semibold">{b.ground.name}</td>
                      <td className="py-3 px-3">{b.captain.name}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold">{b.dateTime.split('T')[0]}</span> • {b.timeSlot} ({b.durationHours}h)
                      </td>
                      <td className="py-3 px-3 uppercase font-bold text-[10px] text-primary-600">{b.bookingType}</td>
                      <td className="py-3 px-3">₹{b.totalCost} ({b.splitCost ? 'Split Cost' : 'Full'})</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          b.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {b.status === 'PENDING' ? (
                          <div className="flex space-x-1.5 justify-center">
                            <button
                              onClick={() => handleModerateBooking(b.id, true)}
                              className="p-1 bg-green-500 hover:bg-green-600 text-white rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleModerateBooking(b.id, false)}
                              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-bold text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER PLAYER / CAPTAIN DASHBOARD ---
  const matchesPlayed = user.matchesPlayed || 0;
  const attRate = user.attendancePercentage || 100.0;
  const cancelRate = user.cancellationPercentage || 0.0;
  const sportsmanship = user.sportsmanshipRating || 5.0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-indigo-700 text-white rounded-3xl p-8 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_40%)]"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Hello, {user.name}!</h1>
            <p className="text-gray-200 max-w-xl">
              Ready to hit the field? Search for nearby grounds, book slots, recruit players, and coordinate matches.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex space-x-3">
            <Link
              to="/matches"
              className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition shadow"
            >
              Book Turf
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Player Trust Score details */}
        <div className="space-y-8">
          
          {/* Trust Score Panel */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-base mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 text-primary-500 mr-2" />
              Player Trust Score
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Attendance Rate</span>
                  <span className="text-primary-600">{attRate}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full rounded-full" style={{ width: `${attRate}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Cancellation Rate</span>
                  <span className="text-red-500">{cancelRate}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${cancelRate}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-gray-100 dark:border-slate-700">
                <div>
                  <span className="text-lg font-black text-gray-800 dark:text-slate-100 block">{matchesPlayed}</span>
                  <span className="text-[9px] uppercase font-bold text-gray-400">Games Played</span>
                </div>
                <div>
                  <span className="text-lg font-black text-yellow-500 block flex items-center justify-center">
                    {sportsmanship} <Star className="w-3.5 h-3.5 fill-current" />
                  </span>
                  <span className="text-[9px] uppercase font-bold text-gray-400">Sportsmanship</span>
                </div>
                <div>
                  <span className="text-lg font-black text-gray-800 dark:text-slate-100 block flex items-center justify-center">
                    {user.averageRating || 5.0} <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                  </span>
                  <span className="text-[9px] uppercase font-bold text-gray-400">Teammate Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-base mb-4 flex items-center">
              <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
              Achievements
            </h3>
            {user.badges && user.badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {user.badges.map((badge, i) => (
                  <div key={i} className="flex flex-col items-center p-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl">
                    <span className="material-icons text-2xl text-yellow-500">stars</span>
                    <span className="text-[10px] font-bold text-gray-800 dark:text-slate-200 mt-1 text-center truncate w-full">{badge}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Play matches and join bookings to unlock badges!</p>
            )}
          </div>

          {/* Booking History */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-base mb-4 flex items-center">
              <Calendar className="w-5 h-5 text-indigo-500 mr-2" />
              Booking & Slots History
            </h3>
            {myBookings.length > 0 ? (
              <div className="space-y-3">
                {myBookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 rounded-xl">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs">{b.ground.name}</span>
                      <span className="text-[9px] uppercase font-bold text-primary-500">{b.status}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1">{b.dateTime.split('T')[0]} • Slot: {b.timeSlot}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No turf slots scheduled yet.</p>
            )}
          </div>
        </div>

        {/* Middle and Right Column: AI recommendations + upcoming matches */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI recommendations */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-base flex items-center">
                <span className="material-icons text-primary-500 mr-2">psychology</span>
                AI Recommended Co-Players
              </h3>
              <span className="text-[10px] font-black uppercase text-primary-500 tracking-widest">Calculated Matches</span>
            </div>

            {recommendations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 dark:text-slate-400">
                No matching players found nearby. Add your sports interests in profile.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-slate-700 flex items-center justify-center text-primary-600 font-bold border border-primary-200">
                          {rec.user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-800 dark:text-slate-200">{rec.user.name}</h4>
                          <p className="text-[10px] text-gray-500 flex items-center mt-0.5">
                            <MapPin className="w-3.5 h-3.5 mr-0.5" />
                            {rec.distanceInKm} km away
                          </p>
                        </div>
                      </div>
                      <span className="bg-primary-500/10 text-primary-600 text-[10px] font-black py-1 px-2.5 rounded-full">
                        {Math.round(rec.matchScore * 100)}% Match
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {rec.user.sportsInterests && rec.user.sportsInterests.slice(0, 2).map((us, j) => (
                        <span key={j} className="bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold py-0.5 px-2 rounded-md">
                          {us.sport.name} • {us.skillLevel}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/40 dark:border-slate-800/80 flex justify-between items-center">
                      <span className="text-[10px] text-gray-400">Attendance: {rec.user.attendancePercentage || 100}%</span>
                      <span className="text-[10px] text-gray-400">Cancel Rate: {rec.user.cancellationPercentage || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment splitting history */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-base mb-6 flex items-center">
              <DollarSign className="w-5 h-5 text-emerald-500 mr-2" />
              Booking Payment Shares & Splits
            </h3>

            {paymentHistory.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No transaction splits recorded.</p>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 border border-gray-150 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-slate-200 block">Turf Match split share</span>
                      <span className="text-[10px] text-gray-400">{p.transactionId} • mode: {p.paymentMode}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-emerald-600 block">₹{p.amount}</span>
                      <span className={`text-[9px] font-bold ${
                        p.status === 'PAID' ? 'text-green-500' : 'text-red-500'
                      }`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
