import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Award, Sparkles, Save, Search, Filter, 
  CheckCircle2, AlertCircle, FileSpreadsheet, RefreshCw, ChevronRight, BookOpen,
  Plus, Edit3, Trash2, X
} from 'lucide-react';
import { saveGradesSupabase } from '../lib/supabase';

export default function PenilaianView({ currentUser, students, classes, grades, setGrades, subjects, setSubjects }) {
  // Default fallback for subjects if not provided
  const availableSubjects = subjects && subjects.length > 0 
    ? subjects 
    : ['Matematika Peminatan', 'Matematika Wajib', 'Fisika Dasar'];

  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [selectedSubject, setSelectedSubject] = useState(availableSubjects[0] || 'Matematika Peminatan');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loadingAiId, setLoadingAiId] = useState(null);

  // Subject Management Modal States
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Sync selectedSubject if it was deleted or changed
  useEffect(() => {
    if (!availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0] || 'Matematika Peminatan');
    }
  }, [availableSubjects, selectedSubject]);

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
      const studentObj = students.find(s => s.id === studentId);
      const exists = prevGrades.some(g => g.studentId === studentId && (g.mapel === selectedSubject || !g.mapel));

      if (exists) {
        return prevGrades.map(g => {
          if (g.studentId === studentId && (g.mapel === selectedSubject || !g.mapel)) {
            const updatedG = { ...g, [field]: val, mapel: selectedSubject };
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
      } else {
        const base = {
          studentId,
          nama: studentObj?.nama || '',
          kelas: studentObj?.kelas || '',
          mapel: selectedSubject,
          tugas1: 80,
          tugas2: 80,
          uh: 80,
          uts: 80,
          uas: 80,
          [field]: val
        };
        const { finalScore, predikat, status } = calculateGradeDetails(
          base.tugas1,
          base.tugas2,
          base.uh,
          base.uts,
          base.uas
        );
        return [...prevGrades, { ...base, nilaiAkhir: finalScore, predikat, status }];
      }
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

      setGrades(prev => {
        const exists = prev.some(g => g.studentId === studentId);
        if (exists) {
          return prev.map(g => {
            if (g.studentId === studentId) {
              return { ...g, catatanAi: promptText };
            }
            return g;
          });
        } else {
          return [...prev, { ...currentGrade, studentId, catatanAi: promptText }];
        }
      });

      setLoadingAiId(null);
    }, 1000);
  };

  const handleSaveGrades = () => {
    saveGradesSupabase(currentUser?.username, grades);
    triggerToast(`Data Penilaian ${selectedSubject} Berhasil Disimpan ke Sistem!`);
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  // Subject Management Handlers
  const handleAddSubject = (e) => {
    e?.preventDefault();
    const nameClean = newSubjectInput.trim();
    if (!nameClean) return;

    if (availableSubjects.some(s => s.toLowerCase() === nameClean.toLowerCase())) {
      alert(`Mata Pelajaran "${nameClean}" sudah ada di dalam daftar!`);
      return;
    }

    if (setSubjects) {
      setSubjects([...availableSubjects, nameClean]);
    }
    setSelectedSubject(nameClean);
    setNewSubjectInput('');
    triggerToast(`Mata pelajaran "${nameClean}" berhasil ditambahkan!`);
  };

  const handleStartEdit = (index, currentName) => {
    setEditingIndex(index);
    setEditingText(currentName);
  };

  const handleSaveEdit = (index) => {
    const oldName = availableSubjects[index];
    const newNameClean = editingText.trim();

    if (!newNameClean) return;
    if (newNameClean.toLowerCase() !== oldName.toLowerCase() && 
        availableSubjects.some(s => s.toLowerCase() === newNameClean.toLowerCase())) {
      alert(`Mata Pelajaran "${newNameClean}" sudah ada!`);
      return;
    }

    // Update subjects array
    const updatedSubjects = [...availableSubjects];
    updatedSubjects[index] = newNameClean;
    if (setSubjects) {
      setSubjects(updatedSubjects);
    }

    // Update existing grades that used oldName
    setGrades(prev => prev.map(g => {
      if (g.mapel === oldName) {
        return { ...g, mapel: newNameClean };
      }
      return g;
    }));

    if (selectedSubject === oldName) {
      setSelectedSubject(newNameClean);
    }

    setEditingIndex(null);
    setEditingText('');
    triggerToast(`Mata pelajaran diperbarui menjadi "${newNameClean}"!`);
  };

  const handleDeleteSubject = (subjectToDelete) => {
    if (availableSubjects.length <= 1) {
      alert('Tidak dapat menghapus. Minimal harus ada 1 mata pelajaran.');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${subjectToDelete}"?`)) {
      const updated = availableSubjects.filter(s => s !== subjectToDelete);
      if (setSubjects) {
        setSubjects(updated);
      }
      if (selectedSubject === subjectToDelete) {
        setSelectedSubject(updated[0]);
      }
      triggerToast(`Mata pelajaran "${subjectToDelete}" telah dihapus.`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-gray-100 relative"
    >
      {/* SAVE / UPDATE TOAST */}
      <AnimatePresence>
        {saveToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-xs sm:text-sm border border-emerald-400/40"
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> {toastMessage || `Data Penilaian Berhasil Disimpan!`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER CONTROLS */}
      <div className="bg-cardBg border border-cardBorder p-4 sm:p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Mata Pelajaran</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-darkBg border border-cardBorder rounded-xl px-3 py-2">
                <BookOpen className="w-4 h-4 text-primaryPurple shrink-0" />
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
                >
                  {availableSubjects.map(sub => (
                    <option key={sub} value={sub} className="bg-cardBg">{sub}</option>
                  ))}
                </select>
              </div>

              {/* Tombol Kelola Mapel */}
              <button 
                type="button"
                onClick={() => setIsSubjectModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Tambah atau Edit Mata Pelajaran"
              >
                <Plus className="w-3.5 h-3.5" />
                <Edit3 className="w-3.5 h-3.5" />
                <span>Kelola Mapel</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Filter Kelas</label>
            <div className="flex items-center gap-2 bg-darkBg border border-cardBorder rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-accentBlue shrink-0" />
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
          className="bg-gradient-to-r from-primaryPurple to-accentBlue px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:opacity-90 transition cursor-pointer"
        >
          <Save className="w-4 h-4" /> Simpan Semua Nilai
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
              Mata Pelajaran: <span className="text-purple-300 font-bold">{selectedSubject}</span>
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
                            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
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

      {/* MODAL KELOLA MATA PELAJARAN */}
      <AnimatePresence>
        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubjectModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-cardBg border border-cardBorder w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-cardBorder flex items-center justify-between bg-darkBg/50">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-primaryPurple" />
                  <h3 className="font-bold text-base text-white">Kelola Daftar Mata Pelajaran</h3>
                </div>
                <button 
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-cardBorder transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Form Tambah Mapel */}
                <form onSubmit={handleAddSubject} className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-300">
                    Tambah Mata Pelajaran Baru
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newSubjectInput}
                      onChange={(e) => setNewSubjectInput(e.target.value)}
                      placeholder="Contoh: Kimia, Informatika, Biologi..."
                      className="flex-1 bg-darkBg border border-cardBorder rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primaryPurple"
                    />
                    <button 
                      type="submit"
                      disabled={!newSubjectInput.trim()}
                      className="bg-primaryPurple hover:bg-primaryPurple/90 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </form>

                {/* List Mapel Terdaftar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                    <span>Mata Pelajaran Terdaftar ({availableSubjects.length})</span>
                    <span>Aksi</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {availableSubjects.map((subName, index) => {
                      const isEditing = editingIndex === index;

                      return (
                        <div 
                          key={subName + index}
                          className="bg-darkBg border border-cardBorder rounded-xl p-3 flex items-center justify-between gap-3"
                        >
                          {isEditing ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input 
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-1 bg-cardBg border border-primaryPurple rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                                autoFocus
                              />
                              <button 
                                type="button"
                                onClick={() => handleSaveEdit(index)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                              >
                                Simpan
                              </button>
                              <button 
                                type="button"
                                onClick={() => setEditingIndex(null)}
                                className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="w-2 h-2 rounded-full bg-primaryPurple shrink-0"></span>
                                <span className="text-xs font-medium text-white truncate">{subName}</span>
                                {selectedSubject === subName && (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                                    Aktif
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button 
                                  type="button"
                                  onClick={() => handleStartEdit(index, subName)}
                                  className="p-1.5 text-gray-400 hover:text-purple-300 hover:bg-cardBorder rounded-lg transition cursor-pointer"
                                  title="Edit Nama Mapel"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteSubject(subName)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                                  title="Hapus Mapel"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-darkBg/60 border-t border-cardBorder flex justify-end">
                <button 
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="bg-cardBorder hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
