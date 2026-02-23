
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthPageProps {
  type: 'login' | 'signup';
  setUser: (user: User | null) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ type, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Validation Logic
  const isEmailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  const isPasswordValid = useMemo(() => {
    return password.length >= 6;
  }, [password]);

  const isNameValid = useMemo(() => {
    return type === 'login' ? true : name.trim().length >= 2;
  }, [name, type]);

  const isFormValid = useMemo(() => {
    return isEmailValid && isPasswordValid && isNameValid;
  }, [isEmailValid, isPasswordValid, isNameValid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setError('');
    setIsSubmitting(true);

    // Artificial delay for cinematic effect
    setTimeout(() => {
      if (type === 'signup') {
        const user = authService.register(name, email, password);
        if (user) {
          setUser(user);
          navigate('/');
        } else {
          setError('Communication Node (Email) already exists in our vault.');
          setIsSubmitting(false);
        }
      } else {
        const user = authService.login(email, password);
        if (user) {
          setUser(user);
          navigate('/');
        } else {
          setError('Invalid Access Sequence or Node Address.');
          setIsSubmitting(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-32 relative overflow-hidden bg-[#05070a]">
      {/* OSHAKUL Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 rounded-full blur-[160px]"></div>
      </div>

      <div className="relative w-full max-w-md bg-[#11141b]/80 backdrop-blur-3xl border border-white/5 p-10 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-orange-500 p-[2px] rounded-2xl">
              <div className="bg-black px-6 py-2 rounded-[14px]">
                <span className="text-2xl font-black text-white uppercase tracking-tighter italic">Mukunzi</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest italic">
            {type === 'login' ? 'Nexus Authentication' : 'Vault Entry Protocol'}
          </h2>
          <p className="text-slate-500 mt-4 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
            {type === 'login' ? 'Synchronizing encrypted user data for portal access' : 'Registering new global cinematic operative identity'}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-orange-950/20 border border-orange-500/30 text-orange-500 text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-pulse">
            <i className="fa-solid fa-triangle-exclamation text-xs"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'signup' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Alias</label>
              <input 
                type="text" 
                required
                disabled={isSubmitting}
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full bg-black/50 border rounded-2xl px-6 py-4 text-white focus:border-blue-500 transition-all outline-none font-bold italic disabled:opacity-50 ${name && !isNameValid ? 'border-orange-500/50' : 'border-white/5'}`}
                placeholder="Your name"
              />
              {name && !isNameValid && (
                <p className="text-[8px] text-orange-500 font-black uppercase tracking-widest ml-2">Minimum 2 characters required</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Node Address</label>
            <input 
              type="email" 
              required
              disabled={isSubmitting}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full bg-black/50 border rounded-2xl px-6 py-4 text-white focus:border-blue-500 transition-all outline-none font-bold italic disabled:opacity-50 ${email && !isEmailValid ? 'border-orange-500/50' : 'border-white/5'}`}
              placeholder="name@email.com"
            />
            {email && !isEmailValid && (
              <p className="text-[8px] text-orange-500 font-black uppercase tracking-widest ml-2">Please enter a valid node address</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Access Sequence</label>
            </div>
            <input 
              type="password" 
              required
              disabled={isSubmitting}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full bg-black/50 border rounded-2xl px-6 py-4 text-white focus:border-blue-500 transition-all outline-none font-bold disabled:opacity-50 ${password && !isPasswordValid ? 'border-orange-500/50' : 'border-white/5'}`}
              placeholder="••••••••"
            />
            {password && !isPasswordValid && (
              <p className="text-[8px] text-orange-500 font-black uppercase tracking-widest ml-2">Sequence must be at least 6 characters</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`w-full font-black py-5 rounded-2xl transition-all active:scale-[0.98] shadow-2xl uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 ${isFormValid && !isSubmitting ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 shadow-none'}`}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                <span>Processing...</span>
              </>
            ) : (
              <span>{type === 'login' ? 'Confirm Access' : 'Initialize Identity'}</span>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          {type === 'login' ? (
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Unregistered Operative? <Link to="/signup" className="text-orange-500 font-black hover:text-white transition-colors">Apply for Vault Access</Link>
            </p>
          ) : (
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Identity Confirmed? <Link to="/login" className="text-blue-500 font-black hover:text-white transition-colors">Terminal Login</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
