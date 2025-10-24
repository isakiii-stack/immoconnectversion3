'use client';

import { useState, useEffect } from 'react';
import { Heart, MapPin, Home, Euro, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  listingType: string;
  address: string;
  city: string;
  country: string;
  views: number;
  createdAt: string;
  photos: Array<{
    id: string;
    url: string;
    isMain: boolean;
  }>;
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

export function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchListings = async () => {
      try {
        setLoading(true);
        // In real implementation, fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setListings([]); // Empty for now
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Biens en vedette
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez nos meilleures annonces immobilières
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
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
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Biens en vedette
          </h2>
          <p className="text-lg text-gray-600">
            Découvrez nos meilleures annonces immobilières
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun bien en vedette pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Revenez bientôt pour découvrir nos meilleures annonces
            </p>
            <Button asChild>
              <Link href="/annonces">Voir toutes les annonces</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {listings.map((listing) => (
                <div key={listing.id} className="card hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={listing.photos[0]?.url || '/placeholder-property.jpg'}
                      alt={listing.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 right-4">
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary-600 text-white px-2 py-1 rounded text-sm font-medium">
                        {listing.listingType === 'SALE' ? 'Vente' : 'Location'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {listing.title}
                      </h3>
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(listing.price)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.city}, {listing.country}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{listing.surface} m²</span>
                      <span>{listing.rooms} pièces</span>
                      <span>{listing.bedrooms} chambres</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="w-4 h-4 mr-1" />
                        {listing.views} vues
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(listing.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/annonces">
                  Voir toutes les annonces
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
