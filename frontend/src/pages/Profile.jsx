import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { User, MapPin, Compass, ShieldCheck, Mail, Save, Plus, Trash2, Award, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    locationName: '',
    latitude: 12.9716,
    longitude: 77.5946,
    bio: '',
    profilePictureUrl: '',
  });

  const [sportsList] = useState([
    { id: 1, name: 'Football' },
    { id: 2, name: 'Basketball' },
    { id: 3, name: 'Cricket' },
    { id: 4, name: 'Badminton' },
    { id: 5, name: 'Tennis' },
  ]);

  const [mySports, setMySports] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState(1);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('INTERMEDIATE');

  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        age: user.age || '',
        locationName: user.locationName || '',
        latitude: user.latitude || 12.9716,
        longitude: user.longitude || 77.5946,
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || '',
      });
      // Load current interests
      if (user.sportsInterests) {
        setMySports(user.sportsInterests);
      }
    }
  }, [user]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfileData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationName: 'Detected Location',
        }));
        setLocating(false);
      },
      (err) => {
        setError('Unable to detect location. Standard coordinates set.');
        setLocating(false);
      }
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({
        ...profileData,
        age: profileData.age ? parseInt(profileData.age, 10) : null,
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSport = async () => {
    setError('');
    setSuccess('');

    // Avoid duplicate sport entries
    const exists = mySports.some((s) => s.sport.id === parseInt(selectedSportId, 10));
    if (exists) {
      setError('You have already added this sport to your profile.');
      return;
    }

    const matchedSportObj = sportsList.find((s) => s.id === parseInt(selectedSportId, 10));
    const newInterest = {
      sport: matchedSportObj,
      skillLevel: selectedSkillLevel,
    };

    const updatedInterests = [...mySports, newInterest];
    setMySports(updatedInterests);

    // Save interest directly to backend
    await saveSportsToBackend(updatedInterests);
  };

  const handleDeleteSport = async (sportId) => {
    setError('');
    setSuccess('');

    const updatedInterests = mySports.filter((s) => s.sport.id !== sportId);
    setMySports(updatedInterests);

    await saveSportsToBackend(updatedInterests);
  };

  const saveSportsToBackend = async (interests) => {
    try {
      const payload = interests.map((s) => ({
        sportId: s.sport.id,
        skillLevel: s.skillLevel,
      }));
      await API.put('/api/users/sports', payload);
      setSuccess('Sports interests updated!');
    } catch (err) {
      setError('Failed to sync sports interests with server.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize your bio, location info, and preferred sport skill levels.
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Edit text details */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-black text-lg mb-6 flex items-center">
            <User className="w-5 h-5 text-primary-500 mr-2" />
            General Profile Information
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                  className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                Home Address / Location Name
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={profileData.locationName}
                  onChange={(e) => setProfileData({ ...profileData, locationName: e.target.value })}
                  className="block w-full flex-grow py-2.5 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Koramangala, Bangalore"
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="bg-primary-50 dark:bg-slate-700 hover:bg-primary-100 text-primary-700 dark:text-primary-400 px-4 rounded-xl border border-primary-200 dark:border-slate-600 flex items-center space-x-1 text-sm font-semibold"
                >
                  <Compass className="w-4 h-4" />
                  <span>{locating ? 'Locating...' : 'Detect'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  readOnly
                  value={profileData.latitude}
                  className="block w-full py-2.5 px-3 bg-gray-100 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  readOnly
                  value={profileData.longitude}
                  className="block w-full py-2.5 px-3 bg-gray-100 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                Profile Picture URL
              </label>
              <input
                type="text"
                value={profileData.profilePictureUrl}
                onChange={(e) => setProfileData({ ...profileData, profilePictureUrl: e.target.value })}
                className="block w-full py-2.5 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Link to hosted image"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                Short Bio / Pitch
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows="4"
                className="block w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="What sports are you down to play?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-6 rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Manage Sports Interests */}
        <div className="space-y-6">
          
          {/* Interests Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-lg mb-6 flex items-center">
              <Award className="w-5 h-5 text-indigo-500 mr-2" />
              Sports Interests
            </h3>

            {/* Form to add interest */}
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700/80">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Select Sport
                </label>
                <select
                  value={selectedSportId}
                  onChange={(e) => setSelectedSportId(e.target.value)}
                  className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  {sportsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Skill Level
                </label>
                <select
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  className="block w-full py-2 px-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <button
                onClick={handleAddSport}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sport interest</span>
              </button>
            </div>

            {/* List of active interests */}
            <div className="space-y-3">
              {mySports.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No sports listed. Add your favorite sports above!</p>
              ) : (
                mySports.map((interest, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl">
                    <div>
                      <span className="font-bold text-sm text-gray-800 dark:text-slate-200 block">
                        {interest.sport.name}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        {interest.skillLevel}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteSport(interest.sport.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                      title="Remove sport"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trust Score Card */}
          {user && user.role === 'USER' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-black text-lg mb-6 flex items-center">
                <ShieldCheck className="w-5 h-5 text-indigo-500 mr-2" />
                Player Trust Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Attendance Rate</span>
                    <span>{user.attendancePercentage || 100}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${user.attendancePercentage || 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Cancellation Rate</span>
                    <span>{user.cancellationPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${user.cancellationPercentage || 0}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center pt-3 border-t border-gray-100 dark:border-slate-700/80">
                  <div>
                    <span className="text-lg font-black text-gray-800 dark:text-slate-100 block">
                      {user.matchesPlayed || 0}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-gray-400">Matches Played</span>
                  </div>
                  <div>
                    <span className="text-lg font-black text-yellow-500 block">
                      {user.sportsmanshipRating || 5.0}★
                    </span>
                    <span className="text-[9px] uppercase font-bold text-gray-400">Sportsmanship</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
