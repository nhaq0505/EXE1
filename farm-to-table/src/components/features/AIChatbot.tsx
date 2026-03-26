import { useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle, X, Send, ShoppingCart, CheckCircle, Package } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from '../ui/Button';
import { products, mealPlans, menuIngredients } from '../../mocks/mockData';
import { useCart } from '../../context/CartContext';

// ── System Prompt ─────────────────────────────────────────────────────────────
const productList = products
  .map(p => `- ID:[${p.id}] Tên:[${p.name}] Giá:[${p.price}]đ`)
  .join('\n');



const menuList = mealPlans
  .map(m => {
    const ingredientIds = (menuIngredients as Record<string, string[]>)[m.id] ?? [];
    const price = ingredientIds.reduce((sum, id) => {
      const p = products.find(prod => prod.id === id);
      return sum + (p?.price || 0);
    }, 0);
    return `- [ID:${m.id}] ${m.title} (${m.targetAudience}) - GIÁ: ${price.toLocaleString('vi-VN')}đ: ${m.dishes.join(', ')}`;
  })
  .join('\n');

const systemInstruction = `Bạn là trợ lý ảo THÔNG MINH của Green Solution.
Nhiệm vụ: Tư vấn nông sản và đề xuất thực đơn CHÍNH XÁC theo ngân sách.

DANH SÁCH SẢN PHẨM & GIÁ:
${productList}

THỰC ĐƠN MẪU:
${menuList}

=== QUY TẮC PHẢN HỒI (BẮT BUỘC) ===
1. Khi liệt kê sản phẩm/nông trại: Dùng icon (vd: 🥬 Rau củ) và dấu gạch đầu dòng (*). Trình bày sạch sẽ.
2. Khi gợi ý theo ngân sách (vd: 200k): PHẢI chọn món lẻ hoặc thực đơn sao cho Tổng Giá < Ngân sách. 
3. THẺ HÀNH ĐỘNG (QUAN TRỌNG NHẤT): 
   - Mọi câu trả lời có gợi ý sản phẩm/thực đơn PHẢI kết thúc bằng một thẻ tag ở dòng cuối cùng.
   - Nếu dùng menu CÓ SẴN: Gắn [[MENU:mpX]]
   - Nếu TỰ PHỐI đồ lẻ: Gắn [[CUSTOM_MENU:p1,p2,p3]] (liệt kê ít nhất 3-5 sản phẩm phù hợp).
   - KHÔNG bao giờ được quên thẻ tag này, nếu không khách sẽ không thể mua hàng.
4. Trả lời ngắn gọn, tự nhiên, tối đa 100 từ.`;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isError?: boolean;
  suggestedPlanId?: string; // for pre-defined plans [[MENU:mp1]]
  customProductIds?: string[]; // for dynamic AI suggestions [[CUSTOM_MENU:p1,p2]]
}

