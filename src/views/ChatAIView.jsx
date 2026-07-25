import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, User, Paperclip } from 'lucide-react';

export default function ChatAIView() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Halo Pak Budi! Saya asisten AI pedagogik Anda. Pilih topik atau ketik instruksi untuk membuat Rencana Pelaksanaan Pembelajaran (RPP) interaktif atau soal ujian.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sedang merumuskan materi sesuai kurikulum merdeka terbaru...' }
      ]);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-8 flex flex-col h-full flex-1"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primaryPurple/20 p-3 rounded-2xl text-primaryPurple border border-primaryPurple/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Chat Asisten AI Pedagogik</h2>
          <p className="text-xs text-gray-400">Buat RPP, modul ajar, dan soal latihan secara instan</p>
        </div>
      </div>

      <div className="flex-1 bg-cardBg border border-cardBorder rounded-2xl flex flex-col overflow-hidden shadow-xl">
        {/* Chat History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-primaryPurple text-white' : 'bg-cardBorder text-primaryPurple'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm max-w-[75%] leading-relaxed ${msg.sender === 'user' ? 'bg-primaryPurple text-white rounded-tr-none' : 'bg-darkBg border border-cardBorder text-gray-200 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-darkBg border-t border-cardBorder flex items-center gap-3">
          <button type="button" className="p-2.5 rounded-xl bg-cardBg border border-cardBorder text-gray-400 hover:text-white transition">
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tuliskan perintah, misal: 'Buatkan soal pilihan ganda tentang Vektor untuk kelas XI...'"
            className="flex-1 bg-cardBg border border-cardBorder rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primaryPurple"
          />
          <button type="submit" className="bg-primaryPurple hover:bg-primaryPurple/80 px-5 py-3 rounded-xl text-white font-semibold flex items-center gap-2 transition shadow-lg shadow-purple-500/20">
            <span>Kirim</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}