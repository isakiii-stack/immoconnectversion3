'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Listing } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Home, MapPin, Euro, Calendar, Edit, Trash2, Eye, Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function MesAnnoncesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push('/login')
      } else {
        fetchUserListings()
      }
    }
  }, [isAuthenticated, authLoading, router])

  const fetchUserListings = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }
      setListings(data || [])
    } catch (err: any) {
      console.error('Error fetching user listings:', err.message)
      setError('Erreur lors du chargement de vos annonces.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user?.id) // Ensure only owner can delete

      if (error) {
        throw error
      }
      setListings(prev => prev.filter(listing => listing.id !== listingId))
      alert('Annonce supprimée avec succès !')
    } catch (err: any) {
      console.error('Error deleting listing:', err.message)
      setError('Erreur lors de la suppression de l\'annonce.')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement de vos annonces...</p>
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
          <Button onClick={fetchUserListings}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Mes Annonces</h1>
            </div>
            <Button asChild>
              <Link href="/publier">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une annonce
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {listings.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏡</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vous n'avez pas encore publié d'annonces
            </h2>
            <p className="text-gray-600 mb-6">
              Commencez dès maintenant à vendre ou louer votre bien immobilier.
            </p>
            <Button asChild size="lg">
              <Link href="/publier">
                <Plus className="w-5 h-5 mr-2" />
                Publier ma première annonce
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white shadow rounded-lg overflow-hidden">
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

                  <div className="flex justify-between items-center mt-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/annonces/${listing.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/annonces/${listing.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteListing(listing.id)}>
                        <Trash2 className="w-4 h-4" />
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