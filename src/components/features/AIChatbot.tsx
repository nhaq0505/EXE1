import { useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle, X, Send } from 'lucide-react';
import { Button } from '../ui/Button';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Chào bạn! Mình là Trợ lý Nông trại. Bạn cần tìm nông sản gì hôm nay?',
      timestamp: new Date()
    }
  ]);

  // Cuộn xuống cuối dải tin nhắn mỗi khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Mô phỏng bot suy nghĩ
    setTimeout(() => {
      let botReply = 'Cảm ơn bạn. Tính năng AI đang được nâng cấp, tạm thời mình chỉ có thể gợi ý về Rau và Thịt thôi ạ!';
      const lowercaseInput = userMessage.text.toLowerCase();

      if (lowercaseInput.includes('rau')) {
        botReply = 'Hiện tại nông trại Sunnyside đang có rau muống và cải thảo rất tươi. Bạn vào mục Nông trại xem thử nhé!';
      } else if (lowercaseInput.includes('thịt') || lowercaseInput.includes('heo') || lowercaseInput.includes('bò')) {
        botReply = 'Bên mình cung cấp thịt sạch chuẩn VietGAP và Organic. Bạn chuyển sang tab Cửa hàng để thêm vào giỏ nha.';
      } else if (lowercaseInput.includes('trái cây') || lowercaseInput.includes('quả')) {
        botReply = 'Cam sành và Dâu tây đang vào mùa thu hoạch hôm nay đó. Mời bạn tham khảo!';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-green-600 text-white shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Mở trợ lý ảo"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col h-[500px] max-h-[80vh] border border-gray-100 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 flex items-center justify-between text-white shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold tracking-wide">Trợ lý Nông trại</h3>
              <div className="flex items-center gap-1.5 text-xs text-green-100">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                Đang trực tuyến
              </div>
            </div>
          </div>
          <button 
            onClick={toggleChat}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
            aria-label="Đóng cửa sổ chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-green-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-4 pr-12 py-3 outline-none transition-all"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1 top-1 h-10 w-10 min-w-10 rounded-full bg-green-600 hover:bg-green-700 shadow-md transition-transform active:scale-95"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 font-medium">✨ Powered by FarmAI</span>
          </div>
        </div>
      </div>
    </>
  );
};
