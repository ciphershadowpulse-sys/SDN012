import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, MessageSquare, BarChart3, FileText, 
  Calendar, Settings, Sparkles, LogOut, Users, 
  CalendarCheck, ClipboardList, GraduationCap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout }) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'data_siswa', icon: Users, label: 'Data Siswa' },
    { id: 'absensi_harian', icon: CalendarCheck, label: 'Absensi Harian' },
    { id: 'absensi_siswa', icon: ClipboardList, label: 'Absensi Siswa' },
    { id: 'penilaian', icon: GraduationCap, label: 'Penilaian' },
    { id: 'chat', icon: MessageSquare, label: 'Chat Asisten AI' },
    { id: 'analytics', icon: BarChart3, label: 'Analisis Kelas' },
    { id: 'documents', icon: FileText, label: 'Bank Modul & RPP' },
    { id: 'settings', icon: Settings, label: 'Pengaturan' },
  ];

  const initials = currentUser?.nama ? currentUser.nama.substring(0, 2).toUpperCase() : 'WK';

  return (
    <aside className="w-64 bg-cardBg border-r border-cardBorder flex flex-col justify-between p-6 select-none">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-gradient-to-tr from-primaryPurple to-accentBlue p-2.5 rounded-xl text-white shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">Digital Guru</h1>
            <p className="text-xs text-gray-400">Workspace Wali Kelas</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.03, x: 5 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-colors text-left ${
                  isActive 
                    ? 'bg-primaryPurple text-white shadow-lg shadow-primaryPurple/30' 
                    : 'text-gray-400 hover:bg-cardBorder hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* User Mini Profile & Logout */}
      <div className="pt-4 border-t border-cardBorder flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow shrink-0">
            {initials}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">{currentUser?.nama || 'Wali Kelas'}</h4>
            <p className="text-[10px] text-purple-300 font-semibold truncate">Wali Kelas {currentUser?.kelasBinaan || '-'}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="text-gray-400 hover:text-red-400 transition p-2 rounded-lg hover:bg-red-500/10 shrink-0" 
          title="Keluar / Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}