
import React from 'react';
import { Event, Club } from '../../types';
import Footer from '../Footer';
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Calendar, 
  Users, 
  ChevronRight, 
  Code, 
  Cpu, 
  Activity, 
  CreditCard,
  Briefcase,
  Target,
  Sun,
  Moon
} from 'lucide-react';

interface Props {
  events: Event[];
  clubs: Club[];
  onLogin: () => void;
  onRegister: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenDeveloper?: () => void;
  onOpenProfile?: () => void;
  onNavigate?: (page: string) => void;
}

const LandingPage: React.FC<Props> = ({ events, clubs, onLogin, onRegister, isDarkMode, onToggleTheme, onOpenDeveloper, onOpenProfile, onNavigate }) => {
  const upcomingEvents = events
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Filter clubs that are actively recruiting
  const hiringClubs = clubs.filter(c => c.recruitmentActive);

  return (
    <div className={`min-h-screen font-sans selection:bg-[#0099FF] selection:text-white ${isDarkMode ? 'bg-[#02040a] text-white' : 'bg-[#F4F7FE] text-[#2B3674]'}`}>
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl border-b ${isDarkMode ? 'bg-[#02040a]/80 border-white/5' : 'bg-white/80 border-[#E9EDF7]'}`}>
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0099FF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0099FF]/30">
              <Zap size={20} className="fill-white" />
            </div>
            <span className="text-xl font-black tracking-tight">CCMS<span className="text-[#0099FF]">.IO</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
             <button 
                onClick={() => onNavigate && onNavigate('verify-cert')} 
                className="flex items-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 transition-all uppercase tracking-widest hover:text-[#0099FF]"
             >
               <ShieldCheck size={14} /> Verify Certificate
             </button>
             <button 
                onClick={onOpenProfile} 
                className="flex items-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 transition-all uppercase tracking-widest hover:text-[#0099FF]"
             >
               <Code size={14} /> Architected by Naman
             </button>
          </div>

          <div className="flex items-center gap-3">
            <button
                onClick={onToggleTheme}
                className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-[#2B3674] hover:bg-[#F4F7FE]'}`}
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={onLogin}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-[#2B3674] hover:bg-slate-300'}`}
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[#0099FF]/10 blur-[120px] rounded-full pointer-events-none opacity-60" />
        <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-[1200px] mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#0099FF]/30 bg-[#0099FF]/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0099FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0099FF]"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0099FF]">MITS Official Campus OS</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 animate-in fade-in zoom-in-95 duration-1000">
            The Future of <br/>
            <span className="text-[#0099FF]">Student Body.</span>
          </h1>
          
          <p className="text-lg md:text-2xl font-medium opacity-60 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Unified operations for 40+ clubs. Automated recruitment, blockchain certificates, and instant event ticketing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <button 
              onClick={onRegister}
              className="group px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
            >
              Launch Console <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('platform')}
              className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              System Specs
            </button>
          </div>
        </div>
      </section>

      {/* Active Recruitment Drives */}
      {hiringClubs.length > 0 && (
        <section className={`py-16 border-y ${isDarkMode ? 'bg-[#0099FF]/5 border-[#0099FF]/10' : 'bg-[#0099FF]/5 border-[#0099FF]/10'}`}>
          <div className="max-w-[1600px] mx-auto px-6">
            <div className="flex items-center gap-3 mb-10 justify-center">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0099FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0099FF]"></span>
               </span>
               <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-[#0099FF]">Live Recruitment Drives</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hiringClubs.map(club => (
                <div key={club.id} className={`group relative p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#0d121d] border-white/10 hover:border-[#0099FF]/50' : 'bg-white border-slate-200'}`}>
                   <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Target size={64} style={{ color: club.themeColor }} />
                   </div>
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ backgroundColor: club.themeColor }}>
                         {club.name[0]}
                      </div>
                      <div>
                         <h3 className="font-black text-lg leading-tight">{club.name}</h3>
                         <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{club.category} Wing</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                         {['Tech', 'Mgmt', 'Creative'].map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-wider opacity-70">
                               {tag}
                            </span>
                         ))}
                      </div>
                      <button 
                        onClick={onLogin}
                        className="w-full py-3 bg-[#0099FF] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#007ACC] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0099FF]/20"
                      >
                        <Briefcase size={14} /> Apply Now
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Active Club Marquee */}
      <section className={`py-12 border-b overflow-hidden ${isDarkMode ? 'bg-[#02040a] border-white/5' : 'bg-white border-slate-100'}`}>
         <div className="flex items-center justify-center gap-3 mb-8 opacity-40">
            <Globe size={16} />
            <p className="text-xs font-black uppercase tracking-[0.3em]">Powering {clubs.length} Student Communities</p>
         </div>
         <div className="relative flex overflow-x-hidden group">
            <div className="animate-marquee whitespace-nowrap flex gap-12 items-center">
               {[...clubs, ...clubs].map((club, i) => (
                  <div key={`${club.id}-${i}`} className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer px-4" onClick={() => onNavigate && onNavigate('clubs')}>
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: club.themeColor }}>
                        {club.name[0]}
                     </div>
                     <span className="text-lg font-black tracking-tight">{club.name}</span>
                  </div>
               ))}
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-12 items-center">
               {[...clubs, ...clubs].map((club, i) => (
                  <div key={`${club.id}-${i}-dup`} className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer px-4" onClick={() => onNavigate && onNavigate('clubs')}>
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: club.themeColor }}>
                        {club.name[0]}
                     </div>
                     <span className="text-lg font-black tracking-tight">{club.name}</span>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Bento Grid Features */}
      <section id="bento" className="py-24 px-6 relative">
        <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Large Card 1 */}
                <div 
                    onClick={() => onNavigate && onNavigate('clubs')}
                    className={`col-span-1 md:col-span-2 lg:col-span-2 row-span-2 rounded-[2.5rem] p-10 border relative overflow-hidden group cursor-pointer ${isDarkMode ? 'bg-[#0d121d] border-white/5 hover:border-white/20' : 'bg-white border-slate-200'} transition-all`}
                >
                    <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:opacity-20 transition-all duration-500">
                        <Globe size={300} className="text-[#0099FF]" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-[#0099FF] flex items-center justify-center text-white mb-6">
                                <Users size={24} />
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight mb-4">Centralized Registry</h3>
                            <p className="opacity-60 font-medium leading-relaxed max-w-sm">
                                A single source of truth for 40+ student organizations. Access memberships, history, and alumni networks in one unified interface.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0d121d] bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                        User
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs font-bold opacity-60">12k+ Active Students</div>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className={`col-span-1 md:col-span-1 lg:col-span-2 rounded-[2.5rem] p-8 border relative overflow-hidden group ${isDarkMode ? 'bg-[#0d121d] border-white/5' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">MITS-721</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-2">Verifiable Credentials</h3>
                    <p className="text-sm opacity-60 font-medium">Blockchain-backed certificates for every event participation.</p>
                </div>

                {/* Card 3 */}
                <div className={`col-span-1 rounded-[2.5rem] p-8 border relative overflow-hidden group ${isDarkMode ? 'bg-[#0d121d] border-white/5' : 'bg-white border-slate-200'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0099FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 rounded-xl bg-[#0099FF]/20 text-[#0099FF] flex items-center justify-center mb-6">
                        <CreditCard size={20} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-2">Zero-Fee UPI</h3>
                    <p className="text-sm opacity-60 font-medium">Direct student-to-club payments with automated reconciliation.</p>
                </div>

                {/* Card 4 */}
                <div 
                    onClick={() => onNavigate && onNavigate('live-feed')}
                    className={`col-span-1 rounded-[2.5rem] p-8 border relative overflow-hidden group cursor-pointer ${isDarkMode ? 'bg-[#0d121d] border-white/5 hover:border-white/20' : 'bg-white border-slate-200'}`}
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
                        <Activity size={20} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-2">Live Pulse</h3>
                    <p className="text-sm opacity-60 font-medium">Real-time campus activity tracking and analytics.</p>
                </div>

                {/* Wide Card 5 */}
                <div className={`col-span-1 md:col-span-3 lg:col-span-2 rounded-[2.5rem] p-8 border relative overflow-hidden flex flex-col justify-between group ${isDarkMode ? 'bg-[#0d121d] border-white/5' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight mb-2">Recruitment AI</h3>
                            <p className="opacity-60 font-medium max-w-xs text-sm">Automated resume screening and candidate ranking powered by Gemini 2.0.</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                            <Cpu size={24} />
                        </div>
                    </div>
                    <div className="mt-8 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-2/3 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Live Events Ticker */}
      <section className={`py-24 border-y ${isDarkMode ? 'bg-[#050914] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <span className="text-[#0099FF] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0099FF] animate-pulse" /> Live Feed
              </span>
              <h2 className="text-4xl font-black tracking-tighter mt-4">Campus Pulse</h2>
            </div>
            <button onClick={() => onNavigate && onNavigate('events')} className="flex items-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 hover:text-[#0099FF] transition-all uppercase tracking-widest">
              View All Events <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map(event => (
              <div key={event.id} className={`group p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#0d121d] border-white/5 hover:border-[#0099FF]/30' : 'bg-white border-slate-200 shadow-xl'}`}>
                <div className="flex justify-between items-start mb-8">
                  <div className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                    {event.type}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#0099FF]">{new Date(event.date).getDate()}</p>
                    <p className="text-[10px] font-bold opacity-40 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</p>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold tracking-tight mb-3 line-clamp-2 group-hover:text-[#0099FF] transition-colors">{event.title}</h3>
                <p className="text-sm opacity-60 line-clamp-2 mb-8 font-medium leading-relaxed">{event.description}</p>
                
                <button 
                  onClick={onLogin}
                  className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white text-[#02040a] hover:bg-slate-200' : 'bg-[#2B3674] text-white hover:bg-[#0099FF]'}`}
                >
                  Register Now
                </button>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-40">
                <Calendar size={48} className="mx-auto mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">No public pulses active</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Developer Spotlight - Minimal */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#0099FF]/10 text-[#0099FF] flex items-center justify-center mb-8 animate-bounce-slow">
                <Code size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Architected for Scale.</h2>
            <p className="text-xl opacity-60 font-medium max-w-2xl mx-auto">
                Built by <span className="text-white font-bold">Naman Lahariya</span> using React, Supabase, and Google Gemini AI. Designed to handle the complexity of a 12,000+ student campus.
            </p>
            <div className="pt-8 flex justify-center gap-4">
                <button onClick={onOpenProfile} className="px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all">
                    View Architect Profile
                </button>
            </div>
        </div>
      </section>

      <Footer 
        onOpenDeveloper={onOpenDeveloper || (() => {})} 
        onOpenProfile={onOpenProfile} 
        onNavigate={onNavigate || (() => {})}
        isDarkMode={isDarkMode} 
      />

    </div>
  );
};

export default LandingPage;
