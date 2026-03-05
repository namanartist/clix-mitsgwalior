
import React, { useState } from 'react';
import { Registration, Club, Event } from '../../types';
import CertificatePreview from '../CertificatePreview';
import { Award, Search, ShieldCheck, ExternalLink, Download, Printer } from 'lucide-react';

interface Props {
  registrations: Registration[];
  clubs: Club[];
  events: Event[];
}

const MyCertificates: React.FC<Props> = ({ registrations, clubs, events }) => {
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const earned = registrations.filter(r => r.attendanceMarked);

  const currentReg = earned.find(r => r.id === selectedRegId);
  const currentEvent = events.find(e => e.id === currentReg?.eventId);
  const currentClub = clubs.find(c => c.id === currentEvent?.clubId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">My Credentials</h1>
          <p className="text-slate-500 font-medium">Verified institutional certifications stored in your secure vault.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter vault..." 
              className="pl-12 pr-6 py-3 rounded-2xl bg-slate-800/50 border border-slate-700 outline-none focus:border-blue-500 transition-all text-sm w-64"
            />
          </div>
        </div>
      </header>

      {earned.length === 0 ? (
        <div className="p-24 border-4 border-dashed border-slate-800 rounded-[3rem] text-center space-y-6">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
            <Award size={40} />
          </div>
          <div>
            <p className="text-xl font-black">Your vault is empty</p>
            <p className="text-slate-500">Participate in club events and mark attendance to earn verified credentials.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            {earned.map(reg => {
              const event = events.find(e => e.id === reg.eventId);
              const club = clubs.find(c => c.id === event?.clubId);
              return (
                <div 
                  key={reg.id}
                  onClick={() => setSelectedRegId(reg.id)}
                  className={`p-6 rounded-[1.5rem] border cursor-pointer transition-all ${selectedRegId === reg.id ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-600/20' : 'bg-[#161b2a] border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${selectedRegId === reg.id ? 'bg-white/20' : 'bg-white/5'}`}>
                      <Award size={24} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm tracking-tight ${selectedRegId === reg.id ? 'text-white' : 'text-slate-200'}`}>{event?.title}</h3>
                      <p className={`text-[10px] font-bold uppercase ${selectedRegId === reg.id ? 'text-blue-200' : 'text-slate-500'}`}>{club?.name}</p>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${selectedRegId === reg.id ? 'border-white/20 text-white/60' : 'border-white/5 text-slate-500'}`}>
                    <span className="flex items-center gap-1"><ShieldCheck size={12}/> Verified</span>
                    <span>{event?.date}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-8">
            {selectedRegId && currentReg && currentEvent && currentClub ? (
              <div className="bg-[#161b2a] border border-slate-800 rounded-[3rem] p-10 space-y-10 sticky top-24">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black tracking-tight text-white">Vault Preview</h2>
                  <div className="flex gap-3">
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <Printer size={16}/> Print / PDF
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-4 border-slate-800">
                  <CertificatePreview 
                    studentName={currentReg.studentName}
                    enrollmentNumber={currentReg.studentRoll}
                    eventName={currentEvent.title}
                    clubName={currentClub.name}
                    clubLogoUrl={currentClub.logoUrl}
                    id={currentReg.certificateId || `VAULT-${selectedRegId.toUpperCase()}`}
                    date={currentEvent.date}
                    // Fetch signatures (Assuming mock data populated in DB, in real app would fetch profiles)
                    template={currentClub.certificateConfig?.templateId || 'classic'}
                    customBackgroundUrl={currentClub.certificateConfig?.customBackgroundUrl}
                    themeColor={currentClub.themeColor}
                    facultyName="Dr. R. S. Jadon" // Default fallback
                    presidentName="Club President"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 border-4 border-dashed border-slate-800 rounded-[3rem] p-20">
                <Award size={64} className="opacity-20" />
                <p className="font-black text-xs uppercase tracking-[0.4em]">Select a credential to preview</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
