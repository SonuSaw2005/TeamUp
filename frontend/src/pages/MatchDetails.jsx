import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import ChatRoom from '../components/ChatRoom';
import { Calendar, MapPin, Users, Award, ShieldAlert, AlertCircle, Trash2, CheckCircle2, MessageSquare, Check, X, Clock, HelpCircle, DollarSign } from 'lucide-react';

const MatchDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [bookingPayments, setBookingPayments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ratings overlay
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratedUserId, setRatedUserId] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [sportsmanshipVal, setSportsmanshipVal] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchMatchDetails();
  }, [id]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      const matchRes = await API.get(`/api/matches/${id}`);
      setMatch(matchRes.data);

      const partsRes = await API.get(`/api/matches/${id}/participants`);
      setParticipants(partsRes.data);

      // Fetch payment shares if booking is attached
      if (matchRes.data.booking) {
        const payRes = await API.get(`/api/bookings/${matchRes.data.booking.id}/payments`);
        setBookingPayments(payRes.data);
      }
    } catch (err) {
      setError('Failed to fetch match room detail.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMatch = async () => {
    try {
      await API.post(`/api/matches/${id}/join`);
      setSuccess('Join request submitted to captain!');
      fetchMatchDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit join request.');
    }
  };

  const handleLeaveMatch = async () => {
    try {
      await API.post(`/api/matches/${id}/leave`);
      setSuccess('You left the match lobby.');
      fetchMatchDetails();
    } catch (err) {
      setError('Could not leave match.');
    }
  };

  const handleModerateParticipant = async (participantId, approve) => {
    try {
      await API.post(`/api/matches/${id}/approve/${participantId}?approve=${approve}`);
      setSuccess(approve ? 'Player approved!' : 'Join request rejected.');
      fetchMatchDetails();
    } catch (err) {
      setError('Moderation failed.');
    }
  };

  const handleCompleteMatch = async () => {
    try {
      await API.post(`/api/matches/${id}/complete`);
      setSuccess('Match marked as COMPLETED! Recalculating player stats.');
      fetchMatchDetails();
    } catch (err) {
      setError('Could not complete match.');
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this turf slot booking? All player shares will be automatically refunded.')) return;
    try {
      await API.post(`/api/bookings/${match.booking.id}/cancel`);
      setSuccess('Booking and match cancelled. Refunds dispatched.');
      fetchMatchDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel slot.');
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/ratings', {
        ratedId: parseInt(ratedUserId, 10),
        rating: parseInt(ratingVal, 10),
        sportsmanship: parseInt(sportsmanshipVal, 10),
        comment,
      });
      setSuccess('Teammate rating submitted!');
      setShowRatingModal(false);
      setComment('');
    } catch (err) {
      setError('Could not submit rating.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isHost = match.creator.id === user.id;
  const isApproved = participants.some((p) => p.user.id === user.id && p.status === 'APPROVED');
  const isPending = participants.some((p) => p.user.id === user.id && p.status === 'PENDING');

  const approvedList = participants.filter((p) => p.status === 'APPROVED');
  const pendingRequests = participants.filter((p) => p.status === 'PENDING');

  // Splitting calculations
  const booking = match.booking;
  const splitCostActive = booking?.splitCost || false;
  const costPerApprovedPlayer = splitCostActive && approvedList.length > 0
    ? Math.round(booking.totalCost / approvedList.length)
    : booking?.totalCost || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-primary-50 dark:bg-slate-900 text-primary-700 dark:text-primary-400 text-xs font-black py-1 px-3 rounded-full">
              {match.sport.name}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
              match.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              match.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {match.status}
            </span>
          </div>
          <h1 className="text-3xl font-black">{match.title}</h1>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            Host: <b className="text-gray-800 dark:text-slate-200 ml-1">{match.creator.name} (Attendance: {match.creator.attendancePercentage || 100}%)</b>
          </p>
        </div>

        {/* Action controls */}
        <div className="flex space-x-2">
          {match.status === 'OPEN' && !isHost && (
            <>
              {!isApproved && !isPending && (
                <button
                  onClick={handleJoinMatch}
                  className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow transition"
                >
                  Request to Join
                </button>
              )}
              {(isApproved || isPending) && (
                <button
                  onClick={handleLeaveMatch}
                  className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold py-2.5 px-5 rounded-xl border border-red-200 dark:border-red-900/30 hover:bg-red-100 transition"
                >
                  Leave Match
                </button>
              )}
            </>
          )}

          {isHost && match.status === 'OPEN' && (
            <div className="flex space-x-2">
              <button
                onClick={handleCompleteMatch}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-5 rounded-xl shadow transition flex items-center space-x-1"
              >
                <Check className="w-4.5 h-4.5" />
                <span>Complete Match</span>
              </button>
              {booking && (
                <button
                  onClick={handleCancelBooking}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-5 rounded-xl shadow transition flex items-center space-x-1"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 text-green-700 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 text-red-600 rounded-xl flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main split details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Match Info + Payments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Turf Slot information */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-lg mb-6 flex items-center">
              <MapPin className="w-5 h-5 text-primary-500 mr-2" />
              Turf Slot Booking Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Turf Location</span>
                <span className="font-bold text-sm text-gray-800 dark:text-slate-200">
                  {match.ground ? match.ground.name : 'Unknown ground'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Play Date & Slot</span>
                <span className="font-bold text-sm text-gray-800 dark:text-slate-200">
                  {new Date(match.dateTime).toLocaleDateString()} • {booking?.timeSlot || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Max Lobby Limit</span>
                <span className="font-bold text-sm text-gray-800 dark:text-slate-200">
                  {match.maxPlayers} players
                </span>
              </div>
            </div>

            {booking && (
              <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl">
                <h4 className="text-xs font-bold uppercase mb-2 tracking-wide text-gray-400">Turf Share Calculation</h4>
                
                <div className="flex justify-between items-center text-xs text-gray-700 dark:text-slate-300">
                  <span>Split cost among players:</span>
                  <span className="font-bold">{splitCostActive ? 'Active' : 'No (Captain Paid Full)'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center mt-3 pt-3 border-t border-gray-200/40">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Total Venue Booking Cost</span>
                    <span className="font-bold text-sm text-gray-800 dark:text-slate-200">₹{booking.totalCost}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Dynamic Split per Player</span>
                    <span className="font-black text-sm text-emerald-600">₹{costPerApprovedPlayer}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Shares list */}
          {splitCostActive && bookingPayments.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-150 dark:border-slate-850 shadow-sm">
              <h3 className="font-black text-base mb-4 flex items-center">
                <DollarSign className="w-5 h-5 text-emerald-500 mr-2" />
                Player Payments Splits & Statuses
              </h3>
              <div className="space-y-3">
                {bookingPayments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-slate-200 block">{p.user.name}</span>
                      <span className="text-[10px] text-gray-400">txn: {p.transactionId}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 block">₹{p.amount}</span>
                      <span className={`text-[9px] font-bold ${
                        p.status === 'PAID' ? 'text-green-500' : 'text-red-500'
                      }`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player list */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-lg mb-6 flex items-center">
              <Users className="w-5 h-5 text-indigo-500 mr-2" />
              Recruited Teammates ({approvedList.length}/{match.maxPlayers})
            </h3>
            
            <div className="space-y-3">
              {approvedList.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center font-bold text-indigo-700">
                      {p.user.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-sm block text-gray-800 dark:text-slate-200">{p.user.name}</span>
                      <span className="text-[9px] text-gray-400 font-semibold uppercase">
                        Attendance: {p.user.attendancePercentage || 100}% • Rating: {p.user.averageRating || 5.0}★
                      </span>
                    </div>
                  </div>

                  {match.status === 'COMPLETED' && isHost && p.user.id !== user.id && (
                    <button
                      onClick={() => {
                        setRatedUserId(p.user.id);
                        setShowRatingModal(true);
                      }}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs py-1.5 px-3 rounded-lg border border-indigo-200"
                    >
                      Rate Player
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Join requests queue for captain */}
          {isHost && pendingRequests.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm">
              <h3 className="font-black text-lg text-primary-600 mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Join Requests Queue
              </h3>
              
              <div className="space-y-3">
                {pendingRequests.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 rounded-2xl">
                    <div>
                      <span className="font-bold text-sm block text-gray-800 dark:text-slate-200">{p.user.name}</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                        Attendance: {p.user.attendancePercentage || 100}% • Cancellations: {p.user.cancellationPercentage || 0}%
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModerateParticipant(p.user.id, true)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold p-1.5 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleModerateParticipant(p.user.id, false)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold p-1.5 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chat Room */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-lg mb-6 flex items-center">
              <MessageSquare className="w-5 h-5 text-primary-500 mr-2" />
              Lobby Match Chat
            </h3>
            {isApproved || isHost ? (
              <ChatRoom matchId={id} />
            ) : (
              <p className="text-xs text-gray-400 text-center py-12">
                Join requests must be approved by host before joining match lobby chat.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Ratings Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden p-6 relative">
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black mb-6">Rate Participant</h2>

            <form onSubmit={handleRateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">
                  Teammate Rating (1-5)
                </label>
                <select
                  value={ratingVal}
                  onChange={(e) => setRatingVal(e.target.value)}
                  className="block w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                >
                  <option value="5">5 - Excellent Player</option>
                  <option value="4">4 - Good Playmaker</option>
                  <option value="3">3 - Decent</option>
                  <option value="2">2 - Poor Performance</option>
                  <option value="1">1 - Bad Play</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">
                  Sportsmanship Rating (1-5)
                </label>
                <select
                  value={sportsmanshipVal}
                  onChange={(e) => setSportsmanshipVal(e.target.value)}
                  className="block w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                >
                  <option value="5">5 - Extremely Friendly & Cooperative</option>
                  <option value="4">4 - Cooperative</option>
                  <option value="3">3 - Normal</option>
                  <option value="2">2 - Unfriendly</option>
                  <option value="1">1 - Hostile/Aggressive behavior</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">
                  Add Review Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                  className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  placeholder="Review comments..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow mt-6 text-xs"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;
