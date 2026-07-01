import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FavoriteButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    vendor: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24
};

export function FavoriteButton({ product, size = 'md', className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(product.id);
  const [justClicked, setJustClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
    setJustClicked(true);
    setTimeout(() => setJustClicked(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200',
        'shadow-lg hover:shadow-xl',
        'border-2',
        'hover:scale-110 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
        favorited 
          ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
          : 'bg-white/95 backdrop-blur-sm text-gray-400 border-white hover:text-red-500 hover:border-red-200',
        justClicked && 'scale-125',
        sizeClasses[size],
        className
      )}
      aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
      title={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={iconSizes[size]}
        fill={favorited ? 'currentColor' : 'none'}
        strokeWidth={favorited ? 2.5 : 2}
        className={cn(
          'transition-all duration-200',
          justClicked && 'animate-bounce'
        )}
      />
    </button>
  );
}