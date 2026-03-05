
import React, { useState, useRef } from 'react';
import { Club } from '../../types';
import { 
  Save, 
  Image as ImageIcon, 
  Palette, 
  Settings as SettingsIcon, 
  AlertCircle,
  Undo2,
  CheckCircle2,
  ShieldCheck,
  Upload,
  UserCheck
} from 'lucide-react';

interface Props {
  club: Club;
  onSave: (updatedClub: Club) => void;
  isDarkMode: boolean;
}

const ClubSettings: React.FC<Props> = ({ club, onSave, isDarkMode }) => {
  const [formData, setFormData] = useState<Club>(JSON.parse(JSON.stringify(club)));
  const [showSavedToast, setShowSavedToast] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <SettingsIcon size={28} />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Administrative Governance</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg">Manage institutional metadata and internal identity for {club.name}.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setFormData(JSON.parse(JSON.stringify(club)))}
            className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border-2 border-dashed ${
              isDarkMode ? 'border-slate-800 text-slate-500 hover:text-slate-300' : 'border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            <Undo2 size={16} /> Revert
          </button>
          <button 
            onClick={handleSave}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
          >
            <Save size={18} /> Sync Metadata
          </button>
        </div>
      </header>

      {showSavedToast && (
        <div className="fixed top-20 right-10 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="bg-emerald-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 font-black text-xs uppercase tracking-widest">
            <CheckCircle2 size={24} /> 
            <span>Governance Ledger Updated</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <section className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'} space-y-8`}>
            <div className="flex items-center gap-3 border-b border-slate-800/10 pb-6">
              <ShieldCheck className="text-blue-500" size={24} />
              <h2 className="text-xl font-black uppercase tracking-widest opacity-60">Core Registry Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Official Club Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 transition-all text-sm font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Classification</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className={`w-full px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 transition-all text-sm font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Technical">Technical Wing</option>
                  <option value="Cultural">Cultural Wing</option>
                  <option value="Social">Social Wing</option>
                  <option value="Sports">Sports Wing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center justify-between">
                  Logo Asset
                  <button onClick={() => logoInputRef.current?.click()} className="text-blue-500 hover:underline flex items-center gap-1 normal-case font-bold"><Upload size={10} /> Local Upload</button>
                  <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                </label>
                <input 
                  type="text" 
                  value={formData.logoUrl || ''} 
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="Asset URL"
                  className={`w-full px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 transition-all text-sm font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">System Accent Color</label>
                <div className="flex gap-4">
                   <input 
                    type="color" 
                    value={formData.themeColor} 
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="w-16 h-14 rounded-xl border-none cursor-pointer bg-transparent overflow-hidden"
                  />
                  <input 
                    type="text" 
                    value={formData.themeColor} 
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className={`flex-1 px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 transition-all text-sm font-mono ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'} space-y-8`}>
            <div className="flex items-center gap-3 border-b border-slate-800/10 pb-6">
              <UserCheck className="text-blue-500" size={24} />
              <h2 className="text-xl font-black uppercase tracking-widest opacity-60">Council Leadership Roster</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(formData.leadership).map(([role, holder]) => (
                <div key={role} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">{role}</label>
                  <input 
                    type="text" 
                    value={holder} 
                    onChange={(e) => {
                      const newLeadership = { ...formData.leadership, [role]: e.target.value };
                      setFormData({ ...formData, leadership: newLeadership });
                    }}
                    className={`w-full px-5 py-3 rounded-xl border outline-none focus:border-blue-500 text-xs font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-40">Identity Snapshot</h3>
              <div className="flex flex-col items-center text-center gap-6">
                 <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl overflow-hidden" style={{ backgroundColor: formData.themeColor }}>
                    {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-cover" /> : formData.name[0]}
                 </div>
                 <div>
                    <h4 className="text-2xl font-black tracking-tight">{formData.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mt-1">{formData.category} Excellence Council</p>
                 </div>
              </div>
            </div>

            <div className={`p-8 rounded-[2.5rem] border flex items-start gap-4 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
              <AlertCircle className="text-amber-500 shrink-0 mt-1" size={20} />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Security Notice</p>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">Administrative changes are logged in the institutional audit trail. Updates to the club name require faculty verification.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubSettings;
