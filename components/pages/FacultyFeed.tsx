
import React from 'react';
import { User, Club } from '../../types';
import { ShieldCheck, Globe, ArrowRight, Zap, Users, Calendar, Settings } from 'lucide-react';

interface Props {
  user: User;
  clubs: Club[];
  onManageClub: (clubId: string) => void;
}

const FacultyFeed: React.FC<Props> = ({ user, clubs, onManageClub }) => {
  const managedClubs = clubs.filter(c => c.facultyCoordinatorNames?.includes(user.name));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16 pb-24">
      {/* Hero Welcome */}
      <header className="relative p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-[#111C44] to-[#0B1437] border border-white/5 overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:opacity-10 transition-all">
             <ShieldCheck size={240} className="text-primary" />
          </div>
          <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                  <span className="px-5 py-2 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-primary/20">Institutional Authority</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
                  Welcome, <span className="opacity-40">Professor.</span>
                </h1>
                <p className="text-xl md:text-2xl text-[#A3AED0] font-medium max-w-2xl leading-tight">
                    Authenticated as {user.name}. You are currently overseeing {managedClubs.length} registered organizations.
                </p>
              </div>
          </div>
      </header>

      {/* Managed Clubs Grid */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Globe size={22} />
             </div>
             <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest opacity-60">Council Portfolio</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {managedClubs.map(club => (
                <div key={club.id} className="bg-[#111C44] p-10 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row gap-8 hover:border-primary/50 transition-all group shadow-xl">
                    <div 
                        className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl group-hover:scale-105 transition-transform shrink-0" 
                        style={{ backgroundColor: club.themeColor }}
                    >
                        {club.name[0]}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-lg">{club.category}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]">{club.subdomain}</span>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-4">{club.name}</h3>
                            <div className="flex items-center gap-6 opacity-60">
                                <div className="flex items-center gap-2 text-xs font-bold"><Users size={14}/> 120+ Members</div>
                                <div className="flex items-center gap-2 text-xs font-bold"><Calendar size={14}/> 4 Projects</div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                            <button 
                                onClick={() => onManageClub(club.id)}
                                className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Settings size={16} /> Enter Control Panel
                            </button>
                            <button className="p-4 bg-white/5 text-[#A3AED0] rounded-2xl hover:bg-white/10 transition-all">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            {managedClubs.length === 0 && (
                <div className="col-span-2 p-32 bg-[#111C44]/50 border-2 border-dashed border-white/5 rounded-[4rem] text-center space-y-6">
                    <ShieldCheck size={64} className="mx-auto text-[#A3AED0] opacity-10" />
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black opacity-30 uppercase tracking-widest">No Assigned Councils</h3>
                        <p className="text-[#A3AED0] max-w-sm mx-auto font-medium">Contact the IT Cell to bind your institutional ID to club registry units.</p>
                    </div>
                </div>
            )}
        </div>
      </section>

      {/* Global Pulse Block */}
      <section className="bg-primary p-12 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
             <Zap size={160} className="fill-white" />
          </div>
          <div className="text-white relative z-10 text-center md:text-left space-y-2">
              <h3 className="text-3xl font-black tracking-tighter leading-tight uppercase">Strategic Integrity Check</h3>
              <p className="text-lg opacity-80 font-medium">Verified student engagement metrics across all wings have surged by 24% this cycle.</p>
          </div>
          <button className="px-10 py-5 bg-white text-primary rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all relative z-10 active:scale-95">
              Launch Detailed Audit
          </button>
      </section>
    </div>
  );
};

export default FacultyFeed;
