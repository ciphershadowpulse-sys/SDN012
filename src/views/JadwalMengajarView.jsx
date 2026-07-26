import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Plus, CheckCircle2, 
  AlertCircle, ChevronRight, BookOpen, Filter, X
} from 'lucide-react';

const initialSchedules = [
  { id: 'SCH-1', hari: 'Senin', jam: '07:30 - 09:00', kelas: 'XII MIPA 1', ruang: 'Lab Mat 1', mapel: 'Matematika Peminatan', topik: 'Turunan Fungsi Trigonometri', status: 'Selesai' },
  { id: 'SCH-2', hari: 'Senin', jam: '10:00 - 11:30', kelas: 'XII MIPA 2', ruang: 'Ruang 12B', mapel: 'Matematika Peminatan', topik: 'Vektor & Proyeksi 3D', status: 'Selesai' },
  { id: 'SCH-3', hari: 'Selasa', jam: '08:15 - 09:45', kelas: 'XI MIPA 1', ruang: 'Ruang 11A', mapel: 'Matematika Wajib', topik: 'Statistika & Distribusi', status: 'Belum Dimulai' },
  { id: 'SCH-4', hari: 'Selasa', jam: '10:15 - 11:45', kelas: 'X MIPA 1', ruang: 'Ruang 10C', mapel: 'Fisika Dasar', topik: 'Vektor Posisi & Kecepatan', status: 'Belum Dimulai' },
  { id: 'SCH-5', hari: 'Rabu', jam: '07:30 - 09:00', kelas: 'XII MIPA 1', ruang: 'Lab Mat 1', mapel: 'Matematika Peminatan', topik: 'Latihan Turunan Implisit', status: 'Belum Dimulai' },
  { id: 'SCH-6', hari: 'Kamis', jam: '09:00 - 10:30', kelas: 'XII MIPA 2', ruang: 'Ruang 12B', mapel: 'Matematika Peminatan', topik: 'Kuis Bab 2', status: 'Belum Dimulai' },
  { id: 'SCH-7', hari: 'Jumat', jam: '08:00 - 09:30', kelas: 'XI MIPA 1', ruang: 'Ruang 11A', mapel: 'Matematika Wajib', topik: 'Pembahasan Tugas Mandiri', status: 'Belum Dimulai' },
];

