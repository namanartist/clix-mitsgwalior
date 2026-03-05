
import React from 'react';
import { Zap, Linkedin, Code, Terminal, Instagram, Youtube, Twitter, Facebook, GraduationCap, MapPin, Mail, Phone } from 'lucide-react';

interface Props {
  onOpenDeveloper: () => void;
  onOpenProfile?: () => void;
  onNavigate: (page: string) => void;
  isDarkMode: boolean;
  variant?: 'default' | 'minimal';
}

const Footer: React.FC<Props> = ({ onOpenDeveloper, onOpenProfile, onNavigate, isDarkMode, variant = 'default' }) => {
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/mits_gwalior/?hl=en", label: "Instagram" },
    { icon: Youtube, href: "https://www.youtube.com/channel/UCKmCxK6awxsc4sV9PPETwHg/videos", label: "YouTube" },
    { icon: Linkedin, href: "https://www.linkedin.com/school/mitsdugwalior/posts/?feedView=all", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/MITS_Gwalior", label: "X (Twitter)" },
    { icon: Facebook, href: "https://www.facebook.com/MitsMadhavIstituteOfTechnologyScienceGwalior/", label: "Facebook" }
  ];

  return (
    <footer className={`border-t transition-colors duration-500 ${isDarkMode ? 'bg-[#02040a] border-white/5 text-slate-400' : 'bg-white border-slate-100 text-slate-500'}`}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-8 md:py-12">
        
        {variant === 'default' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12 border-b border-white/5 pb-12">
            
            {/* Brand & Social - Spans 5 columns */}
            <div className="col-span-1 md:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0099FF] to-[#007ACC] flex items-center justify-center text-white shadow-lg shadow-[#0099FF]/20">
                      <Zap size={20} className="fill-white" />
                  </div>
                  <div>
                      <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CLUB CONNECT</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">MITS Gwalior</p>
                  </div>
              </div>
              <p className="text-sm font-medium leading-relaxed max-w-sm opacity-80">
                  The centralized operating system for student leadership, event management, and recruitment. Empowering the next generation of innovators.
              </p>
              
              <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social, i) => (
                      <a 
                          key={i} 
                          href={social.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/10"
                          title={social.label}
                      >
                          <social.icon size={18} />
                      </a>
                  ))}
                  
                  {/* Separator for Moodle */}
                  <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>

                  <a 
                      href="http://moodle.mitsweb.in/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-[#0099FF]/10 text-[#0099FF] hover:bg-[#0099FF] hover:text-white transition-all border border-[#0099FF]/20"
                      title="Moodle (New)"
                  >
                      <GraduationCap size={18} />
                  </a>
                  <a 
                      href="http://moodle.mitsgwalior.in/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all opacity-60 hover:opacity-100"
                      title="Moodle (Legacy)"
                  >
                      <GraduationCap size={18} />
                  </a>
              </div>
            </div>

            {/* Platform Links - Spans 2 columns */}
            <div className="col-span-1 md:col-span-2">
              <h4 className={`text-xs font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Platform</h4>
              <ul className="space-y-4 text-sm font-medium">
                  <li><button onClick={() => onNavigate('events')} className="hover:text-[#0099FF] transition-colors">Event Registry</button></li>
                  <li><button onClick={() => onNavigate('clubs')} className="hover:text-[#0099FF] transition-colors">Club Directory</button></li>
                  <li><button onClick={() => onNavigate('leadership')} className="hover:text-[#0099FF] transition-colors">Student Leadership</button></li>
                  <li><button onClick={() => onNavigate('faculty')} className="hover:text-[#0099FF] transition-colors">Faculty Portal</button></li>
              </ul>
            </div>

            {/* Legal Links - Spans 2 columns */}
            <div className="col-span-1 md:col-span-2">
              <h4 className={`text-xs font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Legal & Support</h4>
              <ul className="space-y-4 text-sm font-medium">
                  <li><button onClick={() => onNavigate('privacy')} className="hover:text-[#0099FF] transition-colors">Privacy Protocol</button></li>
                  <li><button onClick={() => onNavigate('tos')} className="hover:text-[#0099FF] transition-colors">Terms of Service</button></li>
                  <li><button onClick={() => onNavigate('report')} className="hover:text-[#0099FF] transition-colors">Report Issue</button></li>
                  <li><button onClick={onOpenDeveloper} className="hover:text-[#0099FF] transition-colors flex items-center gap-2"><Terminal size={14} /> Developer Console</button></li>
              </ul>
            </div>

            {/* Get In Touch - Spans 3 columns */}
            <div className="col-span-1 md:col-span-3">
              <h4 className={`text-xs font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Get in Touch</h4>
              <ul className="space-y-4 text-sm font-medium">
                  <li className="flex items-start gap-3">
                      <MapPin size={16} className="mt-1 shrink-0 text-[#0099FF]" />
                      <span className="opacity-80 leading-relaxed">
                          Madhav Institute of Technology & Science (MITS), Gola ka Mandir, Gwalior - 474005, Madhya Pradesh, India
                      </span>
                  </li>
                  <li className="flex items-center gap-3">
                      <Mail size={16} className="shrink-0 text-[#0099FF]" />
                      <a href="mailto:vicechancellor@mitsgwalior.in" className="opacity-80 hover:text-[#0099FF] transition-colors">
                          vicechancellor@mitsgwalior.in
                      </a>
                  </li>
                  <li className="flex items-center gap-3">
                      <Phone size={16} className="shrink-0 text-[#0099FF]" />
                      <span className="opacity-80">
                          0751-240-9354, 0751-240-9300
                      </span>
                  </li>
              </ul>
            </div>
          </div>
        )}

        {/* Minimal Footer / Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
            <p className="text-xs font-bold opacity-50 text-center md:text-left">© 2026 Madhav Institute of Technology & Science. All rights reserved.</p>
            <div className="flex items-center gap-4">
                {/* Developer Console Button in Minimal Footer */}
                <button 
                    onClick={onOpenDeveloper}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
                        isDarkMode 
                        ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' 
                        : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                >
                    <Terminal size={10} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Dev Console</span>
                </button>

                <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="opacity-50">Architected by</span>
                    <button onClick={onOpenProfile} className={`flex items-center gap-2 px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} transition-all`}>
                        <Code size={12} /> Naman Lahariya
                    </button>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
