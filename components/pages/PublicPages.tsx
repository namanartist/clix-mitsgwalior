import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Send, 
  CheckCircle2,
  GraduationCap,
  Lock,
  Globe,
  Users
} from 'lucide-react';
import { db } from '../../db';
import { User, Club, Role, ClubRole } from '../../types';

// --- SHARED LAYOUT ---
interface LayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onBack: () => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<LayoutProps> = ({ title, subtitle, icon, onBack, children }) => (
  <div className="min-h-screen bg-[#0B1437] text-white font-sans flex flex-col items-center p-6 relative overflow-y-auto custom-scrollbar">
    <button 
      onClick={onBack} 
      className="fixed top-8 left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50 backdrop-blur-md text-white"
    >
      <ArrowLeft size={24} />
    </button>

    <div className="max-w-5xl w-full relative z-10 py-20 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        {icon && (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/5 border border-white/10 mb-4 shadow-2xl">
            {icon}
          </div>
        )}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            {subtitle}
          </p>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  </div>
);

// --- LEGAL PAGES ---
export const LegalDocs: React.FC<{ type: 'privacy' | 'tos'; onBack: () => void }> = ({ type, onBack }) => {
  const content = type === 'privacy' ? {
    title: 'Privacy Protocol',
    subtitle: 'Institutional Data Handling & Encryption Standards',
    body: (
      <div className="space-y-8 text-slate-300 leading-relaxed font-light">
        <p>At Madhav Institute of Technology & Science (MITS), data integrity is paramount. The Club Connect Management System (CCMS) operates under strict encryption protocols.</p>
        <h3 className="text-xl font-bold text-white">1. Data Collection</h3>
        <p>We collect minimal identity markers (Enrollment No, Institutional Email) required for authentication and event registration. All biometric data (signatures) is processed locally or stored in secured buckets.</p>
        <h3 className="text-xl font-bold text-white">2. Blockchain Verification</h3>
        <p>Credentials issued via CCMS are hashed and timestamped. This ensures issued certificates are immutable and verifiable by third parties.</p>
        <h3 className="text-xl font-bold text-white">3. Access Control</h3>
        <p>Faculty and Student Admins have tiered access. Your personal contact details are never exposed publicly without explicit consent (e.g., leadership directory).</p>
      </div>
    )
  } : {
    title: 'Terms of Service',
    subtitle: 'Campus Usage Guidelines',
    body: (
      <div className="space-y-8 text-slate-300 leading-relaxed font-light">
        <p>By accessing the MITS CCMS, you agree to the following institutional mandates:</p>
        <h3 className="text-xl font-bold text-white">1. Identity Verification</h3>
        <p>Users must utilize their official college email. Impersonation or proxy usage without authorization is a violation of the student code of conduct.</p>
        <h3 className="text-xl font-bold text-white">2. Financial Transactions</h3>
        <p>All UPI transactions for paid events are subject to audit. Uploading fraudulent payment proofs will result in immediate suspension of club privileges.</p>
        <h3 className="text-xl font-bold text-white">3. Content Policy</h3>
        <p>Club pages and event descriptions must adhere to university dignity standards. Hate speech or political activism on this platform is strictly prohibited.</p>
      </div>
    )
  };

  return (
    <PublicLayout 
      title={content.title} 
      subtitle={content.subtitle} 
      icon={<FileText size={32} className="text-blue-400" />} 
      onBack={onBack}
    >
      <div className="bg-[#111C44]/50 border border-white/10 rounded-[2.5rem] p-10 md:p-16 shadow-2xl backdrop-blur-md">
        {content.body}
      </div>
    </PublicLayout>
  );
};