export default function JadwalMengajarView({ classes }) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [selectedDay, setSelectedDay] = useState('Semua Hari');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Form State
  const [formSchedule, setFormSchedule] = useState({
    hari: 'Senin',
    jam: '07:30 - 09:00',
    kelas: classes[0] || 'XII MIPA 1',
    ruang: 'Ruang 12A',
    mapel: 'Matematika Peminatan',
    topik: ''
  });

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const filteredSchedules = selectedDay === 'Semua Hari'
    ? schedules
    : schedules.filter(s => s.hari === selectedDay);

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!formSchedule.topik.trim()) {
      alert('Mohon isi topik pembelajaran!');
      return;
    }

    const newSch = {
      ...formSchedule,
      id: `SCH-${schedules.length + 1}`,
      status: 'Belum Dimulai'
    };

    setSchedules([...schedules, newSch]);
    setIsModalOpen(false);
    showToast('Agenda Jadwal Mengajar Baru Berhasil Ditambahkan!');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-gray-100 relative"
    >
      {/* TOAST */}
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

      {/* HEADER & ACTIONS */}
      <div className="bg-cardBg border border-cardBorder p-4 sm:p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-primaryPurple rounded-xl shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-lg text-white">Jadwal Agenda Mengajar Mingguan</h3>
            <p className="text-xs text-gray-400">Kelola alokasi waktu dan ruangan kelas mengajar Pak Budi, S.Pd</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-primaryPurple to-accentBlue px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Tambah Agenda Jadwal
        </button>
      </div>

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl">
          <span className="text-xs text-gray-400 font-medium">Total Beban Mengajar</span>
          <h3 className="text-3xl font-bold mt-1 text-white">24 Jam Pelajaran</h3>
          <p className="text-xs text-purple-400 mt-1">4 Kelas Binaan</p>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl">
          <span className="text-xs text-gray-400 font-medium">Agenda Hari Ini</span>
          <h3 className="text-3xl font-bold mt-1 text-emerald-400">2 Sesi Mengajar</h3>
          <p className="text-xs text-emerald-400 mt-1">Status Sesi: Selesai</p>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl">
          <span className="text-xs text-gray-400 font-medium">Sesi Selesai Pekan Ini</span>
          <h3 className="text-3xl font-bold mt-1 text-accentBlue">2 Dari 7 Sesi</h3>
          <p className="text-xs text-gray-400 mt-1">28.5% Progres Pekan</p>
        </div>
      </div>

      {/* HARI FILTER TABS */}
      <div className="flex items-center gap-2 border-b border-cardBorder pb-3">
        {['Semua Hari', ...days].map((day) => {
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isActive 
                  ? 'bg-primaryPurple text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-cardBg text-gray-400 border border-cardBorder hover:text-white'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* SCHEDULE LIST GRID */}
      <div className="space-y-4">
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map((item) => (
            <div 
              key={item.id} 
              className="bg-cardBg border border-cardBorder rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 hover:border-primaryPurple/40 transition"
            >
              <div className="flex items-center gap-6 min-w-[280px]">
                <div className="bg-darkBg p-3 rounded-xl border border-cardBorder text-center w-28 shrink-0">
                  <span className="text-xs text-purple-400 font-bold block">{item.hari}</span>
                  <span className="text-xs text-gray-300 font-mono mt-0.5 block">{item.jam}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-md text-xs font-bold">
                      {item.kelas}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" /> {item.ruang}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base mt-1">{item.topik}</h4>
                  <p className="text-xs text-gray-400">{item.mapel}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === 'Selesai'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {item.status}
                </span>

                <button 
                  onClick={() => showToast(`Membuka tautan RPP untuk sesi "${item.topik}"...`)}
                  className="bg-darkBg hover:bg-cardBorder border border-cardBorder text-gray-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-primaryPurple" /> RPP Sesi
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-400 bg-cardBg border border-cardBorder rounded-2xl">
            Tidak ada agenda mengajar di hari {selectedDay}.
          </div>
        )}
      </div>

      {/* MODAL TAMBAH AGENDA */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cardBg border border-cardBorder rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-cardBorder flex items-center justify-between bg-darkBg/50">
                <h3 className="font-bold text-lg text-white">Tambah Agenda Mengajar Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSchedule} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Hari</label>
                    <select 
                      value={formSchedule.hari}
                      onChange={(e) => setFormSchedule({ ...formSchedule, hari: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    >
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Jam Sesi</label>
                    <input 
                      type="text"
                      value={formSchedule.jam}
                      onChange={(e) => setFormSchedule({ ...formSchedule, jam: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                      placeholder="07:30 - 09:00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Kelas</label>
                    <select 
                      value={formSchedule.kelas}
                      onChange={(e) => setFormSchedule({ ...formSchedule, kelas: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    >
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Ruangan</label>
                    <input 
                      type="text"
                      value={formSchedule.ruang}
                      onChange={(e) => setFormSchedule({ ...formSchedule, ruang: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                      placeholder="Ruang 12A / Lab"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Topik / Materi Pembelajaran *</label>
                  <input 
                    type="text"
                    required
                    value={formSchedule.topik}
                    onChange={(e) => setFormSchedule({ ...formSchedule, topik: e.target.value })}
                    className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    placeholder="Contoh: Turunan Fungsi Implisit"
                  />
                </div>

                <div className="pt-4 border-t border-cardBorder flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-cardBorder text-gray-300 hover:text-white transition text-sm"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="bg-primaryPurple hover:bg-primaryPurple/80 px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg shadow-purple-500/20 text-sm transition"
                  >
                    Simpan Agenda
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
