
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { authService } from '../services/authService';
import { geminiService } from '../services/geminiService';
import { Movie, User, Comment } from '../types';

interface MovieDetailPageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

type Resolution = '720p' | '1080p' | '4K';

const MovieDetailPage: React.FC<MovieDetailPageProps> = ({ user, setUser }) => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [legalSources, setLegalSources] = useState<{recommendation: string, sources: any[]} | null>(null);
  const [searchingSources, setSearchingSources] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<Resolution>('1080p');
  const [isCinematicMode, setIsCinematicMode] = useState(true);
  const [views, setViews] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      const fetchMovie = async () => {
        const found = await movieService.getMovieById(id);
        if (found) {
          setMovie(found);
          fetchLegalSources(found.title);
          fetchViewsAndComments(id);
          incrementViewCount(id);
          // Detect high-res screens
          if (window.devicePixelRatio > 1.5) {
            setSelectedQuality('4K');
          }
        }
      };
      fetchMovie();
    }
  }, [id]);

  const fetchViewsAndComments = async (videoId: string) => {
    try {
      const [v, c] = await Promise.all([
        movieService.getViews(videoId),
        movieService.getComments(videoId)
      ]);
      setViews(v);
      setComments(c);
    } catch (error) {
      console.error("Error fetching views/comments:", error);
    }
  };

  const incrementViewCount = async (videoId: string) => {
    try {
      await movieService.incrementViews(videoId);
      const updatedViews = await movieService.getViews(videoId);
      setViews(updatedViews);
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const result = await movieService.addComment(id!, user.name, user.email, newComment);
      if (result.comment) {
        setNewComment('');
        alert('Tactical feedback transmitted. Pending command approval.');
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const fetchLegalSources = async (title: string) => {
    setSearchingSources(true);
    const sources = await geminiService.findLegalSources(title);
    setLegalSources(sources);
    setSearchingSources(false);
  };

  const getEstimatedSize = (baseSize: string) => {
    const numericSize = parseFloat(baseSize);
    if (selectedQuality === '720p') return `${(numericSize * 0.4).toFixed(1)} GB`;
    if (selectedQuality === '1080p') return baseSize;
    return `${(numericSize * 2.5).toFixed(1)} GB`;
  };

  const contactOnWhatsApp = () => {
    if (!movie) return;
    const text = `Hi Mukunzi! I'm interested in viewing "${movie.title}" in ${selectedQuality}. Could you provide the high-fidelity route?`;
    window.open(`https://wa.me/250794497850?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShare = async () => {
    if (!movie) return;
    const shareData = {
      title: `${movie.title} - Mukunzi Cinema`,
      text: `Check out ${movie.title} on Mukunzi!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Access link copied to clipboard.');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isDownloading) return;
    setIsDownloading(true);
    
    // Simulate bandwidth differences
    const speedMultiplier = selectedQuality === '720p' ? 2 : (selectedQuality === '4K' ? 0.4 : 1);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * (12 * speedMultiplier);
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(async () => {
          setIsDownloading(false);
          const updatedUser = await authService.recordDownload(movie!.id);
          if (updatedUser) setUser(updatedUser);
          
          const blob = new Blob([`Simulated ${selectedQuality} Secure Stream Output`], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${movie!.title.replace(/\s+/g, '_')}_${selectedQuality}_Mukunzi.mp4`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 500);
      } else {
        setProgress(Math.round(currentProgress));
      }
    }, 120);
  };

  if (!movie) return (
    <div className="h-screen bg-[#05070a] flex items-center justify-center">
      <i className="fa-solid fa-circle-notch animate-spin text-blue-600 text-3xl"></i>
    </div>
  );

  // Extract Video ID for the fallback link
  const playerUrl = movie.videoUrl || movie.trailerUrl;
  const videoIdMatch = playerUrl.match(/embed\/([^/?]+)/);
  const youtubeLink = videoIdMatch ? `https://www.youtube.com/watch?v=${videoIdMatch[1]}` : playerUrl;
  const origin = window.location.origin;

  return (
    <div className="bg-[#05070a] min-h-screen pt-24 pb-24 selection:bg-blue-600 selection:text-white">
      
      {/* Optimized Cinematic Player Container - Moved outside main container for maximum width */}
      <div className="w-full mb-12 flex flex-col items-center">
        <div className="w-full px-0">
          <div className="video-container-constrained group ring-1 ring-white/5 relative overflow-hidden">
            <div className={`w-full h-full ${isCinematicMode ? 'video-high-fidelity' : ''}`}>
              <iframe 
                width="100%" 
                height="100%" 
                src={`${playerUrl}?autoplay=0&rel=0&modestbranding=1&origin=${encodeURIComponent(origin)}&enablejsapi=1`} 
                title={movie.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                loading="lazy"
                className="brightness-90 group-hover:brightness-105 transition-all duration-700"
              ></iframe>
            </div>
            
            {/* Film Grain Enhancement Overlay */}
            {isCinematicMode && <div className="video-overlay-grain"></div>}
            
            <div className="absolute top-6 left-6 flex gap-2 pointer-events-none z-10">
              <div className="bg-blue-600/90 backdrop-blur-md text-white text-[7px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-2xl">
                {selectedQuality} Optimized
              </div>
              <button 
                onClick={(e) => { e.preventDefault(); setIsCinematicMode(!isCinematicMode); }}
                className="pointer-events-auto bg-black/40 backdrop-blur-md text-white text-[7px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest hover:bg-orange-600 transition-colors"
              >
                {isCinematicMode ? 'PRO MODE: ON' : 'HD MODE: ON'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1800px] flex flex-col sm:flex-row justify-between items-center mt-8 px-8 sm:px-12 gap-6">
           <div className="flex items-center gap-4">
             <span className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">Multi-Node Delivery System</span>
             <div className="h-0.5 w-12 bg-blue-600 rounded-full"></div>
           </div>
           <div className="flex gap-6 items-center">
              <a 
                href={youtubeLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <i className="fa-brands fa-youtube text-red-600"></i>
                Watch on YouTube
              </a>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {(['720p', '1080p', '4K'] as Resolution[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => setSelectedQuality(res)}
                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${selectedQuality === res ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {res}
                  </button>
                ))}
              </div>
              <div className="h-6 w-[1px] bg-slate-800"></div>
              <button onClick={handleShare} className="text-slate-400 hover:text-white transition-colors text-lg">
                <i className="fa-solid fa-share-nodes"></i>
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16 mt-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 mb-6 text-blue-500 font-black uppercase tracking-widest text-[9px] italic">
               <span className="text-slate-400">{movie.year}</span>
               <span className="w-1 h-1 rounded-full bg-slate-800"></span>
               <span>{movie.category}</span>
               <span className="w-1 h-1 rounded-full bg-slate-800"></span>
               <span className="text-white bg-orange-600 px-2.5 py-1 rounded-full text-[7px] shadow-lg uppercase tracking-widest font-black italic">{selectedQuality === '720p' ? 'Data Saver' : 'Premium Quality'}</span>
               <span className="w-1 h-1 rounded-full bg-slate-800"></span>
               <span className="text-slate-400 flex items-center gap-1">
                 <i className="fa-solid fa-eye text-blue-500"></i>
                 {views.toLocaleString()} VIEWS
               </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[0.9] uppercase italic tracking-tighter transition-all">
              {movie.title}
            </h1>
            
            <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium italic border-l-4 border-blue-600 pl-6 max-w-3xl opacity-80">
              {movie.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <div>
                  <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-0.5">Commanding Director</p>
                  <p className="text-white font-black italic uppercase tracking-tight">{movie.director || 'Unknown Operative'}</p>
                </div>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500">
                  <i className="fa-solid fa-earth-africa"></i>
                </div>
                <div>
                  <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-0.5">Node Origin</p>
                  <p className="text-white font-black italic uppercase tracking-tight">{movie.country || 'Global Network'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 mb-12">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex-1 md:flex-none min-w-[240px] py-5 rounded-2xl font-black text-lg uppercase italic tracking-tighter transition-all active:scale-[0.97] shadow-xl relative overflow-hidden group ${isDownloading ? 'bg-slate-900 text-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'}`}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                   <i className={`fa-solid ${isDownloading ? 'fa-circle-notch animate-spin' : 'fa-bolt'} text-xl`}></i>
                   <span>{isDownloading ? `${progress}%` : `Grab in ${selectedQuality}`}</span>
                </div>
                {isDownloading && (
                  <div className="absolute inset-y-0 left-0 bg-white/10 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                )}
              </button>
              
              <button onClick={contactOnWhatsApp} className="flex-1 md:flex-none flex flex-col justify-center px-8 py-5 rounded-2xl bg-slate-900 border border-white/5 hover:border-green-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <i className="fa-brands fa-whatsapp text-green-500 text-2xl group-hover:scale-110 transition-transform"></i>
                  <div className="flex flex-col text-left">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Support Node</span>
                    <span className="text-sm font-black text-white italic uppercase tracking-tighter">Request Direct Access</span>
                  </div>
                </div>
              </button>
            </div>

            <div className="p-8 bg-[#11141b]/40 rounded-[35px] border border-white/10 backdrop-blur-3xl mb-10 shadow-2xl">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                    <i className="fa-solid fa-link text-orange-500 text-sm"></i> Global Vault Access
                 </h3>
                 {searchingSources && <i className="fa-solid fa-circle-notch animate-spin text-blue-600 text-sm"></i>}
               </div>
               
               {legalSources ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {legalSources.sources.length > 0 ? (
                     legalSources.sources.map((source, i) => (
                       <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="bg-black/60 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between group hover:border-blue-500 transition-all hover:bg-black/90">
                          <div className="flex flex-col">
                            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Authenticated Node</span>
                            <span className="text-slate-300 group-hover:text-white font-black text-base uppercase tracking-tighter italic">{source.title}</span>
                          </div>
                          <i className="fa-solid fa-chevron-right text-sm text-blue-600 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                       </a>
                     ))
                   ) : (
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest col-span-2 py-4">Direct stream access available via premium support node.</p>
                   )}
                 </div>
               ) : <div className="text-slate-800 italic font-black uppercase tracking-[0.4em] text-[9px]">Analyzing optimal high-bandwidth routes for {movie.title}...</div>}
            </div>

            {/* Comment Section */}
            <div className="p-8 bg-[#11141b]/40 rounded-[35px] border border-white/10 backdrop-blur-3xl mb-10 shadow-2xl">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3 mb-8">
                <i className="fa-solid fa-comments text-blue-500 text-sm"></i> Operative Feedback
              </h3>

              <form onSubmit={handleCommentSubmit} className="mb-10">
                <div className="relative">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Share your tactical assessment..." : "Log in to provide feedback"}
                    disabled={!user || isSubmittingComment}
                    className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-5 text-white focus:border-blue-500 outline-none font-medium italic text-slate-400 transition-all resize-none h-32"
                  ></textarea>
                  <button 
                    type="submit"
                    disabled={!user || isSubmittingComment || !newComment.trim()}
                    className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl"
                  >
                    {isSubmittingComment ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Transmit'}
                  </button>
                </div>
              </form>

              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-left-4 duration-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-orange-500 p-0.5">
                            <div className="w-full h-full rounded-[6px] bg-[#05070a] flex items-center justify-center text-[10px] font-black text-white">
                              {comment.username[0]}
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{comment.username}</span>
                        </div>
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed font-medium italic">
                        {comment.comment_text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">No tactical feedback recorded for this node</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-[350px]">
            <div className="sticky top-28 space-y-8">
              <div className="rounded-[35px] overflow-hidden shadow-2xl border border-white/5 aspect-[2/3] relative group transition-all duration-700">
                <img 
                   src={movie.posterUrl} 
                   alt={movie.title} 
                   loading="lazy"
                   decoding="async"
                   className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-8 left-8">
                   <span className="text-blue-500 font-black uppercase text-[7px] tracking-[0.3em] mb-1.5 block">Secure Entry</span>
                   <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">{getEstimatedSize(movie.fileSize)} Payload</h4>
                </div>
              </div>
              
              <div className="bg-[#11141b]/60 p-7 rounded-[35px] border border-white/5 backdrop-blur-xl shadow-xl">
                <h4 className="text-xs font-black text-white uppercase italic tracking-widest mb-4">Technical Specs</h4>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-slate-400">
                      <i className="fa-solid fa-compress text-blue-500 text-[10px]"></i>
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-80">Adaptive Bitrate Stream (VBR)</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-400">
                      <i className="fa-solid fa-shield text-orange-500 text-[10px]"></i>
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-80">Encrypted AES-256 Transport</span>
                   </div>
                   <button onClick={() => setSelectedQuality('720p')} className="w-full mt-3 py-3 bg-white/5 hover:bg-orange-600/10 text-orange-500 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all border border-orange-500/10">
                      Engage Data Conservation
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
