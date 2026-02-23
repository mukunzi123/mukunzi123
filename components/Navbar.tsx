
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { authService } from '../services/authService';

interface NavbarProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsOpen(false);
    navigate('/login');
  };

  const isAdmin = user?.email.toLowerCase() === 'mukunzifabien@gmail.com';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${scrolled ? 'bg-[#05070a]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-[1500px] mx-auto flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-blue-600 to-orange-500 p-[2px] rounded-lg">
            <div className="bg-black px-4 py-1.5 rounded-[6px]">
              <span className="text-xl font-black text-white uppercase tracking-tighter italic">Mukunzi</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em]">
            <Link to="/" className="text-white hover:text-blue-500 transition-colors">Cinema</Link>
            <Link to="/legal-hub" className="text-gray-400 hover:text-orange-500 transition-colors">Guide</Link>
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 text-blue-500 hover:text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full bg-blue-500/5 transition-all hover:bg-blue-500/10">
                <i className="fa-solid fa-shield-halved text-[10px]"></i>
                <span>Admin Node</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-6">
                <span className="hidden lg:block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Operative: {user.name}</span>
                <button 
                  onClick={handleLogout} 
                  className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase text-orange-500 hover:text-orange-400 tracking-widest transition-all"
                >
                  <i className="fa-solid fa-power-off"></i>
                  Terminate
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="w-10 h-10 flex items-center justify-center text-white md:hidden"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-[#05070a] z-[60] flex flex-col p-12 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center">
             <span className="text-xl font-black italic">MUKUNZI</span>
             <button onClick={() => setIsOpen(false)} className="text-white text-2xl">
                <i className="fa-solid fa-xmark"></i>
             </button>
          </div>
          <div className="flex flex-col gap-10 mt-16 text-4xl font-black uppercase italic tracking-tighter">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-white">Cinema</Link>
            <Link to="/legal-hub" onClick={() => setIsOpen(false)} className="text-white">Guide</Link>
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-white">Dashboard</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="text-blue-500 flex items-center gap-4">
                <i className="fa-solid fa-shield-halved text-2xl"></i> Admin Node
              </Link>
            )}
            <button onClick={handleLogout} className="text-left text-orange-600">Terminate Session</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
