
import React, { useRef } from 'react';
import { Movie, User } from '../types';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  user: User | null;
  setUser: (user: User | null) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, user, setUser }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.8;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (movies.length === 0) return null;

  return (
    <section className="relative group overflow-hidden mb-16">
      <div className="px-6 md:px-12 max-w-[1700px] mx-auto mb-6 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-orange-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
          {title}
        </h2>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => scroll('left')} 
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 transition-all active:scale-90"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 transition-all active:scale-90"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>

      <div 
        ref={rowRef}
        className="netflix-row gap-5 px-6 md:px-12 pb-4 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {movies.map(movie => (
          <div key={movie.id} className="min-w-[280px] md:min-w-[360px] transform transition-all duration-300">
            <MovieCard movie={movie} user={user} setUser={setUser} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MovieRow;
