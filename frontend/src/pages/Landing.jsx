import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Users, Trophy, MapPin, Zap, MessageSquare } from 'lucide-react';

const Landing = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <header className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary-900 via-slate-900 to-indigo-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 mb-6">
            <Zap className="w-3.5 h-3.5 mr-1 text-primary-400" />
            Connect, Play & Win
          </span>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6">
            Find Your Next Game on{' '}
            <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
              TeamUp
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10">
            The ultimate matchmaking and collaboration platform for local sports players. Create matches, form teams, explore sports grounds, and host competitive tournaments near you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 transition-all transform hover:-translate-y-0.5"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 transition-all transform hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Platform Statistics */}
      <section className="py-12 bg-white dark:bg-slate-800 border-y border-gray-100 dark:border-slate-800 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">10k+</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mt-1">Active Players</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">2,500+</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mt-1">Matches Played</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">450+</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mt-1">Sports Teams</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">150+</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mt-1">Sports Venues</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Everything You Need To Play</h2>
          <p className="max-w-2xl mx-auto text-gray-500 dark:text-slate-400">
            A comprehensive tool suite designed for sports match scheduling and team collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 active-hover">
            <div className="p-4 bg-primary-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400 rounded-xl w-fit mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Nearby Matches</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Browse matches scheduled near your location. Sort and filter by sport, date, time, and skill level to find your perfect game.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 active-hover">
            <div className="p-4 bg-primary-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400 rounded-xl w-fit mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Recommendations</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Let our recommendation algorithms discover compatible teammates matching your sports interests, skill levels, and geographical distance.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 active-hover">
            <div className="p-4 bg-primary-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400 rounded-xl w-fit mb-6">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Tournament Play</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Create leagues and manage tournament brackets. Advancing winners, log match scores, and track standings in real-time.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 active-hover">
            <div className="p-4 bg-primary-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400 rounded-xl w-fit mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time Group Chat</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Coordinate and chat with teammates directly inside match or team channels. Discuss game strategies and timing instantly.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 active-hover">
            <div className="p-4 bg-primary-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400 rounded-xl w-fit mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Reputation Ratings</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Maintain a safe, welcoming playing environment by reviewing teammates and leaving sportsmanship ratings after every completed match.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 active-hover">
            <div className="p-4 bg-primary-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400 rounded-xl w-fit mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Badges & Badging</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Unlock player achievements, badges (Rookie, Superstar, Veteran, Captain), and display your credentials proudly on your profile.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-extrabold text-white text-lg mb-2">TeamUp</p>
          <p className="text-sm">© {new Date().getFullYear()} TeamUp Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
