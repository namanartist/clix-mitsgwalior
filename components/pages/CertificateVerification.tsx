import React, { useState } from 'react';
import { PublicLayout } from './PublicPages';
import { ShieldCheck, Search, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../../db';
import { Registration, Event, Club } from '../../types';
import CertificatePreview from '../CertificatePreview';

interface Props {
  onBack: () => void;
}

const CertificateVerification: React.FC<Props> = ({ onBack }) => {
  const [searchId, setSearchId] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'valid' | 'invalid'>('idle');
  const [result, setResult] = useState<{
    reg: Registration;
    event: Event;
    club: Club;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    setStatus('searching');
    setResult(null);

    // Fetch data directly from DB to ensure fresh check
    const [regs, events, clubs] = await Promise.all([
        db.getRegistrations(),
        db.getEvents(),
        db.getClubs()
    ]);

    const reg = regs.find(r => r.certificateId === searchId.trim() || r.ticketId === searchId.trim());
    
    if (reg) {
        const event = events.find(e => e.id === reg.eventId);
        const club = clubs.find(c => c.id === event?.clubId);
        if (event && club) {
            setResult({ reg, event, club });
            setStatus('valid');
            return;
        }
    }
    
    setStatus('invalid');
  };

  return (
    <PublicLayout 
      title="Credential Verification" 
      subtitle="Verify the authenticity of MITS issued certificates and tickets."
      icon={<ShieldCheck size={32} className="text-emerald-500" />}
      onBack={onBack}
    >
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="bg-[#111C44]/50 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Certificate / Ticket Serial ID</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={searchId}
                            onChange={(e) => { setSearchId(e.target.value); setStatus('idle'); }}
                            placeholder="Ex: MITS-TECH-2026-X8Y9Z"
                            className="w-full bg-[#0B1437] border border-white/10 rounded-2xl pl-6 pr-16 py-5 text-white font-mono font-bold text-lg outline-none focus:border-emerald-500 transition-all placeholder:text-slate-600"
                        />
                        <button type="submit" className="absolute right-3 top-2.5 p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-lg">
                            <Search size={20} />
                        </button>
                    </div>
                </div>
            </form>
        </div>

        {status === 'invalid' && (
            <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 shrink-0">
                    <XCircle size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-rose-500">Invalid Credential</h3>
                    <p className="text-slate-400 font-medium">The ID provided does not match any active record in the institutional ledger.</p>
                </div>
            </div>
        )}

        {status === 'valid' && result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
                <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-emerald-500">Verified Authentic</h3>
                        <p className="text-slate-400 font-medium">This credential was legally issued by {result.club.name}.</p>
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800">
                    <CertificatePreview 
                        studentName={result.reg.studentName}
                        enrollmentNumber={result.reg.studentRoll}
                        eventName={result.event.title}
                        clubName={result.club.name}
                        clubLogoUrl={result.club.logoUrl}
                        id={result.reg.certificateId || result.reg.ticketId || 'UNKNOWN'}
                        date={result.event.date}
                        template={result.club.certificateConfig?.templateId || 'classic'}
                        customBackgroundUrl={result.club.certificateConfig?.customBackgroundUrl}
                        themeColor={result.club.themeColor}
                    />
                </div>
            </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default CertificateVerification;