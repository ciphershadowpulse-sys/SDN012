import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import ChatAIView from './views/ChatAIView';
import DataSiswaView from './views/DataSiswaView';
import AbsensiHarianView from './views/AbsensiHarianView';
import AbsensiSiswaView from './views/AbsensiSiswaView';
import PenilaianView from './views/PenilaianView';
import AnalisisKelasView from './views/AnalisisKelasView';
import BankModulRppView from './views/BankModulRppView';
import JadwalMengajarView from './views/JadwalMengajarView';
import PengaturanView from './views/PengaturanView';
import LoginRegisterView from './views/LoginRegisterView';

import { INITIAL_STUDENTS, INITIAL_CLASSES, INITIAL_ATTENDANCE_RECAP, INITIAL_GRADES } from './data/initialData';
import { INITIAL_USER_ACCOUNTS } from './data/userAccounts';
import { 
  isSupabaseConfigured,
  fetchUserAccountsSupabase,
  fetchStudentsSupabase,
  fetchAttendanceRecapSupabase,
  fetchGradesSupabase
} from './lib/supabase';
import { Bell, Mail, Sparkles, LogOut, UserCheck, ShieldCheck } from 'lucide-react';

export default function App() {
  // Authentication State
  const [userAccounts, setUserAccounts] = useState(INITIAL_USER_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState(INITIAL_USER_ACCOUNTS[0]); // Default: Pak Budi (Wali Kelas XII MIPA 1)

  const [activeTab, setActiveTab] = useState('dashboard');

  // Shared Master States
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [attendanceRecap, setAttendanceRecap] = useState(INITIAL_ATTENDANCE_RECAP);
  const [grades, setGrades] = useState(INITIAL_GRADES);

  // Load from Supabase on mount if configured
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchUserAccountsSupabase(INITIAL_USER_ACCOUNTS).then(accs => setUserAccounts(accs));
      fetchStudentsSupabase(INITIAL_STUDENTS).then(stus => setStudents(stus));
      fetchAttendanceRecapSupabase(INITIAL_ATTENDANCE_RECAP).then(recap => setAttendanceRecap(recap));
      fetchGradesSupabase(INITIAL_GRADES).then(grds => setGrades(grds));
    }
  }, []);

  // Persistent States for Daily Attendance & Scanned Students across tab switches
  const [scannedStudentIds, setScannedStudentIds] = useState([]);
  const [dailyAttendanceRecords, setDailyAttendanceRecords] = useState({});
  const [scannedSessionList, setScannedSessionList] = useState([]);

  // If not authenticated, render Login & Register Page
  if (!currentUser) {
    return (
      <LoginRegisterView 
        userAccounts={userAccounts}
        setUserAccounts={setUserAccounts}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // Homeroom Class & Student Scoping (Strictly only the class owned by the logged-in Wali Kelas)
  const homeroomClass = currentUser.kelasBinaan;
  const homeroomClasses = [homeroomClass];
  
  // Filter master students strictly for the logged-in Wali Kelas
  const homeroomStudents = students.filter(s => s.kelas === homeroomClass);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="flex h-screen bg-darkBg text-gray-100 font-sans overflow-hidden">
      {/* Sidebar Navigasi */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar Header */}
        <header className="h-20 border-b border-cardBorder px-8 flex items-center justify-between bg-darkBg/50 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {activeTab === 'dashboard' && `Selamat Datang, ${currentUser.nama}! 👋`}
              {activeTab === 'data_siswa' && `Data Siswa Wali Kelas — ${homeroomClass} 👥`}
              {activeTab === 'absensi_harian' && `Absensi Harian Wali Kelas — ${homeroomClass} 📝`}
              {activeTab === 'absensi_siswa' && `Rekap Absensi Siswa — ${homeroomClass} 📊`}
              {activeTab === 'penilaian' && `Penilaian Siswa Wali Kelas — ${homeroomClass} 🎓`}
              {activeTab === 'chat' && 'Pusat Asisten AI Wali Kelas 🤖'}
              {activeTab === 'analytics' && `Analisis Pembelajaran Wali Kelas — ${homeroomClass} 📊`}
              {activeTab === 'documents' && `Bank Modul & RPP — ${homeroomClass} 📁`}
              {activeTab === 'settings' && 'Pengaturan Akun Wali Kelas ⚙️'}
            </h2>
            <p className="text-xs text-gray-400">
              Portal Khusus <strong className="text-purple-300">Wali Kelas {homeroomClass}</strong> ({currentUser.nama})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Wali Kelas {homeroomClass}
            </span>

            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-cardBg border border-cardBorder text-gray-300 hover:text-red-400 hover:border-red-500/30 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </header>

        {/* Dynamic View Loader with Framer Motion Transition */}
        <main className="flex-1 flex flex-col overflow-hidden bg-darkBg">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <DashboardView 
                key="dashboard" 
                currentUser={currentUser} 
                students={students}
              />
            )}
            
            {activeTab === 'data_siswa' && (
              <DataSiswaView 
                key="data_siswa" 
                students={homeroomStudents} 
                setStudents={(updatedHomeroomStudents) => {
                  // Update students in master state
                  if (typeof updatedHomeroomStudents === 'function') {
                    setStudents(prev => {
                      const newHomeroom = updatedHomeroomStudents(prev.filter(s => s.kelas === homeroomClass));
                      const otherStudents = prev.filter(s => s.kelas !== homeroomClass);
                      return [...otherStudents, ...newHomeroom];
                    });
                  } else {
                    const otherStudents = students.filter(s => s.kelas !== homeroomClass);
                    setStudents([...otherStudents, ...updatedHomeroomStudents]);
                  }
                }} 
                classes={homeroomClasses} 
              />
            )}

            {activeTab === 'absensi_harian' && (
              <AbsensiHarianView 
                key="absensi_harian" 
                students={homeroomStudents} 
                classes={homeroomClasses} 
                attendanceRecap={attendanceRecap} 
                setAttendanceRecap={setAttendanceRecap} 
                scannedStudentIds={scannedStudentIds}
                setScannedStudentIds={setScannedStudentIds}
                attendanceRecords={dailyAttendanceRecords}
                setAttendanceRecords={setDailyAttendanceRecords}
                scannedSessionList={scannedSessionList}
                setScannedSessionList={setScannedSessionList}
              />
            )}

            {activeTab === 'absensi_siswa' && (
              <AbsensiSiswaView 
                key="absensi_siswa" 
                students={homeroomStudents} 
                classes={homeroomClasses} 
                attendanceRecap={attendanceRecap} 
              />
            )}

            {activeTab === 'penilaian' && (
              <PenilaianView 
                key="penilaian" 
                students={homeroomStudents} 
                classes={homeroomClasses} 
                grades={grades} 
                setGrades={setGrades} 
              />
            )}

            {activeTab === 'chat' && <ChatAIView key="chat" />}
            
            {activeTab === 'analytics' && (
              <AnalisisKelasView 
                key="analytics" 
                students={homeroomStudents} 
                classes={homeroomClasses} 
              />
            )}

            {activeTab === 'documents' && (
              <BankModulRppView 
                key="documents" 
                classes={homeroomClasses} 
              />
            )}

            {activeTab === 'settings' && (
              <PengaturanView key="settings" />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}