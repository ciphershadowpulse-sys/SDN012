import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, Clock, Award, Sparkles, Send, ChevronRight, UserCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const activityData = [
  { name: 'Sen', aktivitas: 400 },
  { name: 'Sel', aktivitas: 300 },
  { name: 'Rab', aktivitas: 600 },
  { name: 'Kam', aktivitas: 800 },
  { name: 'Jum', aktivitas: 500 },
  { name: 'Sab', aktivitas: 700 },
  { name: 'Min', aktivitas: 900 },
];

const categoryData = [
  { name: 'Pembuatan RPP', value: 45, color: '#8B5CF6' },
  { name: 'Koreksi Tugas', value: 25, color: '#3B82F6' },
  { name: 'Buat Soal Ujian', value: 20, color: '#10B981' },
  { name: 'Administrasi', value: 10, color: '#F59E0B' },
];

export default function DashboardView({ currentUser, students = [] }) {
  const [aiPrompt, setAiPrompt] = useState('');
  
  const kelasName = currentUser?.kelasBinaan || 'XII MIPA 1';
  const kelasStudents = students.filter(s => s.kelas === kelasName);
  const totalSiswaKelas = kelasStudents.length > 0 ? kelasStudents.length : 12;

  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: `Halo ${currentUser?.nama || 'Pengajar'}! Selamat bertugas di kelas ${kelasName}. Ada yang bisa saya bantu untuk persiapan presensi atau RPP hari ini?` }
  ]);

  const handleSendAi = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setChatLog([
      ...chatLog, 
      { sender: 'user', text: aiPrompt }, 
      { sender: 'ai', text: `Baik, saya sedang menyiapkan bahan rekomendasi pembelajaran untuk kelas ${kelasName}...` }
    ]);
    setAiPrompt('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-8 space-y-8 overflow-y-auto flex-1"
    >
      {/* STATS CARDS WALI KELAS */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { title: `Total Siswa (${kelasName})`, value: `${totalSiswaKelas} Siswa`, change: `Wali Kelas ${kelasName}`, icon: Users, color: 'text-purple-400' },
          { title: 'Tugas Dinilai AI', value: '1,245', change: '+14.5% minggu ini', icon: CheckCircle2, color: 'text-blue-400' },
          { title: 'Jam Efektif Mengajar', value: '156 Jam', change: '+22.6% efisiensi', icon: Clock, color: 'text-emerald-400' },
          { title: 'Akurasi Penilaian', value: '98.6%', change: '+5.3% dari standar', icon: Award, color: 'text-amber-400' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl hover:border-primaryPurple/50 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400 font-medium">{stat.title}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <h3 className="text-3xl font-bold mb-1 text-white">{stat.value}</h3>
            <p className="text-xs text-emerald-400 font-medium">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* CHARTS & AI INTERACTIVE SECTION */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-white">Statistik Keaktifan & Tugas Siswa — {kelasName}</h3>
            <span className="text-xs bg-darkBg px-3 py-1 rounded-lg text-gray-400 border border-cardBorder">Minggu Ini</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '0.75rem', color: '#fff' }} />
                <Line type="monotone" dataKey="aktivitas" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-primaryPurple">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Asisten Pintar Wali Kelas</h4>
                <p className="text-xs text-gray-400">Siap bantu RPP & Presensi {kelasName}</p>
              </div>
            </div>

            <div className="bg-darkBg p-4 rounded-xl border border-cardBorder h-40 overflow-y-auto space-y-3 mb-4">
              {chatLog.map((chat, i) => (
                <div key={i} className={`text-xs p-2.5 rounded-xl leading-relaxed ${chat.sender === 'ai' ? 'bg-cardBorder text-gray-200' : 'bg-primaryPurple text-white ml-auto max-w-[80%]'}`}>
                  {chat.text}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendAi} className="flex gap-2">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ketik perintah ke AI..." 
              className="flex-1 bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primaryParameter"
            />
            <button type="submit" className="bg-primaryPurple hover:bg-primaryPurple/80 p-2.5 rounded-xl text-white transition">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold text-lg mb-4 text-white">Distribusi Penggunaan AI</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '0.75rem', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-white">Kelas & Tugas Aktif Terbaru ({kelasName})</h3>
            <span className="text-xs text-primaryPurple font-semibold cursor-pointer flex items-center gap-1 hover:underline">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-3">
            {[
              { title: `Matematika Peminatan ${kelasName} — Turunan Fungsi`, deadline: 'Besok, 23:00', progress: '85%' },
              { title: `Fisika Dasar ${kelasName} — Hukum Newton`, deadline: '28 Jul 2026', progress: '60%' },
              { title: `Matematika Wajib ${kelasName} — Matriks & Vektor`, deadline: '30 Jul 2026', progress: '40%' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-darkBg rounded-xl border border-cardBorder hover:border-primaryPurple/40 transition">
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-gray-400">Tenggat: {item.deadline}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-cardBorder h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primaryPurple to-accentBlue h-full" style={{ width: item.progress }}></div>
                  </div>
                  <span className="text-xs font-bold text-primaryPurple">{item.progress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}