// --- REPORT ISSUE ---
export const ReportIssue: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Anonymous Reporter',
      action: `ISSUE REPORTED: ${desc}`,
      clubId: 'Global'
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PublicLayout title="Report Received" onBack={onBack} icon={<CheckCircle2 size={32} className="text-emerald-500"/>}>
        <div className="text-center space-y-6 bg-[#111C44]/50 border border-white/10 rounded-[2.5rem] p-16">
          <p className="text-xl text-slate-300">Your report has been logged in the audit trail. The technical council will investigate shortly.</p>
          <button onClick={onBack} className="px-8 py-4 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform">
            Return Home
          </button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout 
      title="System Diagnostics" 
      subtitle="Report bugs, security vulnerabilities, or operational failures." 
      icon={<AlertTriangle size={32} className="text-amber-500" />} 
      onBack={onBack}
    >
      <div className="bg-[#111C44]/50 border border-white/10 rounded-[2.5rem] p-10 md:p-16 shadow-2xl backdrop-blur-md max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Issue Description</label>
            <textarea 
              required
              rows={6}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Describe the anomaly or error encountered..."
              className="w-full bg-[#0B1437] border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-amber-500 transition-all font-medium text-lg placeholder:text-slate-600"
            />
          </div>
          <button className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-600/20">
            <Send size={18} /> Transmit Log
          </button>
        </form>
      </div>
    </PublicLayout>
  );
};

// --- FACULTY PORTAL INFO ---
export const FacultyPortalInfo: React.FC<{ onBack: () => void; onLogin: () => void }> = ({ onBack, onLogin }) => {
  return (
    <PublicLayout 
      title="Faculty Governance" 
      subtitle="Institutional oversight and approval gateway." 
      icon={<GraduationCap size={32} className="text-emerald-500" />} 
      onBack={onBack}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#111C44]/50 border border-white/10 rounded-[2.5rem] p-10 space-y-6">
          <ShieldCheck size={48} className="text-emerald-500" />
          <h3 className="text-2xl font-bold text-white">Administrative Access</h3>
          <p className="text-slate-400 leading-relaxed">
            Faculty coordinators act as the primary approval authority for all student club events, budget allocations, and certification issuance.
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Review Event Proposals</li>
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Digital Signature Authority</li>
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Budget Auditing</li>
          </ul>
        </div>

        <div className="bg-[#111C44]/50 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center space-y-8">
          <Lock size={48} className="text-slate-500" />
          <div>
            <h3 className="text-2xl font-bold text-white">Secure Entry</h3>
            <p className="text-slate-400 mt-2">Access restricted to registered institutional IDs.</p>
          </div>
          <button 
            onClick={onLogin}
            className="px-10 py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Faculty Login
          </button>
        </div>
      </div>
    </PublicLayout>
  );
};

// --- STUDENT LEADERSHIP ---
export const StudentLeadership: React.FC<{ clubs: Club[]; users: User[]; onBack: () => void }> = ({ clubs, users, onBack }) => {
  const leaders = clubs.map(club => {
    const president = users.find(u => u.clubMemberships.some(m => m.clubId === club.id && m.role === ClubRole.PRESIDENT));
    return {
      club,
      president
    };
  }).filter(item => item.president);

  return (
    <PublicLayout 
      title="Leadership Council" 
      subtitle="The student architects driving campus innovation." 
      icon={<Users size={32} className="text-purple-500" />} 
      onBack={onBack}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {leaders.map(({ club, president }) => (
          <div key={club.id} className="bg-[#111C44]/50 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="h-32 bg-gradient-to-r from-purple-900/50 to-blue-900/50 relative">
              <div className="absolute -bottom-10 left-8 p-1 bg-[#0B1437] rounded-full">
                <div className="w-20 h-20 rounded-full bg-slate-800 overflow-hidden">
                  {president?.photoUrl ? (
                    <img src={president.photoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500">
                      {president?.name[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-14 p-8">
              <h3 className="text-xl font-bold text-white">{president?.name}</h3>
              <p className="text-purple-400 text-xs font-black uppercase tracking-widest mt-1">President, {club.name}</p>
              
              <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Department</p>
                  <p className="text-sm font-medium text-slate-300">{president?.branch || 'General'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tenure</p>
                  <p className="text-sm font-medium text-slate-300">2025-26</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {leaders.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-30">
            <Users size={64} className="mx-auto mb-4" />
            <p className="text-xl font-bold">Leadership Roster Syncing...</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};