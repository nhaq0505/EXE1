import { useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle, X, Send, AlertCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from '../ui/Button';
import { farms, products, mealPlans } from '../../mocks/mockData';

// ── System Prompt ──────────────────────────────────────────────────────────────
const productList = products
  .map(p => `- ${p.name} (${p.category}, ${p.price.toLocaleString('vi-VN')}đ/${p.unit})`)
  .join('\n');

const farmList = farms
  .map(f => `- ${f.name} tại ${f.location} (⭐${f.rating}) – ${f.description}`)
  .join('\n');

const menuList = mealPlans
  .map(m => `- ${m.title} (${m.targetAudience}, ${m.calories} Kcal): ${m.dishes.join(', ')}`)
  .join('\n');

const systemInstruction = `Bạn là trợ lý ảo thân thiện của Green Solution - ứng dụng nông sản sạch.
Trả lời ngắn gọn, tự nhiên, dùng tiếng Việt. Tối đa 100 từ mỗi câu trả lời.
Chỉ tư vấn dựa trên dữ liệu dưới đây. Nếu sản phẩm không có, xin lỗi và gợi ý sản phẩm tương tự.

SẢN PHẨM:
${productList}

NÔNG TRẠI:
${farmList}

THỰC ĐƠN THÔNG MINH:
${menuList}

THÔNG TIN KHÁC: Giao hàng 2–4 giờ, miễn phí. Gom đơn chung cư giảm 20–30%. Hotline: 1800-GREEN (7h–21h).`;


// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

// ── Gemini singleton ──────────────────────────────────────────────────────────
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// ── Component ─────────────────────────────────────────────────────────────────
export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Xin chào! 👋 Mình là Trợ lý Green Solution. Bạn muốn tìm nông sản, xem thực đơn hay cần tư vấn gì không?',
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // If no API key, fall back to a helpful message
    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: '⚙️ Chưa cấu hình API Key cho Gemini. Vui lòng thêm VITE_GEMINI_API_KEY vào file .env và khởi động lại ứng dụng.',
          timestamp: new Date(),
          isError: true,
        }]);
        setIsTyping(false);
      }, 600);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction,
      });

      // Build chat history — Gemini requires history to start with role 'user'
      // So we skip any leading bot messages (e.g. the initial greeting)
      const allMapped = messages
        .filter(m => !m.isError)
        .map(m => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: m.text }],
        }));
      const firstUserIdx = allMapped.findIndex(m => m.role === 'user');
      const history = firstUserIdx >= 0 ? allMapped.slice(firstUserIdx) : [];

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userText);
      const responseText = result.response.text();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('Gemini error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '😔 Xin lỗi, có lỗi khi kết nối AI. Vui lòng thử lại sau hoặc liên hệ support@greensolution.vn.',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsTyping(false);
    }
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
        className={`fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col h-[520px] max-h-[85vh] border border-gray-100 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 flex items-center justify-between text-white shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold tracking-wide">Trợ lý Green Solution</h3>
              <div className="flex items-center gap-1.5 text-xs text-green-100">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                {apiKey ? 'Powered by Gemini AI ✨' : 'Chế độ demo'}
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
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${msg.sender === 'user'
                    ? 'bg-green-600 text-white rounded-tr-sm'
                    : msg.isError
                      ? 'bg-red-50 border border-red-100 text-red-700 rounded-tl-sm'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                  }`}
              >
                {msg.isError && <AlertCircle className="w-4 h-4 inline mr-1.5 mb-0.5 text-red-500" />}
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
        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về sản phẩm, giá, thực đơn..."
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-4 pr-12 py-3 outline-none transition-all"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1 h-10 w-10 min-w-10 rounded-full bg-green-600 hover:bg-green-700 shadow-md transition-transform active:scale-95"
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 font-medium">
              {apiKey ? '✨ Powered by Google Gemini' : '⚙️ Thêm VITE_GEMINI_API_KEY để dùng AI thật'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
