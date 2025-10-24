'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-blue-700 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-blue-900">ImmoConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-700 font-medium">Bonjour, {user.user_metadata?.full_name || user.email}</span>
              <Link 
                href="/listings" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              >
                Voir les annonces
              </Link>
              <Link 
                href="/messages" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
              >
                Messages
              </Link>
              <Link 
                href="/profile" 
                className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition duration-200 font-medium"
              >
                Profil
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Mes annonces */}
            <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-blue-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-600 truncate">
                        Mes annonces
                      </dt>
                      <dd className="text-lg font-semibold text-blue-900">
                        Gérer vos biens
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 px-6 py-4">
                <div className="text-sm">
                  <Link 
                    href="/mes-annonces" 
                    className="font-medium text-blue-600 hover:text-blue-700 transition duration-200"
                  >
                    Voir mes annonces →
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Messages */}
            <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-blue-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">💬</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-green-600 truncate">
                        Messages
                      </dt>
                      <dd className="text-lg font-semibold text-blue-900">
                        Conversations
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link 
                    href="/messages" 
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    Ouvrir la messagerie
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Profil */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">👤</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Profil
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Informations personnelles
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link 
                    href="/profile" 
                    className="font-medium text-gray-600 hover:text-gray-500"
                  >
                    Modifier le profil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
