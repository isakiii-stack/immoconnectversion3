'use client';

import { useState, useEffect } from 'react';
import { Heart, MapPin, Users, Euro, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  maxPrice: number;
  minPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  propertyType?: string;
  city: string;
  country: string;
  views: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  _count: {
    favorites: number;
    messages: number;
  };
}

export function FeaturedBuyerRequests() {
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchBuyerRequests = async () => {
      try {
        setLoading(true);
        // In real implementation, fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBuyerRequests([]); // Empty for now
        setLoading(false);
      } catch (error) {
        console.error('Error fetching buyer requests:', error);
        setLoading(false);
      }
    };

    fetchBuyerRequests();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recherches d'acheteurs
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez ce que recherchent les acheteurs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Recherches d'acheteurs
          </h2>
          <p className="text-lg text-gray-600">
            Découvrez ce que recherchent les acheteurs
          </p>
        </div>

        {buyerRequests.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune recherche d'acheteur pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Revenez bientôt pour découvrir les recherches des acheteurs
            </p>
            <Button asChild>
              <Link href="/recherches">Voir toutes les recherches</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {buyerRequests.map((request) => (
                <div key={request.id} className="card hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.user.firstName} {request.user.lastName}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Heart className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Budget max:</span>
                        <span className="font-semibold text-primary-600">
                          {formatPrice(request.maxPrice)}
                        </span>
                      </div>
                      
                      {request.minPrice && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Budget min:</span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(request.minPrice)}
                          </span>
                        </div>
                      )}
                      
                      {request.minSurface && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Surface min:</span>
                          <span className="font-semibold text-gray-900">
                            {request.minSurface} m²
                          </span>
                        </div>
                      )}
                      
                      {request.propertyType && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-semibold text-gray-900">
                            {request.propertyType}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {request.city}, {request.country}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {request.views} vues
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(request.createdAt)}
                      </span>
                      <Button size="sm" variant="outline">
                        Contacter
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/recherches">
                  Voir toutes les recherches
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
