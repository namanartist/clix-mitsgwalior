
import React, { useState } from 'react';
import { User, Role } from '../../types';
import { db } from '../../db';
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Key,
  X,
  GraduationCap,
  Trash2
} from 'lucide-react';

interface Props {
  allUsers: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onRemoveUser?: (id: string) => void;
  isDarkMode: boolean;
}

const FacultyRegistry: React.FC<Props> = ({ allUsers, onAddUser, onUpdateUser, onRemoveUser, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    department: ''
  });

  const facultyMembers = allUsers.filter(u => u.globalRole === Role.FACULTY);
  
  const filteredFaculty = facultyMembers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.branch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for Duplicate Email
    if (allUsers.some(u => u.email.toLowerCase() === newFaculty.email.toLowerCase())) {
        alert("Registration Error: Faculty Node (Email) already exists.");
        return;
    }

    const user: User = {
      id: `faculty-${Date.now()}`,
      name: newFaculty.name,
      email: newFaculty.email,
      globalRole: Role.FACULTY,
      clubMemberships: [],
      branch: newFaculty.department,
      password: 'MITS_FACULTY_' + Math.random().toString(36).slice(-6).toUpperCase()
    };
    onAddUser(user);
    setNewFaculty({ name: '', email: '', department: '' });
    setIsAddModalOpen(false);
  };

  const handleGenerateKey = (faculty: User) => {
    const newKey = db.generateRandomPassword();
    onUpdateUser({ ...faculty, password: newKey });
    alert(`Security Protocol: New credentials generated for ${faculty.name}: ${newKey}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Faculty Registry</h1>
          <p className="text-slate-500 font-medium">Manage institutional faculty coordinators and department heads.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-3"
        >
          <UserPlus size={18} /> Register Faculty
        </button>
      </header>

      {/* Search and List */}
      <div className="space-y-6">
        <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by Name, Department or Email..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className={`w-full pl-12 pr-6 py-4 rounded-3xl border outline-none focus:border-blue-500 transition-all text-sm font-bold ${
                 isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white border-slate-200'
               }`}
             />
        </div>

        <div className={`rounded-[3rem] border overflow-hidden ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <table className="w-full text-left">
              <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-10 py-8">Faculty Identity</th>
                  <th className="px-10 py-8">Department</th>
                  <th className="px-10 py-8">Credentials</th>
                  <th className="px-10 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredFaculty.map(f => (
                  <tr key={f.id} className="hover:bg-emerald-500/5 transition-colors group">
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center font-black text-xl">
                              {f.name[0]}
                           </div>
                           <div>
                              <p className="font-black text-lg tracking-tight">{f.name}</p>
                              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{f.email}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-10 py-8">
                        <span className="px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-300">
                            {f.branch || 'General Administration'}
                        </span>
                     </td>
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-[10px] font-mono opacity-60">
                                <Key size={12} /> {f.password || '••••••••'}
                            </div>
                            <button 
                              onClick={() => handleGenerateKey(f)}
                              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                              title="Regenerate Key"
                            >
                              <Key size={14} />
                            </button>
                        </div>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3 items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                <ShieldCheck size={14} /> Active
                            </span>
                            <button 
                              onClick={() => onRemoveUser?.(f.id)}
                              className="p-3 rounded-xl bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-600 transition-all opacity-0 group-hover:opacity-100"
                              title="Remove Faculty"
                            >
                              <Trash2 size={18} />
                            </button>
                        </div>
                     </td>
                  </tr>
                ))}
                {filteredFaculty.length === 0 && (
                  <tr><td colSpan={4} className="px-10 py-20 text-center opacity-30 font-black uppercase tracking-widest">No faculty records found</td></tr>
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className={`max-w-xl w-full p-12 rounded-[4rem] border shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white'
          }`}>
             <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Register Faculty</h2>
                <p className="text-slate-500 text-sm mt-1">Onboard a new faculty coordinator.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-4 bg-slate-800/50 rounded-2xl text-white hover:bg-rose-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={newFaculty.name}
                      onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                      placeholder="Dr. Name Surname"
                      className={`w-full px-8 py-5 rounded-[2rem] border outline-none font-bold ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Institutional Email</label>
                    <input 
                      required
                      type="email" 
                      value={newFaculty.email}
                      onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})}
                      placeholder="faculty@mitsgwl.ac.in"
                      className={`w-full px-8 py-5 rounded-[2rem] border outline-none font-bold ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Department</label>
                    <input 
                      required
                      type="text" 
                      value={newFaculty.department}
                      onChange={(e) => setNewFaculty({...newFaculty, department: e.target.value})}
                      placeholder="CSE / IT / MAC"
                      className={`w-full px-8 py-5 rounded-[2rem] border outline-none font-bold ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                </div>
                <button className="w-full py-6 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all">
                    Generate Credentials
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyRegistry;
