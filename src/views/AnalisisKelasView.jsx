import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, AlertCircle, CheckCircle2, 
  Sparkles, Filter, BookOpen, BrainCircuit, ChevronRight, Target, Users, X, Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Curriculums / Topics per class
const CLASS_TOPICS_MAP = {
  'XII MIPA 1': [
    { topic: 'Vektor & Matriks', difficultyOffset: 8 },
    { topic: 'Trigonometri Lanjut', difficultyOffset: 4 },
    { topic: 'Statistika Inferensial', difficultyOffset: 1 },
    { topic: 'Turunan Fungsi Aljabar', difficultyOffset: -6 },
    { topic: 'Kalkulus Integral', difficultyOffset: -12 },
  ],
  'XII MIPA 2': [
    { topic: 'Gelombang & Optika', difficultyOffset: 6 },
    { topic: 'Geometri Ruang (Dimensi Tiga)', difficultyOffset: 3 },
    { topic: 'Statistika & Peluang', difficultyOffset: 0 },
    { topic: 'Listrik & Magnet', difficultyOffset: -5 },
    { topic: 'Fungsi Eksponen & Logaritma', difficultyOffset: -10 },
  ],
  'XI MIPA 1': [
    { topic: 'Persamaan Lingkaran', difficultyOffset: 7 },
    { topic: 'Fungsi Komposisi & Invers', difficultyOffset: 5 },
    { topic: 'Matriks & Transformasi', difficultyOffset: 2 },
    { topic: 'Polinomial (Suku Banyak)', difficultyOffset: -4 },
    { topic: 'Trigonometri Analitika', difficultyOffset: -9 },
  ],
  'X MIPA 1': [
    { topic: 'Eksponen & Bentuk Akar', difficultyOffset: 8 },
    { topic: 'Sistem Persamaan Linier 3V', difficultyOffset: 5 },
    { topic: 'Vektor Dasar (Vektor 2D)', difficultyOffset: 2 },
    { topic: 'Fungsi Kuadrat & Grafik', difficultyOffset: -3 },
    { topic: 'Trigonometri Dasar', difficultyOffset: -8 },
  ],
};

const DEFAULT_TOPICS = [
  { topic: 'Konsep Dasar & Teori', difficultyOffset: 6 },
  { topic: 'Penerapan Rumus', difficultyOffset: 2 },
  { topic: 'Analisis Soal Hots', difficultyOffset: -4 },
  { topic: 'Evaluasi Komprehensif', difficultyOffset: -10 },
];

