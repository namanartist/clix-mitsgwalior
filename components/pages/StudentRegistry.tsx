
import React, { useState } from 'react';
import { User, Role } from '../../types';
import { db } from '../../db';
import { 
  UserPlus, 
  Upload, 
  Search, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Fingerprint, 
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldAlert,
  Download
} from 'lucide-react';

interface Props {
  allUsers: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onRemoveUser?: (userId: string) => void;
  isDarkMode: boolean;
}

const StudentRegistry: React.FC<Props> = ({ allUsers, onAddUser, onUpdateUser, onRemoveUser, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    enrollment: '',
    branch: ''
  });

  const students = allUsers.filter(u => u.globalRole === Role.STUDENT);
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.enrollmentNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for Duplicate Email
    if (allUsers.some(u => u.email.toLowerCase() === newStudent.email.toLowerCase())) {
        alert("Registration Error: Institutional Node (Email) already exists in the ledger.");
        return;
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: newStudent.name,
      email: newStudent.email,
      password: db.generateRandomPassword(),
      globalRole: Role.STUDENT,
      clubMemberships: [],
      enrollmentNumber: newStudent.enrollment,
      branch: newStudent.branch
    };
    onAddUser(user);
    setIsSingleModalOpen(false);
    setNewStudent({ name: '', email: '', enrollment: '', branch: '' });
  };

  const handleBulkSubmit = () => {
    const lines = bulkText.split('\n').filter(line => line.trim().length > 0);
    let count = 0;
    
    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const [name, email, enrollment, branch] = parts;
        // Check for duplicates in bulk
        if (!allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            const user: User = {
              id: `user-bulk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name,
              email,
              password: db.generateRandomPassword(),
              globalRole: Role.STUDENT,
              clubMemberships: [],
              enrollmentNumber: enrollment || '',
              branch: branch || ''
            };
            onAddUser(user);
            count++;
        }
      }
    });

    alert(`Institutional Ledger Updated: ${count} students imported successfully. Duplicates skipped.`);
    setIsBulkModalOpen(false);
    setBulkText('');
  };

  const handleGenerateKey = (student: User) => {
    const newKey = db.generateRandomPassword();
    onUpdateUser({ ...student, password: newKey });
    alert(`Institutional Security Protocol: New key generated for ${student.name}: ${newKey}`);
  };

  const handleBatchGenerate = () => {
    if (window.confirm(`Generate new institutional security keys for all ${filteredStudents.length} filtered students? This will overwrite existing keys.`)) {
      filteredStudents.forEach(s => {
        onUpdateUser({ ...s, password: db.generateRandomPassword() });
      });
      alert(`Batch Generation Complete: ${filteredStudents.length} identities provisioned.`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className={`text-4xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Student Registry</h1>
          <p className="text-slate-500 font-medium">Global institutional ledger of all student identities at MITS Gwalior.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleBatchGenerate}
            className={`px-6 py-3 rounded-2xl border-2 border-dashed flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${
              isDarkMode ? 'border-blue-600/30 text-blue-400 hover:text-blue-300 hover:border-blue-500' : 'border-blue-200 text-blue-500 hover:text-blue-700'
            }`}
          >
            <Key size={18} /> Batch Generate Keys
          </button>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className={`px-6 py-3 rounded-2xl border-2 border-dashed flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${
              isDarkMode ? 'border-slate-800 text-slate-500 hover:text-slate-300' : 'border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            <Upload size={18} /> Bulk Import
          </button>
          <button 
            onClick={() => setIsSingleModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <UserPlus size={18} /> Single Entry
          </button>
        </div>
      </header>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filter by Name, Roll Number or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-6 py-4 rounded-3xl border outline-none focus:border-blue-500 transition-all text-sm font-bold ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-[#1B2559] placeholder-slate-400'
            }`}
          />
        </div>
        <div className={`px-6 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest opacity-60 flex items-center gap-3 ${
          isDarkMode ? 'bg-slate-800/30 border-slate-800 text-white' : 'bg-slate-50 border-slate-100 text-[#1B2559]'
        }`}>
          <Fingerprint size={16} className="text-blue-500" /> {filteredStudents.length} Identities
        </div>
      </div>

      <div className={`rounded-[3rem] border overflow-hidden ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <table className="w-full text-left">
          <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th className="px-10 py-8">Institutional Identity</th>
              <th className="px-10 py-8">Security Key</th>
              <th className="px-10 py-8">Academic Unit</th>
              <th className="px-10 py-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredStudents.length > 0 ? filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-blue-600/5 transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black text-xl border border-blue-500/10">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className={`font-black text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{s.name}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-slate-500">{s.enrollmentNumber || 'ROLL-PENDING'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-50 border-slate-200 text-blue-600'
                    }`}>
                      {s.password || 'NOT-SET'}
                    </div>
                    <button 
                      onClick={() => handleGenerateKey(s)}
                      className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      title="Regenerate Key"
                    >
                      <Key size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className="px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {s.branch || 'General'}
                  </span>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => onRemoveUser?.(s.id)}
                      className="p-3 rounded-xl bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-600 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-10 py-20 text-center opacity-30 font-black uppercase tracking-[0.4em] text-sm text-slate-500">
                  No records matching the current filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Single Entry Modal */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className={`max-w-xl w-full p-10 rounded-[3rem] border shadow-2xl space-y-8 animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Single Identity Entry</h2>
                <p className="text-slate-500 text-sm font-medium">Add a single student to the institutional ledger.</p>
              </div>
              <button onClick={() => setIsSingleModalOpen(false)} className="p-3 rounded-2xl hover:bg-slate-800/10 transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-slate-500">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className={`w-full px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-slate-500">Enrollment Number</label>
                  <input 
                    required
                    type="text" 
                    value={newStudent.enrollment}
                    onChange={(e) => setNewStudent({...newStudent, enrollment: e.target.value})}
                    className={`w-full px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-slate-500">Institutional Email</label>
                <input 
                  required
                  type="email" 
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className={`w-full px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-slate-500">Department / Branch</label>
                <input 
                  required
                  type="text" 
                  value={newStudent.branch}
                  onChange={(e) => setNewStudent({...newStudent, branch: e.target.value})}
                  className={`w-full px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`}
                />
              </div>

              <button className="w-full py-6 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all">
                Synchronize Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className={`max-w-2xl w-full p-10 rounded-[3rem] border shadow-2xl space-y-8 animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Institutional Bulk Import</h2>
                <p className="text-slate-500 text-sm font-medium">Batch process student identities via the CSV protocol.</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-3 rounded-2xl hover:bg-slate-800/10 transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className={`p-6 rounded-2xl border flex items-start gap-4 ${isDarkMode ? 'bg-blue-600/10 border-blue-600/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              <AlertCircle size={24} className="shrink-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">Protocol Instructions</p>
                <p className="text-xs font-medium opacity-80 leading-relaxed">Paste records in CSV format: <code className="bg-slate-950/10 px-1 rounded">Name, Email, RollNumber, Branch</code>. Each record must occupy a new line.</p>
              </div>
            </div>

            <textarea 
              rows={10}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Aman Gupta, aman@mitsgwl.ac.in, CSE21001, CSE&#10;Sneha Jain, sneha@mitsgwl.ac.in, IT21045, IT"
              className={`w-full px-8 py-6 rounded-[2rem] border outline-none focus:border-blue-500 transition-all text-sm font-mono leading-relaxed ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-100 text-[#1B2559]'
              }`}
            />

            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setIsBulkModalOpen(false)}
                className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-800/10 transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={!bulkText.trim()}
                onClick={handleBulkSubmit}
                className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all ${
                  bulkText.trim() ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <FileSpreadsheet size={18} /> Execute Batch Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistry;
