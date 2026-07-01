import { Bookmark } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
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
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11'
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 22
};

export function BookmarkButton({ product, size = 'md', className }: BookmarkButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200',
        'bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg',
        'border border-gray-200/50',
        'hover:scale-110 active:scale-95',
        saved 
          ? 'text-yellow-600 hover:text-yellow-700' 
          : 'text-gray-400 hover:text-yellow-500',
        sizeClasses[size],
        className
      )}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Bookmark
        size={iconSizes[size]}
        fill={saved ? 'currentColor' : 'none'}
        strokeWidth={saved ? 2 : 1.5}
      />
    </button>
  );
}