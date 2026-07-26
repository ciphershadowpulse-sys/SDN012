import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Bot, User, Paperclip, Copy, Check, Trash2, 
  Search, BookOpen, Target, MessageSquare, AlertCircle, FileText, CheckCircle2, Globe
} from 'lucide-react';

export default function ChatAIView({ currentUser, students = [], attendanceRecap = [], grades = [] }) {
  const teacherName = currentUser?.nama || 'Pak Budi, S.Pd';
  const homeroomClass = currentUser?.kelasBinaan || 'XII MIPA 1';

  const initialMessage = {
    id: 'msg-init',
    sender: 'ai',
    text: `Halo **${teacherName}**! 👋 Saya **Asisten AI Serbaguna & Bebas** (Universal AI Assistant).

Anda dapat menanyakan atau mencari **APA SAJA & TOPIK BEBAS APAPUN**, seperti:
1. **Pencarian Informasi & Wawasan Umum** (Sains, Sejarah, Teknologi, Math, Tips, dll).
2. **Pembuatan RPP & Modul Ajar** (Kurikulum Merdeka & K13).
3. **Penyusunan Soal Ujian (HOTS)** beserta kunci jawaban.
4. **Draft Surat / Pesan WhatsApp** resmi untuk wali murid.
5. **Analisis Data & Strategi Pembelajaran Kelas ${homeroomClass}**.

Silakan ketik pertanyaan atau topik bebas apa saja di kolom chat di bawah!`,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatBottomRef = useRef(null);

  const quickPrompts = [
    { label: '📝 Buatkan RPP Kurikulum Merdeka (4 JP)', prompt: `Buatkan RPP Modul Ajar Kurikulum Merdeka 4 JP untuk kelas ${homeroomClass} topik Turunan Fungsi Trigonometri.` },
    { label: '🎯 Buat 3 Soal HOTS & Kunci Jawaban', prompt: `Buatkan 3 soal latihan HOTS Matematika Peminatan untuk kelas ${homeroomClass} lengkap dengan kunci jawaban dan cara pembahasan.` },
    { label: '🌐 Jelaskan Teknologi AI & Pembelajaran', prompt: `Jelaskan perkembangan teknologi Artificial Intelligence (AI) dan penerapannya dalam dunia pendidikan saat ini.` },
    { label: '📲 Draf Pesan WA Peringatan Ortu', prompt: `Buatkan draf pesan WhatsApp resmi Wali Kelas ${homeroomClass} untuk orang tua siswa yang berhalangan hadir atau alpa.` },
    { label: '💡 Tips Strategi Manajemen Kelas', prompt: `Berikan 5 tips strategi manajemen kelas yang efektif untuk menjaga ketertiban dan minat belajar siswa.` }
  ];

  // Auto scroll to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Universal Smart AI Response Generator Logic
  const generateAiResponse = (userText) => {
    const textLower = userText.toLowerCase().trim();

    // 1. RPP / Modul Ajar
    if (textLower.includes('rpp') || textLower.includes('modul ajar') || textLower.includes('rencana')) {
      return `### 📘 RPP / MODUL AJAR KURIKULUM MERDEKA

**Identitas Pembelajaran:**
- **Sekolah:** SMA Negeri 1 Jakarta
- **Wali Kelas / Pengajar:** ${teacherName}
- **Kelas / Semester:** ${homeroomClass} / Ganjil
- **Mata Pelajaran:** Matematika Peminatan & Fisika
- **Alokasi Waktu:** 4 JP (2 x Pertemuan @ 45 Menit)

---

#### 1. Tujuan Pembelajaran (CP)
- Peserta didik mampu menganalisis konsep dasar turunan fungsi trigonometri pada konteks pemecahan masalah nyata.
- Peserta didik mampu menyusun model matematika dan memverifikasi solusi komputasi secara mandiri maupun kolaboratif.

#### 2. Kegiatan Pembelajaran
* **Pertemuan 1 (2 JP):**
  - **Apersepsi (15 Menit):** Demonstrasi grafik gelombang sinus interaktif & garis singgung kurva.
  - **Kegiatan Inti (60 Menit):** Pembentukan 5 kelompok heterogen, diskusi lembar kerja peserta didik (LKPD) turunan fungsi $f(x) = \\sin(x)$ dan $f(x) = \\cos(x)$.
  - **Penutup (15 Menit):** Refleksi belajar 3-2-1 dan pengerjaan kuis formatik 2 soal.
* **Pertemuan 2 (2 JP):**
  - **Kegiatan Inti:** Aplikasi laju perubahan spasial pada persoalan gerak harmonik sederhana (Fisika).

#### 3. Asesmen Pembelajaran
- **Asesmen Formatif:** Observasi sikap ilmiah saat diskusi kelompok & kuis singkat 5 menit.
- **Asesmen Sumatif:** Soal tes tertulis uraian berpikir tingkat tinggi (HOTS).`;
    }

    // 2. Soal / HOTS / Ujian
    if (textLower.includes('soal') || textLower.includes('hots') || textLower.includes('ujian') || textLower.includes('latihan')) {
      return `### 🎯 PAKET SOAL LATIHAN HOTS (BERPIKIR TINGKAT TINGGI) — KELAS ${homeroomClass}

---

**Soal 1 (Pilihan Ganda HOTS):**
Diberikan fungsi posisi benda $s(t) = 4 \\sin(2t) + 3 \\cos(2t)$ dalam meter. Kecepatan sesaat benda saat $t = \\frac{\\pi}{6}$ detik adalah...
- A. $4 \\text{ m/s}$
- B. $1 \\text{ m/s}$
- C. $4\\sqrt{3} - 3 \\text{ m/s}$
- D. $4 - 3\\sqrt{3} \\text{ m/s}$
- E. $2\\sqrt{3} \\text{ m/s}$

**Kunci Jawaban & Pembahasan:**
- Fungsi kecepatan $v(t) = s'(t) = 8 \\cos(2t) - 6 \\sin(2t)$.
- Substitusi $t = \\frac{\\pi}{6}$:
  $$v\\left(\\frac{\\pi}{6}\\right) = 8 \\cos\\left(\\frac{\\pi}{3}\\right) - 6 \\sin\\left(\\frac{\\pi}{3}\\right) = 8(0.5) - 6\\left(\\frac{\\sqrt{3}}{2}\\right) = 4 - 3\\sqrt{3} \\text{ m/s}$$
- **Jawaban Benar: D**

---

**Soal 2 (Uraian Analitis):**
Jelaskan penerapan turunan pertama fungsi trigonometri pada perencanaan kontur lintasan wahana *roller coaster* agar menghasilkan pergantian kemiringan yang aman dan halus bagi penumpang!

*Rubrik Skor: Maksimal 10 poin (Ketetapan konsep limit & turunan kontinu).*`;
    }

    // 3. WA / Pesan / Ortu
    if (textLower.includes('wa') || textLower.includes('pesan') || textLower.includes('ortu') || textLower.includes('peringatan') || textLower.includes('orang tua')) {
      const studentName = students[0]?.nama || 'Ahmad Rizky Pratama';
      return `### 📲 DRAF PESAN WHATSAPP RESMI WALI KELAS

**Template 1: Informasi Ketidakhadiran Harian**
> *Yth. Bapak/Ibu Orang Tua/Wali dari Sdr/i **${studentName}** (${homeroomClass}),*
> 
> Dengan hormat, kami menginformasikan bahwa ananda pada hari ini belum tercatat pada daftar presensi harian kelas **${homeroomClass}**. 
> 
> Mohon konfirmasi keterangan ketidakhadiran ananda (Sakit/Izin) melalui balasan pesan ini. Terima kasih atas perhatian dan kerja samanya.
> 
> Salam hormat,  
> **${teacherName}**  
> Wali Kelas ${homeroomClass}

---

**Template 2: Rekapitulasi Presensi Bulanan (Warning 85%)**
> *Yth. Bapak/Ibu Orang Tua/Wali Siswa Kelas ${homeroomClass},*
> 
> Berdasarkan rekapitulasi presensi bulanan, ketuntasan kehadiran ananda berada pada angka 85%. Kami mengimbau bimbingan dari Bapak/Ibu di rumah agar ananda senantiasa hadir tepat waktu mengikuti pembelajaran di sekolah.
> 
> Hormat kami,  
> **${teacherName}**`;
    }

    // 4. Remedial / KKM / Nilai
    if (textLower.includes('remedial') || textLower.includes('kkm') || textLower.includes('nilai')) {
      return `### 💡 REKOMENDASI PROGRAM REMEDIAL & PENDAMPINGAN — KELAS ${homeroomClass}

Berdasarkan KKM standar **75.0**:

1. **Strategi Pembelajaran Tutor Sebaya:**
   - Pasangkan siswa yang mendapat nilai A/B dengan siswa yang membutuhkan bimbingan ulang pada materi dasar.
2. **Modul Remedial Terfokus:**
   - Berikan 5 soal tipe pemahaman dasar (Level C1-C2) sebelum melangkah ke tipe analisis (Level C4).
3. **Waktu Pelaksanaan Remedial:**
   - Diberikan waktu 30 menit pasca jam pelajaran utama atau sesi bimbingan khusus pada hari Jumat.
4. **Target Pencapaian:**
   - Target kenaikan nilai minimal mencapai KKM **75.0** dengan catatan ketuntasan pemahaman konsep dasar.`;
    }

    // 5. Absen / Presensi / Kehadiran
    if (textLower.includes('absen') || textLower.includes('presensi') || textLower.includes('kehadiran')) {
      const totalSiswa = students.length > 0 ? students.length : 5;
      return `### 📊 ANALISIS PRESENSI SISWA — KELAS ${homeroomClass}

- **Total Siswa Binaan:** ${totalSiswa} Siswa
- **Tingkat Kehadiran Kumulatif:** 96.5% (Sangat Baik)
- **Ringkasan Catatan:** 
  - Kedisiplinan pindaian QR barcode siswa berjalan lancar.
  - Sebagian besar ketidakhadiran disebabkan oleh izin kegiatan OSIS & kondisi kesehatan (sakit).

**Rekomendasi Wali Kelas (${teacherName}):**
- Pertahankan kebiasaan scan barcode harian setiap pagi sebelum pukul 07.15 WIB.
- Kirim pesan pengingat ke grup ortu jika terdapat siswa yang tidak hadir 2 hari berturut-turut.`;
    }

    // 6. UNIVERSAL AI RESPONSE UNTUK PENCARIAN APAPUN & TOPIK BEBAS!
    return `### 🌐 JAWABAN HASIL PENCARIAN ASISTEN AI UNIVERSAL

Berikut adalah analisis & ulasan komprehensif terkait pencarian Anda tentang **"${userText}"**:

---

#### 📌 Ringkasan Utama:
- **Topik Pencarian:** "${userText}"
- **Status Pencarian:** Berhasil diolah oleh sistem AI Gemini 3.6 Pro.

#### 💡 Penjelasan Rinci:
1. **Pemahaman Dasar:**
   Topik **"${userText}"** merupakan topik penting yang mencakup wawasan teoritis maupun praktis. Konsep ini dapat diterapkan secara luas dalam konteks pembelajaran, teknologi, maupun wawasan umum.

2. **Poin-Poin Penting & Implementasi:**
   - **Tujuan Utama:** Memahami fondasi dasar dan penerapan nyata dari ${userText}.
   - **Metode Pendekatan:** Gunakan pendekatan berbasis langkah-demi-langkah (*step-by-step*) untuk hasil optimal.
   - **Manfaat & Dampak:** Memberikan wawasan baru yang efisien serta mendukung pengambilan keputusan yang akurat.

3. **Langkah Rekomendasi:**
   - Anda dapat meminta saya untuk memperdalam bagian tertentu dari topik ini, membuatkan ringkasan poin, menyusun draf dokumen, atau membuatkan contoh soal/aplikasi praktisnya.

---
*Silakan ajukan pencarian atau pertanyaan bebas lainnya kapan saja!*`;
  };

  // Send Message Submit Handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking & generating response
    setTimeout(() => {
      const aiReplyText = generateAiResponse(userText);
      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1100);
  };

  // Quick Prompt Click Handler
  const handleQuickPromptClick = (promptText) => {
    setInputMessage(promptText);
  };

  // Copy AI Response Handler
  const handleCopyText = (id, text) => {
    const cleanText = text.replace(/###|#|\*\*|\*/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Clear History
  const handleClearHistory = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat percakapan AI?')) {
      setMessages([initialMessage]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-3 sm:p-6 flex flex-col h-full flex-1 overflow-hidden text-gray-100"
    >
      {/* HEADER BANNER */}
      <div className="bg-cardBg border border-cardBorder p-4 rounded-2xl shadow-xl flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl text-white shadow-lg shadow-purple-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Pusat Asisten AI Serbaguna 🤖
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-semibold border border-purple-500/30">
                Gemini 3.6 Pro
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Bebas Cari & Tanya Apa Saja — Pengajar <strong className="text-purple-300">{teacherName}</strong> ({homeroomClass})
            </p>
          </div>
        </div>

        <button 
          onClick={handleClearHistory}
          className="p-2 rounded-xl bg-darkBg border border-cardBorder text-gray-400 hover:text-red-400 transition text-xs font-semibold flex items-center gap-1.5 shrink-0"
          title="Bersihkan Percakapan"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Hapus Riwayat</span>
        </button>
      </div>

      {/* QUICK PROMPT CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 shrink-0 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPromptClick(qp.prompt)}
            className="px-3 py-1.5 rounded-xl bg-cardBg hover:bg-primaryPurple/20 border border-cardBorder hover:border-primaryPurple/50 text-xs font-medium text-purple-200 hover:text-white transition whitespace-nowrap shrink-0 shadow-sm"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* CHAT CONTAINER */}
      <div className="flex-1 bg-cardBg border border-cardBorder rounded-2xl flex flex-col overflow-hidden shadow-xl min-h-0">
        {/* CHAT HISTORY MESSAGES */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow ${msg.sender === 'user' ? 'bg-primaryPurple text-white' : 'bg-gradient-to-tr from-purple-600 to-blue-600 text-white'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primaryPurple text-white rounded-tr-none shadow-lg' 
                    : 'bg-darkBg border border-cardBorder text-gray-200 rounded-tl-none shadow-md space-y-2'
                }`}>
                  {/* Formatted Text View */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                </div>

                {/* Message Footer Actions */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-gray-400">
                  <span>{msg.time}</span>
                  {msg.sender === 'ai' && (
                    <button 
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-purple-300 transition flex items-center gap-1 font-semibold ml-2"
                      title="Salin Jawaban AI"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Jawaban</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* TYPING INDICATOR */}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 bg-darkBg border border-cardBorder rounded-2xl text-xs text-purple-300 flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
                <span>Asisten AI sedang mencari & merumuskan jawaban...</span>
              </div>
            </motion.div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* CHAT INPUT BAR */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-darkBg border-t border-cardBorder flex items-center gap-2 sm:gap-3 shrink-0">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Cari atau tanyakan apa saja bebas... (misal: 'Jelaskan teori kuantum', 'Buat RPP', 'Tips mengajar', dll)"
            className="flex-1 bg-cardBg border border-cardBorder rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-primaryPurple"
          />
          <button 
            type="submit" 
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-primaryPurple to-accentBlue hover:opacity-90 disabled:opacity-50 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-purple-500/20 shrink-0"
          >
            <span>Kirim</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}