import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface AnimationData {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  image?: string;
}

interface CartAnimationContextType {
  animateToCart: (startX: number, startY: number, image?: string) => void;
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

export const CartAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animations, setAnimations] = useState<AnimationData[]>([]);
  const nextId = useRef(0);

  const animateToCart = useCallback((startX: number, startY: number, image?: string) => {
    const cartIcon = document.getElementById('cart-icon');
    if (!cartIcon) return;

    const rect = cartIcon.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    const id = nextId.current++;
    setAnimations(prev => [...prev, { id, startX, startY, endX, endY, image }]);

    // Cleanup animation after it finishes
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== id));
    }, 800);
  }, []);

  return (
    <CartAnimationContext.Provider value={{ animateToCart }}>
      {children}
      {/* Portaled animations */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {animations.map(anim => (
          <div
            key={anim.id}
            className="absolute w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white bg-white flex items-center justify-center animate-fly-to-cart"
            style={{
              '--start-x': `${anim.startX}px`,
              '--start-y': `${anim.startY}px`,
              '--end-x': `${anim.endX}px`,
              '--end-y': `${anim.endY}px`,
            } as React.CSSProperties}
          >
            {anim.image ? (
              <img src={anim.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-green-500 rounded-full" />
            )}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fly-to-cart {
          0% {
            transform: translate(calc(var(--start-x) - 50%), calc(var(--start-y) - 50%)) scale(1);
            opacity: 1;
          }
          40% {
            transform: translate(calc(var(--start-x) - 50%), calc(var(--start-y) - 50% - 40px)) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--end-x) - 50%), calc(var(--end-y) - 50%)) scale(0.2);
            opacity: 0;
          }
        }
        .animate-fly-to-cart {
          animation: fly-to-cart 0.8s cubic-bezier(0.1, 0.7, 0.1, 1) forwards;
        }
      `}</style>
    </CartAnimationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCartAnimation = () => {
  const context = useContext(CartAnimationContext);
  if (!context) {
    throw new Error('useCartAnimation must be used within a CartAnimationProvider');
  }
  return context;
};
