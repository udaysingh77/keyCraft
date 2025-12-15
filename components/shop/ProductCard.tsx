import React from 'react';
import { ShoppingCart, Layers } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const imageCount = product.images?.length || 0;

  return (
    <div className={`group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 ${!product.isActive ? 'opacity-60 grayscale' : ''}`}>
      <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-90 sm:aspect-none sm:h-72 relative">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-center object-cover sm:w-full sm:h-full"
        />
        {/* Multiple Images Indicator */}
        {imageCount > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md flex items-center backdrop-blur-sm">
                <Layers className="w-3 h-3 mr-1" />
                {imageCount}
            </div>
        )}
        
        {!product.isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
                <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold">Inactive</span>
            </div>
        )}
      </div>
      <div className="flex-1 p-4 space-y-2 flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">
              {product.name}
            </h3>
            <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>
        
        <button
          onClick={() => addToCart(product)}
          disabled={!product.isActive || product.stock === 0}
          className={`mt-4 w-full flex items-center justify-center rounded-md border border-transparent py-2 px-8 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
              !product.isActive || product.stock === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gray-900 hover:bg-gray-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};