// ── Inline Meal Plan Card (Static mpX) ──────────────────────────────────────────
function MealPlanSuggestionCard({ planId }: { planId: string }) {
  const { addToCart, toggleCart } = useCart();
  const [added, setAdded] = useState(false);

  const plan = mealPlans.find(m => m.id === planId);
  if (!plan) return null;

  const ingredientIds = (menuIngredients as Record<string, string[]>)[planId] ?? [];
  const ingredientProducts = ingredientIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as typeof products;

  const dynamicPrice = ingredientProducts.reduce((sum, p) => sum + p.price, 0);

  const handleAdd = () => {
    ingredientProducts.forEach(p => addToCart(p));
    setAdded(true);
    setTimeout(() => toggleCart(), 700);
  };

  return (
    <div className="mt-2 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-3 shadow-sm w-full max-w-[280px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-bold text-green-700 leading-tight">{plan.title}</p>
          <p className="text-[11px] text-gray-500">{plan.targetAudience}</p>
        </div>
        <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
          ~{dynamicPrice.toLocaleString('vi-VN')}đ
        </span>
      </div>
      <p className="text-[11px] text-gray-600 leading-snug mb-3 line-clamp-2">
        🍽️ {plan.dishes.join(', ')}
      </p>
      <button
        onClick={handleAdd}
        disabled={added}
        className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-all ${added ? 'bg-green-100 text-green-700' : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
          }`}
      >
        {added ? <><CheckCircle className="w-3.5 h-3.5" /> Đã thêm giỏ!</> : <><ShoppingCart className="w-3.5 h-3.5" /> Thêm nguyên liệu</>}
      </button>
    </div>
  );
}

// ── Custom Menu Card (Dynamic Product List) ────────────────────────────────────
function CustomMenuCard({ productIds }: { productIds: string[] }) {
  const { addToCart, toggleCart } = useCart();
  const [added, setAdded] = useState(false);

  const selectedProducts = productIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as typeof products;

  if (selectedProducts.length === 0) return null;

  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  const handleAdd = () => {
    selectedProducts.forEach(p => addToCart(p));
    setAdded(true);
    setTimeout(() => toggleCart(), 700);
  };

  return (
    <div className="mt-2 bg-white border border-blue-100 rounded-2xl p-3 shadow-md w-full max-w-[280px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
          <Package className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-blue-800">Combo AI đề xuất</p>
          <p className="text-[10px] text-gray-400">{selectedProducts.length} sản phẩm</p>
        </div>
        <span className="text-xs font-bold text-blue-700">
          {totalPrice.toLocaleString('vi-VN')}đ
        </span>
      </div>

      <div className="space-y-1.5 mb-3 bg-gray-50 p-2 rounded-lg max-h-[100px] overflow-y-auto">
        {selectedProducts.map(p => (
          <div key={p.id} className="flex justify-between items-center text-[10px]">
            <span className="text-gray-600 truncate mr-2">• {p.name}</span>
            <span className="text-gray-400 whitespace-nowrap">{p.price.toLocaleString('vi-VN')}đ</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        disabled={added}
        className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-all ${added ? 'bg-blue-50 text-blue-700' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
      >
        {added ? <><CheckCircle className="w-3.5 h-3.5" /> Đã thêm giỏ!</> : <><ShoppingCart className="w-3.5 h-3.5" /> Thêm combo vào giỏ</>}
      </button>
    </div>
  );
}

// ── Gemini Config ─────────────────────────────────────────────────────────────
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MENU_TAG_REGEX = /\[\[MENU:(mp\d+)\]\]/;
const CUSTOM_MENU_TAG_REGEX = /\[\[CUSTOM_MENU:([\w,]+)\]\]/;

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
      text: 'Chào bạn! Mình là trợ lý GreenSolution, bạn muốn ăn gì hôm nay ?',
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

    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Chế độ demo: Chưa cấu hình API Key.',
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
        systemInstruction
      });

      const allMapped = messages
        .filter(m => !m.isError)
        .map(m => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: m.text + (m.suggestedPlanId ? ` [[MENU:${m.suggestedPlanId}]]` : '') + (m.customProductIds ? ` [[CUSTOM_MENU:${m.customProductIds.join(',')}]]` : '') }],
        }));
      const firstUserIdx = allMapped.findIndex(m => m.role === 'user');
      const history = firstUserIdx >= 0 ? allMapped.slice(firstUserIdx) : [];

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userText);
      const rawText = result.response.text();

      console.log('🤖 AI Raw Response:', rawText);

      // Parse tags
      const menuMatch = rawText.match(MENU_TAG_REGEX);
      const customMatch = rawText.match(CUSTOM_MENU_TAG_REGEX);

      const suggestedPlanId = menuMatch?.[1];
      const customProductIds = customMatch?.[1]?.split(',');

      const cleanText = rawText
        .replace(MENU_TAG_REGEX, '')
        .replace(CUSTOM_MENU_TAG_REGEX, '')
        .replace(/\[ID:\w+\]/g, '')
        .trim();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: cleanText,
        timestamp: new Date(),
        suggestedPlanId,
        customProductIds,
      }]);
    } catch (err: any) {
      console.error('Gemini error:', err);
      const isQuotaError = err?.message?.includes('429') || err?.message?.includes('quota');

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: isQuotaError
          ? '🚀 Nhắn hơi nhanh rồi! Bạn đợi khoảng 10 giây rồi thử lại nhé.'
          : '😔 Có lỗi kết nối AI.',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-green-600 text-white shadow-xl hover:scale-110 transition-all ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      <div
        className={`fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col h-[560px] max-h-[85vh] border border-gray-100 transition-all transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">Trợ lý Thông Minh</h3>
              <div className="text-[10px] text-green-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>
                AI Đề xuất Menu riêng
              </div>
            </div>
          </div>
          <button onClick={toggleChat} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${msg.sender === 'user'
                  ? 'bg-green-600 text-white rounded-tr-sm'
                  : 'bg-white border text-gray-800 rounded-tl-sm'
                  }`}
              >
                <div className="whitespace-pre-line space-y-1">
                  {msg.text.split('\n').map((line, i) => {
                    const isBullet = line.trim().startsWith('*');
                    const cleanLine = line.trim().replace(/^\*\s*/, '');
                    
                    // Parse bold text
                    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                    const styledLine = parts.map((part, pi) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pi}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    });

                    if (isBullet) {
                      return (
                        <div key={i} className="flex gap-2 pl-1">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{styledLine}</span>
                        </div>
                      );
                    }
                    return <div key={i}>{styledLine}</div>;
                  })}
                </div>
              </div>
              {msg.suggestedPlanId && <MealPlanSuggestionCard planId={msg.suggestedPlanId} />}
              {msg.customProductIds && <CustomMenuCard productIds={msg.customProductIds} />}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1.5 text-gray-400">
                <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tôi muốn nấu lẩu Thái / salad cá hồi..."
              className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-full pl-4 pr-12 py-3 outline-none"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1 h-10 w-10 min-w-10 rounded-full bg-green-600 shadow-md"
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="text-center mt-2 text-[9px] text-gray-400">
            Powered by Google Gemini 2.5 Flash
          </div>
        </div>
      </div>
    </>
  );
};
