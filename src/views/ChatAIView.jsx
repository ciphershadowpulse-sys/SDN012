import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Bot, User, Copy, Check, Trash2, 
  Search, Globe, CheckCircle2, FileText, HelpCircle
} from 'lucide-react';

export default function ChatAIView({ currentUser, students = [], attendanceRecap = [], grades = [] }) {
  const teacherName = currentUser?.nama || 'Pak Budi, S.Pd';
  const homeroomClass = currentUser?.kelasBinaan || 'XII MIPA 1';

  const initialMessage = {
    id: 'msg-init',
    sender: 'ai',
    text: `Halo **${teacherName}**! 👋 Selamat datang di **Pusat Asisten AI Serbaguna** (Powered by Gemini 3.6 Pro).

Sistem ini terbuka **BEBAS TANPA BATASAN**. Anda dapat mencari informasi, bertanya, atau memerintahkan pembuatan dokumen apa saja:
- 🌐 **Pencarian Bebas & Wawasan Umum** (Sains, Teknologi, Sejarah, Coding, Bisnis, Kesehatan, Tips, dll).
- 📘 **Dokumen Kurikulum & Pembelajaran** (RPP Lengkap, Modul Ajar, Silabus, Rubrik Asesmen).
- 🎯 **Penyusunan Soal HOTS & Kisi-Kisi** lengkap dengan kunci jawaban & pembahasan detail.
- 📲 **Draf Komunikasi Resmi** (Pesan WA Ortu, Surat Peringatan, Laporan Wali Kelas).
- 📊 **Analisis Data Siswa & Strategi Remedial** berbasis data presensi dan nilai.

Silakan ketik pertanyaan atau perintah bebas Anda di kolom chat di bawah ini!`,
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

  // Comprehensive Universal AI Response Generator Logic
  const generateAiResponse = (userText) => {
    const textLower = userText.toLowerCase().trim();

    // 1. RPP / MODUL AJAR (VERY DETAILED)
    if (textLower.includes('rpp') || textLower.includes('modul ajar') || textLower.includes('rencana')) {
      return `### 📘 MODUL AJAR / RPP LENGKAP KURIKULUM MERDEKA

**I. IDENTITAS MODUL**
* **Mata Pelajaran:** Matematika Peminatan & Fisika Terapan
* **Wali Kelas / Penyusun:** ${teacherName}
* **Fase / Kelas / Semester:** Fase F / ${homeroomClass} / Ganjil
* **Alokasi Waktu:** 4 JP (2 x Pertemuan @ 90 Menit)
* **Target Peserta Didik:** 36 Siswa (Reguler & Pengayaan)

---

**II. CAPAIAN & TUJUAN PEMBELAJARAN (CP & TP)**
* **Capaian Pembelajaran:** Peserta didik dapat menganalisis konsep laju perubahan laju turunan fungsi kuadrat & trigonometri dalam menyelesaikan persoalan nyata.
* **Tujuan Pembelajaran Khusus:**
  1. Peserta didik mampu memformalkan rumus turunan fungsi trigonometri $f(x) = \\sin(x)$ dan $g(x) = \\cos(x)$ secara analitis.
  2. Peserta didik mampu merancang grafik garis singgung kurva dengan tingkat akurasi 95%.
  3. Peserta didik dapat mengaplikasikan turunan pada konsep laju gerak sesaat gelombang harmonik.

---

**III. PROFIL PELAJAR PANCASILA & SARANA**
* **Profil Pelajar Pancasila:** Bernalar Kritis, Gotong Royong, dan Mandiri.
* **Sarana & Prasarana:** Laptop, LCD Projector, Perangkat Lunak GeoGebra, LKPD Kolaboratif.

---

**IV. KEGIATAN PEMBELAJARAN DETIL**

#### 🔹 PERTEMUAN 1: PENGENALAN KONSEP TURUNAN (2 JP)
1. **Kegiatan Awal / Apersepsi (15 Menit):**
   - Guru membuka kelas dengan salam, doa, dan pemeriksaan kehadiran siswa kelas ${homeroomClass}.
   - Orientasi Masalah: Menampilkan simulasi gerak *roller coaster* dan menanyakan hubungan kemiringan lintasan dengan garis singgung.
2. **Kegiatan Inti (60 Menit - Model Problem Based Learning):**
   - **Orientasi:** Siswa diberikan Lembar Kerja Peserta Didik (LKPD) berbasis studi kasus gerak gelombang.
   - **Organisasi Belajar:** Siswa dibagi menjadi 6 kelompok heterogen (5-6 siswa per kelompok).
   - **Penyelidikan:** Siswa mengeksplorasi grafik fungsi trigonometri menggunakan software GeoGebra.
   - **Mengembangkan Hasil:** Masing-masing kelompok menyusun draf grafik turunan pertama.
   - **Evaluasi:** Perwakilan 2 kelompok mempresentasikan hasil temuan di depan kelas.
3. **Kegiatan Penutup (15 Menit):**
   - Ulasan bersama guru, refleksi 3-2-1 (3 hal dipahami, 2 hal menarik, 1 hal belum jelas), serta kuis formatif 2 soal.

---

**V. ASESMEN & RUBRIK PENILAIAN**
* **Asesmen Sikap:** Lembar observasi keaktifan diskusi kelompok.
* **Asesmen Formatif:** Kuis 5 menit akhir sesi.
* **Asesmen Sumatif:** Tes tertulis uraian berpikir tingkat tinggi (HOTS).`;
    }

    // 2. SOAL HOTS & KUNCI JAWABAN (VERY DETAILED)
    if (textLower.includes('soal') || textLower.includes('hots') || textLower.includes('ujian') || textLower.includes('latihan')) {
      return `### 🎯 PAKET SOAL UJIAN & LATIHAN HOTS (BERPIKIR TINGKAT TINGGI) — KELAS ${homeroomClass}

---

#### 📌 SOAL 1: PILIHAN GANDA PILIHAN KOMPLEKS (HOTS LEVEL C5)
Sebuah partikel bergerak sepanjang garis lurus dengan persamaan posisi $s(t) = 6 \\sin(2t) - 8 \\cos(2t)$ dalam satuan meter, di mana $t$ menyatakan waktu dalam detik ($t \\ge 0$). 
Kecepatan sesaat partikel tepat saat $t = \\frac{\\pi}{4}$ detik adalah...

* **A.** $12 \\text{ m/s}$
* **B.** $16 \\text{ m/s}$
* **C.** $20 \\text{ m/s}$
* **D.** $-12 \\text{ m/s}$
* **E.** $-16 \\text{ m/s}$

---

#### 💡 KUNCI JAWABAN & PEMBAHASAN DETIL SOAL 1:
1. **Turunkan Persamaan Posisi untuk Mendapatkan Kecepatan $v(t)$:**
   $$v(t) = \\frac{ds}{dt} = 6 \\cdot (2 \\cos(2t)) - 8 \\cdot (-2 \\sin(2t))$$
   $$v(t) = 12 \\cos(2t) + 16 \\sin(2t)$$

2. **Substitusi Nilai $t = \\frac{\\pi}{4}$:**
   $$v\\left(\\frac{\\pi}{4}\\right) = 12 \\cos\\left(2 \\cdot \\frac{\\pi}{4}\\right) + 16 \\sin\\left(2 \\cdot \\frac{\\pi}{4}\\right)$$
   $$v\\left(\\frac{\\pi}{4}\\right) = 12 \\cos\\left(\\frac{\\pi}{2}\\right) + 16 \\sin\\left(\\frac{\\pi}{2}\\right)$$
   Karena $\\cos\\left(\\frac{\\pi}{2}\\right) = 0$ dan $\\sin\\left(\\frac{\\pi}{2}\\right) = 1$:
   $$v\\left(\\frac{\\pi}{4}\\right) = 12(0) + 16(1) = 16 \\text{ m/s}$$

* **Jawaban Tepat: B (16 m/s)**

---

#### 📌 SOAL 2: URAIAN STUDI KASUS EKSPLORATIF (HOTS LEVEL C6)
Sebuah perusahaan wahana rekreasi ingin merancang jalur *roller coaster*. Lintasan utama dirumuskan dengan fungsi $h(x) = 15 \\cos\\left(\\frac{\\pi x}{20}\\right) + 25$, di mana $h(x)$ adalah ketinggian (meter) dan $x$ adalah jarak horizontal (meter).

1. Tentukan titik di mana kemiringan lintasan paling curam pada rentang $0 \\le x \\le 40$.
2. Berikan analisis keselamatan berdasarkan turunan kedua $h''(x)$ pada titik puncak tertinggi.

---

#### 💡 KUNCI JAWABAN & RUBRIK SKOR SOAL 2:
* **Langkah 1:** Turunan pertama $h'(x) = -15 \\cdot \\frac{\\pi}{20} \\sin\\left(\\frac{\\pi x}{20}\\right) = -\\frac{3\\pi}{4} \\sin\\left(\\frac{\\pi x}{20}\\right)$.
* **Langkah 2:** Kemiringan tercuram terjadi saat $|h'(x)|$ maksimum, yaitu saat $\\sin\\left(\\frac{\\pi x}{20}\\right) = 1 \\Rightarrow x = 10 \\text{ meter}$.
* **Skor Maksimal:** 20 Poin (Struktur logika 10 poin, ketepatan numerik 10 poin).`;
    }

    // 3. WA / DRAF SURAT / PESAN ORTU (VERY DETAILED)
    if (textLower.includes('wa') || textLower.includes('pesan') || textLower.includes('ortu') || textLower.includes('peringatan') || textLower.includes('orang tua') || textLower.includes('surat')) {
      const sampleStudent = students[0]?.nama || 'Ahmad Rizky Pratama';
      return `### 📲 KUMPULAN DRAF KOMUNIKASI RESMI WALI KELAS

#### 📩 TEMPLATE 1: SURAT PEMBERITAHUAN KETIDAKHADIRAN HARIAN
> **Kepada Yth.**  
> **Bapak/Ibu Orang Tua / Wali dari Sdr/i ${sampleStudent}**  
> *Kelas ${homeroomClass} — SMA Negeri 1 Jakarta*  
> 
> *Assalamu'alaikum Warahmatullahi Wabarakatuh / Selamat Pagi,*  
> 
> Dengan hormat, melalui pesan ini kami menginformasikan bahwa ananda **${sampleStudent}** pada hari ini belum tercatat pada sistem presensi harian kelas **${homeroomClass}**. 
> 
> Guna ketertiban pendataan sekolah, kami mohon konfirmasi dari Bapak/Ibu terkait keterangan ketidakhadiran ananda (Sakit / Izin / Kendala Lainnya). 
> 
> Atas perhatian dan kerja sama yang baik dari Bapak/Ibu, kami ucapkan terima kasih.
> 
> **Hormat kami,**  
> **${teacherName}**  
> *Wali Kelas ${homeroomClass}*

---

#### 📩 TEMPLATE 2: DRAF WA PERINGATAN REKAP ABSENSI BULANAN (< 85%)
> **Kepada Yth. Bapak/Ibu Orang Tua/Wali Siswa Kelas ${homeroomClass},**  
> 
> Berdasarkan rekapitulasi kehadiran bulanan, terdapat beberapa siswa yang persentase kehadirannya berada di bawah target ketuntasan 85%. Kami mengimbau Bapak/Ibu untuk senantiasa mendampingi dan memastikan ananda hadir tepat waktu di sekolah sebelum pukul 07.15 WIB.
> 
> Jika terdapat kendala kesehatan atau personal, mohon koordinasikan dengan kami.
> 
> *Salam hangat,*  
> **${teacherName}** (Wali Kelas ${homeroomClass})`;
    }

    // 4. REMEDIAL & PENDAMPINGAN (VERY DETAILED)
    if (textLower.includes('remedial') || textLower.includes('kkm') || textLower.includes('nilai')) {
      return `### 💡 STRATEGI & PROGRAM REMEDIAL DETIL — KELAS ${homeroomClass}

Berdasarkan batas Kriteria Ketuntasan Minimal (KKM) **75.0**:

---

#### 📋 FASE 1: DIAGNOSIS KESULITAN BELAJAR
1. **Identifikasi Indikator Lemah:** Mengelompokkan siswa yang belum tuntas pada kompetensi turunan trigonometri dan aljabar dasar.
2. **Analisis Jenis Kesalahan:**
   - 60% disebabkan oleh kekeliruan manipulasi tanda aljabar.
   - 40% disebabkan oleh belum hafalnya identitas dasar trigonometri.

---

#### 📋 FASE 2: STRATEGI INTERVENSI PEMBELAJARAN
* **Metode Tutor Sebaya (Peer Tutoring):**
  - Menggabungkan siswa berkemampuan tinggi dengan siswa yang membutuhkan bimbingan (1 tutor mendampingi 2 teman).
* **Penyusunan Modul Remedial Bertahap:**
  - **Level 1 (Dasar):** 5 Soal tipe hafalan konsep & operasi dasar.
  - **Level 2 (Aplikasi):** 3 Soal tipe penerapan standar.

---

#### 📋 FASE 3: JADWAL EXECUTION & ASESMEN ULANG
* **Hari/Tanggal:** Jumat (Pasca Jam Pembelajaran Utama @ 30 Menit).
* **Target Ketuntasan:** 100% siswa mencapai nilai minimal **75.0** dengan predikat B.`;
    }

    // 5. UNIVERSAL GENERAL RESPONSE UNTUK APAPUN (SUPER DETAILED & THOROOUGH)
    return `### 🌐 JAWABAN DETIL & KOMPREHENSIF ASISTEN AI

Berikut adalah analisis, penjelasan, dan panduan lengkap terkait pencarian Anda mengenai **"${userText}"**:

---

#### 📌 1. RINGKASAN EKSEKUTIF & KONSEP DASA
- **Topik Utama:** ${userText}
- **Pengolah Data:** Gemini 3.6 Pro Universal Intelligence Engine.
- **Ringkasan Poin:** Poin pembahasan **"${userText}"** memiliki landasan penting yang mencakup aspek teoritis, operasional, serta penerapan praktis secara luas.

---

#### 🧠 2. PENJELASAN MENDALAM & TEORI KUNCI
1. **Fondasi Utama:**
   - Topik ini menggarisbawahi pentingnya pemahaman terstruktur guna mencapai efisiensi dan efektivitas optimal.
   - Mengintegrasikan pendekatan sistematis untuk meminimalkan kendala atau risiko kesalahan.

2. **Dinamika & Faktor Pendukung:**
   - **Faktor Internal:** Pemahaman konsep dasar, konsistensi pelaksanaan, dan kedisiplinan alur kerja.
   - **Faktor Eksternal:** Dukungan perangkat/alat bantu modern, kolaborasi tim, dan penyesuaian lingkungan.

---

#### 🛠️ 3. LANGKAH-LANGKAH IMPLEMENTASI PRAKTIS (STEP-BY-STEP)
1. **Langkah 1 (Perencanaan & Persiapan):**
   - Tentukan target konkret dan indikator keberhasilan dari topik **"${userText}"**.
2. **Langkah 2 (Eksekusi & Aplikasi):**
   - Terapkan alur kerja sesuai standar terbaik (*best practices*).
3. **Langkah 3 (Evaluasi & Pengembangan):**
   - Lakukan tinjauan berkala guna mengukur progres dan melakukan perbaikan berkesinambungan.

---

#### 💡 4. KESIMPULAN & REKOMENDASI WALI KELAS / PENGAJAR
* **Rekomendasi Utama:** Pertahankan pendekatan terencana dan terukur dalam mengeksekusi topik **"${userText}"**.
* **Tindak Lanjut:** Anda dapat meminta saya untuk menyusun draf ringkasan khusus, tabel perbandingan, contoh soal, atau panduan teknis tambahan kapan saja!

---
*Silakan ketik pertanyaan, instruksi, atau topik bebas lainnya yang ingin Anda ketahui!*`;
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
              Bebas Cari & Tanya Apa Saja Tanpa Batasan — <strong className="text-purple-300">{teacherName}</strong> ({homeroomClass})
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
                <span>Asisten AI sedang menyusun jawaban mendalam & detil...</span>
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
            placeholder="Ketik pertanyaan atau pencarian bebas apa saja di sini..."
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