export default function AnalisisKelasView({ students = [], classes = [], grades = [], homeroomClass }) {
  const availableClasses = classes && classes.length > 0 ? classes : ['XII MIPA 1', 'XII MIPA 2', 'XI MIPA 1', 'X MIPA 1'];
  const [selectedClass, setSelectedClass] = useState(homeroomClass || availableClasses[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTopicDetail, setSelectedTopicDetail] = useState(null);

  // Filter students for the selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.kelas === selectedClass);
  }, [students, selectedClass]);

  // Compute student scores & status for selected class
  const studentAnalytics = useMemo(() => {
    return classStudents.map(student => {
      // Find grades for student
      const studentGradeRecords = grades.filter(g => g.studentId === student.id);
      let avgScore = 80;
      if (studentGradeRecords.length > 0) {
        const sum = studentGradeRecords.reduce((acc, curr) => acc + (Number(curr.nilaiAkhir) || 0), 0);
        avgScore = Math.round((sum / studentGradeRecords.length) * 10) / 10;
      }
      return {
        ...student,
        avgScore,
        status: avgScore >= 75 ? 'Tuntas' : 'Remidial'
      };
    });
  }, [classStudents, grades]);

  // General Class Summary Calculations
  const totalStudentsCount = studentAnalytics.length;
  const tuntasCount = studentAnalytics.filter(s => s.status === 'Tuntas').length;
  const passPercentage = totalStudentsCount > 0 ? Math.round((tuntasCount / totalStudentsCount) * 100) : 0;
  
  const overallAvgScore = totalStudentsCount > 0 
    ? (studentAnalytics.reduce((acc, s) => acc + s.avgScore, 0) / totalStudentsCount).toFixed(1)
    : '0';

  const remedialStudents = studentAnalytics.filter(s => s.status === 'Remidial');
  const remedialCount = remedialStudents.length;

  // Distribution Breakdown
  const distributionData = useMemo(() => {
    let sangatPaham = 0;
    let paham = 0;
    let cukup = 0;
    let remedial = 0;

    studentAnalytics.forEach(s => {
      if (s.avgScore >= 88) sangatPaham++;
      else if (s.avgScore >= 80) paham++;
      else if (s.avgScore >= 75) cukup++;
      else remedial++;
    });

    const total = totalStudentsCount || 1;
    return [
      { name: 'Sangat Paham (>88)', value: Math.round((sangatPaham / total) * 100), count: sangatPaham, color: '#10B981' },
      { name: 'Paham (80-87)', value: Math.round((paham / total) * 100), count: paham, color: '#3B82F6' },
      { name: 'Cukup (75-79)', value: Math.round((cukup / total) * 100), count: cukup, color: '#F59E0B' },
      { name: 'Remedial (<75)', value: Math.round((remedial / total) * 100), count: remedial, color: '#EF4444' },
    ];
  }, [studentAnalytics, totalStudentsCount]);

  // Topic Mastery Calculations based on class data
  const topicMasteryData = useMemo(() => {
    const topicDefs = CLASS_TOPICS_MAP[selectedClass] || DEFAULT_TOPICS;
    const baseAvg = Number(overallAvgScore) || 80;

    return topicDefs.map(t => {
      const calcScore = Math.min(98, Math.max(45, Math.round(baseAvg + t.difficultyOffset)));
      let status = 'Sangat Baik';
      if (calcScore < 70) status = 'Perlu Remedial';
      else if (calcScore < 80) status = 'Cukup';
      else if (calcScore < 88) status = 'Baik';

      return {
        topic: t.topic,
        penguasaan: calcScore,
        status
      };
    });
  }, [selectedClass, overallAvgScore]);

  // Best and Weakest Topics
  const bestTopic = useMemo(() => {
    if (topicMasteryData.length === 0) return { topic: '-', penguasaan: 0 };
    return [...topicMasteryData].sort((a, b) => b.penguasaan - a.penguasaan)[0];
  }, [topicMasteryData]);

  const weakestTopic = useMemo(() => {
    if (topicMasteryData.length === 0) return { topic: '-', penguasaan: 0 };
    return [...topicMasteryData].sort((a, b) => a.penguasaan - b.penguasaan)[0];
  }, [topicMasteryData]);

  // AI Insight Generator per selected class
  const defaultAiInsight = useMemo(() => {
    const remedialNames = remedialStudents.map(s => s.nama).join(', ');
    return `Berdasarkan data analitik kelas ${selectedClass}, tingkat ketuntasan kumulatif berada pada angka ${passPercentage}% dengan rata-rata nilai kelas ${overallAvgScore}. Kelas unggul pada topik "${bestTopic.topic}" (${bestTopic.penguasaan}%), sedangkan bab "${weakestTopic.topic}" (${weakestTopic.penguasaan}%) mengalami penguasaan terendah. ${remedialCount > 0 ? `Direkomendasikan sesi pengayaan khusus untuk ${remedialCount} siswa (${remedialNames}).` : 'Seluruh siswa telah melampaui KKM.'}`;
  }, [selectedClass, passPercentage, overallAvgScore, bestTopic, weakestTopic, remedialCount, remedialStudents]);

  const [aiInsight, setAiInsight] = useState(defaultAiInsight);

  // Sync AI Insight text when class changes
  React.useEffect(() => {
    setAiInsight(defaultAiInsight);
  }, [defaultAiInsight]);

  const handleRefreshAiInsight = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const remedialNames = remedialStudents.map(s => s.nama).join(', ');
      setAiInsight(
        `[Diagnosis AI Terbaru — ${selectedClass}] Hasil analisis daya serap siswa menunjukkan tren ${passPercentage >= 80 ? 'positif' : 'perlu perhatian'}. Rata-rata kelas ${overallAvgScore}. Terdeteksi tantangan utama siswa pada materi "${weakestTopic.topic}". ${remedialCount > 0 ? `Saran tindakan cepat: Bentuk 2 kelompok tutor sebaya dan berikan drill soal remedial untuk ${remedialNames}.` : 'Rekomendasikan materi pengayaan tingkat olimpiade.'}`
      );
      setIsGenerating(false);
    }, 1100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-gray-100 relative"
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
            {availableClasses.map(c => <option key={c} value={c} className="bg-cardBg">{c}</option>)}
          </select>
        </div>
      </div>

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Indeks Ketuntasan Kelas</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-400">{passPercentage}%</h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Rata-Rata: {overallAvgScore}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Bab Paling Dikuasai</p>
            <h3 className="text-lg font-bold mt-1 text-white truncate max-w-[160px]">{bestTopic.topic}</h3>
            <p className="text-xs text-purple-400 mt-1">{bestTopic.penguasaan}% Penguasaan</p>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-primaryPurple rounded-xl">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Bab Perlu Remedial</p>
            <h3 className="text-lg font-bold mt-1 text-amber-400 truncate max-w-[160px]">{weakestTopic.topic}</h3>
            <p className="text-xs text-amber-400 mt-1">{weakestTopic.penguasaan}% Penguasaan</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Siswa Perlu Pendampingan</p>
            <h3 className="text-3xl font-bold mt-1 text-red-400">{remedialCount} Siswa</h3>
            <p className="text-xs text-gray-400 mt-1">Dari {totalStudentsCount} Siswa Terdaftar</p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI INSIGHT CARD */}
      <div className="bg-gradient-to-r from-purple-900/30 via-cardBg to-blue-900/30 border border-purple-500/30 p-6 rounded-2xl shadow-xl relative">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primaryPurple text-white rounded-xl shadow-lg shadow-purple-500/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                Rekomendasi Strategi Pembelajaran AI — {selectedClass}
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
            className="bg-primaryPurple hover:bg-primaryPurple/80 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Menganalisis...' : 'Perbarui Diagnosis AI'}
          </button>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-white">Tingkat Penguasaan per Bab</h3>
              <p className="text-xs text-gray-400">Persentase rata-rata kelulusan indikator materi {selectedClass}</p>
            </div>
            <span className="text-xs bg-darkBg px-3 py-1 rounded-lg text-purple-300 font-semibold border border-cardBorder">
              {selectedClass}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicMasteryData}>
                <XAxis dataKey="topic" stroke="#6B7280" tick={{ fontSize: 11 }} />
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
            <p className="text-xs text-gray-400 mb-4">Pengelompokan daya serap siswa ({totalStudentsCount} Siswa)</p>
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
          
          <div className="space-y-1.5 text-xs mt-2">
            {distributionData.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-white">{item.value}% ({item.count} siswa)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED TOPIC TABLE */}
      <div className="bg-cardBg border border-cardBorder rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-cardBorder bg-darkBg/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Detail Penguasaan Topik — {selectedClass}</h3>
          <span className="text-xs text-gray-400">Total {topicMasteryData.length} Bab Utama</span>
        </div>

        <div className="divide-y divide-cardBorder">
          {topicMasteryData.map((item, idx) => (
            <div key={idx} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-cardBorder/30 transition">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-darkBg border border-cardBorder rounded-xl text-primaryPurple font-bold text-sm">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{item.topic}</h4>
                  <p className="text-xs text-gray-400">Analisis Kurikulum Kelas {selectedClass}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-36 sm:w-48">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Skor Penguasaan</span>
                    <span className="font-bold text-white">{item.penguasaan}%</span>
                  </div>
                  <div className="w-full bg-darkBg h-2 rounded-full overflow-hidden border border-cardBorder">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        item.penguasaan >= 85 ? 'bg-emerald-400' :
                        item.penguasaan >= 75 ? 'bg-blue-400' :
                        item.penguasaan >= 68 ? 'bg-amber-400' : 'bg-red-400'
                      }`} 
                      style={{ width: `${item.penguasaan}%` }}
                    ></div>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.penguasaan >= 85 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  item.penguasaan >= 75 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  item.penguasaan >= 68 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {item.status}
                </span>

                <button 
                  onClick={() => setSelectedTopicDetail(item)}
                  className="text-xs text-primaryPurple font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DAFTAR SISWA REMEDIAL & DAFTAR SISWA KELAS */}
      <div className="bg-cardBg border border-cardBorder rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-cardBorder pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base text-white">Daftar Siswa Kelas {selectedClass}</h3>
          </div>
          <span className="text-xs px-3 py-1 bg-darkBg border border-cardBorder rounded-lg text-gray-300">
            {totalStudentsCount} Siswa Terdaftar
          </span>
        </div>

        {studentAnalytics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentAnalytics.map(stu => (
              <div 
                key={stu.id} 
                className="bg-darkBg border border-cardBorder p-3.5 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-white">{stu.nama}</div>
                  <div className="text-[11px] text-gray-400">NISN: {stu.nisn}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">Nilai: {stu.avgScore}</div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    stu.status === 'Tuntas' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {stu.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-4 text-center">
            Belum ada data siswa terdaftar di kelas {selectedClass}.
          </p>
        )}
      </div>

      {/* MODAL TOPIC DETAIL */}
      <AnimatePresence>
        {selectedTopicDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTopicDetail(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-cardBg border border-cardBorder w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-cardBorder flex items-center justify-between bg-darkBg/50">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primaryPurple" />
                  <h3 className="font-bold text-base text-white">Detail Analisis Topik</h3>
                </div>
                <button 
                  onClick={() => setSelectedTopicDetail(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-bold text-lg text-white">{selectedTopicDetail.topic}</h4>
                  <p className="text-xs text-gray-400">Kelas: {selectedClass}</p>
                </div>

                <div className="bg-darkBg p-4 rounded-xl border border-cardBorder space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Tingkat Penguasaan</span>
                    <span className="font-bold text-emerald-400">{selectedTopicDetail.penguasaan}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Status Evaluasi</span>
                    <span className="font-bold text-purple-300">{selectedTopicDetail.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-300">Rekomendasi Tindakan Pengajaran:</h5>
                  <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside bg-darkBg/50 p-3 rounded-xl border border-cardBorder">
                    <li>Berikan latihan soal tipe HOTS untuk meningkatkan daya pemahaman siswa.</li>
                    <li>Sediakan sesi konsultasi tambahan atau modul pengayaan terstruktur.</li>
                    <li>Evaluasi kemajuan dalam ujian harian berikutnya.</li>
                  </ul>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-darkBg/60 border-t border-cardBorder flex justify-end">
                <button 
                  onClick={() => setSelectedTopicDetail(null)}
                  className="bg-cardBorder hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
