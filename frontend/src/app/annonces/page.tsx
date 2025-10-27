'use client'

import { useState, useEffect } from 'react'
import { supabase, Listing } from '@/lib/supabase'
import { Home, MapPin, Euro, Calendar, Eye, Heart, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function AnnoncesPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    property_type: '',
    location: '',
    min_price: '',
    max_price: ''
  })

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      // Appliquer les filtres
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type)
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters.min_price) {
        query = query.gte('price', parseInt(filters.min_price))
      }
      if (filters.max_price) {
        query = query.lte('price', parseInt(filters.max_price))
      }

      const { data, error } = await query

      if (error) {
        throw error
      }
      setListings(data || [])
    } catch (err: any) {
      console.error('Error fetching listings:', err.message)
      setError('Erreur lors du chargement des annonces.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    fetchListings()
  }

  const clearFilters = () => {
    setFilters({
      property_type: '',
      location: '',
      min_price: '',
      max_price: ''
    })
    fetchListings()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement des annonces...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Erreur</h2>
          <p className="text-gray-700">{error}</p>
          <Button onClick={fetchListings}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Annonces Immobilières</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href="/publier">
                  Publier une annonce
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filtres */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de bien
              </label>
              <select
                value={filters.property_type}
                onChange={(e) => handleFilterChange('property_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tous les types</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="terrain">Terrain</option>
                <option value="bureau">Bureau</option>
                <option value="commerce">Commerce</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Alger, Oran..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix min (DZD)
              </label>
              <input
                type="number"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix max (DZD)
              </label>
              <input
                type="number"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                placeholder="100000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="ghost" onClick={clearFilters}>
              Effacer les filtres
            </Button>
            <Button onClick={applyFilters}>
              Appliquer les filtres
            </Button>
          </div>
        </div>

        {/* Résultats */}
        {listings.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Aucune annonce trouvée
            </h2>
            <p className="text-gray-600 mb-6">
              Il n'y a actuellement aucune annonce correspondant à vos critères.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="ghost" onClick={clearFilters}>
                Voir toutes les annonces
              </Button>
              <Button asChild>
                <Link href="/publier">
                  Publier une annonce
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {listing.image_url ? (
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    <Home className="w-12 h-12" />
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{listing.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">Bien immobilier</p>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">Alger, Algérie</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="text-lg font-bold text-indigo-600">
                      {listing.price.toLocaleString()} DZD
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Publié le {new Date(listing.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/annonces/${listing.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Link>
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
