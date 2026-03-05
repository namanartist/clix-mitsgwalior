
import React from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';
import { CertificateTemplate } from '../types';

interface CertificateProps {
  studentName: string;
  enrollmentNumber?: string;
  eventName: string;
  clubName: string;
  clubLogoUrl?: string;
  id: string;
  date?: string;
  
  // Configuration
  template: CertificateTemplate;
  customBackgroundUrl?: string;
  themeColor?: string;

  // Signatures
  facultySignature?: string;
  facultyName?: string;
  presidentSignature?: string;
  presidentName?: string;
}

const CertificatePreview: React.FC<CertificateProps> = ({ 
  studentName, 
  enrollmentNumber,
  eventName, 
  clubName, 
  clubLogoUrl,
  id,
  date,
  template,
  customBackgroundUrl,
  themeColor = '#2563eb',
  facultySignature,
  facultyName = "Faculty Coordinator",
  presidentSignature,
  presidentName = "Club President",
}) => {
  const issueDate = date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // --- SHARED SIGNATURE BLOCK ---
  const SignatureBlock = ({ isDark = false }: { isDark?: boolean }) => (
    <div className="w-full grid grid-cols-2 gap-32 px-16 mt-auto mb-12">
        <div className="text-center flex flex-col items-center justify-end h-32">
            {facultySignature ? (
                <img src={facultySignature} alt="Faculty Sig" className={`max-h-20 object-contain mb-2 ${isDark ? 'invert' : 'mix-blend-multiply'}`} />
            ) : (
                <div className={`font-serif italic text-2xl mb-4 ${isDark ? 'text-white/30' : 'text-slate-300'}`}>Digitally Signed</div>
            )}
            <div className={`h-px w-48 ${isDark ? 'bg-white/30' : 'bg-slate-800'}`}></div>
            <p className={`mt-2 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{facultyName}</p>
            <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Faculty Coordinator</p>
        </div>
        <div className="text-center flex flex-col items-center justify-end h-32">
            {presidentSignature ? (
                <img src={presidentSignature} alt="President Sig" className={`max-h-20 object-contain mb-2 ${isDark ? 'invert' : 'mix-blend-multiply'}`} />
            ) : (
                <div className={`font-serif italic text-2xl mb-4 ${isDark ? 'text-white/30' : 'text-slate-300'}`}>Digitally Signed</div>
            )}
            <div className={`h-px w-48 ${isDark ? 'bg-white/30' : 'bg-slate-800'}`}></div>
            <p className={`mt-2 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{presidentName}</p>
            <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-slate-500'}`}>President, {clubName}</p>
        </div>
    </div>
  );

  // --- RENDERERS ---

  const renderClassic = () => (
    <div className="relative w-full h-full bg-[#fdfbf7] p-8 flex flex-col items-center text-center font-serif text-[#1a1a1a]">
        {/* Border */}
        <div className="absolute inset-4 border-4 border-double border-[#C5A059] pointer-events-none"></div>
        <div className="absolute inset-6 border border-[#C5A059] opacity-50 pointer-events-none"></div>
        
        {/* Header */}
        <div className="mt-12 mb-8 flex flex-col items-center">
            <img src="https://upload.wikimedia.org/wikipedia/en/b/bd/Madhav_Institute_of_Technology_and_Science_logo.png" className="w-24 mb-4" />
            <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1B2559]">Madhav Institute of Technology & Science</h1>
            <p className="text-xs font-sans font-bold text-[#C5A059] tracking-[0.3em] mt-1">GWALIOR (M.P.), INDIA</p>
        </div>

        <h2 className="text-5xl font-black text-[#C5A059] mb-8 tracking-wider drop-shadow-sm">CERTIFICATE OF EXCELLENCE</h2>
        
        <div className="flex-1 flex flex-col justify-center space-y-4 max-w-4xl z-10">
            <p className="text-xl italic text-slate-600">This is to certify that</p>
            <h3 className="text-6xl font-black text-[#1B2559] capitalize font-sans">{studentName}</h3>
            <p className="text-sm font-bold font-sans uppercase tracking-widest text-slate-500">{enrollmentNumber}</p>
            <p className="text-xl leading-relaxed mt-4 px-12">
                has successfully participated and demonstrated outstanding performance in <br/>
                <span className="font-bold border-b-2 border-[#C5A059] px-2">{eventName}</span> <br/>
                conducted by the <span className="font-bold text-[#1B2559]">{clubName}</span> on {issueDate}.
            </p>
        </div>

        <SignatureBlock />
        
        <div className="absolute bottom-8 left-8 text-[8px] font-sans text-slate-400">ID: {id}</div>
        <div className="absolute bottom-8 right-8"><QrCode size={48} color="#1B2559"/></div>
    </div>
  );

  const renderModern = () => (
    <div className="relative w-full h-full bg-white flex flex-col font-sans overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-slate-50 z-0"></div>
        <div className="absolute top-0 left-0 w-2 h-full bg-[#1B2559] z-10"></div>
        
        <div className="relative z-20 flex h-full">
            {/* Sidebar info */}
            <div className="w-1/3 h-full p-12 flex flex-col justify-between">
                <div>
                    <img src="https://upload.wikimedia.org/wikipedia/en/b/bd/Madhav_Institute_of_Technology_and_Science_logo.png" className="w-20 mb-6" />
                    <h3 className="text-2xl font-black text-[#1B2559] leading-none">MITS<br/>GWALIOR</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-slate-500">Estd. 1957</p>
                </div>
                <div>
                    <div className="w-24 h-1 bg-[#1B2559] mb-4"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                    <p className="text-lg font-bold text-[#1B2559]">{issueDate}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-6 mb-1">Certificate ID</p>
                    <p className="text-xs font-mono text-[#1B2559]">{id}</p>
                    <div className="mt-8"><QrCode size={64} /></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-16 flex flex-col justify-center">
                <h1 className="text-6xl font-black tracking-tighter text-[#1B2559] mb-2">CERTIFICATE</h1>
                <p className="text-xl font-medium text-slate-400 uppercase tracking-[0.4em] mb-12">Of Participation</p>
                
                <p className="text-lg text-slate-500 font-medium">Presented to</p>
                <h2 className="text-5xl font-black text-black mt-2 mb-2">{studentName}</h2>
                <p className="text-sm font-bold bg-slate-100 self-start px-3 py-1 rounded text-slate-600 mb-8">{enrollmentNumber}</p>

                <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                    For their active role and contribution in <strong>{eventName}</strong>, organized by the <strong>{clubName}</strong> team.
                </p>

                <div className="mt-auto grid grid-cols-2 gap-12 pt-12 border-t border-slate-100">
                    <div>
                        {facultySignature && <img src={facultySignature} className="h-12 object-contain mix-blend-multiply mb-2" />}
                        <p className="font-bold text-[#1B2559]">{facultyName}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Coordinator</p>
                    </div>
                    <div>
                        {presidentSignature && <img src={presidentSignature} className="h-12 object-contain mix-blend-multiply mb-2" />}
                        <p className="font-bold text-[#1B2559]">{presidentName}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">President</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderTech = () => (
    <div className="relative w-full h-full bg-[#050505] text-white font-mono flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* Cyber Grid */}
        <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
        <div className="absolute bottom-0 right-0 p-8 opacity-20"><QrCode size={100} color="white"/></div>

        <div className="relative z-10 w-full max-w-5xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/en/b/bd/Madhav_Institute_of_Technology_and_Science_logo.png" className="w-16 grayscale brightness-200" />
                    <div>
                        <h2 className="font-bold tracking-widest text-lg">MITS GWALIOR</h2>
                        <p className="text-[10px] text-cyan-400">INSTITUTIONAL PROTOCOL</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CERTIFIED</h1>
                    <p className="text-xs text-slate-500 tracking-[0.5em]">HASH: {id.split('-').pop()}</p>
                </div>
            </div>

            <div className="space-y-6 mb-16">
                <p className="text-slate-400 text-sm">RECIPIENT_IDENTITY:</p>
                <h2 className="text-6xl font-bold text-white border-l-4 border-cyan-500 pl-6">{studentName}</h2>
                <div className="flex gap-4 text-xs font-bold text-slate-500">
                    <span>ROLL: {enrollmentNumber}</span>
                    <span>//</span>
                    <span>EVENT: {eventName}</span>
                </div>
                <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
                    Has successfully executed all required modules and tasks assigned by <span className="text-cyan-400">{clubName}</span>. This credential validates technical proficiency and participation.
                </p>
            </div>

            <SignatureBlock isDark={true} />
        </div>
    </div>
  );

  const renderElegant = () => (
    <div className="relative w-full h-full bg-[#FFFCF5] p-10 flex flex-col font-serif text-[#4a4a4a]">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-[#D4AF37] rounded-tl-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-[#D4AF37] rounded-br-3xl opacity-50"></div>
        
        <div className="flex-1 border border-[#D4AF37] p-8 flex flex-col items-center justify-center text-center">
            <div className="mb-8">
               <img src="https://upload.wikimedia.org/wikipedia/en/b/bd/Madhav_Institute_of_Technology_and_Science_logo.png" className="w-20 mx-auto mb-4" />
               <p className="text-xs font-sans font-bold tracking-[0.3em] text-[#D4AF37]">MITS GWALIOR</p>
            </div>

            <h1 className="text-6xl font-medium italic text-[#2c2c2c] mb-12">Certificate of Appreciation</h1>
            
            <p className="text-lg mb-2">Proudly presented to</p>
            <h2 className="text-5xl font-bold text-[#D4AF37] mb-4 font-sans uppercase tracking-widest">{studentName}</h2>
            
            <p className="max-w-3xl text-xl leading-8 mt-8">
                In recognition of your valuable contribution and dedication shown during the 
                <br/><span className="font-bold text-black text-2xl">"{eventName}"</span><br/>
                organized by {clubName}.
            </p>

            <div className="mt-auto w-full">
                <SignatureBlock />
            </div>
        </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="relative w-full h-full bg-white p-20 flex flex-col justify-between font-sans text-black">
        <div className="flex justify-between items-start">
            <h1 className="text-6xl font-black tracking-tighter leading-none">Certificate<br/><span className="text-slate-300">Of Completion</span></h1>
            <img src="https://upload.wikimedia.org/wikipedia/en/b/bd/Madhav_Institute_of_Technology_and_Science_logo.png" className="w-24 grayscale opacity-20" />
        </div>

        <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Awarded To</p>
            <h2 className="text-5xl font-bold">{studentName}</h2>
            <p className="text-slate-500">{enrollmentNumber}</p>
        </div>

        <div className="space-y-2 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">For</p>
            <p className="text-3xl leading-tight">Outstanding participation in {eventName}, an initiative by {clubName}.</p>
        </div>

        <div className="grid grid-cols-3 gap-12 border-t border-black pt-8">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-4">Date</p>
                <p className="font-bold">{issueDate}</p>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-4">Signature</p>
                {presidentSignature && <img src={presidentSignature} className="h-10 mix-blend-multiply" />}
                <p className="text-xs mt-1">{presidentName}</p>
            </div>
            <div className="flex justify-end">
                <QrCode size={64} className="opacity-80"/>
            </div>
        </div>
    </div>
  );

  // --- MAIN RENDER ---
  
  const getRenderer = () => {
    switch (template) {
        case 'classic': return renderClassic();
        case 'modern': return renderModern();
        case 'tech': return renderTech();
        case 'elegant': return renderElegant();
        case 'minimal': return renderMinimal();
        default: return renderClassic();
    }
  };

  return (
    <div 
        id="certificate-print-area"
        className="w-full h-full relative overflow-hidden bg-white shadow-2xl"
        style={{ aspectRatio: '1.414/1' }} // A4 Landscape Ratio
    >
        {customBackgroundUrl && (
            <div className="absolute inset-0 z-0">
                <img src={customBackgroundUrl} className="w-full h-full object-cover" alt="Cert BG" />
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" /> {/* Overlay to ensure text readability */}
            </div>
        )}
        <div className="relative z-10 w-full h-full">
            {getRenderer()}
        </div>
        
        {/* Print Styles */}
        <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #certificate-print-area, #certificate-print-area * {
                    visibility: visible;
                }
                #certificate-print-area {
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 0;
                    z-index: 9999;
                    box-shadow: none;
                }
            }
        `}</style>
    </div>
  );
};

export default CertificatePreview;
