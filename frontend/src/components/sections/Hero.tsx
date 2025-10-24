'use client';

import { useState } from 'react';
import { Search, MapPin, Home, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function Hero() {
  const [searchType, setSearchType] = useState<'listings' | 'buyer-requests'>('listings');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic
    const searchParams = new URLSearchParams({
      q: query,
      location,
      type: searchType,
    });
    window.location.href = `/${searchType === 'listings' ? 'annonces' : 'recherches'}?${searchParams.toString()}`;
  };

  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-20">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Trouvez votre{' '}
            <span className="text-gradient">propriété idéale</span>
            <br />
            ou{' '}
            <span className="text-gradient">vendez votre bien</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            La première marketplace immobilière bidirectionnelle. 
            Consultez les biens disponibles ou publiez votre recherche d'achat.
          </p>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            {/* Search Type Tabs */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1 max-w-md mx-auto">
              <button
                onClick={() => setSearchType('listings')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'listings'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Biens à vendre/louer
              </button>
              <button
                onClick={() => setSearchType('buyer-requests')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'buyer-requests'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Recherches d'acheteurs
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      searchType === 'listings'
                        ? 'Appartement, maison, studio...'
                        : 'Type de bien recherché...'
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ville, région, code postal..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto px-8 py-3 text-lg"
              >
                Rechercher
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/annonces">
                <Home className="w-5 h-5 mr-2" />
                Voir toutes les annonces
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/recherches">
                <Users className="w-5 h-5 mr-2" />
                Voir les recherches
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
