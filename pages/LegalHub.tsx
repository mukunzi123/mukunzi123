import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

const LegalHub: React.FC = () => {
  const [data, setData] = useState<{text: string, links: any[]} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatforms = async () => {
      const res = await geminiService.getLegalPlatformsDirectory();
      setData(res);
      setLoading(false);
    };
    fetchPlatforms();
  }, []);

  return (
    <div className="pt-24 pb-24 bg-[#05070a] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">Legal Watch Guide</h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto uppercase tracking-tight font-medium">Verified platforms to stream your favorite movies safely and legally, across Africa and the globe.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner animate-spin text-blue-600 text-3xl"></i>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <section className="bg-slate-900/40 p-8 rounded-[30px] border border-white/5 backdrop-blur-xl">
                <h2 className="text-lg font-black text-white uppercase italic tracking-tight mb-5 flex items-center gap-3">
                  <i className="fa-solid fa-earth-africa text-orange-500 text-base"></i>
                  Platforms
                </h2>
                <div className="prose prose-invert prose-sm max-w-none text-slate-400 leading-relaxed mb-6 italic font-medium">
                  {data?.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </section>

              <section className="bg-slate-900/40 p-8 rounded-[30px] border border-white/5 backdrop-blur-xl">
                <h2 className="text-lg font-black text-white uppercase italic tracking-tight mb-5 flex items-center gap-3">
                  <i className="fa-solid fa-scale-balanced text-blue-500 text-base"></i>
                  Repositories
                </h2>
                <p className="text-slate-400 mb-6 text-[11px] font-bold uppercase tracking-widest opacity-60">Legal public domain repositories for free access.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data?.links.filter(l => l.title.toLowerCase().includes('archive') || l.title.toLowerCase().includes('public')).map((link, i) => (
                    <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="bg-black/50 p-5 rounded-2xl border border-slate-800 hover:border-blue-600 transition-all flex items-center justify-between group">
                      <span className="text-xs font-black text-white group-hover:text-blue-500 uppercase italic tracking-tighter">{link.title}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-slate-700 text-[10px]"></i>
                    </a>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-orange-600 p-8 rounded-[35px] shadow-2xl">
                <i className="fa-solid fa-shield-check text-2xl text-white mb-4"></i>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">Safety First</h3>
                <p className="text-orange-100 text-[10px] leading-relaxed mb-6 font-bold uppercase tracking-wider">Mukunzi recommends using verified platforms to support creators and avoid malware.</p>
                <button className="w-full bg-white text-orange-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 transition-colors">Read Policy</button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[35px]">
                <h3 className="text-xs font-black text-white uppercase italic mb-5 tracking-widest">Quick Links</h3>
                <div className="flex flex-col gap-4">
                  {data?.links.slice(0, 6).map((link, i) => (
                    <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white flex items-center gap-3 group transition-colors">
                      <i className="fa-solid fa-circle-check text-blue-500 text-[6px]"></i>
                      <span className="text-[10px] font-bold truncate uppercase tracking-tight">{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalHub;