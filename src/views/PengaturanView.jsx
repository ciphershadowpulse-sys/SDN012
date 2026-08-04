import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, User, Building, Sparkles, Save, CheckCircle2, 
  ShieldCheck, BellRing, Database, Lock, Key, Globe
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  fetchSchoolSettingsSupabase, 
  saveSchoolSettingsSupabase,
  saveUserAccountSupabase
} from '../lib/supabase';

export default function PengaturanView({ currentUser, setCurrentUser }) {
  const defaultProfile = {
    nama: currentUser?.nama || 'Pak Budi, S.Pd',
    nip: currentUser?.nip || '19850412 201001 1 008',
    mapel: 'Matematika Peminatan & Fisika',
    email: currentUser?.email || 'budi.matematika@sekolah.sch.id',
    phone: currentUser?.phone || '081234567890',
    namaSekolah: 'SMA Negeri 1 Jakarta',
    tahunAjaran: '2026/2027 (Semester Ganjil)',
    kkmDefault: 75,
    kurikulum: 'Kurikulum Merdeka',
    aiModel: 'Gemini 3.6 Pro (Fast & Accurate)',
    autoWaAlert: true
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    if (isSupabaseConfigured && currentUser?.username) {
      fetchSchoolSettingsSupabase(currentUser.username, defaultProfile).then(sett => {
        setProfile(prev => ({
          ...prev,
          ...sett
        }));
      });
    }
  }, [currentUser]);

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSupabaseConfigured && currentUser?.username) {
      await saveSchoolSettingsSupabase(currentUser.username, profile);
      await saveUserAccountSupabase({
        id: currentUser?.id || `USR-${Date.now()}`,
        username: currentUser?.username || 'user',
        password: currentUser?.password || '123456',
        nama: profile.nama,
        nip: profile.nip,
        kelasBinaan: currentUser?.kelasBinaan || 'XII MIPA 1',
        role: currentUser?.role || 'Wali Kelas',
        email: profile.email,
        phone: profile.phone
      });
      if (setCurrentUser && currentUser) {
        const updatedUser = { ...currentUser, nama: profile.nama, nip: profile.nip, email: profile.email, phone: profile.phone };
        setCurrentUser(updatedUser);
        localStorage.setItem('digital_guru_session', JSON.stringify(updatedUser));
      }
    }
    setToastMsg('Pengaturan Akun & Identitas Sekolah Berhasil Disimpan ke Supabase!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-gray-100 relative"
    >
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-xs sm:text-sm border border-emerald-400/40"
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="bg-cardBg border border-cardBorder p-4 sm:p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-primaryPurple rounded-xl shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-lg text-white">Pengaturan Akun Guru & Konfigurasi Sekolah</h3>
            <p className="text-xs text-gray-400">Atur profil, identitas kurikulum, dan integrasi kecerdasan buatan AI</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="bg-gradient-to-r from-primaryPurple to-accentBlue px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:opacity-90 transition"
        >
          <Save className="w-4 h-4" /> Simpan Pengaturan
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SEKSI 1: PROFIL GURU */}
        <div className="bg-cardBg border border-cardBorder p-4 sm:p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-cardBorder pb-4">
            <User className="w-5 h-5 text-primaryPurple" />
            <h4 className="font-bold text-base text-white">Profil Pengajar / Guru</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nama Lengkap & Gelar</label>
              <input 
                type="text"
                value={profile.nama}
                onChange={(e) => {
                  const val = e.target.value;
                  const capitalized = val.replace(/\b\w/g, char => char.toUpperCase());
                  setProfile({ ...profile, nama: capitalized });
                }}
                className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple capitalize"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">NIP (Nomor Induk Pegawai)</label>
              <input 
                type="text"
                value={profile.nip}
                onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Mata Pelajaran Utama</label>
              <input 
                type="text"
                value={profile.mapel}
                onChange={(e) => setProfile({ ...profile, mapel: e.target.value })}
                className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Akun Belajar.id</label>
              <input 
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
              />
            </div>
          </div>
        </div>

        {/* SEKSI 2: IDENTITAS SEKOLAH & KURIKULUM */}
        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-cardBorder pb-4">
            <Building className="w-5 h-5 text-accentBlue" />
            <h4 className="font-bold text-base text-white">Identitas Sekolah & Standar KKM</h4>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nama Instansi / Sekolah</label>
              <input 
                type="text"
                value={profile.namaSekolah}
                onChange={(e) => setProfile({ ...profile, namaSekolah: e.target.value })}
                className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tahun Ajaran & Semester</label>
              <input 
                type="text"
                value={profile.tahunAjaran}
                onChange={(e) => setProfile({ ...profile, tahunAjaran: e.target.value })}
                className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">KKM (Kriteria Ketuntasan Minimal)</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={profile.kkmDefault}
                onChange={(e) => setProfile({ ...profile, kkmDefault: Number(e.target.value) })}
                className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Model Kurikulum Acuan</label>
              <select 
                value={profile.kurikulum}
                onChange={(e) => setProfile({ ...profile, kurikulum: e.target.value })}
                className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
              >
                <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                <option value="K13 Revisi 2018">K13 Revisi 2018</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEKSI 3: INTEGRASI AI & CLOUD */}
        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-cardBorder pb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-base text-white">Integrasi Asisten AI & Cloud Sync</h4>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Mesin AI Rekomendasi Guru</label>
              <select 
                value={profile.aiModel}
                onChange={(e) => setProfile({ ...profile, aiModel: e.target.value })}
                className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
              >
                <option value="Gemini 3.6 Pro (Fast & Accurate)">Gemini 3.6 Pro (Fast & Accurate)</option>
                <option value="Cloudflare Workers AI (Edge Deployment)">Cloudflare Workers AI (Edge Deployment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Status Sinkronisasi Database</label>
              <div className={`flex items-center gap-2 bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs font-semibold ${isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                <Database className={`w-4 h-4 ${isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`} /> 
                {isSupabaseConfigured ? 'Terhubung (Cloud Synchronized)' : 'Mode Standalone (Lokal - Tanpa Cloud DB)'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-darkBg rounded-xl border border-cardBorder">
            <div className="flex items-center gap-3">
              <BellRing className="w-5 h-5 text-purple-400" />
              <div>
                <h5 className="font-semibold text-sm text-white">Notifikasi Warning WhatsApp Ortu Otomatis</h5>
                <p className="text-xs text-gray-400">Aktifkan pembuatan tautan WhatsApp peringatan ketidakhadiran secara otomatis</p>
              </div>
            </div>

            <input 
              type="checkbox"
              checked={profile.autoWaAlert}
              onChange={(e) => setProfile({ ...profile, autoWaAlert: e.target.checked })}
              className="w-5 h-5 accent-primaryPurple cursor-pointer"
            />
          </div>
        </div>
      </form>
    </motion.div>
  );
}
