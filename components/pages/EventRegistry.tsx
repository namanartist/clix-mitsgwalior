
import React, { useState, useMemo } from 'react';
import { Event, Club } from '../../types';
import { PublicLayout } from './PublicPages';
import { Calendar, Search, Filter, MapPin, Clock, Tag } from 'lucide-react';

interface Props {
  events: Event[];
  clubs: Club[];
  onBack: () => void;
}

const EventRegistry: React.FC<Props> = ({ events, clubs, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Upcoming' | 'Past'>('Upcoming');

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => {
        const eventDate = new Date(e.date);
        if (filterType === 'Upcoming') return eventDate >= now;
        if (filterType === 'Past') return eventDate < now;
        return true;
      })
      .filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchTerm, filterType]);

  return (
    <PublicLayout 
      title="Event Registry" 
      subtitle="Official schedule of academic, cultural, and technical pulses." 
      icon={<Calendar size={32} className="text-rose-500" />} 
      onBack={onBack}
    >
      <div className="space-y-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search events..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#111C44] border border-white/10 rounded-[2rem] pl-14 pr-6 py-4 text-white outline-none focus:border-rose-500 transition-all font-bold"
            />
          </div>
          <div className="bg-[#111C44] p-1 rounded-[2rem] border border-white/10 flex">
            {['All', 'Upcoming', 'Past'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t as any)}
                className={`px-6 py-3 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${
                  filterType === t ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEvents.map(event => {
            const club = clubs.find(c => c.id === event.clubId);
            return (
              <div key={event.id} className="bg-[#111C44]/50 border border-white/10 rounded-[2.5rem] p-8 hover:border-rose-500/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ backgroundColor: club?.themeColor || '#333' }}>
                      {club?.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white leading-tight group-hover:text-rose-500 transition-colors">{event.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{club?.name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    event.type === 'Paid' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    {event.type}
                  </span>
                </div>

                <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-300 bg-white/5 p-3 rounded-xl">
                    <Calendar size={14} className="text-rose-500" /> {event.date}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-300 bg-white/5 p-3 rounded-xl">
                    <MapPin size={14} className="text-rose-500" /> MITS Campus
                  </div>
                </div>
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
              <Calendar size={64} className="mx-auto mb-4" />
              <p className="text-xl font-bold">No events found in registry.</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default EventRegistry;
