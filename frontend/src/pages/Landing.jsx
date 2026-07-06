import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Users, MapPin, Trophy, ShieldAlert, Zap, Compass, DollarSign, Sparkles, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

const Landing = () => {
  const { user } = useContext(AuthContext);

  const pillars = [
    {
      title: 'Book Sports Turfs',
      desc: 'Lock in local grounds, select hour slots, and choose split-cost configurations instantly.',
      icon: <Calendar className="w-8 h-8 text-primary-500" />,
      link: '/matches',
      badge: 'Real-time Slots',
      color: 'border-primary-500/20 hover:border-primary-500/50'
    },
    {
      title: 'Recruit Missing Players',
      desc: 'Caption team incomplete? Recruit verified local public players based on AI skill ratings.',
      icon: <Users className="w-8 h-8 text-primary-400" />,
      link: '/dashboard',
      badge: 'AI Recruiting',
      color: 'border-primary-400/20 hover:border-primary-400/50'
    },
    {
      title: 'Dynamic Cost Splitting',
      desc: 'Automatic player shares calculations. Captains book, players join, and shares update instantly.',
      icon: <CreditCard className="w-8 h-8 text-moss-green" />,
      link: '/matches',
      badge: 'Safe Payments',
      color: 'border-moss-green/20 hover:border-moss-green/50'
    },
    {
      title: 'Player Trust Scores',
      desc: 'Attend games to boost scores. Avoid late cancellations to keep recruitment status active.',
      icon: <ShieldCheck className="w-8 h-8 text-primary-600" />,
      link: '/dashboard',
      badge: 'Verified Rep',
      color: 'border-primary-600/20 hover:border-primary-600/50'
    },
    {
      title: 'Explore Local Grounds',
      desc: 'Browse maps indicating nearby synthetic turfs, amenities, location coords, and pricing details.',
      icon: <Compass className="w-8 h-8 text-primary-500" />,
      link: '/matches',
      badge: 'Geo Search',
      color: 'border-primary-500/20 hover:border-primary-500/50'
    },
    {
      title: 'Urgent Match Alerts',
      desc: 'Fill slots in games reaching their booking deadlines soon to save cost split ratios.',
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      link: '/matches',
      badge: '🔥 Last Call',
      color: 'border-red-500/20 hover:border-red-500/50'
    },
  ];

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Glow Blobs (Matching user colors) */}
      <div className="glow-blob top-10 left-10 pulse-glow opacity-60"></div>
      <div className="glow-blob bottom-20 right-10 pulse-glow opacity-40" style={{ animationDelay: '-2s', background: 'radial-gradient(rgba(2, 99, 109, 0.3), transparent)' }}></div>

      {/* Hero Section */}
      <header className="relative pt-28 pb-16 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-[#C4B6B6]/30 dark:bg-primary-800 text-primary-850 dark:text-primary-200 border border-primary-200 dark:border-primary-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary-500 animate-pulse" />
              Next-Gen Turf Bookings & Player Recruitment
            </span>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-primary-950 dark:text-white">
              Recruit Players. <br />
              Book Turfs. <br />
              <span className="bg-gradient-to-r from-primary-500 via-[#02636D] to-[#63610C] bg-clip-text text-transparent">
                Split Booking Costs.
              </span>
            </h1>
            
            <p className="max-w-xl text-sm sm:text-base text-primary-400 dark:text-primary-100 leading-relaxed font-normal">
              TeamUp is the ultimate sports matchmaking playground. Seamlessly book turfs, recruit missing players for your squad, auto-calculate split cost shares, and handle cancellations easily.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto text-center btn-3d-glow bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  Enter Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto text-center btn-3d-glow bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    Join TeamUp Now <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto text-center bg-white/80 dark:bg-primary-800 hover:bg-white dark:hover:bg-primary-700 text-primary-400 dark:text-primary-100 border border-primary-200 dark:border-primary-700 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Gen Z 3D Interactive Device Frame Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[420px] lg:max-w-none">
              
              {/* 3D Perspective Card Shadow Wrapper */}
              <div className="relative rounded-[2.5rem] p-3 bg-gradient-to-tr from-[#02636D] to-[#0EA098] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-out preserve-3d">
                
                {/* Simulated Glass Screen */}
                <div className="bg-slate-900 rounded-[2.2rem] overflow-hidden border border-white/10 relative">
                  
                  {/* Generated turf visual */}
                  <img 
                    src="/hero_sports_turf.jpg" 
                    alt="Futuristic Neon Sports Arena Mockup"
                    className="w-full h-[460px] object-cover opacity-85"
                  />
                  
                  {/* Neon Color Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                  {/* Floating Interactive 3D Status Badges */}
                  <div className="absolute bottom-6 left-6 right-6 space-y-3 z-10">
                    
                    {/* Glass Booking Badge */}
                    <div className="glass-premium p-4 rounded-2xl border border-white/20 backdrop-blur-md flex items-center gap-3 transform -translate-y-1 hover:translate-y-0 transition-transform duration-300">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                        <Calendar className="w-5 h-5 text-primary-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Turf booking</p>
                        <p className="text-sm font-extrabold text-white">Play Arena (Koramangala)</p>
                      </div>
                      <span className="ml-auto text-xs font-bold text-primary-500 bg-primary-500/10 px-2 py-1 rounded-lg">6 Slots Left</span>
                    </div>

                    {/* Glass Cost Splitting Badge */}
                    <div className="glass-premium p-4 rounded-2xl border border-white/20 backdrop-blur-md flex items-center gap-3 transform translate-x-2 hover:translate-x-0 transition-transform duration-300">
                      <div className="w-10 h-10 rounded-xl bg-[#63610C]/20 flex items-center justify-center border border-[#63610C]/30">
                        <DollarSign className="w-5 h-5 text-[#C4B6B6]" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Captains Cost Splitting</p>
                        <p className="text-sm font-extrabold text-white">₹150 Per Player Share</p>
                      </div>
                      <span className="ml-auto text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">Auto Splitting</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Decorative elements behind the card */}
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#63610C] rounded-full blur-xl opacity-80 animate-bounce"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-500 rounded-full blur-2xl opacity-60"></div>
            </div>
          </div>

        </div>
      </header>

      {/* cost splitting display feature */}
      <section className="py-20 relative z-10 border-t border-primary-200/20 bg-primary-100/30 dark:bg-primary-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image in 3D frame */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="/turf_football.jpg" 
                alt="Close-up Soccer ball on premium turf"
                className="w-full h-[380px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-bold text-white bg-primary-500 px-3 py-1 rounded-full uppercase tracking-wider">Join instantly</span>
                <h4 className="text-xl font-black text-white mt-2">Recruit Players On The Go</h4>
                <p className="text-xs text-gray-305 mt-1">Keep track of your match participant count to share turf rents.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Feature List */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-950 dark:text-white">
              Dynamic Cost Splits & Easy Player Matching
            </h2>
            <p className="text-primary-400 dark:text-primary-100 text-sm sm:text-base leading-relaxed font-normal">
              Captains are no longer forced to bear 100% of turf booking fees. With TeamUp, cost splits are updated dynamically as soon as a player joins or leaves.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="glass-premium p-6 rounded-2xl border border-primary-200/20">
                <div className="text-primary-500 font-extrabold text-lg mb-2">💰 Auto Split calculations</div>
                <p className="text-xs text-primary-400 dark:text-primary-100">Rents adjust in real time as players join. Complete payment processing securely inside the app.</p>
              </div>
              <div className="glass-premium p-6 rounded-2xl border border-primary-200/20">
                <div className="text-primary-500 font-extrabold text-lg mb-2">⭐ Skill Recommendation</div>
                <p className="text-xs text-primary-400 dark:text-primary-100">Find the perfect teammate. Recommend players based on skill level matching, sports interest, and geolocation proximity.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Dynamic 3D Grid Panels */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black text-primary-950 dark:text-white">Platform Pillars</h2>
          <p className="text-primary-400 dark:text-primary-200 text-xs sm:text-sm max-w-lg mx-auto font-normal">
            Interactive tools tailored for turf recruitment, instant chat coordination, and ground reservation workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`card-3d glass-premium p-8 rounded-3xl block text-left relative overflow-hidden group border ${item.color} shadow-lg`}
            >
              {/* Badge */}
              <span className="absolute top-4 right-4 bg-primary-500/10 text-primary-600 dark:text-primary-300 text-[10px] font-extrabold py-0.5 px-2.5 rounded-full uppercase tracking-wider border border-primary-500/10">
                {item.badge}
              </span>

              {/* Icon Container */}
              <div className="p-4 bg-white/90 dark:bg-primary-900/60 rounded-2xl w-fit mb-6 shadow-sm border border-primary-100 dark:border-primary-800">
                {item.icon}
              </div>

              {/* Title & Desc */}
              <h3 className="text-lg font-black mb-2 text-primary-950 dark:text-white group-hover:text-primary-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-primary-400 dark:text-primary-150 text-xs leading-relaxed font-normal">
                {item.desc}
              </p>

              {/* Hover glow effect decoration */}
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            </Link>
          ))}
        </div>
      </main>

      {/* Developer Showcase Section */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="card-3d glass-premium p-8 sm:p-10 rounded-[2.5rem] border border-primary-200/30 flex flex-col md:flex-row items-center gap-8 shadow-xl">
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-primary-500 shadow-lg">
              <img 
                src="/sonu_saw.jpg" 
                alt="Sonu Saw - Developer & Designer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#63610C] text-[#C4B6B6] p-2.5 rounded-full shadow-md border border-white/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-center md:text-left space-y-3">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-300 bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/10">
              Lead Architect & Creator
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-primary-950 dark:text-white">Sonu Saw</h3>
            <p className="text-xs sm:text-sm text-primary-400 dark:text-primary-100 leading-relaxed font-normal">
              Designed and built the full-stack sports matchmaking architecture. Programmed the Spring Boot security controls, database schema, real-time cost-splitting booking system, and this custom 3D responsive UI.
            </p>
          </div>
        </div>
      </section>

      {/* Stats footer */}
      <footer className="py-12 bg-white/40 dark:bg-primary-950/40 border-t border-primary-200/20 backdrop-blur text-center text-xs text-primary-450 z-10 relative">
        <p className="font-semibold">&copy; 2026 TeamUp Inc. Designed & Developed by Sonu Saw.</p>
      </footer>
    </div>
  );
};

export default Landing;
