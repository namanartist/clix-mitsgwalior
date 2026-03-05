
import React, { useMemo, useState, useEffect } from 'react';
import { Event, Club, Registration, User, ClubRole } from '../../types';
import { Calendar, MapPin, Users, Ticket, Sparkles, Filter, Search, Zap, Clock, Heart, X, Share2, Copy, UserPlus, CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { db } from '../../db';

interface Props {
  events: Event[];
  clubs: Club[];
  registrations: Registration[];
  onRegister: (eventId: string, proxyStudent?: { name: string, roll: string, branch: string }) => void;
  isDarkMode: boolean;
  user: User;
}

const CampusEvents: React.FC<Props> = ({ events, clubs, registrations, onRegister, isDarkMode, user }) => {
  const userRegistrations = registrations.filter(r => r.studentId === user.id);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Proxy Registration State
  const [isProxyMode, setIsProxyMode] = useState(false);
  const [proxyData, setProxyData] = useState({ name: '', roll: '', branch: '' });

  // Payment State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchSaved = async () => {
        const saved = await db.getSavedEvents(user.id);
        setSavedEventIds(saved.map(s => s.eventId));
    };
    fetchSaved();
  }, [user.id]);

  const handleToggleSave = async (eventId: string) => {
    await db.toggleSavedEvent(user.id, eventId);
    if (savedEventIds.includes(eventId)) {
        setSavedEventIds(prev => prev.filter(id => id !== eventId));
    } else {
        setSavedEventIds(prev => [...prev, eventId]);
    }
  };

  const handleShare = (event: Event) => {
    // Generate a simulated deep link for the event
    const eventLink = `${window.location.origin}/events/${event.id}`;
    const shareText = `Check out ${event.title} at MITS Gwalior!\nDate: ${event.date}\nLink: ${eventLink}`;
    navigator.clipboard.writeText(shareText);
    alert("Event registration link copied to clipboard!");
  };

  const handleRegistrationClick = async () => {
    if (selectedEvent) {
      const club = clubs.find(c => c.id === selectedEvent.clubId);
      const isGatewayActive = selectedEvent.type === 'Paid' && club?.paymentGatewayConfig?.isActive && club.paymentGatewayConfig.provider !== 'ManualUPI';

      if (isProxyMode) {
        if (!proxyData.name || !proxyData.roll || !proxyData.branch) {
          alert("Please enter full details (Name, Roll No, Branch) for proxy registration.");
          return;
        }
        onRegister(selectedEvent.id, proxyData);
        setProxyData({ name: '', roll: '', branch: '' });
        setIsProxyMode(false);
        setSelectedEvent(null);
      } else {
        if (isGatewayActive) {
            // Trigger Gateway Flow
            setIsProcessingPayment(true);
            
            // SIMULATION: In real app, call Razorpay/Stripe API here
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setIsProcessingPayment(false);
            setPaymentSuccess(true);
            
            // Auto Register after success
            setTimeout(() => {
                onRegister(selectedEvent.id); 
                setPaymentSuccess(false);
                setSelectedEvent(null);
            }, 1500);
        } else {
            // Free or Manual UPI
            onRegister(selectedEvent.id);
            setSelectedEvent(null);
        }
      }
    }
  };

  const liveEvents = useMemo(() => events.filter(e => {
    const eventDate = new Date(e.date);
    const now = new Date();
    return eventDate.toDateString() === now.toDateString();
  }), [events]);

  const upcomingEvents = useMemo(() => events.filter(e => {
    const eventDate = new Date(e.date);
    const now = new Date();
    return eventDate > now && eventDate.toDateString() !== now.toDateString();
  }), [events]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Check if user is a member of the selected event's club (allowed to proxy)
  const isClubMember = useMemo(() => {
    if (!selectedEvent) return false;
    // Allow any member of the club (Role.MEMBER and above) or Faculty/Admin to proxy
    return user.clubMemberships.some(m => m.clubId === selectedEvent.clubId) || user.globalRole !== 'Student';
  }, [selectedEvent, user]);

  // Determine Button Text & State
  const getButtonConfig = () => {
      if (!selectedEvent) return { text: 'Register', disabled: false };
      const club = clubs.find(c => c.id === selectedEvent.clubId);
      const isGatewayActive = selectedEvent.type === 'Paid' && club?.paymentGatewayConfig?.isActive && club.paymentGatewayConfig.provider !== 'ManualUPI';
      const provider = club?.paymentGatewayConfig?.provider;

      if (isProxyMode) return { text: 'Register Student Proxy', disabled: false };
      
      const isRegistered = registrations.some(r => r.eventId === selectedEvent.id && r.studentId === user.id);
      if (isRegistered) return { text: 'Already Registered', disabled: true };

      if (isGatewayActive) return { text: `Pay ₹${selectedEvent.fee} via ${provider}`, disabled: false, isGateway: true };
      
      return { text: 'Confirm Registration', disabled: false };
  };

  const btnConfig = getButtonConfig();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Campus Event Pipeline</h1>
          <p className="text-slate-500 font-medium text-lg">Live pulses and future marathons at MITS Gwalior.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search events..." 
              className={`pl-12 pr-6 py-3 rounded-2xl border outline-none focus:border-blue-500 transition-all text-sm w-full md:w-64 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
            />
          </div>
          <button className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            <Filter size={20} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Live Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
          <h2 className="text-xl font-black uppercase tracking-[0.2em] opacity-60">Happening Today</h2>
        </div>
        {liveEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {liveEvents.map(e => {
              const club = clubs.find(c => c.id === e.clubId);
              const isRegistered = userRegistrations.some(r => r.eventId === e.id);
              return (
                <div key={e.id} className={`p-6 md:p-10 rounded-[3rem] border-2 relative overflow-hidden transition-all group ${
                  isDarkMode ? 'bg-slate-900 border-rose-500/20 shadow-2xl shadow-rose-500/5' : 'bg-white border-rose-100 shadow-xl'
                }`}>
                  <div className="absolute top-0 right-0 p-8">
                    <Zap size={48} className="text-rose-500 opacity-10 group-hover:opacity-20 transition-opacity" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30">Live Now</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Venue: SAC Auditorium</span>
                        </div>
                        <button 
                            onClick={() => handleToggleSave(e.id)}
                            className={`p-2 rounded-full ${savedEventIds.includes(e.id) ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-rose-500'}`}
                        >
                            <Heart size={20} fill={savedEventIds.includes(e.id) ? "currentColor" : "none"} />
                        </button>
                    </div>
                    <h3 
                      onClick={() => setSelectedEvent(e)}
                      className="text-3xl md:text-4xl font-black tracking-tighter leading-tight cursor-pointer hover:text-rose-500 transition-colors"
                    >
                      {e.title}
                    </h3>
                    <p className="text-slate-500 font-medium line-clamp-2">{e.description}</p>
                    <div className="flex items-center gap-8 pt-4">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-blue-500" />
                        <span className="text-sm font-black">450+ Attending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-amber-500" />
                        <span className="text-sm font-black text-amber-500">Ends in 2h</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedEvent(e)}
                      disabled={isRegistered}
                      className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                        isRegistered ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-600/20'
                      }`}
                    >
                      {isRegistered ? 'Credentials Issued' : 'Instant Hall Entry'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-20 border-4 border-dashed border-slate-800/30 rounded-[3rem] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">The campus is currently between major pulses.</p>
          </div>
        )}
      </section>

      {/* Upcoming Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-500" size={24} />
          <h2 className="text-xl font-black uppercase tracking-[0.2em] opacity-60">Future Pipeline (Next 4 Weeks)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map(e => {
            const club = clubs.find(c => c.id === e.clubId);
            const isRegistered = userRegistrations.some(r => r.eventId === e.id);
            const isSaved = savedEventIds.includes(e.id);
            const eventDate = new Date(e.date);
            
            return (
              <div key={e.id} className={`p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] ${
                isDarkMode ? 'bg-[#161b2a] border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex flex-col items-center justify-center border border-slate-700 shadow-inner">
                    <span className="text-xs font-black text-blue-500">{eventDate.getDate()}</span>
                    <span className="text-[8px] font-bold opacity-40 uppercase">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                        e.type === 'Paid' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                        {e.type} Event
                    </div>
                    <button 
                        onClick={() => handleToggleSave(e.id)}
                        className={`p-1.5 rounded-full transition-colors ${isSaved ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-rose-500'}`}
                    >
                        <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <h3 
                    onClick={() => setSelectedEvent(e)}
                    className="text-2xl font-black tracking-tight leading-tight cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    {e.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Sparkles size={12} className="text-blue-500" /> Organized by {club?.name}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                    <span>Slots Left: 45/100</span>
                    <span>Starts in 12 days</span>
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(e)}
                    className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isRegistered ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    }`}
                  >
                    {isRegistered ? 'View Ticket' : 'Register Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setSelectedEvent(null)}>
            <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#111C44] border border-white/10' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            
            <div className="absolute top-8 right-8 z-10 flex gap-2">
                <button 
                    onClick={() => handleShare(selectedEvent)}
                    className="p-3 rounded-full bg-white/5 hover:bg-blue-500 hover:text-white transition-all text-slate-400"
                    title="Share Event Link"
                >
                    <Share2 size={20} />
                </button>
                <button 
                    onClick={() => setSelectedEvent(null)}
                    className="p-3 rounded-full bg-white/5 hover:bg-rose-500 hover:text-white transition-all text-slate-400"
                >
                    <X size={20} />
                </button>
            </div>

            {selectedEvent.bannerUrl && (
                <div className="w-full h-56 rounded-[2rem] overflow-hidden mb-8 shadow-lg relative">
                    <img src={selectedEvent.bannerUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111C44]/80 to-transparent" />
                </div>
            )}

            {/* Payment Processing Overlay */}
            {isProcessingPayment && (
                <div className="absolute inset-0 z-50 bg-[#111C44]/95 flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl rounded-[3rem]">
                    <Loader2 size={64} className="text-emerald-500 animate-spin mb-6" />
                    <h3 className="text-2xl font-black text-white tracking-tight">Secure Payment Gateway</h3>
                    <p className="text-slate-400 mt-2 font-mono text-xs">Redirecting to {clubs.find(c => c.id === selectedEvent.clubId)?.paymentGatewayConfig?.provider}...</p>
                    <div className="mt-8 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold text-slate-300">
                        Do not close this window.
                    </div>
                </div>
            )}

            {/* Success Overlay */}
            {paymentSuccess && (
                <div className="absolute inset-0 z-50 bg-[#111C44]/95 flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl rounded-[3rem]">
                    <CheckCircle2 size={80} className="text-emerald-500 mb-6 animate-in zoom-in duration-300" />
                    <h3 className="text-3xl font-black text-white tracking-tight">Payment Verified</h3>
                    <p className="text-emerald-400 mt-2 font-bold text-sm">Transaction ID: TXN-{Date.now()}</p>
                    <p className="text-slate-400 mt-4 max-w-sm">Your registration is confirmed. Generating digital ticket...</p>
                </div>
            )}

            <div className="space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedEvent.type === 'Paid' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                            {selectedEvent.type} Access
                        </span>
                        {selectedEvent.type === 'Paid' && <span className="text-sm font-black text-amber-500">₹{selectedEvent.fee}</span>}
                    </div>
                    <h2 className={`text-4xl font-black tracking-tighter leading-tight ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>
                    {selectedEvent.title}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Calendar className="text-blue-500" size={20} />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Date</p>
                        <p className="text-sm font-bold">{selectedEvent.date}</p>
                    </div>
                    </div>
                    <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <MapPin className="text-rose-500" size={20} />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Location</p>
                        <p className="text-sm font-bold">MITS Campus</p>
                    </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Event Brief</h4>
                    <p className={`text-base font-medium leading-relaxed ${isDarkMode ? 'text-[#A3AED0]' : 'text-slate-600'}`}>
                    {selectedEvent.description}
                    </p>
                </div>

                {/* Proxy Registration Panel */}
                {(isClubMember || isProxyMode) && (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-600/30 bg-slate-900/30">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                <UserPlus size={14} /> Club Privilege: Proxy Registration
                            </h4>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    name="toggle" 
                                    id="proxy-toggle" 
                                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:bg-emerald-500"
                                    checked={isProxyMode}
                                    onChange={() => setIsProxyMode(!isProxyMode)}
                                />
                                <label htmlFor="proxy-toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-700 cursor-pointer"></label>
                            </div>
                        </div>
                        
                        {isProxyMode && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Student Name"
                                        value={proxyData.name}
                                        onChange={(e) => setProxyData({...proxyData, name: e.target.value})}
                                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold outline-none focus:border-emerald-500"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Roll Number"
                                        value={proxyData.roll}
                                        onChange={(e) => setProxyData({...proxyData, roll: e.target.value})}
                                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Branch (e.g. CSE, IT, MAC)"
                                    value={proxyData.branch}
                                    onChange={(e) => setProxyData({...proxyData, branch: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold outline-none focus:border-emerald-500"
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-6 border-t border-white/5">
                    <button 
                        onClick={handleRegistrationClick}
                        disabled={btnConfig.disabled}
                        className={`w-full py-5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 ${
                            btnConfig.disabled 
                                ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                                : isProxyMode 
                                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                                    : btnConfig.isGateway 
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {btnConfig.isGateway ? <CreditCard size={18} /> : null}
                        {btnConfig.text}
                    </button>
                </div>
            </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CampusEvents;
