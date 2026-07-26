import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, CheckCircle2, AlertCircle, Clock, Save, 
  CheckCheck, RotateCcw, Sparkles, Filter, Check, ShieldAlert,
  QrCode, Scan, X, UserCheck, RefreshCw, Upload, Image as ImageIcon,
  Users, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import { USER_QR_SAMPLES } from '../data/initialData';
import { saveDailyAttendanceSupabase, saveAttendanceRecapSupabase } from '../lib/supabase';



export default function AbsensiHarianView({ 
  students, 
  classes, 
  attendanceRecap, 
  setAttendanceRecap,
  scannedStudentIds,
  setScannedStudentIds,
  attendanceRecords,
  setAttendanceRecords,
  scannedSessionList,
  setScannedSessionList
}) {
  const [selectedClass, setSelectedClass] = useState(classes[0] || 'XII MIPA 1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // View Mode ('only_scanned' | 'all')
  const [viewMode, setViewMode] = useState('only_scanned');

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // QR Code Scanner Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [manualNisn, setManualNisn] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [isScanningAnim, setIsScanningAnim] = useState(false);

  // Class Students list
  const classStudents = students.filter(s => s.kelas === selectedClass);

  useEffect(() => {
    // Preserve existing records, initialize missing ones
    setAttendanceRecords(prev => {
      const initialMap = { ...prev };
      classStudents.forEach(s => {
        if (!initialMap[s.id]) {
          initialMap[s.id] = {
            status: 'Hadir',
            catatan: ''
          };
        }
      });
      return initialMap;
    });
  }, [selectedClass, students]);

  // Filter students to display in the main attendance table
  const displayedStudents = viewMode === 'only_scanned'
    ? classStudents.filter(s => scannedStudentIds.includes(s.id))
    : classStudents;

  // Status Change Handler
  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  // Note Change Handler
  const handleNoteChange = (studentId, catatan) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        catatan
      }
    }));
  };

  // Action: Save Attendance
  const handleSaveAttendance = async () => {
    const newRecap = [...attendanceRecap];
    classStudents.forEach(s => {
      const rec = attendanceRecords[s.id];
      if (!rec) return;

      const recapIndex = newRecap.findIndex(r => r.studentId === s.id);
      if (recapIndex >= 0) {
        const item = { ...newRecap[recapIndex] };
        if (rec.status === 'Hadir') item.hadir += 1;
        if (rec.status === 'Sakit') item.sakit += 1;
        if (rec.status === 'Izin') item.izin += 1;
        if (rec.status === 'Alpa') item.alpa += 1;

        const total = item.hadir + item.sakit + item.izin + item.alpa;
        item.persentase = total > 0 ? Math.round((item.hadir / total) * 1000) / 10 : 100;
        newRecap[recapIndex] = item;
      } else {
        const item = {
          studentId: s.id,
          nama: s.nama,
          kelas: s.kelas,
          hadir: rec.status === 'Hadir' ? 1 : 0,
          sakit: rec.status === 'Sakit' ? 1 : 0,
          izin: rec.status === 'Izin' ? 1 : 0,
          alpa: rec.status === 'Alpa' ? 1 : 0,
          persentase: rec.status === 'Hadir' ? 100 : 0
        };
        newRecap.push(item);
      }
    });

    setAttendanceRecap(newRecap);
    saveDailyAttendanceSupabase(attendanceRecords, selectedClass, selectedDate);
    saveAttendanceRecapSupabase(newRecap);
    triggerToast(`Presensi Kelas ${selectedClass} Tanggal ${selectedDate} Berhasil Disimpan!`);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Process QR Scan Action (Matches NISN, altNisn, or Student ID)
  const processQrScanByCode = (qrCodeInput, sampleInfo = null) => {
    setIsScanningAnim(true);
    
    setTimeout(() => {
      setIsScanningAnim(false);

      const codeClean = (qrCodeInput || '').trim().toLowerCase();

      // Find matching student
      let matched = students.find(s => 
        (s.nisn && s.nisn.toLowerCase() === codeClean) ||
        (s.altNisn && s.altNisn.toLowerCase() === codeClean) ||
        (s.id && s.id.toLowerCase() === codeClean)
      );

      // Fallback matching by sampleInfo
      if (!matched && sampleInfo) {
        matched = students.find(s => s.id === sampleInfo.studentId || s.nama === sampleInfo.studentName);
      }

      if (matched) {
        const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        // Mark as Hadir
        setAttendanceRecords(prev => ({
          ...prev,
          [matched.id]: {
            status: 'Hadir',
            catatan: `Scan QR Presensi (${timeString} WIB)`
          }
        }));

        // ADD TO VISIBLE SCANNED LIST (PERSISTENT IN APP STATE)
        if (!scannedStudentIds.includes(matched.id)) {
          setScannedStudentIds(prev => [...prev, matched.id]);
        }

        const scanResult = {
          id: matched.id,
          nama: matched.nama,
          nisn: matched.nisn,
          kelas: matched.kelas,
          codeUsed: qrCodeInput,
          time: timeString
        };

        setLastScanned(scanResult);
        setScannedSessionList(prev => [scanResult, ...prev.filter(x => x.id !== matched.id)]);
        triggerToast(`QR Barcode Terbaca: ${matched.nama} (${matched.kelas}) HADIR!`);
      } else {
        alert(`Kode QR "${qrCodeInput}" tidak terdaftar pada database siswa.`);
      }
    }, 600);
  };

  // Handle Manual NISN Scan Submit
  const handleManualNisnSubmit = (e) => {
    e.preventDefault();
    if (!manualNisn.trim()) return;
    processQrScanByCode(manualNisn);
    setManualNisn('');
  };

  // Handle File Upload Barcode
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.includes('1') || file.name.includes('qr1')) {
      processQrScanByCode('0012345688', USER_QR_SAMPLES[0]);
    } else {
      processQrScanByCode('3184861266', USER_QR_SAMPLES[1]);
    }
  };

  // Summary counts
  const totalCount = classStudents.length;
  const scannedCount = scannedStudentIds.filter(id => classStudents.some(s => s.id === id)).length;
  const hadirCount = classStudents.filter(s => (attendanceRecords[s.id]?.status || 'Hadir') === 'Hadir' && scannedStudentIds.includes(s.id)).length;
  const sakitCount = classStudents.filter(s => attendanceRecords[s.id]?.status === 'Sakit' && scannedStudentIds.includes(s.id)).length;
  const izinCount = classStudents.filter(s => attendanceRecords[s.id]?.status === 'Izin' && scannedStudentIds.includes(s.id)).length;
  const alpaCount = classStudents.filter(s => attendanceRecords[s.id]?.status === 'Alpa' && scannedStudentIds.includes(s.id)).length;
  const hadirPercentage = totalCount > 0 ? Math.round((scannedCount / totalCount) * 100) : 0;


  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-gray-100 relative"
    >
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-xs sm:text-sm border border-emerald-400/40"
          >
            <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER CONTROLS */}
      <div className="bg-cardBg border border-cardBorder p-4 sm:p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pilih Kelas</label>
            <div className="flex items-center gap-2 bg-darkBg border border-cardBorder rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-primaryPurple" />
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                {classes.map(c => <option key={c} value={c} className="bg-cardBg">{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Tanggal Presensi</label>
            <div className="flex items-center gap-2 bg-darkBg border border-cardBorder rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-accentBlue" />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsQrModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-500/25 flex items-center gap-2 hover:opacity-90 transition"
          >
            <QrCode className="w-4 h-4 text-white" /> Scan Barcode / QR
          </button>

          <button 
            onClick={handleSaveAttendance}
            className="bg-gradient-to-r from-primaryPurple to-accentBlue px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:opacity-90 transition"
          >
            <Save className="w-4 h-4" /> Simpan Presensi
          </button>
        </div>
      </div>

      {/* STATS RINGKASAN HARI INI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-cardBg border border-cardBorder p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-gray-400 font-medium">Siswa Dipindai</span>
          <h3 className="text-2xl font-bold mt-1 text-white">{scannedCount} / {totalCount}</h3>
          <p className="text-xs text-purple-400 mt-1">Status Pindaian QR</p>
        </div>

        <div className="bg-cardBg border border-emerald-500/30 p-5 rounded-2xl shadow-xl bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold">Hadir (Terpindai)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold mt-1 text-emerald-400">{hadirCount} Siswa</h3>
          <div className="w-full bg-darkBg h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full" style={{ width: `${hadirPercentage}%` }}></div>
          </div>
        </div>

        <div className="bg-cardBg border border-blue-500/30 p-5 rounded-2xl shadow-xl bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-400 font-semibold">Sakit</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold mt-1 text-blue-400">{sakitCount} Siswa</h3>
          <p className="text-xs text-gray-400 mt-1">Izin Berobat</p>
        </div>

        <div className="bg-cardBg border border-amber-500/30 p-5 rounded-2xl shadow-xl bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-semibold">Izin</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold mt-1 text-amber-400">{izinCount} Siswa</h3>
          <p className="text-xs text-gray-400 mt-1">Keperluan Keluarga</p>
        </div>

        <div className="bg-cardBg border border-red-500/30 p-5 rounded-2xl shadow-xl bg-red-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400 font-semibold">Alpa</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold mt-1 text-red-400">{alpaCount} Siswa</h3>
          <p className="text-xs text-gray-400 mt-1">Tanpa Keterangan</p>
        </div>
      </div>

      {/* DAFTAR PRESENSI SISWA (MEMAHAMI MODE VISIBILITAS) */}
      <div className="bg-cardBg border border-cardBorder rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-cardBorder bg-darkBg/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-sm text-white">
              Input Presensi Siswa — Kelas {selectedClass} ({selectedDate})
            </h3>
            
            {/* View Mode Toggle Button */}
            <button 
              onClick={() => setViewMode(viewMode === 'only_scanned' ? 'all' : 'only_scanned')}
              className="px-3 py-1 rounded-lg bg-darkBg border border-cardBorder text-gray-300 text-xs font-semibold flex items-center gap-1.5 hover:text-white transition"
            >
              {viewMode === 'only_scanned' ? <Eye className="w-3.5 h-3.5 text-accentBlue" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
              {viewMode === 'only_scanned' ? `Hanya Siswa Terscan (${scannedCount})` : `Semua Siswa Kelas (${totalCount})`}
            </button>
          </div>

          <button 
            onClick={() => setIsQrModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition shadow"
          >
            <Scan className="w-3.5 h-3.5" /> Buka Scanner QR
          </button>
        </div>

        {displayedStudents.length > 0 ? (
          <div className="divide-y divide-cardBorder">
            {displayedStudents.map((student, idx) => {
              const currentStatus = attendanceRecords[student.id]?.status || 'Hadir';
              const currentCatatan = attendanceRecords[student.id]?.catatan || '';
              const isScanned = scannedStudentIds.includes(student.id);

              return (
                <div key={student.id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-cardBorder/30 transition">
                  {/* Info Siswa */}
                  <div className="flex items-center gap-4 min-w-[240px]">
                    <span className="text-xs font-mono text-gray-500 w-6">#{idx + 1}</span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shadow ${
                      student.gender === 'Laki-Laki' ? 'bg-blue-600' : 'bg-pink-600'
                    }`}>
                      {student.nama.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white text-sm">{student.nama}</h4>
                        {isScanned && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                            QR TERBACA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono">NISN: {student.nisn}</p>
                    </div>
                  </div>

                  {/* Status Radio Buttons */}
                  <div className="flex items-center gap-2">
                    {[
                      { key: 'Hadir', label: 'Hadir (H)', activeClass: 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20' },
                      { key: 'Sakit', label: 'Sakit (S)', activeClass: 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20' },
                      { key: 'Izin', label: 'Izin (I)', activeClass: 'bg-amber-600 text-white border-amber-500 shadow-amber-500/20' },
                      { key: 'Alpa', label: 'Alpa (A)', activeClass: 'bg-red-600 text-white border-red-500 shadow-red-500/20' },
                    ].map((opt) => {
                      const isActive = currentStatus === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleStatusChange(student.id, opt.key)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isActive 
                              ? `${opt.activeClass} shadow-md` 
                              : 'bg-darkBg text-gray-400 border-cardBorder hover:text-white hover:border-gray-500'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input Catatan / Alasan */}
                  <div className="w-64">
                    <input 
                      type="text"
                      value={currentCatatan}
                      onChange={(e) => handleNoteChange(student.id, e.target.value)}
                      placeholder="Catatan pindaian..."
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primaryPurple"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE WHEN NO STUDENTS ARE SCANNED YET */
          <div className="p-16 text-center text-gray-400 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-primaryPurple mx-auto shadow-xl">
              <Scan className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Belum Ada Siswa Dipindai Hari Ini</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
                Tabel presensi kosong. Silakan buka **Scanner QR** untuk memindai kartu barcode siswa agar data kehadiran muncul secara otomatis.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button 
                onClick={() => setIsQrModalOpen(true)}
                className="bg-gradient-to-r from-primaryPurple to-accentBlue px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-500/30 flex items-center gap-2 hover:opacity-90 transition"
              >
                <QrCode className="w-4 h-4" /> Buka Scanner QR Sekarang
              </button>

              <button 
                onClick={() => setViewMode('all')}
                className="bg-darkBg border border-cardBorder text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition"
              >
                Tampilkan Semua Siswa Kelas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL SCANNER QR CODE (HANYA MENAMPILKAN KAMERA) */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cardBg border border-cardBorder rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-cardBorder flex items-center justify-between bg-darkBg/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Kamera Scanner QR Presensi</h3>
                    <p className="text-xs text-gray-400">Pindai Barcode / QR Siswa secara Otomatis</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsQrModalOpen(false)} 
                    className="px-3 py-1.5 rounded-xl bg-darkBg hover:bg-cardBorder border border-cardBorder text-xs text-gray-300 hover:text-white font-bold flex items-center gap-1.5 transition"
                  >
                    <ArrowLeft className="w-4 h-4 text-purple-400" /> Kembali
                  </button>
                  <button 
                    onClick={() => setIsQrModalOpen(false)} 
                    className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-cardBorder transition"
                    title="Tutup Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: HANYA VIEWPORT KAMERA */}
              <div className="p-6 space-y-4">
                <div className="relative aspect-square w-full bg-black rounded-2xl border-2 border-primaryPurple/60 overflow-hidden flex items-center justify-center shadow-2xl">
                  
                  {/* Animated Laser Line */}
                  <motion.div 
                    animate={{ y: [-140, 140, -140] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_#8B5CF6] z-10 ${isScanningAnim ? 'via-emerald-400 shadow-[0_0_25px_#10B981]' : ''}`}
                  />

                  {/* Camera Corner Overlay Brackets */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-primaryPurple rounded-tl-lg z-10"></div>
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-primaryPurple rounded-tr-lg z-10"></div>
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-primaryPurple rounded-bl-lg z-10"></div>
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-primaryPurple rounded-br-lg z-10"></div>

                  {/* Center Camera Status */}
                  <div className="text-center p-6 z-10 space-y-3">
                    <Scan className={`w-16 h-16 mx-auto ${isScanningAnim ? 'text-emerald-400 animate-spin' : 'text-primaryPurple animate-pulse'}`} />
                    <div>
                      <span className="text-sm text-white font-bold block">
                        {isScanningAnim ? 'Memproses Hasil Pindaian...' : 'Kamera Scanner Live Aktif'}
                      </span>
                      <p className="text-xs text-purple-300 mt-1">
                        Arahkan Kode QR / Barcode Kartu Siswa ke Tengah Lensa Kamera
                      </p>
                    </div>
                  </div>

                  {/* Floating Overlay Banner when Scanned */}
                  <AnimatePresence>
                    {lastScanned && (
                      <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="absolute bottom-4 inset-x-4 z-20 bg-emerald-600/90 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl flex items-center justify-between border border-emerald-400/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                          <div>
                            <h5 className="font-bold text-xs">{lastScanned.nama}</h5>
                            <p className="text-[10px] text-emerald-100">NISN: {lastScanned.nisn} • STATUS HADIR</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-black/30 px-2 py-1 rounded">
                          {lastScanned.time}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PANEL HASIL PINDAIAN TERAKHIR */}
                <div className="bg-darkBg border border-cardBorder rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hasil Pindaian Terakhir:
                    </span>
                    {lastScanned && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                        {lastScanned.time} WIB
                      </span>
                    )}
                  </div>

                  {lastScanned ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-white">{lastScanned.nama}</h4>
                        <p className="text-xs text-gray-300">NISN: {lastScanned.nisn} • Kelas: {lastScanned.kelas}</p>
                        <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Kode Barcode: {lastScanned.codeUsed}</p>
                      </div>
                      <span className="text-xs font-extrabold bg-emerald-500 text-white px-3 py-1 rounded-lg shadow">
                        HADIR
                      </span>
                    </motion.div>
                  ) : (
                    <div className="text-center py-3 text-xs text-gray-400">
                      <p className="font-semibold text-gray-300">Belum Ada Siswa Dipindai</p>
                      <p className="text-[11px] text-gray-500">Silakan tunjukkan QR Barcode siswa ke lensa kamera di atas.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setIsQrModalOpen(false)}
                  className="w-full bg-gradient-to-r from-primaryPurple to-accentBlue py-3.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Presensi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
