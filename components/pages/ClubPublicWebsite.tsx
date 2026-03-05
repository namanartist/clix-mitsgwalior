
import React, { useState, useEffect, useMemo } from 'react';
import { Club, Event, User, ClubRole, Role } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Share2, 
  X, 
  Linkedin, 
  Github, 
  Mail, 
  LayoutDashboard, 
  Edit3, 
  Users, 
  Sparkles, 
  Loader2, 
  ExternalLink,
  ArrowDown,
  CheckCircle2,
  Ticket,
  UserPlus,
  Terminal,
  Palette,
  HeartHandshake,
  Trophy,
  Cpu,
  Zap,
  Globe2,
  Copy
} from 'lucide-react';
import { aiService } from '../../ai';

interface Props {
  club: Club;
  events: Event[];
  members: User[];
  currentUser: User;
  isDarkMode: boolean;
  onApply?: (data: { name: string, rollNumber: string, domain: string, whyJoin: string }) => void;
  onToggleRecruitment?: () => void;
  onUpdateWebsiteContent?: (content: any) => void;
  onUpdateClub?: (club: Club) => void;
  onSwitchToDashboard?: () => void;
  onRegister?: (eventId: string, proxyStudent?: { name: string, roll: string, branch: string }) => void;
}

const ClubPublicWebsite: React.FC<Props> = ({ 
  club, events, members, currentUser, isDarkMode, onApply, onToggleRecruitment, onUpdateWebsiteContent, onUpdateClub, onSwitchToDashboard, onRegister
}) => {
  // --- State ---
  const [activeTab, setActiveTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Proxy Registration
  const [isProxyMode, setIsProxyMode] = useState(false);
  const [proxyData, setProxyData] = useState({ name: '', roll: '', branch: '' });

  // Permissions
  const isPresident = currentUser.clubMemberships.some(m => m.clubId === club.id && m.role === ClubRole.PRESIDENT);
  const isFaculty = currentUser.globalRole === Role.FACULTY;
  const isAdmin = currentUser.globalRole === Role.SUPER_ADMIN;
  const showAdminControls = isPresident || isFaculty || isAdmin;
  const isClubMember = useMemo(() => currentUser.clubMemberships.some(m => m.clubId === club.id) || isFaculty || isAdmin, [currentUser, club.id, isFaculty, isAdmin]);

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Template Engine ---
  const getTheme = () => {
    switch (club.category) {
      case 'Technical':
        return {
          id: 'cyber',
          fontHeading: 'font-mono',
          fontBody: 'font-mono',
          bg: 'bg-[#050505]',
          text: 'text-cyan-50',
          accent: 'cyan',
          accentColor: '#22d3ee',
          gradient: 'from-cyan-500 via-blue-600 to-violet-600',
          cardShape: 'rounded-none border-l-2',
          buttonShape: 'rounded-none',
          navStyle: 'border-b border-cyan-900/30 bg-[#050505]/90',
          icon: <Terminal size={24} />
        };
      case 'Cultural':
        return {
          id: 'canvas',
          fontHeading: 'font-serif',
          fontBody: 'font-sans',
          bg: 'bg-[#1c1917]',
          text: 'text-rose-50',
          accent: 'rose',
          accentColor: '#fb7185',
          gradient: 'from-rose-500 via-orange-500 to-amber-500',
          cardShape: 'rounded-[2.5rem]',
          buttonShape: 'rounded-full',
          navStyle: 'border-b border-white/5 bg-white/5 backdrop-blur-md',
          icon: <Palette size={24} />
        };
      case 'Social':
      case 'Sports':
      default:
        return {
          id: 'pulse',
          fontHeading: 'font-sans',
          fontBody: 'font-sans',
          bg: 'bg-[#020617]',
          text: 'text-slate-50',
          accent: club.category === 'Sports' ? 'orange' : 'emerald',
          accentColor: club.category === 'Sports' ? '#f97316' : '#10b981',
          gradient: club.category === 'Sports' ? 'from-orange-600 to-red-600' : 'from-emerald-500 to-teal-600',
          cardShape: 'rounded-3xl',
          buttonShape: 'rounded-2xl',
          navStyle: 'bg-black/50 backdrop-blur-xl border border-white/10 rounded-full mt-4 mx-4',
          icon: club.category === 'Sports' ? <Trophy size={24} /> : <HeartHandshake size={24} />
        };
    }
  };

  const theme = getTheme();

  // --- Handlers ---
  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const content = await aiService.generateClubContent(club.name, club.category);
      if (onUpdateClub) {
        onUpdateClub({
            ...club,
            tagline: content.tagline,
            description: content.mission,
            customSections: content.sections.map((s: any) => ({
                id: `sec-${Date.now()}-${Math.random()}`,
                title: s.title,
                content: s.content,
                iconName: s.iconName
            }))
        });
      }
      alert("AI has redesigned the content strategy.");
    } catch (e) {
      alert("AI Service busy.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegister = () => {
    if (selectedEvent && onRegister) {
        if (isProxyMode) {
            if (!proxyData.name || !proxyData.roll) return alert("Details required");
            onRegister(selectedEvent.id, proxyData);
            setProxyData({ name: '', roll: '', branch: '' });
            setIsProxyMode(false);
        } else {
            onRegister(selectedEvent.id);
        }
        setSelectedEvent(null);
    }
  };

  const copyLink = (id: string) => {
      navigator.clipboard.writeText(`${window.location.origin}/events/${id}`);
      alert("Link copied to clipboard");
  };

  // --- Render Helpers ---
  const renderNav = () => (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${theme.navStyle} ${!scrolled && theme.id !== 'pulse' ? 'bg-transparent border-transparent' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center text-white ${theme.buttonShape} ${theme.id === 'cyber' ? 'bg-cyan-900/20 border border-cyan-500/50' : `bg-gradient-to-br ${theme.gradient}`}`}>
                    {club.logoUrl ? <img src={club.logoUrl} className={`w-full h-full object-cover ${theme.buttonShape}`} /> : club.name[0]}
                </div>
                <span className={`text-xl font-bold tracking-tighter ${theme.fontHeading} hidden md:block`}>{club.name}</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
                {['Mission', 'Events', 'Team', 'Join'].map(item => (
                    <button 
                        key={item} 
                        onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                        className={`text-sm font-medium opacity-60 hover:opacity-100 hover:text-${theme.accent}-400 transition-colors uppercase tracking-widest ${theme.fontBody}`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                {showAdminControls && (
                    <button onClick={onSwitchToDashboard} className={`p-3 bg-white/5 hover:bg-white/10 ${theme.buttonShape} backdrop-blur-md transition-all`}>
                        <LayoutDashboard size={18} />
                    </button>
                )}
                <button className={`px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform ${theme.buttonShape}`}>
                    Get in Touch
                </button>
            </div>
        </div>
    </nav>
  );

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${theme.fontBody} selection:bg-${theme.accent}-500/30 relative overflow-x-hidden`}>
      {renderNav()}

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
         {/* Dynamic Backgrounds */}
         {theme.id === 'cyber' && (
             <div className="absolute inset-0 z-0">
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee10_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                 <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-[#050505] to-transparent" />
             </div>
         )}
         {theme.id === 'canvas' && (
             <div className="absolute inset-0 z-0">
                 <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-rose-900/20 rounded-full blur-[120px] animate-pulse" />
                 <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-orange-900/20 rounded-full blur-[120px]" />
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-20 mix-blend-overlay" />
             </div>
         )}
         {theme.id === 'pulse' && (
             <div className="absolute inset-0 z-0">
                 <img src={club.bannerUrl || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2000"} className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
                 <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />
             </div>
         )}

         <div className="relative z-10 max-w-6xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 border ${theme.id === 'cyber' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/30' : 'border-white/10 bg-white/5 rounded-full'} backdrop-blur-md`}>
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${theme.accent}-400 opacity-75`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 bg-${theme.accent}-500`}></span>
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.fontBody}`}>MITS {club.category} Wing</span>
                    </div>
                    
                    <h1 className={`text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] ${theme.fontHeading} ${theme.id === 'canvas' ? 'italic' : ''}`}>
                        {club.name}
                    </h1>
                    
                    <p className="text-lg md:text-2xl opacity-70 max-w-xl leading-relaxed">
                        {club.tagline || "Redefining student leadership and excellence through innovation."}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button 
                            onClick={() => document.getElementById('events')?.scrollIntoView({behavior: 'smooth'})}
                            className={`px-8 py-4 ${theme.buttonShape} bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform flex items-center gap-3`}
                        >
                            Explore Events <ArrowDown size={16} />
                        </button>
                        {showAdminControls && (
                            <button 
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`px-8 py-4 ${theme.buttonShape} border border-white/20 hover:bg-white/10 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3`}
                            >
                                <Edit3 size={16} /> {isEditMode ? 'Close Studio' : 'Edit Site'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Hero Visual Element based on Theme */}
                <div className="hidden lg:block relative">
                    {theme.id === 'cyber' && (
                        <div className="relative w-full aspect-square border border-cyan-500/20 bg-cyan-950/10 backdrop-blur-sm p-2 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-dashed border-cyan-500/20 animate-[spin_10s_linear_infinite]" />
                            <Cpu size={200} className="text-cyan-500 opacity-50" />
                            <div className="absolute bottom-4 right-4 text-xs font-mono text-cyan-500">SYS.ONLINE</div>
                        </div>
                    )}
                    {theme.id === 'canvas' && (
                        <div className="relative w-full aspect-[4/5]">
                            <div className="absolute inset-0 rounded-[3rem] overflow-hidden rotate-3 hover:rotate-0 transition-all duration-700">
                                <img src={club.bannerUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 animate-bounce-slow">
                                <Sparkles size={40} className="text-rose-300" />
                            </div>
                        </div>
                    )}
                    {theme.id === 'pulse' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 mt-12">
                                <div className="h-64 rounded-3xl bg-white/5 border border-white/10 overflow-hidden"><img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=400" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"/></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-40 rounded-3xl bg-white/5 border border-white/10 overflow-hidden"><img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"/></div>
                                <div className="h-64 rounded-3xl bg-white/5 border border-white/10 overflow-hidden"><img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=400" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"/></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
         </div>
      </section>

      {/* --- MISSION / CUSTOM SECTIONS --- */}
      <section id="mission" className="py-24 relative">
         <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${theme.fontHeading}`}>Mission Protocol</h2>
               <p className={`text-xl opacity-70 max-w-3xl leading-relaxed ${theme.id === 'cyber' ? 'font-mono' : ''}`}>
                  {club.description || "To foster a community of excellence, driving innovation and leadership among the students of MITS Gwalior."}
               </p>
               {isEditMode && (
                   <button onClick={generateContent} className="mt-6 flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300">
                       {isGenerating ? <Loader2 className="animate-spin"/> : <Sparkles/>} Generate AI Persona
                   </button>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {(club.customSections || []).map((sec, i) => (
                   <div key={i} className={`group p-8 ${theme.cardShape} bg-white/5 border border-white/10 hover:bg-white/10 transition-all`}>
                       <div className={`w-12 h-12 flex items-center justify-center mb-6 rounded-xl bg-${theme.accent}-500/20 text-${theme.accent}-400`}>
                           <Zap size={24} />
                       </div>
                       <h3 className={`text-2xl font-bold mb-3 ${theme.fontHeading}`}>{sec.title}</h3>
                       <p className="text-sm opacity-60 leading-relaxed">{sec.content}</p>
                   </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- EVENTS PIPELINE --- */}
      <section id="events" className={`py-24 ${theme.id === 'cyber' ? 'bg-cyan-950/10 border-y border-cyan-900/30' : 'bg-white/5'}`}>
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                    <span className={`text-xs font-black uppercase tracking-[0.3em] text-${theme.accent}-500 mb-2 block`}>Operations</span>
                    <h2 className={`text-5xl font-black tracking-tighter ${theme.fontHeading}`}>Event Pipeline</h2>
                </div>
            </div>

            <div className="flex overflow-x-auto gap-8 pb-12 snap-x custom-scrollbar">
                {events.filter(e => new Date(e.date) > new Date()).map(event => (
                    <div 
                        key={event.id} 
                        className={`min-w-[350px] md:min-w-[400px] snap-center group relative ${theme.cardShape} bg-slate-900 border border-white/10 overflow-hidden flex flex-col`}
                    >
                        <div className="h-48 overflow-hidden relative">
                            <img src={event.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                            <div className={`absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur text-[10px] font-black uppercase tracking-widest text-white border border-white/20 ${theme.buttonShape}`}>
                                {event.type}
                            </div>
                        </div>
                        
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 text-xs font-bold text-${theme.accent}-400 mb-2">
                                <Calendar size={14} /> {event.date}
                            </div>
                            <h3 className={`text-2xl font-black mb-3 leading-tight ${theme.fontHeading} group-hover:text-${theme.accent}-400 transition-colors`}>{event.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-2 mb-6">{event.description}</p>
                            
                            <div className="mt-auto grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setSelectedEvent(event)}
                                    className={`py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-${theme.accent}-400 hover:text-white transition-colors ${theme.buttonShape}`}
                                >
                                    Details
                                </button>
                                <button 
                                    onClick={() => copyLink(event.id)}
                                    className={`py-3 border border-white/10 hover:bg-white/10 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${theme.buttonShape}`}
                                >
                                    <Share2 size={14} /> Share
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {events.filter(e => new Date(e.date) > new Date()).length === 0 && (
                    <div className="w-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl opacity-40">
                        <p className="text-xl font-bold">No Upcoming Operations</p>
                    </div>
                )}
            </div>
         </div>
      </section>

      {/* --- LEADERSHIP GRID --- */}
      <section id="team" className="py-24">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className={`text-4xl md:text-5xl font-black mb-16 text-center ${theme.fontHeading}`}>The Council</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {members.filter(m => m.clubMemberships.some(cm => cm.clubId === club.id && cm.role !== 'Member')).map(leader => (
                    <div key={leader.id} className="group text-center">
                        <div className={`aspect-[4/5] ${theme.cardShape} overflow-hidden relative mb-6 bg-white/5`}>
                            <img src={leader.photoUrl || `https://i.pravatar.cc/300?u=${leader.id}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 gap-4">
                                <a href="#" className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"><Linkedin size={16}/></a>
                                <a href="#" className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"><Mail size={16}/></a>
                            </div>
                        </div>
                        <h4 className="text-lg font-black">{leader.name}</h4>
                        <p className={`text-xs font-bold uppercase tracking-widest text-${theme.accent}-500 mt-1`}>
                            {leader.clubMemberships.find(m => m.clubId === club.id)?.role}
                        </p>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* --- FOOTER / RECRUITMENT --- */}
      <footer id="join" className="py-24 border-t border-white/10 bg-black/20">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
             <div className="space-y-8">
                 <div className="flex items-center gap-4">
                     <div className={`w-14 h-14 ${theme.buttonShape} bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white text-2xl font-black`}>
                         {club.name[0]}
                     </div>
                     <span className={`text-3xl font-black tracking-tight ${theme.fontHeading}`}>{club.name}</span>
                 </div>
                 <p className="text-lg opacity-60 max-w-md">
                     Empowering the next generation of innovators at Madhav Institute of Technology & Science.
                 </p>
                 <div className="flex gap-4">
                     {['Instagram', 'Twitter', 'LinkedIn'].map(social => (
                         <a key={social} href="#" className={`px-4 py-2 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all`}>{social}</a>
                     ))}
                 </div>
             </div>

             <div className={`p-10 ${theme.cardShape} bg-gradient-to-br ${theme.gradient} relative overflow-hidden text-white`}>
                 <div className="relative z-10 space-y-6">
                     <h3 className="text-3xl font-black tracking-tight">Join the Legacy</h3>
                     <p className="font-medium opacity-90">Recruitment for the 2026 tenure is now active. We are looking for technical architects, creative storytellers, and management prodigies.</p>
                     <button className={`px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest ${theme.buttonShape} shadow-2xl hover:scale-105 transition-transform`}>
                         Apply Now
                     </button>
                 </div>
                 <div className="absolute top-0 right-0 p-12 opacity-10">
                     <Zap size={180} />
                 </div>
             </div>
         </div>
         <div className="text-center pt-16 mt-16 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
             © 2026 MITS Gwalior • {club.category} Wing
         </div>
      </footer>

      {/* --- EVENT MODAL --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedEvent(null)}>
            <div className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar ${theme.cardShape} p-0 shadow-2xl animate-in zoom-in-95 duration-300 bg-[#0f0f0f] border border-white/10`} onClick={e => e.stopPropagation()}>
            
                <div className="relative h-48">
                    <img src={selectedEvent.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
                    <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-rose-500 transition-colors"><X size={20}/></button>
                </div>

                <div className="p-8 space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-${theme.accent}-500/30 text-${theme.accent}-400 bg-${theme.accent}-500/10`}>{selectedEvent.type}</span>
                            {selectedEvent.type === 'Paid' && <span className="text-sm font-bold text-white">₹{selectedEvent.fee}</span>}
                        </div>
                        <h2 className={`text-3xl font-black leading-tight text-white ${theme.fontHeading}`}>{selectedEvent.title}</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
                            <Calendar className={`text-${theme.accent}-500`} size={20} />
                            <div>
                                <p className="text-[10px] uppercase opacity-50 font-bold">Date</p>
                                <p className="text-sm font-bold">{selectedEvent.date}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
                            <MapPin className={`text-${theme.accent}-500`} size={20} />
                            <div>
                                <p className="text-[10px] uppercase opacity-50 font-bold">Venue</p>
                                <p className="text-sm font-bold">MITS Campus</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-widest opacity-50">Briefing</h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedEvent.description}</p>
                    </div>

                    {(isClubMember || isProxyMode) && (
                        <div className={`p-5 rounded-2xl border border-dashed border-white/20 bg-white/5 space-y-4`}>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-emerald-400">
                                    <UserPlus size={14} /> Proxy Registration
                                </span>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                    <input type="checkbox" checked={isProxyMode} onChange={() => setIsProxyMode(!isProxyMode)} className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5 transition-all duration-200" />
                                    <label className="block overflow-hidden h-5 rounded-full bg-gray-700 cursor-pointer"></label>
                                </div>
                            </div>
                            {isProxyMode && (
                                <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2">
                                    <input placeholder="Student Name" value={proxyData.name} onChange={e => setProxyData({...proxyData, name: e.target.value})} className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-white/30" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="Roll Number" value={proxyData.roll} onChange={e => setProxyData({...proxyData, roll: e.target.value})} className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-white/30" />
                                        <input placeholder="Branch" value={proxyData.branch} onChange={e => setProxyData({...proxyData, branch: e.target.value})} className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-white/30" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button 
                        onClick={handleRegister}
                        className={`w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center gap-2`}
                    >
                        {isProxyMode ? 'Register Proxy' : 'Confirm Registration'} <Ticket size={16} />
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClubPublicWebsite;
