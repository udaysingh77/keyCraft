import React, { useEffect, useState, useCallback } from 'react';
import { ProductCard } from '../components/shop/ProductCard';
import { getProducts } from '../services/productService';
import { Product } from '../types';
import { Search, Filter } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Simulated Categories derived from loaded products (in real app, separate API)
  const [categories, setCategories] = useState<string[]>(['All']);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // In a real backend, we'd pass search params to the API.
      // Here we mimic that behavior.
      const response = await getProducts({
        search: searchTerm,
        category: selectedCategory,
        includeInactive: false // Only active products for customers
      });
      setProducts(response.data);
      
      // Update categories if 'All' is selected, or just keep them
      if (selectedCategory === 'All' && searchTerm === '') {
         const cats = ['All', ...Array.from(new Set(response.data.map(p => p.category)))];
         setCategories(cats);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
        loadData();
    }, 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  return (
    <div className="space-y-8 px-4">
      {/* Hero Section */}
      <div className="bg-indigo-900 rounded-3xl overflow-hidden shadow-xl text-white">
        <div className="px-6 py-12 md:py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Carry a Piece of Art
          </h1>
          <p className="text-lg md:text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
            Discover our exclusive collection of handcrafted, 3D printed, and premium metal keychains. Small details, big statements.
          </p>
          <a 
            href="#shop"
            className="inline-block bg-white text-indigo-900 font-bold py-3 px-8 rounded-full hover:bg-indigo-50 transition transform hover:scale-105"
          >
            Shop Now
          </a>
        </div>
      </div>

      {/* Filters and Search */}
      <div id="shop" className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 bg-gray-50 z-30 py-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search keychains..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <Filter className="h-5 w-5 text-gray-500" />
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white h-96 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No keychains found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};