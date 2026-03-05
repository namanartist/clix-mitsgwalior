
import React from 'react';
import { Club } from '../../types';
import { Globe, Users, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  clubs: Club[];
  isDarkMode: boolean;
  onEnterClub: (id: string) => void;
}

const GlobalClubs: React.FC<Props> = ({ clubs, isDarkMode, onEnterClub }) => {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight">Institutional Registry</h1>
          <p className="text-slate-500 font-medium">Browse and discover all student-led organizations at MITS Gwalior.</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
           <Globe size={16} /> {clubs.length} Active Organizations
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clubs.map(club => (
          <div 
            key={club.id} 
            className={`p-10 rounded-[2.5rem] border transition-all hover:scale-[1.02] cursor-default group ${isDarkMode ? 'bg-[#161b2a] border-slate-800 hover:border-blue-500/30' : 'bg-white border-slate-100 shadow-sm'}`}
          >
            <div className="flex justify-between items-start mb-8">
              <div 
                onClick={() => onEnterClub(club.id)}
                className="w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-xl cursor-pointer hover:scale-110 transition-transform" 
                style={{ backgroundColor: club.themeColor }}
              >
                {club.name[0]}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                <ShieldCheck size={14} /> Verified
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <h3 
                onClick={() => onEnterClub(club.id)}
                className="text-3xl font-black tracking-tighter cursor-pointer hover:text-blue-500 transition-colors inline-block"
              >
                {club.name}
              </h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                The official {club.category.toLowerCase()} community of MITS, focusing on excellence and student leadership.
              </p>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-800/20">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                  <Users size={14} /> 200+
                </div>
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                <div className="text-[10px] font-black uppercase tracking-widest">{club.category}</div>
              </div>
              <button 
                onClick={() => onEnterClub(club.id)}
                className="text-blue-500 hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-xl transition-all"
              >
                <ExternalLink size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalClubs;
