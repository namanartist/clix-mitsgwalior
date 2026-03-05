
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Club, CustomSection, Event } from '../../types';
import { 
  Save, 
  Image as ImageIcon, 
  Type, 
  Globe, 
  Layout, 
  Undo2,
  CheckCircle2,
  Sparkles,
  Eye,
  Upload,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
  Zap,
  Target,
  Users,
  Code,
  Globe2,
  Layers,
  Settings,
  Rocket,
  Clock,
  Calendar,
  X,
  MapPin,
  Tag,
  CreditCard
} from 'lucide-react';
import { aiService } from '../../ai';

interface Props {
  club: Club;
  events: Event[];
  onSave: (updatedClub: Club) => void;
  isDarkMode: boolean;
}

const ClubSiteEditor: React.FC<Props> = ({ club, events, onSave, isDarkMode }) => {
  const [formData, setFormData] = useState<Club>({ ...club, customSections: club.customSections || [] });
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const categorizedEvents = useMemo(() => {
    const now = new Date();
    return {
      live: events.filter(e => new Date(e.date).toDateString() === now.toDateString()),
      upcoming: events.filter(e => new Date(e.date) > now && new Date(e.date).toDateString() !== now.toDateString()),
    };
  }, [events]);

  const handleSave = () => {
    onSave(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const result = await aiService.generateClubContent(formData.name, formData.category);
      setFormData(prev => ({ 
        ...prev, 
        tagline: result.tagline,
        description: result.mission,
        customSections: result.sections.map((s: any) => ({
          id: `ai-${Date.now()}-${Math.random()}`,
          title: s.title,
          content: s.content,
          iconName: s.iconName
        }))
      }));
    } catch (e) {
      alert("AI Engine is currently at capacity. Please try again shortly.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, bannerUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSection = () => {
    const newSec: CustomSection = {
      id: `sec-${Date.now()}`,
      title: 'New Content Module',
      content: 'Elaborate on club specialized activities here...',
      iconName: 'Layers'
    };
    setFormData(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSec]
    }));
  };

  const removeSection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter(s => s.id !== id)
    }));
  };

  const updateSection = (id: string, updates: Partial<CustomSection>) => {
    setFormData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden">
      {/* Editor Sidebar */}
      <div className="w-1/2 overflow-y-auto p-8 border-r border-white/5 space-y-10 custom-scrollbar pb-32">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Layout size={28} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white">Site Studio</h1>
            </div>
            <p className="text-[#A3AED0] font-medium text-lg mt-1 italic">Craft a world-class digital home for {club.name}.</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="group bg-gradient-to-br from-primary to-purple-600 text-white p-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl flex flex-col items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={32} /> : <Sparkles className="group-hover:rotate-12 transition-transform" size={32} />}
            AI Persona Generator
          </button>
          <button 
            onClick={handleSave}
            className="bg-[#111C44] border border-primary/20 text-white p-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl flex flex-col items-center gap-4 transition-all hover:bg-[#1B254B] hover:scale-[1.02] active:scale-95"
          >
            <Rocket size={32} className="text-primary" />
            Publish Changes
          </button>
        </div>

        {showSavedToast && (
          <div className="p-5 rounded-2xl bg-emerald-600 text-white flex items-center gap-4 font-black text-xs uppercase tracking-widest mb-8 animate-in slide-in-from-top-4">
            <CheckCircle2 size={24} /> 
            <span>Public Identity Synchronized</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Brand Strategy */}
          <section className="bg-[#111C44] p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-xl">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Globe2 size={24} /></div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">Brand Foundation</h2>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3AED0] flex items-center gap-2 ml-2">Hero Tagline</label>
              <input 
                type="text" 
                value={formData.tagline || ''} 
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="High-impact mission summary..."
                className="w-full bg-[#0B1437] border border-white/10 px-8 py-6 rounded-[2rem] outline-none focus:border-primary transition-all font-bold text-white text-lg"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3AED0] ml-2">Strategic Vision (Description)</label>
              <textarea 
                rows={6}
                value={formData.description || ''} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="The definitive purpose of your organization..."
                className="w-full bg-[#0B1437] border border-white/10 px-8 py-6 rounded-[2.5rem] outline-none focus:border-primary transition-all font-medium text-white leading-relaxed"
              />
            </div>
          </section>

          {/* Visual Assets */}
          <section className="bg-[#111C44] p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><ImageIcon size={24} /></div>
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Visual Identity</h2>
              </div>
              <button onClick={() => bannerInputRef.current?.click()} className="bg-white/5 hover:bg-white/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Upload size={14} /> Upload Hero</button>
              <input type="file" accept="image/*" className="hidden" ref={bannerInputRef} onChange={handleFileUpload} />
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3AED0] ml-2">Banner Asset URL</label>
              <input 
                type="text" 
                value={formData.bannerUrl || ''} 
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                placeholder="Direct image link (CDN recommend)"
                className="w-full bg-[#0B1437] border border-white/10 px-8 py-6 rounded-[2rem] outline-none focus:border-primary transition-all font-mono text-xs text-[#A3AED0]"
              />
            </div>
          </section>

          {/* Custom Sections */}
          <section className="bg-[#111C44] p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Layers size={24} /></div>
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Content Architecture</h2>
              </div>
              <button 
                onClick={addSection}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
              >
                <Plus size={16} /> Add Module
              </button>
            </div>

            <div className="space-y-6">
              {(formData.customSections || []).map((sec, idx) => (
                <div key={sec.id} className="p-8 bg-[#0B1437] border border-white/10 rounded-[2.5rem] space-y-6 relative group">
                  <button 
                    onClick={() => removeSection(sec.id)}
                    className="absolute top-6 right-6 p-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]/40 ml-2">Module Title</label>
                       <input 
                         type="text"
                         value={sec.title}
                         onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                         className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl outline-none focus:border-primary text-white font-black text-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]/40 ml-2">Icon Descriptor</label>
                       <input 
                         type="text"
                         value={sec.iconName}
                         onChange={(e) => updateSection(sec.id, { iconName: e.target.value })}
                         className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl outline-none focus:border-primary text-white font-mono text-xs"
                         placeholder="Zap, Target, Code..."
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]/40 ml-2">Module Narrative</label>
                    <textarea 
                      rows={3}
                      value={sec.content}
                      onChange={(e) => updateSection(sec.id, { content: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary text-white font-medium text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ))}
              {(formData.customSections?.length || 0) === 0 && (
                <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center space-y-4 opacity-30">
                  <Layers size={48} className="mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No custom modules active</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Real-time Preview Area */}
      <div className="flex-1 bg-[#0B1437] p-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 animate-pulse"><Eye size={20} /></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Live Identity Render</h3>
            </div>
            <div className="flex p-1 bg-[#111C44] rounded-xl border border-white/10">
               <button onClick={() => setActivePreviewTab('desktop')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activePreviewTab === 'desktop' ? 'bg-primary text-white shadow-lg' : 'text-[#A3AED0]'}`}>Desktop</button>
               <button onClick={() => setActivePreviewTab('mobile')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activePreviewTab === 'mobile' ? 'bg-primary text-white shadow-lg' : 'text-[#A3AED0]'}`}>Mobile</button>
            </div>
        </div>

        <div className={`flex-1 rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] bg-white dark:mits-bg-main relative mits-text-main custom-scrollbar overflow-y-auto ${activePreviewTab === 'mobile' ? 'max-w-[400px] mx-auto' : 'w-full'}`}>
           {/* Mock Public Website View */}
           <div className="relative h-64 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
             <img src={formData.bannerUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800'} className="w-full h-full object-cover" alt="Banner" />
             <div className="absolute bottom-8 left-8 z-20 space-y-2 max-w-[80%]">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl" style={{ backgroundColor: formData.themeColor }}>{formData.name[0]}</div>
                  <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">MITS Council Org</span>
               </div>
               <h1 className="text-3xl font-black text-white tracking-tighter leading-none">{formData.name}</h1>
               <p className="text-white/80 font-bold italic text-sm truncate">"{formData.tagline || 'Innovation Hub at MITS'}"</p>
             </div>
           </div>

           <div className="p-10 space-y-12">
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Mission Intel</span>
                <p className="text-lg font-black tracking-tight leading-tight mits-text-main">{formData.description || 'Global mission narrative will appear in this segment.'}</p>
              </div>

              {/* Custom Sections Render */}
              <div className="grid grid-cols-1 gap-8">
                {(formData.customSections || []).map((sec) => (
                  <div key={sec.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-primary/5 text-primary">
                          <Layers size={20} />
                       </div>
                       <h4 className="text-sm font-black uppercase tracking-widest mits-text-main">{sec.title}</h4>
                    </div>
                    <p className="text-xs font-medium mits-text-muted leading-relaxed">{sec.content}</p>
                  </div>
                ))}
              </div>

              {/* Event Registry Preview */}
              <div className="space-y-6 pt-8 border-t border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Live Operations</span>
                <div className="space-y-4">
                  {[...categorizedEvents.live, ...categorizedEvents.upcoming].map(ev => (
                    <div 
                        key={ev.id} 
                        className="p-6 rounded-[2rem] border mits-border bg-white/5 hover:bg-white/10 transition-all cursor-pointer group" 
                        onClick={() => setSelectedEvent(ev)}
                    >
                        <h5 className="text-lg font-black tracking-tight mb-2 mits-text-main group-hover:text-primary transition-colors underline decoration-transparent group-hover:decoration-primary">{ev.title}</h5>
                        <p className="text-xs mits-text-muted line-clamp-2">{ev.description}</p>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                                <Clock size={12} /> {ev.date}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                ev.type === 'Paid' 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                                {ev.type}
                            </span>
                        </div>
                    </div>
                  ))}
                  {events.length === 0 && <p className="text-xs text-[#A3AED0] italic opacity-40">No active events in registry.</p>}
                </div>
              </div>
              
              <div className="pt-10 border-t border-white/5 text-center">
                 <p className="text-[8px] font-black uppercase tracking-[0.5em] opacity-20">© 2026 MITS GWALIOR • IDENTITY RENDER</p>
              </div>
           </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setSelectedEvent(null)}>
            <div className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#111C44] border border-white/10' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-rose-500 hover:text-white transition-all text-slate-400"
            >
                <X size={20} />
            </button>

            {selectedEvent.bannerUrl && (
                <div className="w-full h-40 rounded-[2rem] overflow-hidden mb-8 shadow-lg relative">
                    <img src={selectedEvent.bannerUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111C44]/80 to-transparent" />
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${selectedEvent.type === 'Paid' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                           <Tag size={12} /> {selectedEvent.type} Access
                       </span>
                       {selectedEvent.type === 'Paid' && (
                           <span className="text-sm font-black text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full bg-amber-500/5 flex items-center gap-1">
                               <CreditCard size={14} /> ₹{selectedEvent.fee}
                           </span>
                       )}
                    </div>
                    <h2 className={`text-3xl font-black tracking-tighter leading-tight ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>
                    {selectedEvent.title}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Calendar className="text-blue-500" size={20} />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Date</p>
                        <p className="text-sm font-bold">{selectedEvent.date}</p>
                    </div>
                    </div>
                    <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <MapPin className="text-rose-500" size={20} />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Location</p>
                        <p className="text-sm font-bold">MITS Campus</p>
                    </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Brief</h4>
                    <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-[#A3AED0]' : 'text-slate-600'}`}>
                    {selectedEvent.description}
                    </p>
                </div>
            </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClubSiteEditor;
