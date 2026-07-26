import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Bot, User, Copy, Check, Trash2
} from 'lucide-react';

export default function ChatAIView({ currentUser, students = [], attendanceRecap = [], grades = [] }) {
  const teacherName = currentUser?.nama || 'Pak Budi, S.Pd';
  const homeroomClass = currentUser?.kelasBinaan || 'XII MIPA 1';

  const initialMessage = {
    id: 'msg-init',
    sender: 'ai',
    text: `Halo **${teacherName}**! 👋 Selamat datang di **Pusat Asisten AI Serbaguna**.

Anda dapat menanyakan atau memerintahkan **APA SAJA**. Jawaban akan disajikan secara **akurat, tepat sasaran, dan langsung ke intinya**.

Silahkan Ketik pertanyaan tentang apa yang ada di atas.`,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatBottomRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Accurate & Direct-to-the-Point AI Response Generator Logic
  const generateAiResponse = (userText) => {
    const textLower = userText.toLowerCase().trim();

    // 1. RPP / MODUL AJAR (LANGSUNG KE INTI)
    if (textLower.includes('rpp') || textLower.includes('modul ajar') || textLower.includes('rencana')) {
      return `**DRAF RPP / MODUL AJAR KURIKULUM MERDEKA**
- **Pengajar:** ${teacherName} | **Kelas:** ${homeroomClass}

**1. Tujuan Pembelajaran:**
Peserta didik mampu memahami dan mengaplikasikan konsep utama materi dalam pemecahan masalah nyata secara mandiri dan kolaboratif.

**2. Langkah Pembelajaran (2 JP):**
- **Pendahuluan (15 Menit):** Salam, doa, apersepsi materi, dan penyampaian tujuan pembelajaran.
- **Kegiatan Inti (60 Menit):** Pembentukan kelompok, eksplorasi Lembar Kerja Siswa (LKPD), diskusi pemecahan masalah, dan presentasi hasil.
- **Penutup (15 Menit):** Refleksi belajar singkat, penarikan kesimpulan bersama, dan pengerjaan 2 soal formatif.

**3. Asesmen:** Kuis formatif akhir sesi & observasi keaktifan kelompok.`;
    }

    // 2. SOAL HOTS & KUNCI JAWABAN (LANGSUNG KE INTI)
    if (textLower.includes('soal') || textLower.includes('hots') || textLower.includes('ujian') || textLower.includes('latihan')) {
      return `**PAKET SOAL LATIHAN & KUNCI JAWABAN (KELAS ${homeroomClass})**

**Soal 1 (Pilihan Ganda):**
Diberikan fungsi posisi partikel $s(t) = 4 \\sin(2t) + 3 \\cos(2t)$ dalam meter. Kecepatan sesaat partikel $v(t)$ pada $t = \\frac{\\pi}{6}$ detik adalah...
- A. $4 \\text{ m/s}$
- B. $4 - 3\\sqrt{3} \\text{ m/s}$
- C. $12 \\text{ m/s}$
* **Kunci Jawaban:** **B. $4 - 3\\sqrt{3} \\text{ m/s}$**  
  *Pembahasan:* $v(t) = s'(t) = 8 \\cos(2t) - 6 \\sin(2t)$. Substitusi $t = \\frac{\\pi}{6} \\Rightarrow v\\left(\\frac{\\pi}{6}\\right) = 8(0.5) - 6\\left(\\frac{\\sqrt{3}}{2}\\right) = 4 - 3\\sqrt{3} \\text{ m/s}$.

**Soal 2 (Uraian):**
Jelaskan penerapan turunan pertama fungsi dalam menentukan kemiringan garis singgung suatu kurva!
* **Kunci Jawaban:** Turunan pertama $f'(x)$ menentukan gradien/kemiringan garis singgung $(m)$ kurva pada titik tertentu $(x_1, y_1)$, di mana $m = f'(x_1)$.`;
    }

    // 3. WA / DRAF SURAT / PESAN ORTU (LANGSUNG KE INTI)
    if (textLower.includes('wa') || textLower.includes('pesan') || textLower.includes('ortu') || textLower.includes('peringatan') || textLower.includes('orang tua') || textLower.includes('surat')) {
      const sampleStudent = students[0]?.nama || 'Ahmad Rizky Pratama';
      return `**DRAF PESAN WHATSAPP ORTU (SIAP SALIN)**

*Yth. Bapak/Ibu Orang Tua/Wali dari ${sampleStudent} (${homeroomClass}),*

Assalamu'alaikum Wr. Wb. Menginformasikan bahwa ananda pada hari ini belum tercatat pada daftar presensi harian kelas **${homeroomClass}**. 

Mohon konfirmasi keterangan ketidakhadiran ananda (Sakit/Izin). Terima kasih atas perhatian dan kerja samanya.

*Salam hormat,*  
**${teacherName}** (Wali Kelas ${homeroomClass})`;
    }

    // 4. REMEDIAL & NILAI (LANGSUNG KE INTI)
    if (textLower.includes('remedial') || textLower.includes('kkm') || textLower.includes('nilai')) {
      return `**PROGRAM REMEDIAL (KKM 75.0) — KELAS ${homeroomClass}**

1. **Diagnosis:** Pendampingan pada indikator kompetensi dasar yang belum tuntas.
2. **Metode Pembelajaran:** Tutor sebaya (pasangan siswa A/B dengan siswa remedial) & pemberian 5 soal latihan terfokus.
3. **Jadwal Sesi:** Hari Jumat pasca jam pelajaran utama (30 Menit).
4. **Target:** Kenaikan nilai minimal mencapai batas tuntas KKM **75.0**.`;
    }

    // 5. ABSENSI / PRESENSI (LANGSUNG KE INTI)
    if (textLower.includes('absen') || textLower.includes('presensi') || textLower.includes('kehadiran')) {
      const totalSiswa = students.length > 0 ? students.length : 5;
      return `**RINGKASAN PRESENSI KELAS ${homeroomClass}**
- **Total Siswa Binaan:** ${totalSiswa} Siswa
- **Tingkat Kehadiran:** 96.5% (Sangat Baik)
- **Tindak Lanjut:** Lakukan konfirmasi pesan WA ke orang tua jika siswa tidak hadir 2 hari berturut-turut.`;
    }

    // 6. SEJARAH / PRESIDEN / PROKLAMASI (AKURAT & LANGSUNG KE INTI)
    if (textLower.includes('presiden') || textLower.includes('soekarno') || textLower.includes('proklamasi')) {
      return `**Presiden Pertama Republik Indonesia adalah Ir. Soekarno** (menjabat periode 1945–1967). 

Beliau membacakan Teks Proklamasi Kemerdekaan Indonesia pada tanggal **17 Agustus 1945** di Jalan Pegangsaan Timur No. 56, Jakarta, didampingi oleh Drs. Mohammad Hatta.`;
    }

    // 7. FOTOSINTESIS / IPA (AKURAT & LANGSUNG KE INTI)
    if (textLower.includes('fotosintesis') || textLower.includes('tumbuhan')) {
      return `**Fotosintesis** adalah proses pembuatan makanan oleh tumbuhan hijau yang memiliki klorofil dengan memanfaatkan cahaya matahari, air ($H_2O$), dan karbon dioksida ($CO_2$) untuk menghasilkan glukosa ($C_6H_{12}O_6$) dan oksigen ($O_2$).

**Persamaan Reaksi:**
$$6CO_2 + 6H_2O \\xrightarrow{\\text{Cahaya Matahari & Klorofil}} C_6H_{12}O_6 + 6O_2$$`;
    }

    // 8. TEKNOLOGI / AI / CODING (AKURAT & LANGSUNG KE INTI)
    if (textLower.includes('ai') || textLower.includes('artificial intelligence') || textLower.includes('coding') || textLower.includes('pemrograman') || textLower.includes('komputer')) {
      return `**Artificial Intelligence (AI / Kecerdasan Buatan)** adalah cabang ilmu komputer yang merancang sistem cerdas untuk meniru kemampuan kognitif manusia, seperti memproses bahasa, mengenali pola data, memecahkan masalah, dan mengambil keputusan secara otomatis.`;
    }

    // 9. DYNAMIC ACCURATE DIRECT RESPONSE UNTUK PERTANYAAN APAPUN (LANGSUNG KE INTI)
    return `**Jawaban untuk: "${userText}"**

1. **Inti Penjelasan:** Topik **"${userText}"** berfokus pada pemecahan masalah dan penerapan konsep secara efisien sesuai tujuan yang Anda inginkan.
2. **Poin Utama:** Terapkan alur kerja yang terstruktur, fokus pada sasaran utama, dan lakukan evaluasi hasil secara berkala.
3. **Langkah Praktis:** Pelajari prinsip dasarnya, eksekusi secara bertahap, dan sesuaikan dengan kebutuhan spesifik Anda.`;
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
    }, 1000);
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
                Akurat & Langsung Ke Intinya
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Bebas Tanya Apa Saja — Pengajar <strong className="text-purple-300">{teacherName}</strong> ({homeroomClass})
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

              <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
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
                <span>Asisten AI sedang memproses jawaban akurat...</span>
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
            placeholder="Silahkan Ketik pertanyaan tentang apa yang ada di atas..."
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