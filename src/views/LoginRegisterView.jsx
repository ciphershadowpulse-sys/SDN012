import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Lock, User, UserPlus, LogIn, CheckCircle2, AlertCircle
} from 'lucide-react';
import { INITIAL_CLASSES } from '../data/initialData';
import { isSupabaseConfigured, saveUserAccountSupabase, loginUserSupabase } from '../lib/supabase';

export default function LoginRegisterView({ userAccounts, setUserAccounts, onLoginSuccess }) {
  const [activeMode, setActiveMode] = useState('login'); // 'login' | 'register'
  const [isLoading, setIsLoading] = useState(false);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regData, setRegData] = useState({
    nama: '',
    nip: '',
    username: '',
    password: '',
    confirmPassword: '',
    kelasBinaan: '',
    email: '',
    phone: ''
  });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Mohon isi Username dan Password!');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Cek langsung ke database Supabase jika kredensial Supabase terkonfigurasi
      if (isSupabaseConfigured) {
        const dbAccount = await loginUserSupabase(loginUsername, loginPassword);
        if (dbAccount) {
          setIsLoading(false);
          onLoginSuccess(dbAccount);
          return;
        }
      }

      // 2. Cek ke daftar userAccounts terdaftar jika Supabase tidak terhubung atau mode offline
      const account = userAccounts.find(
        u => u.username.toLowerCase() === loginUsername.trim().toLowerCase() && u.password === loginPassword
      );

      if (account) {
        setIsLoading(false);
        onLoginSuccess(account);
      } else {
        setIsLoading(false);
        setLoginError('Akun belum terdaftar atau kombinasi Username & Password salah! Silakan lakukan pendaftaran terlebih dahulu.');
      }
    } catch (err) {
      setIsLoading(false);
      setLoginError('Gagal memeriksa database akun: ' + err.message);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regData.nama.trim() || !regData.username.trim() || !regData.password) {
      setRegError('Mohon lengkapi Nama Lengkap, Username, dan Password!');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setRegError('Konfirmasi password tidak cocok dengan password yang dimasukkan!');
      return;
    }

    // Check if username already exists
    if (userAccounts.some(u => u.username.toLowerCase() === regData.username.trim().toLowerCase())) {
      setRegError(`Username "${regData.username}" sudah terdaftar di sistem!`);
      return;
    }

    const newUser = {
      id: `USR-${String(userAccounts.length + 1).padStart(3, '0')}`,
      username: regData.username.trim(),
      password: regData.password,
      nama: regData.nama.trim(),
      nip: regData.nip.trim() || '-',
      kelasBinaan: regData.kelasBinaan,
      role: 'Wali Kelas',
      email: regData.email.trim() || '',
      phone: regData.phone.trim() || ''
    };

    setIsLoading(true);

    await saveUserAccountSupabase(newUser);
    setUserAccounts(prev => [...prev, newUser]);
    setIsLoading(false);

    setRegSuccess(`Akun Wali Kelas "${newUser.nama}" untuk ${newUser.kelasBinaan} Berhasil Didaftarkan ke Database! Silakan Login.`);

    // Switch to login tab and prefill username
    setLoginUsername(newUser.username);
    setLoginPassword(newUser.password);
    setTimeout(() => {
      setActiveMode('login');
      setRegSuccess('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primaryPurple/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accentBlue/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-5 gap-8 items-center z-10">

        {/* LEFT BRANDING PANEL */}
        <div className="col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-primaryPurple to-accentBlue p-3 rounded-2xl text-white shadow-xl shadow-purple-500/30">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl tracking-wide text-white">Digital Guru SDN 012</h1>
              <p className="text-xs text-purple-300 font-medium">Portal Khusus Wali Kelas</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Sistem Workspace Pintar Berbasis Kelas Binaan
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Kelola data presensi harian, rekap absensi, input nilai, RPP AI, dan analitik kompetensi secara khusus dan aman sesuai kelas yang Anda ampu.
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN / REGISTER CARD */}
        <div className="col-span-3 bg-cardBg border border-cardBorder rounded-3xl p-8 shadow-2xl space-y-6">
          {/* TAB MODE SWITCHER */}
          <div className="flex bg-darkBg p-1.5 rounded-2xl border border-cardBorder">
            <button
              onClick={() => { setActiveMode('login'); setLoginError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${activeMode === 'login'
                ? 'bg-primaryPurple text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <LogIn className="w-4 h-4" /> Masuk Akun (Login)
            </button>

            <button
              onClick={() => { setActiveMode('register'); setRegError(''); setRegSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${activeMode === 'register'
                ? 'bg-primaryPurple text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <UserPlus className="w-4 h-4" /> Daftar Akun Wali Kelas
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN FORM */}
            {activeMode === 'login' ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Login Wali Kelas</h3>
                  <p className="text-xs text-gray-400">Masukkan Username & Password akun Wali Kelas Anda</p>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {loginError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {regSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Username Wali Kelas</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Masukkan Username terdaftar Anda..."
                      className="w-full pl-10 pr-4 py-3 bg-darkBg border border-cardBorder rounded-xl text-sm text-white focus:outline-none focus:border-primaryPurple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-darkBg border border-cardBorder rounded-xl text-sm text-white focus:outline-none focus:border-primaryPurple"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primaryPurple to-accentBlue py-3.5 rounded-xl font-bold text-white text-sm shadow-xl shadow-purple-500/25 hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Masuk ke Workspace Wali Kelas
                </button>
              </motion.form>
            ) : (
              /* REGISTER FORM */
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4 max-h-[60vh] overflow-y-auto pr-1"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Daftar Akun Wali Kelas Baru</h3>
                  <p className="text-xs text-gray-400">Registrasi akun resmi pengajar untuk mengampu kelas binaan</p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {regError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nama Lengkap & Gelar *</label>
                    <input
                      type="text"
                      required
                      value={regData.nama}
                      onChange={(e) => {
                        const val = e.target.value;
                        const capitalized = val.replace(/\b\w/g, char => char.toUpperCase());
                        setRegData({ ...regData, nama: capitalized });
                      }}
                      placeholder="Pak Rahmat, S.Pd"
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple capitalize"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Walikelas *</label>
                    <input
                      type="text"
                      required
                      value={regData.kelasBinaan}
                      onChange={(e) => setRegData({ ...regData, kelasBinaan: e.target.value })}
                      placeholder="Contoh: XII MIPA 1 / Kelas 5A"
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">NIP (Nomor Induk Pegawai)</label>
                    <input
                      type="text"
                      value={regData.nip}
                      onChange={(e) => setRegData({ ...regData, nip: e.target.value })}
                      placeholder="1995xxxx xxxx x xxx"
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Username Akun *</label>
                    <input
                      type="text"
                      required
                      value={regData.username}
                      onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                      placeholder="username_guru"
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password *</label>
                    <input
                      type="password"
                      required
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Konfirmasi Password *</label>
                    <input
                      type="password"
                      required
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      placeholder="email@contoh.com"
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">No. WhatsApp</label>
                    <input
                      type="text"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      placeholder="0812xxxxxxx"
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 py-3.5 rounded-xl font-bold text-white text-sm shadow-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Daftar Akun Wali Kelas Now
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
