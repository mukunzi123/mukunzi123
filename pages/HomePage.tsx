
import React, { useState, useEffect, useMemo } from 'react';
import { movieService } from '../services/movieService';
import { geminiService } from '../services/geminiService';
import { Movie } from '../types';
import FeaturedHero from '../components/FeaturedHero';
import MovieRow from '../components/MovieRow';
import { GENRES } from '../constants';

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webResults, setWebResults] = useState<any[]>([]);

  useEffect(() => {
    setMovies(movieService.getMovies());
  }, []);

  const filteredMovies = useMemo(() => {
    let result = movies;
    
    if (searchQuery) {
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedGenre !== 'All') {
      result = result.filter(movie => movie.category === selectedGenre);
    }
    
    return result;
  }, [movies, searchQuery, selectedGenre]);

  // Dynamically extract all unique sectors (categories) present in the database
  const activeSectors = useMemo(() => {
    const sectorsSet = new Set<string>();
    
    // Use the filtered movies to determine which sector rows to show
    // However, if we are in "All" mode we want all sectors.
    // If a specific genre is selected, we only want that sector.
    const moviesToAnalyze = selectedGenre === 'All' ? movies : movies.filter(m => m.category === selectedGenre);
    
    moviesToAnalyze.forEach(m => sectorsSet.add(m.category));
    
    // Ordered categories based on request
    const requestedOrder = ['Action', 'Adventure', 'Sci-Fi', 'Horror', 'Comedy', 'Drama'];
    
    const orderedSectors = requestedOrder.filter(g => sectorsSet.has(g));
    const otherSectors = Array.from(sectorsSet)
      .filter(g => !requestedOrder.includes(g))
      .sort();

    return [...orderedSectors, ...otherSectors];
  }, [movies, selectedGenre]);

  const handleWebDiscovery = async () => {
    if (!searchQuery) return;
    setIsSearchingWeb(true);
    try {
      const results = await geminiService.findLegalSources(searchQuery);
      if (results && results.sources) {
        setWebResults(results.sources);
      }
    } catch (error) {
      console.error("Discovery error", error);
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const genreIcons: Record<string, string> = {
    'Action': '🔥',
    'Adventure': '🗺️',
    'Sci-Fi': '🚀',
    'Horror': '👻',
    'Comedy': '😂',
    'Drama': '🎭'
  };

  return (
    <div className="pb-32 bg-[#05070a] selection:bg-orange-600">
      <FeaturedHero />

      {/* Control Terminal / Search Bar & Filters */}
      <div className="relative z-20 -mt-24 px-6 md:px-12 max-w-[1700px] mx-auto mb-20">
        <div className="bg-[#11141b]/95 backdrop-blur-3xl p-6 md:p-8 rounded-[35px] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
           <div className="relative group w-full max-w-2xl mx-auto mb-8">
              <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"></i>
              <input 
                 type="text" 
                 placeholder="Search Vault Sectors or Discovery Web..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleWebDiscovery()}
                 className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-16 pr-32 text-white focus:border-blue-500 transition-all outline-none font-black italic tracking-tight"
              />
              <button 
               onClick={handleWebDiscovery}
               disabled={isSearchingWeb || !searchQuery}
               className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
               {isSearchingWeb ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Discover'}
              </button>
           </div>

           {/* Genre Filter Bar */}
           <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
              <button 
                onClick={() => setSelectedGenre('All')}
                className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedGenre === 'All' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white hover:border-white/10'}`}
              >
                🎬 All Sectors
              </button>
              {GENRES.map(genre => (
                <button 
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedGenre === genre ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-900/20' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white hover:border-white/10'}`}
                >
                  {genreIcons[genre] || '📂'} {genre}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {searchQuery ? (
          // Search view shows a single filtered row or grid
          <MovieRow title={`Search Results: ${searchQuery}`} movies={filteredMovies} />
        ) : (
          // Standard Sector View
          <>
            <MovieRow title={selectedGenre === 'All' ? "🎬 All Master Archive" : `🎬 ${selectedGenre} Archive`} movies={filteredMovies} />
            
            {activeSectors.map(sector => {
              const icon = genreIcons[sector] || "📂";
              return (
                <MovieRow 
                  key={sector} 
                  title={`${icon} ${sector} Sector`} 
                  movies={movies.filter(m => m.category === sector)} 
                />
              );
            })}
          </>
        )}

        {/* Web Discovery Results */}
        {webResults.length > 0 && (
          <section className="px-6 md:px-12 max-w-[1700px] mx-auto mt-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center gap-4 mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-blue-500">Global Web Intelligence</h3>
                <span className="h-[1px] flex-1 bg-blue-500/10"></span>
                <button onClick={() => setWebResults([])} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Clear intel</button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {webResults.map((result, i) => (
                  <a 
                    key={i} 
                    href={result.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#11141b] p-6 rounded-2xl border border-white/5 hover:border-blue-600 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-2 block">External Node</span>
                      <h4 className="text-white font-black uppercase italic tracking-tighter text-sm leading-tight group-hover:text-blue-500 transition-colors line-clamp-2">{result.title}</h4>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{new URL(result.uri).hostname}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-blue-600 text-xs"></i>
                    </div>
                  </a>
                ))}
             </div>
          </section>
        )}
      </div>

      {/* Global Stats Footer Enhancement */}
      <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-32 mt-20 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                  <i className="fa-solid fa-server text-3xl text-blue-600"></i>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Distributed Vault</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-loose">Cinematic assets distributed across 12 high-bandwidth nodes for 4K zero-latency playback.</p>
              </div>
              <div className="space-y-4">
                  <i className="fa-solid fa-bolt-lightning text-3xl text-orange-600"></i>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Adaptive Bitrate</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-loose">Seamless switching between 4K and 720p based on operative network health and signal strength.</p>
              </div>
              <div className="space-y-4">
                  <i className="fa-solid fa-lock text-3xl text-green-600"></i>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">AES-256 Retrieval</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-loose">All downloads and streams are tunnelled through encrypted protocols to ensure asset security.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HomePage;
