import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, AlertCircle, CheckCircle2, 
  Sparkles, Filter, BookOpen, BrainCircuit, ChevronRight, Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const topicMasteryData = [
  { topic: 'Vektor & Matriks', penguasaan: 92, status: 'Sangat Baik' },
  { topic: 'Trigonometri', penguasaan: 88, status: 'Baik' },
  { topic: 'Statistika', penguasaan: 85, status: 'Baik' },
  { topic: 'Turunan Fungsi', penguasaan: 72, status: 'Cukup' },
  { topic: 'Kalkulus Integral', penguasaan: 64, status: 'Perlu Remedial' },
];

const distributionData = [
  { name: 'Sangat Paham (>88)', value: 40, color: '#10B981' },
  { name: 'Paham (80-87)', value: 35, color: '#3B82F6' },
  { name: 'Cukup (70-79)', value: 15, color: '#F59E0B' },
  { name: 'Remedial (<70)', value: 10, color: '#EF4444' },
];

export default function AnalisisKelasView({ students, classes }) {
  const [selectedClass, setSelectedClass] = useState('XII MIPA 1');
  const [aiInsight, setAiInsight] = useState(
    'Berdasarkan data nilai terbaru, kelas XII MIPA 1 unggul dalam topik Vektor (92%), namun 36% siswa mengalami hambatan pada sub-materi Kalkulus Integral. Disarankan memberikan latihan terpandu 15 menit awal sebelum memulai materi baru.'
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRefreshAiInsight = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAiInsight(
        `Analisis AI Baru untuk ${selectedClass}: Tingkat ketuntasan kumulatif berada pada angka 84.5%. Terdeteksi pola kesalahan umum pada pemahaman rumus turunan rantai. Direkomendasikan pembagian kelompok belajar sebaya.`
      );
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-gray-100"
    >
      {/* HEADER CONTROL */}
      <div className="bg-cardBg border border-cardBorder p-4 sm:p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-primaryPurple rounded-xl shrink-0">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-lg text-white">Analisis Perkembangan & Penguasaan Pembelajaran</h3>
            <p className="text-xs text-gray-400">Peta kompetensi siswa berbasis analitik data pembelajaran real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-darkBg border border-cardBorder rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-accentBlue" />
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
          >
            {classes.map(c => <option key={c} value={c} className="bg-cardBg">{c}</option>)}
          </select>
        </div>
      </div>

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Indeks Ketuntasan Kelas</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-400">84.5%</h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Memenuhi Target KKM
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Bab Paling Dikuasai</p>
            <h3 className="text-xl font-bold mt-1 text-white">Vektor & Matriks</h3>
            <p className="text-xs text-purple-400 mt-1">92% Penguasaan</p>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-primaryPurple rounded-xl">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Bab Perlu Remedial</p>
            <h3 className="text-xl font-bold mt-1 text-amber-400">Kalkulus Integral</h3>
            <p className="text-xs text-amber-400 mt-1">64% Penguasaan</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Siswa Perlu Pendampingan</p>
            <h3 className="text-3xl font-bold mt-1 text-red-400">3 Siswa</h3>
            <p className="text-xs text-gray-400 mt-1">Saran Tutor Sebaya</p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI INSIGHT CARD */}
      <div className="bg-gradient-to-r from-purple-900/30 via-cardBg to-blue-900/30 border border-purple-500/30 p-6 rounded-2xl shadow-xl relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primaryPurple text-white rounded-xl shadow-lg shadow-purple-500/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                Rekomendasi Strategi Pembelajaran AI
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Model AI Pro
                </span>
              </h4>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed max-w-3xl">
                {aiInsight}
              </p>
            </div>
          </div>

          <button 
            onClick={handleRefreshAiInsight}
            disabled={isGenerating}
            className="bg-primaryPurple hover:bg-primaryPurple/80 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition shrink-0 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Menganalisis...' : 'Perbarui Diagnosis AI'}
          </button>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-white">Tingkat Penguasaan per Bab</h3>
              <p className="text-xs text-gray-400">Persentase rata-rata kelulusan indikator materi</p>
            </div>
            <span className="text-xs bg-darkBg px-3 py-1 rounded-lg text-gray-400 border border-cardBorder">
              {selectedClass}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicMasteryData}>
                <XAxis dataKey="topic" stroke="#6B7280" />
                <YAxis domain={[0, 100]} stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '0.75rem', color: '#fff' }} />
                <Bar dataKey="penguasaan" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-white mb-1">Distribusi Pemahaman</h3>
            <p className="text-xs text-gray-400 mb-4">Pengelompokan tingkat daya serap siswa</p>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '0.75rem', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-1.5 text-xs">
            {distributionData.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED TOPIC TABLE */}
      <div className="bg-cardBg border border-cardBorder rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-cardBorder bg-darkBg/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Detail Penguasaan Topik — {selectedClass}</h3>
          <span className="text-xs text-gray-400">Total 5 Bab Utama Kurikulum</span>
        </div>

        <div className="divide-y divide-cardBorder">
          {topicMasteryData.map((item, idx) => (
            <div key={idx} className="p-5 flex items-center justify-between hover:bg-cardBorder/30 transition">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-darkBg border border-cardBorder rounded-xl text-primaryPurple font-bold text-sm">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{item.topic}</h4>
                  <p className="text-xs text-gray-400">Mata Pelajaran Matematika Peminatan</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-36">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Skor Penguasaan</span>
                    <span className="font-bold text-white">{item.penguasaan}%</span>
                  </div>
                  <div className="w-full bg-darkBg h-2 rounded-full overflow-hidden border border-cardBorder">
                    <div 
                      className={`h-full ${
                        item.penguasaan >= 85 ? 'bg-emerald-400' :
                        item.penguasaan >= 70 ? 'bg-blue-400' : 'bg-amber-400'
                      }`} 
                      style={{ width: `${item.penguasaan}%` }}
                    ></div>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.penguasaan >= 85 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  item.penguasaan >= 70 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {item.status}
                </span>

                <button className="text-xs text-primaryPurple font-semibold hover:underline flex items-center gap-1">
                  Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
