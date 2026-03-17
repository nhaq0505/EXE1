import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../mocks/mockData';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCart } from '../../context/CartContext';
import { useCartAnimation } from '../../context/CartAnimationContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { animateToCart } = useCartAnimation();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    animateToCart(rect.left + rect.width / 2, rect.top + rect.height / 2, product.image);
    addToCart(product);
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(product.price);

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <Badge className="mb-3">{product.category}</Badge>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
            {product.name}
          </h3>
        </div>
        <div className="mt-2">
          <span className="font-bold text-lg text-green-600">{formattedPrice}</span>
          <span className="text-gray-500 text-sm"> / {product.unit}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full gap-2 transition-transform duration-200 active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          Thêm vào giỏ
        </Button>
      </CardFooter>
    </Card>
  );
};
