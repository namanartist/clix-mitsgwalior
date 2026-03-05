
import React from 'react';
import { PublicLayout } from './PublicPages';
import { 
  Cpu, 
  ShieldCheck, 
  Wallet, 
  Users, 
  Zap, 
  Globe, 
  Lock, 
  Layout, 
  Server,
  Code
} from 'lucide-react';

const PlatformFeatures: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const features = [
    {
      title: "Governance Core",
      desc: "Role-based access control (RBAC) for Presidents, Faculty, and Admins. Hierarchical approval workflows for high-stakes actions like budget release and event publishing.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Treasury & Finance",
      desc: "Integrated UPI payment verification ledger. Automated quotation handling for procurement with faculty oversight and audit trails.",
      icon: Wallet,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: "Recruitment AI",
      desc: "LLM-powered applicant screening. Automatically scores intent statements and categorizes candidates into Technical, Management, or Creative domains.",
      icon: Cpu,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Event Cloud",
      desc: "End-to-end event lifecycle management. From proposal drafting to QR-based ticketing and automated certificate minting on completion.",
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Identity Vault",
      desc: "Centralized student registry with encrypted profile data. Single Sign-On (SSO) for seamless access across all 40+ club subsystems.",
      icon: Users,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      title: "Public Microsites",
      desc: "Each club gets an auto-generated, SEO-optimized public landing page with dynamic content management capabilities.",
      icon: Globe,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20"
    }
  ];

  return (
    <PublicLayout 
      title="System Architecture" 
      subtitle="A modular operating system designed for the scale of MITS Gwalior."
      icon={<Server size={32} className="text-[#0055FF]" />}
      onBack={onBack}
    >
      <div className="space-y-20">
        
        {/* Core Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] border ${f.border} ${f.bg} backdrop-blur-sm relative group overflow-hidden`}>
              <div className={`absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-all duration-500`}>
                <f.icon size={120} className={f.color} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-[#02040a] border border-white/5 shadow-xl`}>
                  <f.icon size={28} className={f.color} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">{f.title}</h3>
                <p className="text-sm font-medium text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="p-12 rounded-[3rem] bg-[#111C44]/50 border border-white/10 text-center space-y-8">
           <h2 className="text-3xl font-black text-white tracking-tight">Built on Modern Primitives</h2>
           <div className="flex flex-wrap justify-center gap-4">
              {['React 18', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'Google Gemini AI', 'Recharts'].map((tech) => (
                <span key={tech} className="px-6 py-3 rounded-full bg-[#02040a] border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                   <Code size={14} className="text-[#0055FF]"/> {tech}
                </span>
              ))}
           </div>
        </div>

      </div>
    </PublicLayout>
  );
};

export default PlatformFeatures;
