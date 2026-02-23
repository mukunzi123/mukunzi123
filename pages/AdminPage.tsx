
import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Movie } from '../types';
import { movieService } from '../services/movieService';
import { authService } from '../services/authService';
import { geminiService } from '../services/geminiService';
import { GENRES } from '../constants';

interface AdminPageProps {
  user: User | null;
}

type AdminView = 'dashboard' | 'films' | 'users';

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  
  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Notifications
  const [notifications, setNotifications] = useState<{id: number, text: string, type: 'success' | 'error'}[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Action',
    year: new Date().getFullYear(),
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: '',
    fileSize: '1.8 GB',
    quality: 'Full HD' as '4K' | 'Full HD' | 'HD',
    status: 'Online' as 'Online' | 'Offline'
  });

  useEffect(() => {
    setMovies(movieService.getMovies());
    setUsers(authService.getUsers());
  }, []);

  const addNotification = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const filteredMovies = useMemo(() => {
    return movies.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = filterGenre === 'All' || m.category === filterGenre;
      return matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, filterGenre]);

  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(start, start + itemsPerPage);
  }, [filteredMovies, currentPage]);

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);

  const stats = useMemo(() => {
    const totalDownloads = users.reduce((acc, u) => acc + (u.downloads?.length || 0), 0);
    return {
      movies: movies.length,
      users: users.length,
      downloads: totalDownloads
    };
  }, [movies, users]);

  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const handleEnhance = async () => {
    if (!formData.title) return addNotification('Enter a title first', 'error');
    setIsEnhancing(true);
    const result = await geminiService.enhanceMovieDetails(formData.title);
    if (result) {
      setFormData(prev => ({ ...prev, ...result }));
      addNotification('AI Sequence Synchronized Successfully');
    } else {
      addNotification('AI Sync Interrupted', 'error');
    }
    setIsEnhancing(false);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'Action',
      year: new Date().getFullYear(),
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000',
      trailerUrl: '',
      fileSize: '1.8 GB',
      quality: 'Full HD',
      status: 'Online'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setEditingId(movie.id);
    setFormData({
      title: movie.title,
      description: movie.description,
      category: movie.category,
      year: movie.year,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl,
      fileSize: movie.fileSize,
      quality: movie.quality,
      status: movie.status || 'Online'
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    
    setTimeout(() => {
      if (editingId) {
        const updated = movieService.updateMovie(editingId, formData);
        if (updated) {
          setMovies(movies.map(m => m.id === editingId ? updated : m));
          addNotification('Asset Record Updated');
        }
      } else {
        const newMovie = movieService.addMovie({ ...formData, popularity: 50 });
        setMovies([newMovie, ...movies]);
        addNotification('New Asset Successfully Deployed');
      }
      setIsDeploying(false);
      setShowModal(false);
    }, 1000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Erase this cinematic node from the permanent record?')) {
      movieService.deleteMovie(id);
      setMovies(movies.filter(m => m.id !== id));
      setSelectedMovieIds(prev => prev.filter(selectedId => selectedId !== id));
      addNotification('Asset Erased from Vault');
    }
  };

  const handleBulkDelete = () => {
    if (selectedMovieIds.length === 0) return;
    if (window.confirm(`Erase ${selectedMovieIds.length} cinematic nodes from the permanent record?`)) {
      movieService.bulkDeleteMovies(selectedMovieIds);
      setMovies(movies.filter(m => !selectedMovieIds.includes(m.id)));
      setSelectedMovieIds([]);
      addNotification(`${selectedMovieIds.length} Assets Erased from Vault`);
    }
  };

  const handleBulkStatusUpdate = (status: 'Online' | 'Offline') => {
    if (selectedMovieIds.length === 0) return;
    movieService.bulkUpdateStatus(selectedMovieIds, status);
    setMovies(movies.map(m => selectedMovieIds.includes(m.id) ? { ...m, status } : m));
    setSelectedMovieIds([]);
    addNotification(`Bulk Status Update: ${status}`);
  };

  const toggleSelectAll = () => {
    if (selectedMovieIds.length === paginatedMovies.length) {
      setSelectedMovieIds([]);
    } else {
      setSelectedMovieIds(paginatedMovies.map(m => m.id));
    }
  };

  const toggleSelectMovie = (id: string) => {
    setSelectedMovieIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const SidebarItem = ({ id, icon, label }: { id: AdminView, icon: string, label: string }) => (
    <button
      onClick={() => setCurrentView(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${currentView === id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
      <i className={`fa-solid ${icon} text-lg w-6`}></i>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );

  return (
    <div className="flex bg-[#05070a] min-h-screen relative">
      {/* Toast Notifications */}
      <div className="fixed top-24 right-8 z-[120] flex flex-col gap-4">
        {notifications.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl border backdrop-blur-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-300 ${n.type === 'success' ? 'bg-green-600/10 border-green-500/50 text-green-500' : 'bg-orange-600/10 border-orange-500/50 text-orange-500'}`}>
            <i className={`fa-solid ${n.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{n.text}</span>
          </div>
        ))}
      </div>

      <aside className="w-80 border-r border-white/5 pt-32 pb-12 px-6 flex flex-col hidden lg:flex fixed h-full z-20 bg-[#05070a]">
        <div className="mb-12 px-6">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] block mb-2">Command Center</span>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Admin Portal</h2>
        </div>
        
        <nav className="flex-1 space-y-3">
          <SidebarItem id="dashboard" icon="fa-chart-simple" label="Platform Metrics" />
          <SidebarItem id="films" icon="fa-film" label="Asset Management" />
          <SidebarItem id="users" icon="fa-user-lock" label="Access Control" />
        </nav>

        <div className="mt-auto p-6 bg-[#11141b] rounded-3xl border border-white/5">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">System Active</span>
           </div>
           <p className="text-[8px] font-bold text-slate-500 uppercase leading-loose">Core engine running at 100% efficiency. All nodes synchronized.</p>
        </div>
      </aside>

      <main className="flex-1 lg:ml-80 pt-32 pb-24 px-4 sm:px-10 lg:px-16">
        
        {currentView === 'films' && (
          <div className="animate-in fade-in duration-700">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
               <div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Cinematic Vault</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Manage master encrypted assets</p>
                <div className="flex flex-wrap gap-4">
                  <div className="relative group">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                      type="text" 
                      placeholder="Search title..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-white text-[10px] font-bold uppercase tracking-widest outline-none focus:border-blue-500 transition-all min-w-[260px]"
                    />
                  </div>
                  <select 
                    value={filterGenre}
                    onChange={e => setFilterGenre(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="All">All Sectors</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleOpenAdd}
                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[22px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-blue-900/40 transition-all active:scale-95"
              >
                <i className="fa-solid fa-plus-circle text-lg"></i> Deploy New Asset
              </button>
            </div>

            <div className="bg-[#11141b] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl mb-8">
              {/* Bulk Actions Bar */}
              {selectedMovieIds.length > 0 && (
                <div className="bg-blue-600/10 border-b border-white/5 px-10 py-6 flex items-center justify-between animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{selectedMovieIds.length} Assets Selected</span>
                    <div className="h-4 w-px bg-white/10"></div>
                    <button 
                      onClick={() => setSelectedMovieIds([])}
                      className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleBulkStatusUpdate('Online')}
                      className="px-4 py-2 rounded-lg bg-green-600/20 text-green-500 border border-green-500/20 text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
                    >
                      Mark Online
                    </button>
                    <button 
                      onClick={() => handleBulkStatusUpdate('Offline')}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all"
                    >
                      Mark Offline
                    </button>
                    <button 
                      onClick={handleBulkDelete}
                      className="px-4 py-2 rounded-lg bg-orange-600/20 text-orange-500 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#05070a]/50 text-slate-500 text-[9px] uppercase font-black tracking-[0.4em] border-b border-white/5">
                      <th className="px-10 py-8 w-10">
                        <button 
                          onClick={toggleSelectAll}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedMovieIds.length === paginatedMovies.length && paginatedMovies.length > 0 ? 'bg-blue-600 border-blue-600' : 'border-white/20 hover:border-white/40'}`}
                        >
                          {selectedMovieIds.length === paginatedMovies.length && paginatedMovies.length > 0 && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                        </button>
                      </th>
                      <th className="px-10 py-8">Asset Identifer</th>
                      <th className="px-10 py-8">Sector</th>
                      <th className="px-10 py-8">Status</th>
                      <th className="px-10 py-8">Quality</th>
                      <th className="px-10 py-8 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedMovies.length > 0 ? paginatedMovies.map(m => (
                      <tr key={m.id} className={`hover:bg-blue-500/5 transition-colors group ${selectedMovieIds.includes(m.id) ? 'bg-blue-600/5' : ''}`}>
                        <td className="px-10 py-8">
                          <button 
                            onClick={() => toggleSelectMovie(m.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedMovieIds.includes(m.id) ? 'bg-blue-600 border-blue-600' : 'border-white/20 hover:border-white/40'}`}
                          >
                            {selectedMovieIds.includes(m.id) && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                          </button>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                            <img src={m.posterUrl} className="w-14 h-10 object-cover rounded-xl shadow-lg border border-white/5" alt="" />
                            <div className="flex flex-col">
                              <span className="font-black text-white uppercase italic tracking-tight group-hover:text-blue-500 transition-colors">{m.title}</span>
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">{m.year} • {m.fileSize}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{m.category}</span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Offline' ? 'bg-slate-600' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></div>
                             <span className={`text-[9px] font-black uppercase tracking-widest ${m.status === 'Offline' ? 'text-slate-600' : 'text-white'}`}>{m.status || 'Online'}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`text-[8px] font-black px-2 py-1 rounded ${m.quality === '4K' ? 'bg-orange-600/20 text-orange-500 border border-orange-500/20' : 'bg-blue-600/20 text-blue-500 border border-blue-500/20'}`}>
                            {m.quality}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-4">
                            <button onClick={() => handleOpenEdit(m)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-all border border-white/5"><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                            <button onClick={() => handleDelete(m.id)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-orange-500 transition-all border border-white/5"><i className="fa-solid fa-trash-can text-xs"></i></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-10 py-24 text-center">
                           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">No assets found in target sector</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition-all"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-12 h-12 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                   disabled={currentPage === totalPages}
                   onClick={() => setCurrentPage(prev => prev + 1)}
                   className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition-all"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="animate-in fade-in duration-700">
             <div className="mb-12">
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Tactical Intelligence</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global metrics and node health</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-[#11141b] p-10 rounded-[40px] border border-white/5">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Total Vault Nodes</p>
                  <h3 className="text-5xl font-black text-blue-500 italic tracking-tighter">{stats.movies}</h3>
               </div>
               <div className="bg-[#11141b] p-10 rounded-[40px] border border-white/5">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Authorized Operatives</p>
                  <h3 className="text-5xl font-black text-orange-500 italic tracking-tighter">{stats.users}</h3>
               </div>
               <div className="bg-[#11141b] p-10 rounded-[40px] border border-white/5">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Successful Retrievals</p>
                  <h3 className="text-5xl font-black text-green-500 italic tracking-tighter">{stats.downloads}</h3>
               </div>
            </div>

            <div className="mt-12 p-10 bg-[#11141b] rounded-[40px] border border-white/5">
                <h4 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-6 italic">Recent System Events</h4>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node Synchronized: Cinematic asset deployment successfully verified at {new Date().toLocaleTimeString()} GMT</p>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        )}

        {currentView === 'users' && (
          <div className="animate-in fade-in duration-700">
             <div className="mb-12">
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Access Control</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Manage registered operative identities</p>
            </div>
            
            <div className="bg-[#11141b] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#05070a]/50 text-slate-500 text-[9px] uppercase font-black tracking-[0.4em] border-b border-white/5">
                      <th className="px-10 py-8">Operative Identity</th>
                      <th className="px-10 py-8">Authorization Level</th>
                      <th className="px-10 py-8">Retrieval History</th>
                      <th className="px-10 py-8">Registry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-orange-500/5 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="font-black text-white uppercase italic tracking-tight">{u.name}</span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${u.role === 'admin' ? 'bg-blue-600/20 text-blue-500 border-blue-500/20' : 'bg-slate-800 text-slate-400 border-white/5'}`}>
                            {u.role === 'admin' ? 'Command' : 'Operative'}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-white font-black italic">{u.downloads?.length || 0} Assets</span>
                        </td>
                        <td className="px-10 py-8 text-slate-500 font-bold text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Deployment Protocol Modal (Enhanced with Live Preview) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#05070a]/98 backdrop-blur-3xl" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-[#11141b] w-full max-w-[1400px] rounded-[50px] border border-white/10 shadow-[0_60px_200px_rgba(0,0,0,1)] overflow-hidden h-[90vh] flex flex-col">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/40">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                <i className="fa-solid fa-microchip text-blue-500 text-xl"></i>
                {editingId ? 'Modify Record' : 'Vault Deployment Protocol'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Form Side */}
              <form onSubmit={handleSubmit} className="flex-1 p-10 overflow-y-auto space-y-8 no-scrollbar border-r border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Cinematic Asset Title</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" required value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="flex-1 bg-black/50 border border-white/5 rounded-2xl px-8 py-5 text-white focus:border-blue-500 outline-none font-bold italic transition-all" 
                        placeholder="e.g. Inception"
                      />
                      <button type="button" onClick={handleEnhance} disabled={isEnhancing} className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 px-6 rounded-2xl flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white transition-all">
                        {isEnhancing ? <i className="fa-solid fa-atom animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Sector Classification</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-5 text-white outline-none font-black text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer"
                    >
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Deployment Era (Year)</label>
                    <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-5 text-white outline-none font-bold italic" />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Signal Resolution</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['HD', 'Full HD', '4K'] as const).map(q => (
                        <button 
                          key={q} type="button" 
                          onClick={() => setFormData({...formData, quality: q})}
                          className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.quality === q ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Intel Synopsis</label>
                  <textarea 
                    required rows={4} value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-5 text-white focus:border-blue-500 outline-none font-medium italic text-slate-400 transition-all"
                    placeholder="Briefly describe the cinematic node..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Poster Visual (URL)</label>
                    <input type="text" value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-4 text-white outline-none text-[10px] font-mono" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Trailer Node (Embed)</label>
                    <input type="text" value={formData.trailerUrl} onChange={e => setFormData({...formData, trailerUrl: e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-4 text-white outline-none text-[10px] font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Visibility Status</label>
                    <div className="flex gap-4 p-2 bg-black/40 border border-white/5 rounded-2xl">
                       <button 
                         type="button" 
                         onClick={() => setFormData({...formData, status: 'Online'})}
                         className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.status === 'Online' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                       >
                         ONLINE
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setFormData({...formData, status: 'Offline'})}
                         className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.status === 'Offline' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                       >
                         OFFLINE
                       </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Payload Size</label>
                    <input type="text" value={formData.fileSize} onChange={e => setFormData({...formData, fileSize: e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-4 text-white outline-none font-bold italic" />
                  </div>
                </div>

                <div className="flex justify-end gap-6 pt-10">
                  <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all">Abort</button>
                  <button 
                    type="submit" 
                    disabled={isDeploying}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-12 py-5 rounded-[22px] font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3"
                  >
                    {isDeploying ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                    {editingId ? 'Save Changes' : 'Initialize Deployment'}
                  </button>
                </div>
              </form>

              {/* Preview Side */}
              <div className="w-[450px] hidden xl:flex flex-col bg-black/60 p-12 overflow-y-auto no-scrollbar">
                  <div className="mb-12">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] block mb-4">Live Preview Node</span>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Real-time Cinematic Verification</h3>
                  </div>

                  <div className="space-y-12">
                    {/* Card Preview */}
                    <div className="space-y-4">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Row Asset Preview</p>
                      <div className="relative group rounded-2xl overflow-hidden border border-white/5 aspect-video bg-[#11141b] shadow-2xl">
                         <img src={formData.posterUrl} className="w-full h-full object-cover" alt="" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                         <div className="absolute bottom-4 left-4">
                           <div className="flex gap-2 mb-2">
                             <span className="text-[6px] font-black uppercase tracking-widest bg-blue-600 px-2 py-0.5 rounded-sm">Premium</span>
                             <span className="text-[6px] font-black uppercase tracking-widest bg-orange-500 px-2 py-0.5 rounded-sm">{formData.quality}</span>
                           </div>
                           <h4 className="text-white font-black uppercase italic tracking-tighter text-sm">{formData.title || 'Untitled Asset'}</h4>
                         </div>
                      </div>
                    </div>

                    {/* Meta Preview */}
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/5 space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{formData.category}</span>
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{formData.year}</span>
                      </div>
                      <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight">{formData.title || 'Untitled Node'}</h4>
                      <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed line-clamp-4">{formData.description || 'No description encrypted yet...'}</p>
                      
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Payload Size</span>
                            <span className="text-white font-black italic">{formData.fileSize}</span>
                         </div>
                         <div className={`px-4 py-1.5 rounded-full border text-[7px] font-black uppercase tracking-widest ${formData.status === 'Offline' ? 'border-slate-800 text-slate-600' : 'border-green-500/30 text-green-500'}`}>
                           {formData.status}
                         </div>
                      </div>
                    </div>

                    {/* Embed Verification */}
                    <div className="space-y-4 opacity-40">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Signal Link Status</p>
                       <div className="flex items-center gap-3">
                          <i className={`fa-solid ${formData.trailerUrl ? 'fa-link text-blue-500' : 'fa-link-slash text-slate-700'}`}></i>
                          <span className="text-[8px] font-mono text-slate-600 truncate">{formData.trailerUrl || 'NO_SIGNAL_DETECTED'}</span>
                       </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
