
import React, { useState } from 'react';
import { Club, Registration, Notification } from '../../types';
import { Users, TrendingUp, Calendar, Wallet, GraduationCap, BellRing, Send, ArrowRight } from 'lucide-react';
import { db } from '../../db';

interface Props {
  club: Club;
  registrations: Registration[];
}

const ClubHome: React.FC<Props> = ({ club, registrations }) => {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notification, setNotification] = useState({ title: '', message: '' });

  const stats = [
    { label: 'Council Roll', val: '12', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Enrolled', val: registrations.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending Task', val: '04', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Budget Cap', val: '₹12K', icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10' }
  ];

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notification.title || !notification.message) return;

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: notification.title,
      message: notification.message,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      senderName: club.name
    };

    await db.sendNotification(notif);
    alert(`Alert sent to all ${registrations.length} members.`);
    setIsNotifyOpen(false);
    setNotification({ title: '', message: '' });
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 md:space-y-10">
      {/* Hero Banner */}
      <div className="relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden min-h-[300px] flex items-center p-8 md:p-16 border border-white/5 group bg-[#111C44]">
        <div className="absolute inset-0">
            {club.bannerUrl ? (
                <img src={club.bannerUrl} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-900 to-[#0B1437]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1437] via-[#0B1437]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl" style={{ backgroundColor: club.themeColor }}>{club.name[0]}</div>
                    <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-white uppercase tracking-widest">
                        {club.category} Wing
                    </span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">{club.name}</h1>
                <p className="text-[#A3AED0] font-medium text-base md:text-lg max-w-xl line-clamp-2">{club.tagline || `${club.category} Excellence Council of MITS Gwalior`}</p>
            </div>
            
            <button 
                onClick={() => setIsNotifyOpen(true)}
                className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
                <BellRing size={18} /> Broadcast Alert
            </button>
        </div>
      </div>

      {/* Faculty Block */}
      {(club.facultyCoordinatorNames && club.facultyCoordinatorNames.length > 0) && (
        <div className="p-6 md:p-8 rounded-[2.5rem] bg-[#111C44] dark:bg-[#111C44] bg-white border dark:border-white/5 border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-[#A3AED0]">
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A3AED0] mb-1">Faculty Mentorship</h3>
              <p className="text-lg md:text-xl font-bold dark:text-white text-[#1B2559]">{club.facultyCoordinatorNames.join(', ')}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 w-full md:w-auto text-center">Active Oversight</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#111C44] p-8 rounded-[2.5rem] border dark:border-white/5 border-transparent shadow-xl flex flex-col justify-between h-48 group">
            <div className="flex justify-between items-start">
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <stat.icon size={24} />
                </div>
                <ArrowRight size={16} className="text-[#A3AED0] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
                <p className="text-4xl font-black dark:text-white text-[#1B2559] tracking-tighter">{stat.val}</p>
                <p className="text-[10px] text-[#A3AED0] font-black uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Modal */}
      {isNotifyOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-[#111C44] border border-white/10 rounded-[3rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                <h2 className="text-2xl font-black text-white tracking-tight mb-6 flex items-center gap-3">
                    <BellRing size={24} className="text-primary"/> Push Alert
                </h2>
                <form onSubmit={handleSendNotification} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-3 mb-2 block">Alert Title</label>
                        <input 
                            value={notification.title}
                            onChange={e => setNotification({...notification, title: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white font-bold outline-none focus:border-primary"
                            placeholder="Meeting Urgent..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-3 mb-2 block">Body Message</label>
                        <textarea 
                            value={notification.message}
                            onChange={e => setNotification({...notification, message: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white font-medium outline-none focus:border-primary h-32 resize-none"
                            placeholder="Brief details..."
                        />
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setIsNotifyOpen(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white/10">Cancel</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-hover shadow-lg flex items-center justify-center gap-2">
                            <Send size={16} /> Broadcast
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClubHome;
