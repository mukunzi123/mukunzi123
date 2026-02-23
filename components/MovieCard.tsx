import React from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, className = "" }) => {
  return (
    <div className={`group relative ${className}`}>
      <Link 
        to={`/movie/${movie.id}`} 
        className="block relative rounded-xl overflow-hidden bg-[#11141b] aspect-video transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/5 group-hover:border-blue-500/50"
      >
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                <i className="fa-solid fa-play ml-1"></i>
            </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[7px] font-black uppercase tracking-widest bg-blue-600 text-white px-2 py-0.5 rounded-sm">Premium</span>
                <span className="text-[7px] font-black uppercase tracking-widest bg-orange-500 text-white px-2 py-0.5 rounded-sm">{movie.quality}</span>
            </div>
        </div>
      </Link>
      <div className="mt-4 px-1">
          <h3 className="text-sm font-black text-white uppercase tracking-wider line-clamp-1 group-hover:text-blue-500 transition-colors">{movie.title}</h3>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
            {movie.year} <span className="w-1 h-1 bg-gray-800 rounded-full"></span> {movie.category}
          </p>
      </div>
    </div>
  );
};

export default MovieCard;