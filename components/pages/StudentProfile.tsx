
import React, { useState, useRef, useEffect } from 'react';
import { User, Registration, Applicant, Event, SavedEvent, Role, ClubRole } from '../../types';
import { db } from '../../db';
import { 
  User as UserIcon, 
  MapPin, 
  ShieldCheck, 
  Save, 
  Edit2,
  Zap,
  CheckCircle2, 
  Camera, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Plus, 
  X, 
  Heart, 
  Calendar, 
  Briefcase, 
  ListPlus, 
  Trash2, 
  Layers, 
  Award as AwardIcon,
  PenTool,
  Upload,
  RefreshCw
} from 'lucide-react';

interface Props {
  user: User;
  onSave: (updatedUser: User) => void;
  isDarkMode: boolean;
  registrations: Registration[];
  applicants: Applicant[];
  events: Event[];
}

const StudentProfile: React.FC<Props> = ({ user, onSave, isDarkMode, registrations, applicants, events }) => {
  const [formData, setFormData] = useState<User>({ ...user });
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  // Dashboard Data
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [myProposals, setMyProposals] = useState<Event[]>([]);
  
  // Filtered Lists
  const myRegistrations = registrations.filter(r => r.studentId === user.id);
  const myApplications = applicants.filter(a => a.name === user.name); 

  // Authority Check
  const isAuthority = user.globalRole === Role.FACULTY || user.clubMemberships.some(m => m.role === ClubRole.PRESIDENT);

  useEffect(() => {
    const fetchData = async () => {
        const saved = await db.getSavedEvents(user.id);
        const savedEventObjs = saved.map(s => events.find(e => e.id === s.eventId)).filter(e => e !== undefined) as Event[];
        setSavedEvents(savedEventObjs);
        const proposals = events.filter(e => e.createdBy === user.id);
        setMyProposals(proposals);
    };
    fetchData();
  }, [user.id, events]);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                // Auto Remove Background Logic via Canvas
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imgData.data;
                    
                    // Iterate through pixels to remove white/light background
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        // If pixel is light (white/grey), make it transparent
                        if (r > 200 && g > 200 && b > 200) {
                            data[i + 3] = 0; // Alpha = 0
                        }
                    }
                    ctx.putImageData(imgData, 0, 0);
                    setFormData(prev => ({ ...prev, signatureUrl: canvas.toDataURL() }));
                }
            };
        };
        reader.readAsDataURL(file);
    }
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !(formData.skills || []).includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (!isEditing) return;
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skillToRemove)
    }));
  };

  const removeSavedEvent = async (eventId: string) => {
      await db.toggleSavedEvent(user.id, eventId);
      setSavedEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleCreateProposal = async () => {
      const title = prompt("Enter Event Title:");
      if(!title) return;
      
      const newEvent: Event = {
          id: `evt-${Date.now()}`,
          clubId: user.clubMemberships[0]?.clubId || 'club-octane',
          title: title,
          description: "User Proposed Event",
          type: 'Free',
          status: 'Pending',
          date: new Date().toISOString().split('T')[0],
          isFinalized: false,
          createdBy: user.id
      };
      await db.saveEvent(newEvent);
      setMyProposals(prev => [...prev, newEvent]);
      alert("Event proposal submitted for approval.");
  };

  const inputClasses = `w-full px-6 py-4 rounded-2xl border outline-none transition-all text-sm font-bold ${
    isDarkMode 
      ? 'bg-slate-900 border-slate-800 text-white focus:border-primary placeholder:text-slate-600' 
      : 'bg-slate-50 border-slate-200 focus:border-primary placeholder:text-slate-400'
  } ${!isEditing ? 'opacity-60 cursor-default' : ''}`;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16 pb-24 relative">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-24 right-10 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="bg-emerald-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 font-black text-xs uppercase tracking-widest">
            <CheckCircle2 size={24} /> 
            <span>Profile Updated</span>
          </div>
        </div>
      )}

      {/* Top Banner Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <section className={`p-10 rounded-[3rem] border flex flex-col items-center text-center ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-800 overflow-hidden border-4 border-primary/20 shadow-2xl relative">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <UserIcon size={64} />
                  </div>
                )}
              </div>
              {isEditing && (
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-4 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all z-10">
                  <Camera size={20} />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
            
            <div className="mt-8 space-y-2">
              <h3 className="text-3xl font-black tracking-tighter text-white">{formData.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{formData.globalRole}</p>
            </div>

            <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`mt-8 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-[#111C44] text-[#A3AED0] hover:text-white'}`}
            >
                {isEditing ? <><Save size={16}/> Sync Entry</> : <><Edit2 size={16}/> Modify Ledger</>}
            </button>
          </section>

          {/* Signature Section (Only for Authorities) */}
          {isAuthority && (
            <section className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><PenTool size={18}/></div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Digital Authority</h4>
                </div>
                
                <div className="space-y-4">
                    <div className={`h-32 w-full rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden ${
                        isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                    }`}>
                        {formData.signatureUrl ? (
                            <img src={formData.signatureUrl} className="max-w-[80%] max-h-[80%] object-contain mix-blend-difference invert" alt="Signature" />
                        ) : (
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-50">No Signature</p>
                        )}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <button onClick={() => signatureInputRef.current?.click()} className="text-white flex flex-col items-center gap-2">
                                    <Upload size={24} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Upload Image</span>
                                </button>
                                <p className="text-[8px] text-white/50 mt-2">Auto Background Removal</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={signatureInputRef} onChange={handleSignatureUpload} className="hidden" accept="image/*" />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        This signature will be automatically processed to remove background and applied to valid certificates issued under your authority.
                    </p>
                </div>
            </section>
          )}

          {/* Skills Section */}
          <section className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Zap size={18}/></div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Verified Skills</h4>
                  </div>
                  {isEditing && (
                      <form onSubmit={addSkill} className="flex items-center gap-2">
                          <input 
                              type="text" 
                              value={newSkill}
                              onChange={e => setNewSkill(e.target.value)}
                              placeholder="Add..."
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs outline-none focus:border-primary text-white"
                          />
                          <button type="submit" className="p-1 bg-primary rounded-md text-white"><Plus size={14}/></button>
                      </form>
                  )}
              </div>
              <div className="flex flex-wrap gap-2">
                  {(formData.skills || []).map(skill => (
                    <span 
                        key={skill} 
                        className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-2"
                    >
                        {skill}
                        {isEditing && <button onClick={() => removeSkill(skill)} className="hover:text-rose-500"><X size={12}/></button>}
                    </span>
                  ))}
                  {(formData.skills || []).length === 0 && <p className="text-xs text-slate-500 italic">No specialized skills indexed.</p>}
              </div>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-8">
           {/* Council Memberships (The "Club Profile") */}
           <section className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'} space-y-10`}>
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Layers size={24} /></div>
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Council Appointments</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.clubMemberships.length > 0 ? user.clubMemberships.map(m => (
                    <div key={m.clubId} className="p-6 rounded-[2.5rem] bg-[#111C44] border border-white/5 flex items-center justify-between group hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl">
                                {m.clubId.charAt(5).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-lg font-black text-white leading-tight">{m.clubId.replace('club-', '').toUpperCase()}</p>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{m.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            <ShieldCheck size={12} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-2 py-10 text-center opacity-30">
                        <Layers size={48} className="mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.4em]">No active council slots</p>
                    </div>
                )}
              </div>
           </section>

           {/* Identity Ledger */}
           <section className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'} space-y-10`}>
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl"><ShieldCheck size={24} /></div>
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Institutional Records</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Identity Marker (Name)</label>
                    <input type="text" value={formData.name} disabled={!isEditing} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClasses}/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Enrollment Link (ID)</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={formData.enrollmentNumber || 'PENDING'} 
                            disabled={true} 
                            className={`${inputClasses} bg-slate-100 dark:bg-slate-800 opacity-70 cursor-not-allowed`}
                        />
                        {formData.enrollmentNumber && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                <ShieldCheck size={16} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Academic Node (Email)</label>
                    <input type="text" value={formData.email} disabled={!isEditing} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClasses}/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Connectivity (Phone)</label>
                    <input type="text" value={formData.phoneNumber || ''} placeholder="+91 0000000000" disabled={!isEditing} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className={inputClasses}/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Academic Unit (Branch)</label>
                    <input type="text" value={formData.branch || ''} placeholder="Ex: CSE" disabled={!isEditing} onChange={e => setFormData({...formData, branch: e.target.value})} className={inputClasses}/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Professional Link (LinkedIn)</label>
                    <input type="text" value={formData.linkedin || ''} placeholder="URL" disabled={!isEditing} onChange={e => setFormData({...formData, linkedin: e.target.value})} className={inputClasses}/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Source Archive (GitHub)</label>
                    <input type="text" value={formData.github || ''} placeholder="URL" disabled={!isEditing} onChange={e => setFormData({...formData, github: e.target.value})} className={inputClasses}/>
                </div>
              </div>
           </section>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="space-y-10">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Zap size={22}/></div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase tracking-widest opacity-60">System Pulsar</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 1. Registered Events */}
            <div className={`p-8 rounded-[3rem] border flex flex-col ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-8 text-emerald-500">
                    <Calendar size={24} />
                    <h3 className="font-black text-lg text-white">Event Registry</h3>
                    <span className="ml-auto bg-emerald-500/10 px-4 py-1 rounded-full text-[10px] font-black">{myRegistrations.length}</span>
                </div>
                <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {myRegistrations.length > 0 ? myRegistrations.map(reg => {
                        const ev = events.find(e => e.id === reg.eventId);
                        return (
                            <div key={reg.id} className="p-6 rounded-3xl bg-[#111C44] border border-white/5 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                                <div>
                                    <p className="font-black text-white text-sm tracking-tight">{ev?.title}</p>
                                    <p className="text-[9px] text-[#A3AED0] uppercase font-bold mt-1 tracking-widest">{reg.status}</p>
                                </div>
                                {reg.status === 'Approved' ? <CheckCircle2 size={16} className="text-emerald-500"/> : <Zap size={16} className="text-amber-500 animate-pulse"/>}
                            </div>
                        )
                    }) : <p className="text-xs text-[#A3AED0] italic opacity-40">No active pulse registrations found.</p>}
                </div>
            </div>

            {/* 2. Application Status */}
            <div className={`p-8 rounded-[3rem] border flex flex-col ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-8 text-blue-500">
                    <Briefcase size={24} />
                    <h3 className="font-black text-lg text-white">Membership Flow</h3>
                    <span className="ml-auto bg-blue-500/10 px-4 py-1 rounded-full text-[10px] font-black">{myApplications.length}</span>
                </div>
                <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {myApplications.length > 0 ? myApplications.map(app => (
                        <div key={app.id} className="p-6 rounded-3xl bg-[#111C44] border border-white/5 hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <p className="font-black text-white text-sm">{app.domain} Wing</p>
                                <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/10">{app.stage}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden shadow-inner">
                                <div 
                                    className="h-full bg-primary rounded-full shadow-[0_0_10px_var(--primary)] transition-all duration-1000" 
                                    style={{ width: ['Applied','Screening','Interview','Offer','Selected'].indexOf(app.stage) * 25 + '%' }} 
                                />
                            </div>
                        </div>
                    )) : <p className="text-xs text-[#A3AED0] italic opacity-40">No active recruitment cycles joined.</p>}
                </div>
            </div>

            {/* 3. Saved & Proposed Events */}
            <div className={`p-8 rounded-[3rem] border flex flex-col ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-8 text-rose-500">
                    <Heart size={24} />
                    <h3 className="font-black text-lg text-white">Curated List</h3>
                    <span className="ml-auto bg-rose-500/10 px-4 py-1 rounded-full text-[10px] font-black">{savedEvents.length}</span>
                </div>
                
                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                     {savedEvents.length > 0 ? savedEvents.map(ev => (
                        <div key={ev.id} className="p-5 rounded-3xl bg-[#111C44] border border-white/5 flex justify-between items-center group hover:bg-rose-500/5 transition-all">
                            <p className="font-bold text-white text-sm truncate">{ev.title}</p>
                            <button onClick={() => removeSavedEvent(ev.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-full transition-all"><Heart size={16} fill="currentColor" /></button>
                        </div>
                    )) : <p className="text-xs text-[#A3AED0] italic opacity-40">Identity vault contains no bookmarks.</p>}
                </div>

                <div className="border-t border-white/5 pt-8 mt-auto">
                    <div className="flex items-center justify-between mb-6 text-purple-500">
                        <div className="flex items-center gap-3">
                            <ListPlus size={20} />
                            <h3 className="font-black text-xs uppercase tracking-widest text-white/60">Institutional Listings</h3>
                        </div>
                        <button onClick={handleCreateProposal} className="p-3 bg-purple-500/10 rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-lg active:scale-95"><Plus size={18}/></button>
                    </div>
                    <div className="space-y-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                        {myProposals.map(ev => (
                            <div key={ev.id} className="text-xs font-bold flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-white truncate">{ev.title}</span>
                                <span className={`uppercase text-[8px] font-black px-2 py-0.5 rounded ${ev.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{ev.status}</span>
                            </div>
                        ))}
                        {myProposals.length === 0 && <p className="text-[10px] text-[#A3AED0] opacity-40 italic">Registry contains no active proposals.</p>}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
