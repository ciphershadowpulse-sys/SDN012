import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Download, Search, Filter, AlertTriangle, 
  CheckCircle2, ShieldAlert, Send, FileSpreadsheet, Sparkles, TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyTrendData = [
  { bulan: 'Jan', persentase: 96 },
  { bulan: 'Feb', persentase: 94 },
  { bulan: 'Mar', persentase: 97 },
  { bulan: 'Apr', persentase: 95 },
  { bulan: 'Mei', persentase: 98 },
  { bulan: 'Jun', persentase: 93 },
  { bulan: 'Jul', persentase: 96 },
];

const absenceReasonData = [
  { name: 'Sakit', value: 45, color: '#3B82F6' },
  { name: 'Izin', value: 30, color: '#F59E0B' },
  { name: 'Alpa', value: 25, color: '#EF4444' },
];

export default function AbsensiSiswaView({ students, classes, attendanceRecap }) {
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [selectedMonth, setSelectedMonth] = useState('Juli 2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportToast, setExportToast] = useState(false);

  // Combine student info with attendance recap
  const recapData = students.map(student => {
    const recap = attendanceRecap.find(r => r.studentId === student.id) || {
      hadir: 40, sakit: 0, izin: 0, alpa: 0, persentase: 100
    };
    return {
      ...student,
      ...recap
    };
  });

  // Filtered recap
  const filteredRecap = recapData.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.nisn.includes(searchTerm);
    const matchesClass = selectedClass === 'Semua Kelas' || item.kelas === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Metrics
  const totalStudents = filteredRecap.length;
  const perfectCount = filteredRecap.filter(item => item.persentase >= 100).length;
  const warningCount = filteredRecap.filter(item => item.alpa > 0 || item.persentase < 85).length;
  const avgAttendance = totalStudents > 0 
    ? (filteredRecap.reduce((acc, curr) => acc + curr.persentase, 0) / totalStudents).toFixed(1)
    : 100;

  // Handle Export
  const handleExport = () => {
    setExportToast(true);
    setTimeout(() => setExportToast(false), 3500);
  };

  // WhatsApp Alert Generator
  const handleSendWA = (student) => {
    const message = `Yth. Ortu/Wali dari ${student.nama} (${student.kelas}), kami menginformasikan rekap kehadiran bulan ${selectedMonth}: Hadir: ${student.hadir} hari, Sakit: ${student.sakit} hari, Izin: ${student.izin} hari, Alpa: ${student.alpa} hari (${student.persentase}% kehadiran). Mohon perhatiannya. Terima kasih.`;
    const encoded = encodeURIComponent(message);
    const phone = student.phoneOrtu ? student.phoneOrtu.replace(/^0/, '62') : '6281234567890';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-8 space-y-8 overflow-y-auto flex-1 text-gray-100"
    >
      {/* EXPORT TOAST */}
      <AnimatePresence>
        {exportToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-sm border border-purple-400/40"
          >
            <FileSpreadsheet className="w-5 h-5" /> Laporan Rekap Kehadiran ({selectedClass}) Berhasil Diunduh (Excel/PDF)!
          </motion.div>
        )}
      </AnimatePresence>

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Rata-rata Kehadiran</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-400">{avgAttendance}%</h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +1.2% dari bulan lalu
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Kehadiran Sempurna (100%)</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{perfectCount} Siswa</h3>
            <p className="text-xs text-purple-400 mt-1">Disiplin Tinggi</p>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-primaryPurple rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Siswa Perlu Perhatian</p>
            <h3 className="text-3xl font-bold mt-1 text-red-400">{warningCount} Siswa</h3>
            <p className="text-xs text-red-400 mt-1">Sering Alpa / Ketidakhadiran High</p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Siswa Dalam Rekap</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{totalStudents} Siswa</h3>
            <p className="text-xs text-gray-400 mt-1">Periode: {selectedMonth}</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CHARTS ANALYTICS */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-white">Grafik Tren Kehadiran Bulanan</h3>
              <p className="text-xs text-gray-400">Persentase tingkat kehadiran sekolah per bulan</p>
            </div>
            <span className="text-xs bg-darkBg px-3 py-1 rounded-lg text-gray-400 border border-cardBorder">Tahun 2026</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <XAxis dataKey="bulan" stroke="#6B7280" />
                <YAxis domain={[80, 100]} stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '0.75rem', color: '#fff' }} />
                <Line type="monotone" dataKey="persentase" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-white mb-1">Alokasi Ketidakhadiran</h3>
            <p className="text-xs text-gray-400 mb-4">Persentase alasan tidak hadir</p>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={absenceReasonData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                    {absenceReasonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '0.75rem', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-darkBg p-2 rounded-lg border border-cardBorder">
              <span className="text-blue-400 font-bold block">Sakit</span> 45%
            </div>
            <div className="bg-darkBg p-2 rounded-lg border border-cardBorder">
              <span className="text-amber-400 font-bold block">Izin</span> 30%
            </div>
            <div className="bg-darkBg p-2 rounded-lg border border-cardBorder">
              <span className="text-red-400 font-bold block">Alpa</span> 25%
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR & TABLE */}
      <div className="bg-cardBg border border-cardBorder p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama Siswa / NISN..." 
              className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-cardBorder rounded-xl text-sm text-white focus:outline-none focus:border-primaryPurple"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple"
            >
              <option value="Juli 2026">Juli 2026</option>
              <option value="Juni 2026">Juni 2026</option>
              <option value="Mei 2026">Mei 2026</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="bg-darkBg border border-cardBorder hover:border-primaryPurple text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow flex items-center gap-2 transition shrink-0"
        >
          <Download className="w-4 h-4 text-primaryPurple" /> Ekspor Rekap (Excel/PDF)
        </button>
      </div>

      {/* TABLE REKAP PRESENSI */}
      <div className="bg-cardBg border border-cardBorder rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-darkBg/60 text-xs uppercase text-gray-400 border-b border-cardBorder">
              <tr>
                <th className="py-4 px-6">Siswa</th>
                <th className="py-4 px-4">Kelas</th>
                <th className="py-4 px-4 text-center">Hadir</th>
                <th className="py-4 px-4 text-center">Sakit</th>
                <th className="py-4 px-4 text-center">Izin</th>
                <th className="py-4 px-4 text-center text-red-400">Alpa</th>
                <th className="py-4 px-6">Persentase</th>
                <th className="py-4 px-6 text-right">Peringatan Ortu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cardBorder">
              {filteredRecap.length > 0 ? (
                filteredRecap.map((item) => {
                  const isWarning = item.alpa > 0 || item.persentase < 85;
                  return (
                    <tr key={item.id} className="hover:bg-cardBorder/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow ${
                            item.gender === 'Laki-Laki' ? 'bg-blue-600' : 'bg-pink-600'
                          }`}>
                            {item.nama.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{item.nama}</div>
                            <div className="text-xs text-gray-400 font-mono">NISN: {item.nisn}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="bg-darkBg px-2.5 py-1 rounded-lg text-xs border border-cardBorder">
                          {item.kelas}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-emerald-400">{item.hadir}</td>
                      <td className="py-4 px-4 text-center font-bold text-blue-400">{item.sakit}</td>
                      <td className="py-4 px-4 text-center font-bold text-amber-400">{item.izin}</td>
                      <td className="py-4 px-4 text-center font-bold text-red-400">{item.alpa}</td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-darkBg h-2 rounded-full overflow-hidden border border-cardBorder">
                            <div 
                              className={`h-full ${
                                item.persentase >= 95 ? 'bg-emerald-400' :
                                item.persentase >= 85 ? 'bg-blue-400' : 'bg-red-500'
                              }`} 
                              style={{ width: `${item.persentase}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-bold ${
                            item.persentase >= 95 ? 'text-emerald-400' :
                            item.persentase >= 85 ? 'text-blue-400' : 'text-red-400'
                          }`}>
                            {item.persentase}%
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {isWarning ? (
                          <button 
                            onClick={() => handleSendWA(item)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto transition"
                          >
                            <Send className="w-3.5 h-3.5" /> Kirim Warning WA
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">Aman</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    Tidak ada data rekap presensi untuk filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
