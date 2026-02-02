
import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Settings,
  Image as ImageIcon,
  Smile,
  ThumbsUp,
  Phone,
  Video,
  Info,
  Send,
  Trash2,
  ChevronLeft,
  Camera,
  Heart,
  AlertCircle,
  Users,
  Save,
  RotateCcw
} from 'lucide-react';
import { Message, Participant, MessageSide, ReactionGroup } from './types';

const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: 'user-1', name: 'Phương QL', avatar: 'https://picsum.photos/seed/user1/200', isOnline: true },
  { id: 'user-2', name: 'PHAN XUAN', avatar: 'https://picsum.photos/seed/user2/200', isOnline: true },
];

const STORAGE_KEY = 'messenger-mockup-participants';

const loadSavedParticipants = (): Participant[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load saved participants:', e);
  }
  return DEFAULT_PARTICIPANTS;
};

const INITIAL_PARTICIPANTS = loadSavedParticipants();

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Tôi mọi người hay bận. Nên team sẽ chốt đi ăn vào trưa thứ 6 nhé',
    senderId: 'user-1',
    timestamp: '10:00 AM',
    side: 'left',
    reactions: [
      { emoji: '😍', names: ['Thảo Bùi', 'Lê Khanh', 'Kim Tuyến'] },
      { emoji: 'OK', names: ['PHAN XUAN'] },
      { emoji: '❤️', names: ['PHAN XUAN', 'bách'] },
      { emoji: '👏', names: ['Thanh Huyền'] }
    ],
    type: 'text'
  },
  {
    id: '2',
    text: 'vâng ạ',
    senderId: 'user-2',
    timestamp: '10:01 AM',
    side: 'right',
    reactions: [],
    type: 'text'
  },
];

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [side, setSide] = useState<MessageSide>('left');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type: 'text' | 'image' | 'like' = 'text', content?: string) => {
    if (type === 'text' && !inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: type === 'text' ? inputText : (type === 'like' ? '👍' : (content || '')),
      senderId: side === 'left' ? participants[0].id : participants[1].id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      side: side,
      reactions: [],
      type: type
    };

    setMessages([...messages, newMessage]);
    if (type === 'text') setInputText('');
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
    if (selectedMessageId === id) setSelectedMessageId(null);
  };

  const updateReaction = (messageId: string, emoji: string, namesStr: string) => {
    const names = namesStr.split(',').map(n => n.trim()).filter(n => n !== '');
    setMessages(messages.map(m => {
      if (m.id === messageId) {
        const otherReactions = m.reactions.filter(r => r.emoji !== emoji);
        const newReactions = names.length > 0 
          ? [...otherReactions, { emoji, names }]
          : otherReactions;
        return { ...m, reactions: newReactions };
      }
      return m;
    }));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  const saveParticipantsToStorage = () => {
    try {
      const data = JSON.stringify(participants);
      localStorage.setItem(STORAGE_KEY, data);
      showToast('Đã lưu cấu hình nhân vật!', 'success');
    } catch (e: unknown) {
      console.error('Failed to save participants:', e);
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        showToast('Ảnh quá lớn! Hãy dùng ảnh nhỏ hơn.', 'error');
      } else {
        showToast('Lỗi khi lưu cấu hình!', 'error');
      }
    }
  };

  const resetParticipants = () => {
    setParticipants(DEFAULT_PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Đã đặt lại cấu hình!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof index === 'number') {
          updateParticipant(index, 'avatar', reader.result as string);
        } else {
          addMessage('image', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedMessage = messages.find(m => m.id === selectedMessageId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Control Panel */}
      <div className="w-full lg:w-1/3 p-4 bg-white border-r border-slate-200 overflow-y-auto max-h-screen pb-20">
        <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <Settings className="text-blue-600" />
          Cấu hình Chat
        </h1>

        {/* Participants */}
        <section className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-500" /> Nhân vật
          </h2>
          {participants.map((p, idx) => (
            <div key={p.id} className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-slate-100">
              <div className="flex gap-3 items-center">
                <div className="relative group">
                  <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera size={16} className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, idx)} />
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updateParticipant(idx, 'name', e.target.value)}
                    className="w-full text-sm font-semibold p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <button
              onClick={saveParticipantsToStorage}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Save size={16} />
              Lưu mặc định
            </button>
            <button
              onClick={resetParticipants}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-500 text-white rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
            >
              <RotateCcw size={16} />
              Đặt lại
            </button>
          </div>
        </section>

        {/* Content Creation */}
        <section className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Thêm tin nhắn</h2>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {participants.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSide(idx === 0 ? 'left' : 'right')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                    (idx === 0 && side === 'left') || (idx === 1 && side === 'right')
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  <img src={p.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                  <span className="truncate">{p.name.split(' ').pop()}</span>
                </button>
              ))}
            </div>
            <textarea
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
              placeholder="Nội dung chat..."
              className="w-full p-3 h-20 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => addMessage('text')} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">Gửi</button>
              <button onClick={() => addMessage('like')} className="bg-white border border-slate-200 p-2 rounded-lg"><ThumbsUp className="text-blue-600" /></button>
            </div>
          </div>
        </section>

        {/* Reaction Manager */}
        <section className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <h2 className="text-lg font-semibold mb-2 text-blue-800 flex items-center gap-2">
            <Smile size={20} /> Quản lý Cảm xúc
          </h2>
          {selectedMessageId ? (
            <div className="space-y-4">
              <p className="text-xs text-blue-600 font-medium italic truncate">Đang sửa: "{selectedMessage.text}"</p>
              {['😍', 'OK', '❤️', '👏', '👍'].map(emoji => {
                const group = selectedMessage?.reactions.find((r: ReactionGroup) => r.emoji === emoji);
                return (
                  <div key={emoji} className="flex flex-col gap-1">
                    <label className="text-xs font-bold flex items-center gap-1">{emoji} Người react:</label>
                    <input
                      type="text"
                      placeholder="Tên 1, Tên 2..."
                      value={group ? group.names.join(', ') : ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateReaction(selectedMessageId, emoji, e.target.value)}
                      className="w-full p-2 text-xs border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                );
              })}
              <button 
                onClick={() => setSelectedMessageId(null)}
                className="w-full text-xs font-bold py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                Xong
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-sm gap-2">
              <AlertCircle size={24} />
              <p>Click vào tin nhắn để thêm cảm xúc</p>
            </div>
          )}
        </section>
      </div>

      {/* Mockup Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-md w-full bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden h-[700px] flex flex-col">
          
          {/* Header - Lark Style */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <ChevronLeft className="text-slate-500" size={24} />
              <h3 className="text-base font-semibold text-slate-900">Group Chat</h3>
            </div>
            <div className="flex gap-3 text-slate-500">
              <Phone size={20} />
              <Video size={20} />
              <Users size={20} />
            </div>
          </div>

          {/* Chat Content - Lark Style */}
          <div className="flex-1 overflow-y-auto p-4 bg-white flex flex-col gap-4">
            {messages.map((msg: Message, idx: number) => {
              const sender = participants.find(p => p.id === msg.senderId) || participants[0];
              const isSelected = selectedMessageId === msg.id;

              const getReactionStyle = (emoji: string) => {
                switch (emoji) {
                  case '😍': return 'bg-yellow-100 border-yellow-200';
                  case 'OK': return 'bg-green-100 border-green-200';
                  case '❤️': return 'bg-red-100 border-red-200';
                  case '👏': return 'bg-orange-100 border-orange-200';
                  case '👍': return 'bg-blue-100 border-blue-200';
                  default: return 'bg-slate-100 border-slate-200';
                }
              };

              return (
                <div key={msg.id} className="flex items-start gap-3 group relative">
                  {/* Avatar */}
                  <img
                    src={sender.avatar}
                    alt={sender.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Sender Name */}
                    <div className="text-sm font-medium text-slate-700 mb-1">
                      {sender.name}
                    </div>

                    {/* Message Bubble - Lark style */}
                    <div
                      onClick={() => setSelectedMessageId(msg.id)}
                      className={`inline-block cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      } ${
                        msg.type === 'like'
                          ? 'text-4xl p-0'
                          : 'bg-[#F5F6F7] text-slate-900 px-3 py-2 rounded-lg text-[15px]'
                      }`}
                    >
                      {msg.type === 'image' ? (
                        <img src={msg.text} className="rounded-lg max-w-[200px]" alt="" />
                      ) : (
                        msg.text
                      )}
                    </div>

                    {/* Reaction Pills - Lark style with colored backgrounds */}
                    {msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.reactions.map((r: ReactionGroup, i: number) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm ${getReactionStyle(r.emoji)}`}
                          >
                            <span>{r.emoji}</span>
                            <span className="text-slate-700 font-medium">
                              {r.names.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Floating Tools */}
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity bg-white shadow-lg border border-slate-100 rounded-lg p-1 z-20">
                    <button onClick={() => updateReaction(msg.id, '❤️', 'Người dùng')} className="hover:bg-slate-100 p-1 rounded">❤️</button>
                    <button onClick={() => deleteMessage(msg.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Bar - Lark Style */}
          <div className="px-3 py-3 border-t border-slate-200 bg-white flex items-center gap-3">
            <Plus className="text-slate-400" size={22} />
            <div className="flex-1 h-10 bg-slate-100 rounded-lg flex items-center px-4 text-slate-400 text-sm border border-slate-200">
              Nhập tin nhắn...
            </div>
            <Smile className="text-slate-400" size={22} />
            <Send className="text-blue-500" size={22} />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium z-50 transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
