
import React, { useState, useMemo, useRef } from 'react';
import { Club, Registration, Event, User, ClubRole, CertificateTemplate, CertificateConfig } from '../../types';
import CertificatePreview from '../CertificatePreview';
import { db } from '../../db';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  Search, 
  Filter, 
  Download, 
  Palette, 
  Layout, 
  Image as ImageIcon, 
  Save, 
  AlertTriangle,
  Printer
} from 'lucide-react';

interface Props {
  club: Club;
  registrations: Registration[];
  events: Event[];
  onIssueBatch: (issuanceData: { registrationId: string, certificateId: string }[]) => void;
  allUsers?: User[];
}

const CertificationGovernance: React.FC<Props> = ({ club, registrations, events, onIssueBatch, allUsers = [] }) => {
  const [activeTab, setActiveTab] = useState<'issuance' | 'design'>('issuance');
  
  // Issuance State
  const [activeEventId, setActiveEventId] = useState<string>(events[0]?.id || '');
  const [selectedRegs, setSelectedRegs] = useState<Set<string>>(new Set());
  const [isMinting, setIsMinting] = useState(false);
  const [mintProgress, setMintProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Design Studio State
  const [designConfig, setDesignConfig] = useState<CertificateConfig>(club.certificateConfig || {
      templateId: 'classic',
      showClubLogo: true,
      showMITSLogo: true,
      signatureTextFaculty: 'Faculty Coordinator',
      signatureTextPresident: 'Club President'
  });
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Find Signatories
  const president = allUsers.find(u => u.clubMemberships.some(m => m.clubId === club.id && m.role === ClubRole.PRESIDENT));
  const faculty = allUsers.find(u => 
    (club.facultyCoordinatorNames?.includes(u.name)) || 
    (u.globalRole === 'Faculty Coordinator' && !club.facultyCoordinatorNames?.length)
  );

  const missingSignatures = !president?.signatureUrl || !faculty?.signatureUrl;

  // Filter registrations
  const currentEventRegs = useMemo(() => registrations.filter(r => r.eventId === activeEventId), [registrations, activeEventId]);
  const activeEvent = events.find(e => e.id === activeEventId);
  const eligible = currentEventRegs.filter(r => r.attendanceMarked && !r.certificateId);
  const issued = currentEventRegs.filter(r => !!r.certificateId);

  // --- ACTIONS ---

  const handleSaveDesign = async () => {
      const updatedClub = { ...club, certificateConfig: designConfig };
      await db.updateClub(updatedClub);
      alert("Certificate template updated successfully.");
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setDesignConfig({ ...designConfig, customBackgroundUrl: reader.result as string });
          reader.readAsDataURL(file);
      }
  };

  const handleMinting = async () => {
    if (selectedRegs.size === 0) return;
    if (missingSignatures) {
        alert("Cannot issue: Missing digital signatures from Faculty or President. Please ask them to update their profiles.");
        return;
    }
    
    setIsMinting(true);
    setMintProgress(0);

    const total = selectedRegs.size;
    const interval = setInterval(() => {
        setMintProgress(prev => {
            const next = prev + (100 / total);
            return next > 100 ? 100 : next;
        });
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 2500));
    clearInterval(interval);

    const batch = Array.from(selectedRegs).map(regId => {
      const uniqueId = `MITS-${club.id.split('-')[1].toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      return { registrationId: regId, certificateId: uniqueId };
    });

    onIssueBatch(batch);
    setIsMinting(false);
    setSelectedRegs(new Set());
    setMintProgress(0);
  };

  // Preview Data
  const previewRegId = Array.from(selectedRegs)[0] || issued[0]?.id || eligible[0]?.id;
  const previewReg = registrations.find(r => r.id === previewRegId);

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex justify-between items-center shrink-0">
        <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={32} />
                Certification Authority
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage issuance and design for {club.name}.</p>
        </div>
        <div className="bg-white dark:bg-[#111C44] p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex">
            <button 
                onClick={() => setActiveTab('issuance')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'issuance' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
                Issuance Console
            </button>
            <button 
                onClick={() => setActiveTab('design')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'design' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
                <Palette size={14} /> Design Studio
            </button>
        </div>
      </div>

      {activeTab === 'issuance' ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
            {/* Left: Controls */}
            <div className="lg:col-span-7 flex flex-col gap-6 h-full min-h-0">
                <div className="flex items-center gap-3 bg-white dark:bg-[#111C44] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 opacity-50">Event Scope</span>
                    <select 
                        value={activeEventId} 
                        onChange={(e) => { setActiveEventId(e.target.value); setSelectedRegs(new Set()); }}
                        className="bg-transparent font-bold text-sm outline-none cursor-pointer pr-4 w-full"
                    >
                        {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                </div>

                {missingSignatures && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3">
                        <AlertTriangle size={24} />
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest">Protocol Halted</p>
                            <p className="text-[10px] font-medium">Missing digital signatures from {president?.signatureUrl ? '' : 'President '} {!faculty?.signatureUrl && !president?.signatureUrl ? '& ' : ''} {faculty?.signatureUrl ? '' : 'Faculty'}.</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter candidates..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 outline-none font-bold text-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setSelectedRegs(selectedRegs.size === eligible.length ? new Set() : new Set(eligible.map(r => r.id)))}
                        className="px-5 py-3 rounded-2xl bg-white dark:bg-[#111C44] border font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        {selectedRegs.size === eligible.length && eligible.length > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="flex-1 bg-white dark:bg-[#111C44] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative shadow-sm">
                    {isMinting && (
                        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                            <Loader2 size={64} className="text-emerald-500 animate-spin mb-6" />
                            <h3 className="text-2xl font-black">Minting Credentials</h3>
                            <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${mintProgress}%` }} /></div>
                        </div>
                    )}
                    <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {currentEventRegs
                            .filter(r => r.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(reg => (
                            <div 
                                key={reg.id}
                                onClick={() => !reg.certificateId && setSelectedRegs(prev => { const n = new Set(prev); n.has(reg.id) ? n.delete(reg.id) : n.add(reg.id); return n; })}
                                className={`p-4 rounded-3xl flex justify-between items-center transition-all cursor-pointer ${
                                    selectedRegs.has(reg.id) ? 'bg-emerald-500/10 border border-emerald-500/50' : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedRegs.has(reg.id) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {selectedRegs.has(reg.id) ? <CheckCircle2 size={18}/> : reg.studentName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{reg.studentName}</p>
                                        <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">{reg.studentRoll}</p>
                                    </div>
                                </div>
                                {reg.certificateId && <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full">Issued</span>}
                            </div>
                        ))}
                    </div>
                    <div className="p-6 border-t dark:border-slate-800">
                        <button 
                            onClick={handleMinting}
                            disabled={selectedRegs.size === 0 || missingSignatures}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 ${selectedRegs.size > 0 && !missingSignatures ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            <Cpu size={18} /> Mint {selectedRegs.size} Certificates
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-5 flex flex-col h-full min-h-0 space-y-6">
                <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-slate-800 flex-1 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="w-full transform transition-all group-hover:scale-[1.02] duration-500">
                        <CertificatePreview 
                            studentName={previewReg?.studentName || "Student Name"}
                            enrollmentNumber={previewReg?.studentRoll || "Enrollment No"}
                            eventName={activeEvent?.title || "Event Title"}
                            clubName={club.name}
                            clubLogoUrl={club.logoUrl}
                            id="PREVIEW-MODE"
                            date={activeEvent?.date}
                            facultySignature={faculty?.signatureUrl}
                            presidentSignature={president?.signatureUrl}
                            template={designConfig.templateId}
                            customBackgroundUrl={designConfig.customBackgroundUrl}
                            themeColor={club.themeColor}
                        />
                    </div>
                    <div className="absolute bottom-8 flex gap-4">
                        <button className="px-6 py-3 bg-white/10 backdrop-blur rounded-xl text-white text-xs font-bold flex items-center gap-2 hover:bg-white/20 transition-all"><Download size={16}/> Save PDF</button>
                    </div>
                </div>
            </div>
          </div>
      ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar">
              {/* Settings Panel */}
              <div className="lg:col-span-1 space-y-8 bg-white dark:bg-[#111C44] p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-black tracking-tight mb-4">Template Settings</h2>
                  
                  <div className="space-y-4">
                      <label className="text-xs font-bold opacity-60 uppercase tracking-widest">Select Layout</label>
                      <div className="grid grid-cols-2 gap-3">
                          {(['classic', 'modern', 'tech', 'elegant', 'minimal'] as CertificateTemplate[]).map(t => (
                              <button 
                                key={t} 
                                onClick={() => setDesignConfig({ ...designConfig, templateId: t })}
                                className={`p-4 rounded-2xl border text-left transition-all ${
                                    designConfig.templateId === t 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                }`}
                              >
                                  <span className="block text-sm font-bold capitalize">{t}</span>
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                      <label className="text-xs font-bold opacity-60 uppercase tracking-widest">Custom Background</label>
                      <div 
                        onClick={() => bgInputRef.current?.click()}
                        className="h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                          {designConfig.customBackgroundUrl ? (
                              <img src={designConfig.customBackgroundUrl} className="h-full w-full object-cover rounded-2xl opacity-50" />
                          ) : (
                              <div className="text-center text-slate-400">
                                  <ImageIcon className="mx-auto mb-2" />
                                  <span className="text-[10px] font-bold uppercase">Upload Image</span>
                              </div>
                          )}
                          <input type="file" ref={bgInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />
                      </div>
                      {designConfig.customBackgroundUrl && (
                          <button onClick={() => setDesignConfig({...designConfig, customBackgroundUrl: undefined})} className="text-xs text-rose-500 font-bold hover:underline">Remove Custom Background</button>
                      )}
                  </div>

                  <button 
                    onClick={handleSaveDesign}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                      <Save size={16} /> Save Configuration
                  </button>
              </div>

              {/* Preview Area */}
              <div className="lg:col-span-2 bg-slate-100 dark:bg-[#0B1024] rounded-[3rem] p-10 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div className="w-full max-w-4xl shadow-2xl rounded-sm overflow-hidden transform transition-all duration-500">
                      <CertificatePreview 
                          studentName="Amit Sharma"
                          enrollmentNumber="0901CS221045"
                          eventName="Tech-Sprint Hackathon 2026"
                          clubName={club.name}
                          clubLogoUrl={club.logoUrl}
                          id="PREVIEW-TEMPLATE-001"
                          date={new Date().toISOString()}
                          facultySignature={faculty?.signatureUrl}
                          presidentSignature={president?.signatureUrl}
                          template={designConfig.templateId}
                          customBackgroundUrl={designConfig.customBackgroundUrl}
                          themeColor={club.themeColor}
                      />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CertificationGovernance;
