import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { movieService } from '../services/movieService';

const FeaturedHero: React.FC = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const all = movieService.getMovies();
    if (all.length > 0) {
      setMovie(all[0]);
    }
  }, []);

  if (!movie) return null;

  return (
    <div className="relative w-full h-[80vh] min-h-[500px] flex items-center overflow-hidden bg-[#05070a]">
      <div className="absolute inset-0">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover opacity-20 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070a] via-[#05070a]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
          <div className="inline-flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.3em] text-[8px] bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
             <i className="fa-solid fa-bolt text-orange-500"></i>
             <span>Optimized Stream Ready</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] uppercase italic tracking-tighter">
            {movie.title}
          </h1>
          
          <p className="text-sm md:text-base text-gray-400 font-medium max-w-md leading-relaxed uppercase tracking-tight italic">
            {movie.description.split('. ').slice(0, 2).join('. ')}. Experience cinematic perfection with our variable bitrate delivery.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 transform active:scale-95"
            >
              Stream Now
            </button>
            <button 
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="bg-white/5 backdrop-blur-md text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
            >
              Vault Details
            </button>
          </div>
        </div>

        <div className="hidden lg:flex justify-end relative">
           <div className="absolute -inset-10 bg-blue-500/10 rounded-full blur-[100px]"></div>
           {/* Restricted Preview Dimensions */}
           <div className="relative w-[380px] aspect-video rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/10 group cursor-pointer max-h-[220px]" onClick={() => navigate(`/movie/${movie.id}`)}>
              <img 
                src={movie.posterUrl} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                alt="" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white text-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                    <i className="fa-solid fa-play ml-1"></i>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedHero;