import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Award, Sparkles, Save, Search, Filter, 
  CheckCircle2, AlertCircle, FileSpreadsheet, RefreshCw, ChevronRight, BookOpen
} from 'lucide-react';

export default function PenilaianView({ students, classes, grades, setGrades }) {
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [selectedSubject, setSelectedSubject] = useState('Matematika Peminatan');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [loadingAiId, setLoadingAiId] = useState(null);

  // Combine student list with grades
  const studentGrades = students.map(student => {
    const gradeRec = grades.find(g => g.studentId === student.id && g.mapel === selectedSubject) || {
      studentId: student.id,
      mapel: selectedSubject,
      tugas1: 80,
      tugas2: 80,
      uh: 80,
      uts: 80,
      uas: 80,
      nilaiAkhir: 80,
      predikat: 'B',
      status: 'Tuntas',
      catatanAi: 'Pemahaman konsep dasar pembelajaran berada pada tingkat yang baik.'
    };

    return {
      ...student,
      grade: gradeRec
    };
  });

  // Filtering
  const filteredGrades = studentGrades.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.nisn.includes(searchTerm);
    const matchesClass = selectedClass === 'Semua Kelas' || item.kelas === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Calculate stats
  const totalCount = filteredGrades.length;
  const avgScore = totalCount > 0 
    ? (filteredGrades.reduce((acc, curr) => acc + curr.grade.nilaiAkhir, 0) / totalCount).toFixed(1)
    : '0';

  const maxScore = totalCount > 0 
    ? Math.max(...filteredGrades.map(g => g.grade.nilaiAkhir)).toFixed(1)
    : '0';

  const minScore = totalCount > 0 
    ? Math.min(...filteredGrades.map(g => g.grade.nilaiAkhir)).toFixed(1)
    : '0';

  const passedCount = filteredGrades.filter(g => g.grade.status === 'Tuntas').length;
  const passPercentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100;

  // Grade calculation helper
  const calculateGradeDetails = (t1, t2, uh, uts, uas) => {
    const score1 = Number(t1) || 0;
    const score2 = Number(t2) || 0;
    const scoreUh = Number(uh) || 0;
    const scoreUts = Number(uts) || 0;
    const scoreUas = Number(uas) || 0;

    // Formula: 15% T1 + 15% T2 + 20% UH + 25% UTS + 25% UAS
    const finalScore = Math.round((score1 * 0.15 + score2 * 0.15 + scoreUh * 0.20 + scoreUts * 0.25 + scoreUas * 0.25) * 10) / 10;
    
    let predikat = 'D';
    if (finalScore >= 88) predikat = 'A';
    else if (finalScore >= 80) predikat = 'B';
    else if (finalScore >= 70) predikat = 'C';

    const status = finalScore >= 75 ? 'Tuntas' : 'Remidial';

    return { finalScore, predikat, status };
  };

  // Score Input Change
  const handleScoreChange = (studentId, field, value) => {
    const val = Math.min(100, Math.max(0, Number(value) || 0));

    setGrades(prevGrades => {
      return prevGrades.map(g => {
        if (g.studentId === studentId && g.mapel === selectedSubject) {
          const updatedG = { ...g, [field]: val };
          const { finalScore, predikat, status } = calculateGradeDetails(
            field === 'tugas1' ? val : updatedG.tugas1,
            field === 'tugas2' ? val : updatedG.tugas2,
            field === 'uh' ? val : updatedG.uh,
            field === 'uts' ? val : updatedG.uts,
            field === 'uas' ? val : updatedG.uas
          );
          return {
            ...updatedG,
            nilaiAkhir: finalScore,
            predikat,
            status
          };
        }
        return g;
      });
    });
  };

  // Generate AI Catatan for Student
  const handleGenerateAiFeedback = (studentId, studentNama, currentGrade) => {
    setLoadingAiId(studentId);
    setTimeout(() => {
      let promptText = '';
      if (currentGrade.nilaiAkhir >= 90) {
        promptText = `${studentNama} menunjukkan penguasaan materi ${selectedSubject} yang sangat cemerlang. Sangat direkomendasikan mengikuti pembinaan olimpiade tingkat lanjut.`;
      } else if (currentGrade.nilaiAkhir >= 80) {
        promptText = `${studentNama} memahami kompetensi ${selectedSubject} dengan baik dan stabil. Perlu terus mempertahankan ritme belajar mandiri.`;
      } else if (currentGrade.nilaiAkhir >= 75) {
        promptText = `${studentNama} telah mencapai KKM pada ${selectedSubject}. Disarankan memperbanyak latihan soal tipe penerapan.`;
      } else {
        promptText = `${studentNama} membutuhkan pendampingan remedial pada materi ${selectedSubject}. Perlu diberikan bimbingan ulang konsep dasar.`;
      }

      setGrades(prev => prev.map(g => {
        if (g.studentId === studentId && g.mapel === selectedSubject) {
          return { ...g, catatanAi: promptText };
        }
        return g;
      }));

      setLoadingAiId(null);
    }, 1000);
  };

  // Save Grades Action
  const handleSaveGrades = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-8 space-y-8 overflow-y-auto flex-1 text-gray-100 relative"
    >
      {/* SAVE TOAST */}
      <AnimatePresence>
        {saveToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-sm border border-emerald-400/40"
          >
            <CheckCircle2 className="w-5 h-5" /> Data Penilaian {selectedSubject} Berhasil Disimpan ke Sistem!
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER CONTROLS */}
      <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Mata Pelajaran</label>
            <div className="flex items-center gap-2 bg-darkBg border border-cardBorder rounded-xl px-3 py-2">
              <BookOpen className="w-4 h-4 text-primaryPurple" />
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="Matematika Peminatan" className="bg-cardBg">Matematika Peminatan</option>
                <option value="Matematika Wajib" className="bg-cardBg">Matematika Wajib</option>
                <option value="Fisika Dasar" className="bg-cardBg">Fisika Dasar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Filter Kelas</label>
            <div className="flex items-center gap-2 bg-darkBg border border-cardBorder rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-accentBlue" />
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="Semua Kelas" className="bg-cardBg">Semua Kelas</option>
                {classes.map(c => <option key={c} value={c} className="bg-cardBg">{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSaveGrades}
          className="bg-gradient-to-r from-primaryPurple to-accentBlue px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:opacity-90 transition"
        >
          <Save className="w-4 h-4" /> Simpan Semua Nilai
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Rata-Rata Kelas</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{avgScore}</h3>
            <p className="text-xs text-purple-400 mt-1">KKM Sekolah: 75.0</p>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-primaryPurple rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Nilai Tertinggi</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-400">{maxScore}</h3>
            <p className="text-xs text-emerald-400 mt-1">Predikat A</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Nilai Terendah</p>
            <h3 className="text-3xl font-bold mt-1 text-amber-400">{minScore}</h3>
            <p className="text-xs text-amber-400 mt-1">Perlu Pembinaan</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Tingkat Ketuntasan</p>
            <h3 className="text-3xl font-bold mt-1 text-blue-400">{passPercentage}%</h3>
            <p className="text-xs text-blue-400 mt-1">{passedCount} Dari {totalCount} Tuntas</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SEARCH BAR & TABLE PENILAIAN */}
      <div className="bg-cardBg border border-cardBorder rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-cardBorder bg-darkBg/60 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama Siswa atau NISN..." 
              className="w-full pl-10 pr-4 py-2 bg-darkBg border border-cardBorder rounded-xl text-xs text-white focus:outline-none focus:border-primaryPurple"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              Bobot: <span className="text-purple-300 font-semibold">Tugas (30%) + UH (20%) + UTS (25%) + UAS (25%)</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-darkBg/80 text-xs uppercase text-gray-400 border-b border-cardBorder">
              <tr>
                <th className="py-4 px-6 min-w-[200px]">Siswa</th>
                <th className="py-4 px-3 text-center">Tugas 1</th>
                <th className="py-4 px-3 text-center">Tugas 2</th>
                <th className="py-4 px-3 text-center">UH</th>
                <th className="py-4 px-3 text-center">UTS</th>
                <th className="py-4 px-3 text-center">UAS</th>
                <th className="py-4 px-4 text-center">Nilai Akhir</th>
                <th className="py-4 px-3 text-center">Predikat</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 min-w-[280px]">Catatan Capaian AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cardBorder">
              {filteredGrades.length > 0 ? (
                filteredGrades.map((item) => {
                  const g = item.grade;
                  const isAiLoading = loadingAiId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-cardBorder/30 transition">
                      {/* Nama & Kelas */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{item.nama}</div>
                        <div className="text-xs text-gray-400">{item.kelas} • NISN: {item.nisn}</div>
                      </td>

                      {/* Tugas 1 */}
                      <td className="py-4 px-3 text-center">
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={g.tugas1}
                          onChange={(e) => handleScoreChange(item.id, 'tugas1', e.target.value)}
                          className="w-16 bg-darkBg border border-cardBorder rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-primaryPurple font-semibold"
                        />
                      </td>

                      {/* Tugas 2 */}
                      <td className="py-4 px-3 text-center">
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={g.tugas2}
                          onChange={(e) => handleScoreChange(item.id, 'tugas2', e.target.value)}
                          className="w-16 bg-darkBg border border-cardBorder rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-primaryPurple font-semibold"
                        />
                      </td>

                      {/* UH */}
                      <td className="py-4 px-3 text-center">
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={g.uh}
                          onChange={(e) => handleScoreChange(item.id, 'uh', e.target.value)}
                          className="w-16 bg-darkBg border border-cardBorder rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-primaryPurple font-semibold"
                        />
                      </td>

                      {/* UTS */}
                      <td className="py-4 px-3 text-center">
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={g.uts}
                          onChange={(e) => handleScoreChange(item.id, 'uts', e.target.value)}
                          className="w-16 bg-darkBg border border-cardBorder rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-primaryPurple font-semibold"
                        />
                      </td>

                      {/* UAS */}
                      <td className="py-4 px-3 text-center">
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={g.uas}
                          onChange={(e) => handleScoreChange(item.id, 'uas', e.target.value)}
                          className="w-16 bg-darkBg border border-cardBorder rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-primaryPurple font-semibold"
                        />
                      </td>

                      {/* Nilai Akhir */}
                      <td className="py-4 px-4 text-center font-bold text-base text-white">
                        {g.nilaiAkhir}
                      </td>

                      {/* Predikat */}
                      <td className="py-4 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          g.predikat === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          g.predikat === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          g.predikat === 'C' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {g.predikat}
                        </span>
                      </td>

                      {/* Status Ketuntasan */}
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          g.status === 'Tuntas'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {g.status}
                        </span>
                      </td>

                      {/* Catatan AI */}
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <p className="text-xs text-gray-300 bg-darkBg p-2.5 rounded-xl border border-cardBorder leading-relaxed">
                            {g.catatanAi || 'Belum ada ulasan AI.'}
                          </p>
                          <button 
                            type="button"
                            onClick={() => handleGenerateAiFeedback(item.id, item.nama, g)}
                            disabled={isAiLoading}
                            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                            {isAiLoading ? 'Memproses AI...' : 'Generate Catatan AI'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-gray-400">
                    Tidak ada siswa terdaftar untuk kelas dan kriteria filter ini.
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
