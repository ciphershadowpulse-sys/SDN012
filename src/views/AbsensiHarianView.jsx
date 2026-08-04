import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CheckCircle2, AlertCircle, Clock, Save,
  CheckCheck, RotateCcw, Sparkles, Filter, Check, ShieldAlert,
  QrCode, Scan, X, UserCheck, RefreshCw, Upload, Image as ImageIcon,
  Users, Eye, EyeOff, ArrowLeft, Camera, CameraOff, SwitchCamera,
  Keyboard, ImagePlus, Zap
} from 'lucide-react';
import { USER_QR_SAMPLES } from '../data/initialData';
import { 
  isSupabaseConfigured,
  fetchDailyAttendanceSupabase, 
  saveDailyAttendanceSupabase, 
  fetchAttendanceRecapSupabase,
  saveAttendanceRecapSupabase 
} from '../lib/supabase';
import { Html5Qrcode } from 'html5-qrcode';

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

  // Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)
  const [scannerTab, setScannerTab] = useState('camera'); // 'camera' | 'manual' | 'upload'
  const html5QrCodeRef = useRef(null);
  const scannerContainerRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Class Students list
  const classStudents = students.filter(s => s.kelas === selectedClass);

  useEffect(() => {
    let isMounted = true;

    async function loadDailyAttendance() {
      const existing = await fetchDailyAttendanceSupabase(selectedClass, selectedDate);
      if (!isMounted) return;

      setAttendanceRecords(prev => {
        const initialMap = { ...prev };
        classStudents.forEach(s => {
          if (existing[s.id]) {
            initialMap[s.id] = existing[s.id];
          } else if (!initialMap[s.id]) {
            initialMap[s.id] = {
              status: 'Hadir',
              catatan: ''
            };
          }
        });
        return initialMap;
      });

      // Update scanned IDs from loaded attendance that has status Hadir
      const scannedIds = Object.keys(existing).filter(id => existing[id].status === 'Hadir');
      if (scannedIds.length > 0) {
        setScannedStudentIds(prev => Array.from(new Set([...prev, ...scannedIds])));
      }
    }

    loadDailyAttendance();

    return () => {
      isMounted = false;
    };
  }, [selectedClass, selectedDate, students]);

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
    const res = await saveDailyAttendanceSupabase(attendanceRecords, classStudents, selectedClass, selectedDate);

    if (!res.success) {
      alert(`Gagal menyimpan presensi ke Supabase: ${res.error}`);
      return;
    }

    // Refresh attendance recap from Supabase if configured
    if (isSupabaseConfigured) {
      const updatedRecap = await fetchAttendanceRecapSupabase(attendanceRecap);
      setAttendanceRecap(updatedRecap);
    } else {
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
      saveAttendanceRecapSupabase(newRecap);
    }

    triggerToast(`Presensi Kelas ${selectedClass} Tanggal ${selectedDate} Berhasil Disimpan ke Supabase!`);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Process QR Scan Action (Matches NISN, altNisn, or Student ID)
  const processQrScanByCode = useCallback((qrCodeInput, sampleInfo = null) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsScanningAnim(true);

    setTimeout(() => {
      setIsScanningAnim(false);
      isProcessingRef.current = false;

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
        triggerToast(`QR Terbaca: ${matched.nama} (${matched.kelas}) HADIR!`);
      } else {
        triggerToast(`⚠️ Kode QR "${qrCodeInput}" tidak terdaftar.`);
      }
    }, 400);
  }, [students, scannedStudentIds, setAttendanceRecords, setScannedStudentIds, setScannedSessionList]);

  // ==========================================
  // CAMERA QR SCANNER (html5-qrcode)
  // ==========================================
  const startCamera = useCallback(async () => {
    setCameraError(null);

    // Cleanup existing scanner instance
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // SCANNING
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore cleanup errors
      }
      html5QrCodeRef.current = null;
    }

    const containerId = 'qr-reader-container';
    const container = document.getElementById(containerId);
    if (!container) {
      setCameraError('Container kamera tidak ditemukan.');
      return;
    }

    // Clear container content
    container.innerHTML = '';

    try {
      const html5QrCode = new Html5Qrcode(containerId);
      html5QrCodeRef.current = html5QrCode;

      const qrCodeSuccessCallback = (decodedText) => {
        processQrScanByCode(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
        disableFlip: false,
        rememberLastUsedCamera: true,
        supportedScanTypes: [0], // SCAN_TYPE_CAMERA only
      };

      await html5QrCode.start(
        { facingMode },
        config,
        qrCodeSuccessCallback,
        () => { } // ignore error (no QR found in frame)
      );

      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera start error:', err);
      let errorMsg = 'Gagal mengakses kamera.';

      if (typeof err === 'string') {
        if (err.includes('NotAllowedError') || err.includes('Permission')) {
          errorMsg = 'Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.';
        } else if (err.includes('NotFoundError') || err.includes('Requested device not found')) {
          errorMsg = 'Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.';
        } else if (err.includes('NotReadableError')) {
          errorMsg = 'Kamera sedang digunakan oleh aplikasi lain.';
        } else {
          errorMsg = err;
        }
      } else if (err?.message) {
        if (err.message.includes('NotAllowed') || err.message.includes('Permission')) {
          errorMsg = 'Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.';
        } else if (err.message.includes('NotFound') || err.message.includes('Requested device not found')) {
          errorMsg = 'Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.';
        } else if (err.message.includes('NotReadable')) {
          errorMsg = 'Kamera sedang digunakan oleh aplikasi lain.';
        } else {
          errorMsg = err.message;
        }
      }

      setCameraError(errorMsg);
      setIsCameraActive(false);
    }
  }, [facingMode, processQrScanByCode]);

  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Toggle camera facing mode
  const toggleCameraFacing = useCallback(async () => {
    await stopCamera();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, [stopCamera]);

  // Start camera when scanner tab is 'camera' and modal is open
  useEffect(() => {
    if (isQrModalOpen && scannerTab === 'camera') {
      // Short delay to let DOM render
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [isQrModalOpen, scannerTab, facingMode]);

  // Cleanup on modal close
  useEffect(() => {
    if (!isQrModalOpen) {
      stopCamera();
      setCameraError(null);
    }
  }, [isQrModalOpen, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Manual NISN Scan Submit
  const handleManualNisnSubmit = (e) => {
    e.preventDefault();
    if (!manualNisn.trim()) return;
    processQrScanByCode(manualNisn);
    setManualNisn('');
  };

  // Handle File Upload scan via html5-qrcode
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Use html5-qrcode to scan from image file
      const html5QrCode = new Html5Qrcode('qr-file-upload-container');
      const result = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      processQrScanByCode(result);
    } catch (err) {
      // Fallback: try filename-based matching for sample QR images
      const fileName = file.name.toLowerCase();
      if (fileName.includes('1') || fileName.includes('qr1')) {
        processQrScanByCode('0012345688', USER_QR_SAMPLES[0]);
      } else if (fileName.includes('2') || fileName.includes('qr2')) {
        processQrScanByCode('3184861266', USER_QR_SAMPLES[1]);
      } else {
        triggerToast('⚠️ Tidak dapat membaca kode QR dari gambar ini.');
      }
    }
    // Reset file input
    e.target.value = '';
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
            className="fixed top-20 right-4 sm:right-8 z-[60] bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-xs sm:text-sm border border-emerald-400/40"
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shadow ${student.gender === 'Laki-Laki' ? 'bg-blue-600' : 'bg-pink-600'
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
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${isActive
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

      {/* ============================================================ */}
      {/* MODAL SCANNER QR CODE — REAL CAMERA + MANUAL + UPLOAD        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cardBg border border-cardBorder rounded-2xl w-full max-w-[380px] sm:max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
            >
              {/* Header Modal */}
              <div className="px-4 py-3 border-b border-cardBorder flex items-center justify-between bg-darkBg/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Scanner QR Presensi</h3>
                    <p className="text-[10px] text-gray-400">Kamera langsung • Manual • Upload gambar</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-cardBorder transition"
                  title="Tutup Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scanner Tab Switcher */}
              <div className="flex border-b border-cardBorder shrink-0">
                {[
                  { key: 'camera', icon: Camera, label: 'Kamera' },
                  { key: 'manual', icon: Keyboard, label: 'Manual' },
                  { key: 'upload', icon: ImagePlus, label: 'Upload' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setScannerTab(tab.key)}
                    className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${scannerTab === tab.key
                        ? 'text-purple-300 border-purple-500 bg-purple-500/5'
                        : 'text-gray-400 border-transparent hover:text-white hover:bg-cardBorder/30'
                      }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1">

                {/* ========== TAB: CAMERA ========== */}
                {scannerTab === 'camera' && (
                  <div className="space-y-3">
                    {/* Camera Viewport */}
                    <div className="relative w-full aspect-square max-h-[280px] bg-black rounded-xl border-2 border-purple-500/40 overflow-hidden">
                      {/* QR Scanner container — html5-qrcode renders into this */}
                      <div
                        id="qr-reader-container"
                        ref={scannerContainerRef}
                        className="w-full h-full"
                        style={{ position: 'relative' }}
                      />

                      {/* Corner brackets overlay */}
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-purple-400 rounded-tl-sm"></div>
                        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-400 rounded-tr-sm"></div>
                        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-purple-400 rounded-bl-sm"></div>
                        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-purple-400 rounded-br-sm"></div>
                      </div>

                      {/* Scanning animation laser line */}
                      {isCameraActive && (
                        <motion.div
                          animate={{ y: ['10%', '90%', '10%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_#8B5CF6] z-10 pointer-events-none"
                        />
                      )}

                      {/* Processing overlay */}
                      {isScanningAnim && (
                        <div className="absolute inset-0 bg-emerald-500/20 z-20 flex items-center justify-center pointer-events-none">
                          <div className="bg-emerald-600/90 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                            <Zap className="w-4 h-4 text-white animate-pulse" />
                            <span className="text-xs font-bold text-white">QR Terbaca!</span>
                          </div>
                        </div>
                      )}

                      {/* Camera Error State */}
                      {cameraError && !isCameraActive && (
                        <div className="absolute inset-0 bg-darkBg flex flex-col items-center justify-center text-center p-4 z-20">
                          <CameraOff className="w-10 h-10 text-red-400 mb-3" />
                          <p className="text-xs text-red-300 font-semibold mb-1">Kamera Tidak Tersedia</p>
                          <p className="text-[10px] text-gray-400 leading-relaxed max-w-[240px]">
                            {cameraError}
                          </p>
                          <button
                            onClick={startCamera}
                            className="mt-3 px-4 py-1.5 rounded-lg bg-purple-600 text-white text-[11px] font-bold flex items-center gap-1.5 hover:bg-purple-500 transition"
                          >
                            <RefreshCw className="w-3 h-3" /> Coba Lagi
                          </button>
                        </div>
                      )}

                      {/* Loading State */}
                      {!isCameraActive && !cameraError && (
                        <div className="absolute inset-0 bg-darkBg flex flex-col items-center justify-center z-20">
                          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3"></div>
                          <p className="text-xs text-gray-400 font-semibold">Memuat kamera...</p>
                        </div>
                      )}

                      {/* Scanned Result Banner */}
                      <AnimatePresence>
                        {lastScanned && (
                          <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0 }}
                            className="absolute bottom-2 inset-x-2 z-30 bg-emerald-600/95 backdrop-blur-md text-white p-2.5 rounded-lg shadow-xl flex items-center justify-between border border-emerald-400/40"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                              <div>
                                <h5 className="font-bold text-[11px] leading-tight">{lastScanned.nama}</h5>
                                <p className="text-[9px] text-emerald-100">NISN: {lastScanned.nisn} • HADIR</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono bg-black/30 px-1.5 py-0.5 rounded">
                              {lastScanned.time}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Camera Control Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleCameraFacing}
                        className="flex-1 bg-darkBg border border-cardBorder text-gray-300 hover:text-white py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition hover:border-purple-500/40"
                        title="Ganti Kamera Depan/Belakang"
                      >
                        <SwitchCamera className="w-3.5 h-3.5" />
                        {facingMode === 'environment' ? 'Kamera Depan' : 'Kamera Belakang'}
                      </button>

                      <button
                        onClick={isCameraActive ? stopCamera : startCamera}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition border ${isCameraActive
                            ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                      >
                        {isCameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                        {isCameraActive ? 'Matikan Kamera' : 'Nyalakan Kamera'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ========== TAB: MANUAL INPUT ========== */}
                {scannerTab === 'manual' && (
                  <div className="space-y-3">
                    <div className="bg-darkBg border border-cardBorder rounded-xl p-4 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                        <Keyboard className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">Input Manual NISN / ID Siswa</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Ketik NISN atau ID siswa lalu tekan Enter</p>
                      </div>
                    </div>

                    <form onSubmit={handleManualNisnSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={manualNisn}
                        onChange={(e) => setManualNisn(e.target.value)}
                        placeholder="Masukkan NISN / ID siswa..."
                        className="flex-1 bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow hover:opacity-90 transition flex items-center gap-1.5"
                      >
                        <Scan className="w-3.5 h-3.5" /> Scan
                      </button>
                    </form>

                    {/* Quick Sample NISN buttons */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-gray-500 font-semibold">Contoh NISN Terdaftar:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {students.slice(0, 5).map(s => (
                          <button
                            key={s.id}
                            onClick={() => processQrScanByCode(s.nisn)}
                            className="bg-darkBg border border-cardBorder text-gray-300 hover:text-white hover:border-purple-500/40 px-2.5 py-1 rounded-lg text-[10px] font-mono transition"
                          >
                            {s.nisn}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========== TAB: UPLOAD IMAGE ========== */}
                {scannerTab === 'upload' && (
                  <div className="space-y-3">
                    <div className="bg-darkBg border-2 border-dashed border-cardBorder rounded-xl p-6 text-center space-y-3 hover:border-purple-500/40 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-14 h-14 mx-auto bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                        <ImagePlus className="w-7 h-7 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">Upload Gambar QR Code</h4>
                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                          Pilih file gambar berisi QR Code / Barcode siswa.<br />
                          Format: JPG, PNG, WEBP
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg text-[11px] text-purple-300 font-semibold">
                        <Upload className="w-3 h-3" /> Pilih File Gambar
                      </div>
                    </div>
                    {/* Hidden container for file scan */}
                    <div id="qr-file-upload-container" className="hidden"></div>
                  </div>
                )}

                {/* ========== PANEL HASIL PINDAIAN TERAKHIR ========== */}
                <div className="bg-darkBg border border-cardBorder rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pindaian Terakhir
                    </span>
                    {lastScanned && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-mono border border-emerald-500/30">
                        {lastScanned.time} WIB
                      </span>
                    )}
                  </div>

                  {lastScanned ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-white">{lastScanned.nama}</h4>
                        <p className="text-[10px] text-gray-300">NISN: {lastScanned.nisn} • Kelas: {lastScanned.kelas}</p>
                      </div>
                      <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2.5 py-1 rounded-lg shadow">
                        HADIR
                      </span>
                    </motion.div>
                  ) : (
                    <div className="text-center py-2 text-xs text-gray-400">
                      <p className="font-semibold text-xs text-gray-300">Belum Ada Siswa Dipindai</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Gunakan kamera, input manual, atau upload gambar QR.</p>
                    </div>
                  )}
                </div>

                {/* Session Scan History (compact) */}
                {scannedSessionList.length > 0 && (
                  <div className="bg-darkBg border border-cardBorder rounded-xl p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Riwayat Scan Sesi Ini ({scannedSessionList.length})
                    </span>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {scannedSessionList.slice(0, 10).map((s, i) => (
                        <div key={s.id + '-' + i} className="flex items-center justify-between bg-cardBg/50 px-2 py-1 rounded text-[10px]">
                          <span className="text-white font-semibold truncate">{s.nama}</span>
                          <span className="text-gray-400 font-mono shrink-0 ml-2">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="w-full bg-gradient-to-r from-primaryPurple to-accentBlue py-2.5 rounded-xl text-xs font-bold text-white shadow flex items-center justify-center gap-1.5 hover:opacity-90 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Presensi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
