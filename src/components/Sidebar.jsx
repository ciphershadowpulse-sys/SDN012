import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, MessageSquare, BarChart3, FileText, 
  Settings, Sparkles, LogOut, Users, 
  CalendarCheck, ClipboardList, GraduationCap, X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout, isMobileOpen, setIsMobileOpen }) {
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

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 lg:p-5 select-none overflow-y-auto">
      <div>
        {/* Logo & Mobile Close Button */}
        <div className="flex items-center justify-between gap-3 mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-primaryPurple to-accentBlue p-2 rounded-xl text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white">Digital Guru</h1>
              <p className="text-[11px] text-gray-400">Workspace Wali Kelas</p>
            </div>
          </div>

          {/* Close button for Mobile */}
          <button 
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)} 
            className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all text-left ${
                  isActive 
                    ? 'bg-primaryPurple text-white shadow-md shadow-primaryPurple/30 font-semibold' 
                    : 'text-gray-400 hover:bg-cardBorder hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Mini Profile & Logout */}
      <div className="pt-3 border-t border-cardBorder flex items-center justify-between mt-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow shrink-0">
            {initials}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">{currentUser?.nama || 'Wali Kelas'}</h4>
            <p className="text-[10px] text-purple-300 font-semibold truncate">Wali Kelas {currentUser?.kelasBinaan || '-'}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="text-gray-400 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10 shrink-0" 
          title="Keluar / Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-52 lg:w-56 bg-cardBg border-r border-cardBorder flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-60 bg-cardBg z-50 md:hidden shadow-2xl border-r border-cardBorder"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}