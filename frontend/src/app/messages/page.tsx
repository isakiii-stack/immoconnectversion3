'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Message, Listing } from '@/lib/supabase'
import ChatInterface from '@/components/messaging/ChatInterface'
import { useRouter } from 'next/navigation'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchConversations()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      
      // Récupérer les messages groupés par listing
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          listing:listing_id(id, title, price, property_type, location),
          sender:sender_id(id, email, user_metadata),
          receiver:receiver_id(id, email, user_metadata)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors de la récupération des conversations:', error)
        return
      }

      // Grouper les messages par listing
      const conversationMap = new Map()
      
      messages?.forEach((message) => {
        const listingId = message.listing_id
        if (!conversationMap.has(listingId)) {
          conversationMap.set(listingId, {
            listing: message.listing,
            lastMessage: message,
            unreadCount: 0,
            otherUser: message.sender_id === user?.id ? message.receiver : message.sender
          })
        }
        
        // Compter les messages non lus
        if (message.receiver_id === user?.id && !message.read_at) {
          const conv = conversationMap.get(listingId)
          conv.unreadCount++
        }
      })

      setConversations(Array.from(conversationMap.values()))
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement des conversations...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="/login" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Se connecter
                </a>
                <a 
                  href="/signup" 
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  S'inscrire
                </a>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connexion requise
            </h2>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour accéder à vos messages
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="/login" 
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
              >
                Se connecter
              </a>
              <a 
                href="/signup" 
                className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
              >
                Créer un compte
              </a>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard" 
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Retour au tableau de bord
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 text-4xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune conversation
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Vous n'avez pas encore de conversations. Commencez par consulter des annonces !
                    </p>
                    <a 
                      href="/listings" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Voir les annonces
                    </a>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.listing.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.listing.id === conversation.listing.id
                          ? 'bg-indigo-50 border-r-4 border-indigo-500'
                          : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.listing.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.listing.property_type} - {conversation.listing.location}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.listing.price}€
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            avec {conversation.otherUser?.user_metadata?.full_name || conversation.otherUser?.email}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="mt-1 text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Interface de chat */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatInterface
                listingId={selectedConversation.listing.id}
                receiverId={selectedConversation.otherUser.id}
                receiverName={selectedConversation.otherUser.user_metadata?.full_name || selectedConversation.otherUser.email}
              />
            ) : (
              <div className="bg-white shadow rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-gray-500">
                    Choisissez une conversation dans la liste pour commencer à discuter
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
