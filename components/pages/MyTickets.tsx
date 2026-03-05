
import React, { useState } from 'react';
import { Registration, Event, Club } from '../../types';
import { Ticket, QrCode, Calendar, MapPin, Download, ShieldCheck, Clock, AlertCircle, Filter, Search, ArrowRight } from 'lucide-react';

interface Props {
  registrations: Registration[];
  events: Event[];
  clubs: Club[];
  isDarkMode: boolean;
}

const MyTickets: React.FC<Props> = ({ registrations, events, clubs, isDarkMode }) => {
  const [filter, setFilter] = useState<'active' | 'past'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  const now = new Date();

  const filteredRegistrations = registrations.filter(reg => {
    const event = events.find(e => e.id === reg.eventId);
    if (!event) return false;
    
    const eventDate = new Date(event.date);
    const isPast = eventDate < now && eventDate.toDateString() !== now.toDateString();
    
    // Filter by Tab
    if (filter === 'active' && isPast) return false;
    if (filter === 'past' && !isPast) return false;

    // Filter by Search
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return event.title.toLowerCase().includes(term) || 
               (clubs.find(c => c.id === event.clubId)?.name || '').toLowerCase().includes(term) ||
               reg.ticketId?.toLowerCase().includes(term);
    }

    return true;
  }).sort((a, b) => {
      const dateA = new Date(events.find(e => e.id === a.eventId)?.date || '').getTime();
      const dateB = new Date(events.find(e => e.id === b.eventId)?.date || '').getTime();
      return filter === 'active' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 min-h-screen">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className={`text-4xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>Digital Access Passes</h1>
          <p className="text-slate-500 font-medium text-lg">Secure, verifiable credentials for campus entry.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className={`flex items-center px-4 py-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#111C44] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <Search size={18} className="text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search event or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`ml-3 bg-transparent outline-none text-sm font-bold w-full ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}
                />
            </div>

            {/* Filter Toggle */}
            <div className={`p-1 rounded-2xl border flex ${isDarkMode ? 'bg-[#111C44] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <button 
                    onClick={() => setFilter('active')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'active' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-500'}`}
                >
                    Active
                </button>
                <button 
                    onClick={() => setFilter('past')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'past' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-500'}`}
                >
                    History
                </button>
            </div>
        </div>
      </header>

      {/* Tickets Grid */}
      {filteredRegistrations.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-20 border-4 border-dashed rounded-[3rem] text-center space-y-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-slate-700' : 'bg-slate-100 text-slate-300'}`}>
            <Ticket size={48} />
          </div>
          <div>
            <p className={`text-xl font-black uppercase tracking-widest opacity-40 ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>
                No {filter} passes found
            </p>
            <p className="text-slate-500 mt-2 font-medium">Register for events to populate your wallet.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredRegistrations.map(reg => {
            const event = events.find(e => e.id === reg.eventId);
            const club = clubs.find(c => c.id === event?.clubId);
            const isApproved = reg.status === 'Approved';
            const ticketColor = club?.themeColor || '#4318FF';
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${reg.ticketId || reg.id}`;
            
            return (
              <div key={reg.id} className="relative group perspective-1000">
                {/* Ticket Container */}
                <div className={`relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${isDarkMode ? 'bg-[#111C44] border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                    
                    {/* Decorative Top Bar */}
                    <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${ticketColor}, #a855f7)` }} />

                    <div className="flex flex-col md:flex-row">
                        {/* Left: Main Info */}
                        <div className="flex-1 p-8 md:p-10 relative">
                            {/* Watermark */}
                            <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none transform rotate-12">
                                <ShieldCheck size={180} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg" style={{ backgroundColor: ticketColor }}>
                                                {club?.name[0]}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {club?.name} Presents
                                            </span>
                                        </div>
                                        {isApproved ? (
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <ShieldCheck size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={12} /> Processing
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className={`text-3xl font-black tracking-tighter leading-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>
                                        {event?.title}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        {event?.type} Access • General Entry
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-[#0B1437]' : 'bg-[#F4F7FE]'}`}>
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Date & Time</p>
                                        <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>
                                            <Calendar size={16} className="text-primary" /> 
                                            {event?.date}
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-[#0B1437]' : 'bg-[#F4F7FE]'}`}>
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Location</p>
                                        <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>
                                            <MapPin size={16} className="text-rose-500" /> 
                                            MITS Campus
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider Line */}
                        <div className="relative md:w-0 md:border-l-2 border-dashed border-slate-700/20 flex flex-row md:flex-col items-center justify-center py-4 md:py-0">
                            <div className={`absolute left-0 md:left-auto md:top-[-10px] -translate-x-1/2 md:-translate-x-1/2 w-6 h-6 rounded-full ${isDarkMode ? 'bg-[#0B1437]' : 'bg-[#F4F7FE]'}`} />
                            <div className={`absolute right-0 md:right-auto md:bottom-[-10px] translate-x-1/2 md:-translate-x-1/2 w-6 h-6 rounded-full ${isDarkMode ? 'bg-[#0B1437]' : 'bg-[#F4F7FE]'}`} />
                        </div>

                        {/* Right: QR Code & ID */}
                        <div className={`w-full md:w-64 p-8 flex flex-col items-center justify-center text-center gap-6 ${isDarkMode ? 'bg-[#0B1437]/50' : 'bg-slate-50'}`}>
                            {isApproved ? (
                                <>
                                    <div className="bg-white p-3 rounded-2xl shadow-xl">
                                        <img src={qrUrl} alt="Ticket QR" className="w-24 h-24 object-contain" />
                                    </div>
                                    <div className="space-y-1 w-full">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Ticket ID</p>
                                        <p className="text-xs font-mono font-bold text-slate-500 break-all bg-slate-200/50 dark:bg-slate-800/50 p-2 rounded-lg select-all">
                                            {reg.ticketId}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => alert(`Downloading Ticket ${reg.ticketId}`)}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={14} /> Download Pass
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                                    <Clock size={48} className="text-amber-500 animate-pulse" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-amber-500">Verification Pending</p>
                                        <p className="text-[10px] text-slate-500 max-w-[150px]">Payment is being verified by the treasurer.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
