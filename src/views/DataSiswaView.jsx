import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Search, Filter, Edit, Trash2, Eye, 
  X, Check, UserCheck, Phone, Mail, MapPin, FileText, AlertCircle,
  Download, Upload, FileSpreadsheet, CheckCircle2, Sparkles
} from 'lucide-react';
import { saveStudentSupabase, deleteStudentSupabase } from '../lib/supabase';


export default function DataSiswaView({ students, setStudents, classes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [selectedGender, setSelectedGender] = useState('Semua Gender');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  
  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);

  // Toast State
  const [toastMsg, setToastMsg] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    nisn: '',
    nama: '',
    kelas: classes[0] || 'XII MIPA 1',
    gender: 'Laki-Laki',
    status: 'Aktif',
    email: '',
    phoneOrtu: '',
    namaOrtu: '',
    alamat: '',
    catatan: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Open modal for Add
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      nisn: `005${Math.floor(1000000 + Math.random() * 9000000)}`,
      nama: '',
      kelas: classes[0] || 'XII MIPA 1',
      gender: 'Laki-Laki',
      status: 'Aktif',
      email: '',
      phoneOrtu: '',
      namaOrtu: '',
      alamat: '',
      catatan: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsModalOpen(true);
  };

  // Save student (Add / Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.nisn.trim()) {
      alert('Mohon isi Nama Lengkap dan NISN siswa.');
      return;
    }

    if (editingStudent) {
      const updated = { ...formData, id: editingStudent.id };
      saveStudentSupabase(updated);
      setStudents(students.map(s => s.id === editingStudent.id ? updated : s));
      showToast(`Data siswa "${formData.nama}" berhasil diperbarui!`);
    } else {
      const newStudent = {
        ...formData,
        id: `STU-${String(students.length + 1).padStart(3, '0')}`
      };
      saveStudentSupabase(newStudent);
      setStudents([...students, newStudent]);
      showToast(`Siswa baru "${formData.nama}" berhasil ditambahkan!`);
    }
    setIsModalOpen(false);
  };

  // Delete student
  const handleDelete = (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data siswa "${nama}"?`)) {
      deleteStudentSupabase(id);
      setStudents(students.filter(s => s.id !== id));
      if (detailStudent && detailStudent.id === id) {
        setDetailStudent(null);
      }
      showToast(`Data siswa "${nama}" telah dihapus.`);
    }
  };

  // Action: Download Template CSV
  const handleDownloadTemplate = () => {
    const csvHeader = 'nisn,nama,kelas,gender,email,namaOrtu,phoneOrtu,alamat,catatan\n';
    const sampleRow1 = '0059998801,Kania Salsabila,XII MIPA 1,Perempuan,kania@siswa.belajar.id,Bpk. Setyawan,081299887701,Jl. Melati No. 10,Siswa rajin dan berprestasi\n';
    const sampleRow2 = '0059998802,Muhammad Arifin,XII MIPA 1,Laki-Laki,arifin@siswa.belajar.id,Ibu Suhartini,081299887702,Jl. Mawar No. 15,Aktif kegiatan ekskul olahraga\n';
    
    const blob = new Blob([csvHeader + sampleRow1 + sampleRow2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Data_Siswa_GuruAIPro.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Template Data Siswa (CSV) Berhasil Diunduh!');
  };

  // Parse CSV text for Import Modal Preview
  const handleParseCsv = (text) => {
    setImportCsvText(text);
    const lines = text.trim().split('\n');
    if (lines.length <= 1) {
      setParsedPreview([]);
      return;
    }

    const rows = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',');
      if (cols.length >= 2) {
        rows.push({
          nisn: cols[0]?.trim() || `005${Math.floor(1000000 + Math.random() * 9000000)}`,
          nama: cols[1]?.trim() || 'Siswa Baru',
          kelas: cols[2]?.trim() || classes[0] || 'XII MIPA 1',
          gender: cols[3]?.trim() || 'Laki-Laki',
          email: cols[4]?.trim() || '',
          namaOrtu: cols[5]?.trim() || '',
          phoneOrtu: cols[6]?.trim() || '',
          alamat: cols[7]?.trim() || '',
          catatan: cols[8]?.trim() || 'Hasil Impor Data',
          status: 'Aktif'
        });
      }
    }
    setParsedPreview(rows);
  };

  // Handle File Upload Import
  const handleImportFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleParseCsv(event.target.result);
    };
    reader.readAsText(file);
  };

  // Execute Import Data
  const handleExecuteImport = () => {
    if (parsedPreview.length === 0) {
      alert('Tidak ada data siswa valid untuk diimpor.');
      return;
    }

    const newStudentsList = parsedPreview.map((item, idx) => ({
      ...item,
      id: `STU-${String(students.length + idx + 1).padStart(3, '0')}`
    }));

    newStudentsList.forEach(s => saveStudentSupabase(s));
    setStudents([...students, ...newStudentsList]);
    setIsImportModalOpen(false);
    setImportCsvText('');
    setParsedPreview([]);
    showToast(`Berhasil Memproses & Mengimpor ${newStudentsList.length} Siswa Baru!`);
  };

  // Filtering
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.nisn.includes(searchTerm);
    const matchesClass = selectedClass === 'Semua Kelas' || student.kelas === selectedClass;
    const matchesGender = selectedGender === 'Semua Gender' || student.gender === selectedGender;
    return matchesSearch && matchesClass && matchesGender;
  });

  // Statistics
  const totalStudents = students.length;
  const maleCount = students.filter(s => s.gender === 'Laki-Laki').length;
  const femaleCount = students.filter(s => s.gender === 'Perempuan').length;
  const activeCount = students.filter(s => s.status === 'Aktif').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-8 space-y-6 overflow-y-auto flex-1 text-gray-100 relative"
    >
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-sm border border-emerald-400/40"
          >
            <CheckCircle2 className="w-5 h-5" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Siswa Terdaftar</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{totalStudents} Siswa</h3>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-primaryPurple rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Siswa Laki-Laki</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{maleCount} Siswa</h3>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Siswa Perempuan</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{femaleCount} Siswa</h3>
          </div>
          <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cardBg border border-cardBorder p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Status Aktif</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-400">{activeCount} Siswa</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Check className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER & ACTIONS TOOLBAR (TERMASUK MENU TEMPLATE & IMPOR) */}
      <div className="bg-cardBg border border-cardBorder p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari NISN atau Nama Siswa..." 
              className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-cardBorder rounded-xl text-sm text-white focus:outline-none focus:border-primaryPurple transition"
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
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple"
            >
              <option value="Semua Gender">Semua Gender</option>
              <option value="Laki-Laki">Laki-Laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
        </div>

        {/* ACTION BUTTONS: TEMPLATE, IMPOR, & TAMBAH SISWA */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={handleDownloadTemplate}
            className="bg-darkBg hover:bg-cardBorder border border-cardBorder text-gray-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            title="Download Template Format CSV/Excel"
          >
            <Download className="w-4 h-4 text-primaryPurple" /> Template CSV/Excel
          </button>

          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-darkBg hover:bg-cardBorder border border-cardBorder hover:border-emerald-500/50 text-gray-200 hover:text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            title="Impor Data Siswa dari File"
          >
            <Upload className="w-4 h-4 text-emerald-400" /> Impor Data Siswa
          </button>

          <button 
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-primaryPurple to-accentBlue px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:opacity-90 transition"
          >
            <UserPlus className="w-4 h-4" /> Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* TABLE DATA SISWA */}
      <div className="bg-cardBg border border-cardBorder rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-darkBg/60 text-xs uppercase text-gray-400 border-b border-cardBorder">
              <tr>
                <th className="py-4 px-6">Siswa</th>
                <th className="py-4 px-4">NISN</th>
                <th className="py-4 px-4">Kelas</th>
                <th className="py-4 px-4">Gender</th>
                <th className="py-4 px-4">Orang Tua / Kontak</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cardBorder">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-cardBorder/40 transition group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow ${
                          student.gender === 'Laki-Laki' ? 'bg-blue-600' : 'bg-pink-600'
                        }`}>
                          {student.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-primaryPurple transition">{student.nama}</div>
                          <div className="text-xs text-gray-400">{student.email || 'Email belum diisi'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-300">{student.nisn}</td>
                    <td className="py-4 px-4">
                      <span className="bg-darkBg px-2.5 py-1 rounded-lg text-xs border border-cardBorder font-medium">
                        {student.kelas}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        student.gender === 'Laki-Laki' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        <div className="text-gray-200 font-medium">{student.namaOrtu || '-'}</div>
                        <div className="text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-400" /> {student.phoneOrtu || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setDetailStudent(student)}
                          className="p-2 rounded-lg bg-darkBg border border-cardBorder text-gray-400 hover:text-white hover:border-primaryPurple transition"
                          title="Lihat Detail Profil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(student)}
                          className="p-2 rounded-lg bg-darkBg border border-cardBorder text-gray-400 hover:text-blue-400 hover:border-blue-500/40 transition"
                          title="Edit Siswa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id, student.nama)}
                          className="p-2 rounded-lg bg-darkBg border border-cardBorder text-gray-400 hover:text-red-400 hover:border-red-500/40 transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-gray-500" />
                      <p>Tidak ada data siswa yang cocok dengan filter kriteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL IMPOR DATA SISWA */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cardBg border border-cardBorder rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 border-b border-cardBorder flex items-center justify-between bg-darkBg/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Impor Data Master Siswa</h3>
                    <p className="text-xs text-gray-400">Unggah file CSV/Excel atau tempel baris data CSV secara langsung</p>
                  </div>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-300">
                {/* Download Template Quick Banner */}
                <div className="bg-darkBg p-4 rounded-xl border border-cardBorder flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-primaryPurple shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Belum Memiliki Format File CSV/Excel?</h4>
                      <p className="text-[11px] text-gray-400">Unduh template acuan untuk menyesuaikan kolom header data siswa.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Template
                  </button>
                </div>

                {/* Upload File Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Unggah File CSV / Text</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-cardBorder hover:border-emerald-500/50 bg-darkBg rounded-2xl p-6 cursor-pointer transition">
                    <Upload className="w-8 h-8 text-emerald-400 mb-2" />
                    <span className="text-xs text-white font-semibold">Klik untuk memilih file CSV / TXT</span>
                    <span className="text-[10px] text-gray-500 mt-1">Format: nisn, nama, kelas, gender, email, namaOrtu, phoneOrtu</span>
                    <input type="file" accept=".csv, .txt, .xlsx" onChange={handleImportFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Or Paste CSV Area */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Atau Tempel Teks CSV</label>
                  <textarea 
                    rows="3"
                    value={importCsvText}
                    onChange={(e) => handleParseCsv(e.target.value)}
                    placeholder="nisn,nama,kelas,gender,email&#10;005999001,Ahmad Fauzi,XII MIPA 1,Laki-Laki,fauzi@siswa.id"
                    className="w-full bg-darkBg border border-cardBorder rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-primaryPurple"
                  />
                </div>

                {/* Parsed Preview Table */}
                {parsedPreview.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Pratinjau {parsedPreview.length} Baris Data Terdeteksi:
                    </span>
                    <div className="bg-darkBg rounded-xl border border-cardBorder overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-cardBg border-b border-cardBorder text-gray-400">
                          <tr>
                            <th className="p-2.5">NISN</th>
                            <th className="p-2.5">Nama Siswa</th>
                            <th className="p-2.5">Kelas</th>
                            <th className="p-2.5">Gender</th>
                            <th className="p-2.5">Orang Tua</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cardBorder text-gray-300">
                          {parsedPreview.map((row, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-mono text-purple-300">{row.nisn}</td>
                              <td className="p-2.5 font-semibold text-white">{row.nama}</td>
                              <td className="p-2.5">{row.kelas}</td>
                              <td className="p-2.5">{row.gender}</td>
                              <td className="p-2.5">{row.namaOrtu || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-darkBg/60 border-t border-cardBorder flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-cardBorder text-gray-300 hover:text-white transition text-xs"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={parsedPreview.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl text-white font-bold shadow-lg text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Impor {parsedPreview.length} Siswa Ke Sistem
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL TAMBAH / EDIT SISWA */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cardBg border border-cardBorder rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-cardBorder flex items-center justify-between bg-darkBg/50">
                <h3 className="font-bold text-lg text-white">
                  {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">NISN Siswa *</label>
                    <input 
                      type="text"
                      required
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple font-mono"
                      placeholder="Contoh: 0051234567"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nama Lengkap Siswa *</label>
                    <input 
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                      placeholder="Nama lengkap siswa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Kelas *</label>
                    <select 
                      value={formData.kelas}
                      onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    >
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Jenis Kelamin *</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    >
                      <option value="Laki-Laki">Laki-Laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Status Siswa</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Non-Aktif">Non-Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nama Orang Tua / Wali</label>
                    <input 
                      type="text"
                      value={formData.namaOrtu}
                      onChange={(e) => setFormData({ ...formData, namaOrtu: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                      placeholder="Bpk / Ibu..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">No. Telepon / WA Ortu</label>
                    <input 
                      type="text"
                      value={formData.phoneOrtu}
                      onChange={(e) => setFormData({ ...formData, phoneOrtu: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                      placeholder="0812xxxxxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Siswa</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    placeholder="nama@siswa.belajar.id"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Alamat Tempat Tinggal</label>
                  <input 
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    placeholder="Jl. Merdeka No. 12..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Catatan Khusus Guru</label>
                  <textarea 
                    rows="3"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    placeholder="Catatan perkembangan, prestasi, atau karakteristik..."
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
                    {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DETAIL PROFIL SISWA */}
      <AnimatePresence>
        {detailStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cardBg border border-cardBorder rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-cardBorder relative flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-xl ${
                  detailStudent.gender === 'Laki-Laki' ? 'bg-blue-600' : 'bg-pink-600'
                }`}>
                  {detailStudent.nama.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{detailStudent.nama}</h3>
                  <p className="text-xs text-purple-300 font-mono">NISN: {detailStudent.nisn}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-darkBg/60 text-xs border border-cardBorder rounded-md text-gray-200">
                    Kelas: {detailStudent.kelas}
                  </span>
                </div>
                <button 
                  onClick={() => setDetailStudent(null)} 
                  className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm text-gray-300">
                <div className="grid grid-cols-2 gap-4 bg-darkBg p-4 rounded-xl border border-cardBorder">
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Gender</span>
                    <p className="font-semibold text-white mt-0.5">{detailStudent.gender}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Status Siswa</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">{detailStudent.status}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primaryPurple shrink-0" />
                    <div>
                      <span className="text-xs text-gray-400 block">Email Siswa</span>
                      <span className="text-gray-200">{detailStudent.email || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs text-gray-400 block">Orang Tua & No. Telepon</span>
                      <span className="text-gray-200">{detailStudent.namaOrtu || '-'} ({detailStudent.phoneOrtu || '-'})</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-gray-400 block">Alamat</span>
                      <span className="text-gray-200">{detailStudent.alamat || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-gray-400 block">Catatan Perkembangan Guru</span>
                      <p className="text-gray-200 bg-darkBg p-3 rounded-xl border border-cardBorder text-xs mt-1 leading-relaxed">
                        {detailStudent.catatan || 'Belum ada catatan khusus.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-darkBg/60 border-t border-cardBorder flex justify-end">
                <button 
                  onClick={() => setDetailStudent(null)}
                  className="px-5 py-2 rounded-xl bg-primaryPurple text-white text-xs font-semibold hover:bg-primaryPurple/80 transition"
                >
                  Tutup Profil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
