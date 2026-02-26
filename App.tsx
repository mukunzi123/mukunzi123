import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { authService } from './services/authService';
import { User } from './types';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import LegalHub from './pages/LegalHub';
import { AuthPage } from './pages/AuthPages';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-[#05070a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-t-4 border-blue-600 border-r-4 border-orange-500 rounded-full animate-spin"></div>
            <div className="text-white font-black uppercase tracking-[0.5em] animate-pulse">Mukunzi</div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.email.toLowerCase() === 'mukunzifabien@gmail.com';

  if (!user) {
    return (
      <Router>
        <div className="min-h-screen bg-[#05070a] text-white selection:bg-blue-600 selection:text-white">
          <Routes>
            <Route path="/login" element={<AuthPage type="login" setUser={setUser} />} />
            <Route path="/signup" element={<AuthPage type="signup" setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#05070a] text-white selection:bg-blue-600 selection:text-white">
        <Navbar user={user} setUser={setUser} />
        
        <a 
          href="https://wa.me/250794497850" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="whatsapp-fab"
          title="Contact Mukunzi Support"
        >
          <i className="fa-brands fa-whatsapp text-2xl"></i>
        </a>

        <main>
          <Routes>
            <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
            <Route path="/movie/:id" element={<MovieDetailPage user={user} setUser={setUser} />} />
            <Route path="/dashboard" element={<DashboardPage user={user} setUser={setUser} />} />
            {/* STRICT ACCESS GATE: Only authenticated Admin Email can pass */}
            <Route 
              path="/admin" 
              element={isAdmin ? <AdminPage user={user} setUser={setUser} /> : <Navigate to="/" replace />} 
            />
            <Route path="/legal-hub" element={<LegalHub />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-[#05070a] py-32 border-t border-white/5 mt-32">
          <div className="max-w-[1500px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
              <div className="col-span-1 md:col-span-2 space-y-8">
                <span className="text-4xl font-black text-white tracking-tighter uppercase italic">Mukunzi Cinema</span>
                <p className="text-gray-500 text-xs leading-loose max-w-sm uppercase tracking-widest font-bold">
                  A high-performance cinematic portal for the modern age. Verified secure downloads, global adaptive streaming, and professional movie curation.
                </p>
                <div className="flex items-center gap-6">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"><i className="fa-brands fa-twitter"></i></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"><i className="fa-brands fa-instagram"></i></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"><i className="fa-brands fa-discord"></i></a>
                </div>
              </div>
              
              <div className="space-y-8">
                <h4 className="font-black uppercase text-[11px] tracking-[0.4em] text-blue-500 border-l-2 border-blue-500 pl-4">Elite Support</h4>
                <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-gray-500">
                  <li>
                    <a href="mailto:mukunzifabien@gmail.com" className="hover:text-white transition-colors flex items-center gap-3">
                      <i className="fa-regular fa-envelope text-orange-500 text-base"></i>
                      mukunzifabien@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:0794497850" className="hover:text-white transition-colors flex items-center gap-3">
                      <i className="fa-solid fa-phone-flip text-blue-500 text-base"></i>
                      0794497850
                    </a>
                  </li>
                  <li>
                    <a href="https://wa.me/250794497850" target="_blank" className="hover:text-green-500 transition-colors flex items-center gap-3">
                      <i className="fa-brands fa-whatsapp text-green-500 text-lg"></i>
                      Technical WhatsApp
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-8">
                <h4 className="font-black uppercase text-[11px] tracking-[0.4em] text-orange-500 border-l-2 border-orange-500 pl-4">Strategic Access</h4>
                <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    <li><Link to="/legal-hub" className="hover:text-white transition-colors">Safety Protocols</Link></li>
                    {isAdmin && (
                      <li>
                        <Link to="/admin" className="text-blue-500 font-black hover:text-white flex items-center gap-2">
                           <i className="fa-solid fa-lock-open text-[10px]"></i> Authorized Command
                        </Link>
                      </li>
                    )}
                    <li><Link to="/" className="hover:text-white transition-colors">Privacy Infrastructure</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-24 mt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-gray-800 text-[9px] font-black uppercase tracking-[0.6em]">
                © 2025 MUKUNZI FABIEN • ENGINEERED FOR CINEMA
              </p>
              <div className="flex gap-10 text-[9px] font-black text-gray-800 uppercase tracking-widest">
                <span className="text-blue-600/30">CDN: ACTIVE</span>
                <span className="text-orange-600/30">SSL: ENCRYPTED</span>
                <span className="text-green-600/30">NODES: 12 GLOBAL</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;