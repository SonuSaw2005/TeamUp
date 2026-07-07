import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, KeyRound, User, MapPin, Compass, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    locationName: '',
    latitude: 17.6890, // Satara, Maharashtra default
    longitude: 73.9883,
    bio: '',
  });

  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationName: 'Detected Location',
        }));
        setLocating(false);
      },
      (err) => {
        setError('Unable to fetch your location. Using default coordinates.');
        setLocating(false);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        ...formData,
        age: parseInt(formData.age, 10),
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundImage: "url('/auth_bg.jpg')" }}
    >
      {/* Background Ambient Darkener Overlay */}
      <div className="absolute inset-0 bg-primary-950/45 backdrop-blur-[3px] z-0"></div>

      <div className="w-full max-w-lg glass-premium p-8 rounded-[2rem] shadow-2xl z-10 border border-white/15 dark:border-white/5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            Join TeamUp to discover games and build teams
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-start space-x-2 text-sm animate-pulse">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-center">
            <span className="material-icons text-4xl text-green-500 mb-2">check_circle</span>
            <h3 className="font-bold text-lg">Registration Successful!</h3>
            <p className="text-sm mt-2">
              A simulated verification link has been printed to the Spring Boot console.
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-4">
              Redirecting to login page shortly...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Age
                </label>
                <input
                  type="number"
                  required
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="25"
                  min="12"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {/* Geolocation Fields */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Home Location
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="locationName"
                    value={formData.locationName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Indiranagar, Bangalore"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="bg-primary-50 dark:bg-slate-700 hover:bg-primary-100 border border-primary-200 dark:border-slate-600 text-primary-700 dark:text-primary-400 px-4 rounded-xl flex items-center space-x-1 text-sm font-semibold disabled:opacity-50"
                >
                  <Compass className="w-4 h-4" />
                  <span>{locating ? 'Locating...' : 'Detect'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Short Bio / Pitch
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="block w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="What sports do you play? When are you free?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-3d-glow bg-primary-650 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up Now'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
