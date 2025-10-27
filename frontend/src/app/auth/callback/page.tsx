'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error)
          router.push('/login?error=auth_error')
          return
        }

        if (data.session) {
          // Utilisateur connecté avec succès
          router.push('/')
        } else {
          // Pas de session, rediriger vers login
          router.push('/login')
        }
      } catch (error) {
        console.error('Erreur lors du callback:', error)
        router.push('/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Finalisation de la connexion...</p>
      </div>
    </div>
  )
}
