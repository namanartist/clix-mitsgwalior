
import React, { useState } from 'react';
import { Club } from '../../types';
import { PublicLayout } from './PublicPages';
import { Globe, Search, ArrowUpRight, ShieldCheck, Users } from 'lucide-react';

interface Props {
  clubs: Club[];
  onBack: () => void;
}

const ClubDirectoryPublic: React.FC<Props> = ({ clubs, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredClubs = clubs.filter(c => 
    (selectedCategory === 'All' || c.category === selectedCategory) &&
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PublicLayout 
      title="Club Directory" 
      subtitle="Explore the diverse ecosystem of student organizations." 
      icon={<Globe size={32} className="text-cyan-500" />} 
      onBack={onBack}
    >
      <div className="space-y-10">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex p-1 bg-[#111C44] rounded-[2rem] border border-white/10 overflow-x-auto w-full md:w-auto">
            {['All', 'Technical', 'Cultural', 'Social', 'Sports'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-3xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Find a club..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#111C44] border border-white/10 rounded-[2rem] pl-14 pr-6 py-4 text-white outline-none focus:border-cyan-500 transition-all font-bold"
            />
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClubs.map(club => (
            <div key={club.id} className="group bg-[#111C44]/50 border border-white/10 rounded-[3rem] p-8 hover:bg-[#111C44] transition-all hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl" style={{ backgroundColor: club.themeColor }}>
                    {club.name[0]}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <ShieldCheck size={12} /> Verified
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mb-3 group-hover:text-cyan-400 transition-colors">{club.name}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 flex-1">
                  {club.tagline || `The official ${club.category} wing of MITS Gwalior.`}
                </p>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{club.category}</span>
                    <div className="w-1 h-1 bg-slate-600 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1"><Users size={12}/> Active</span>
                  </div>
                  <button className="p-3 bg-white/5 rounded-full text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all">
                    <ArrowUpRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default ClubDirectoryPublic;
