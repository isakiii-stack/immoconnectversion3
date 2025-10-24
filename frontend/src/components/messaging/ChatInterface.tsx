'use client'

import { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Message } from '@/lib/supabase'

interface ChatInterfaceProps {
  listingId: string
  receiverId: string
  receiverName: string
}

export default function ChatInterface({ listingId, receiverId, receiverName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAuth()
  const { socket, connected, sendMessage, joinConversation, leaveConversation, getMessages, markMessagesRead, startTyping, stopTyping } = useSocket()

  // Faire défiler vers le bas automatiquement
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Rejoindre la conversation au montage
  useEffect(() => {
    if (connected && listingId) {
      joinConversation(listingId)
      getMessages(listingId)
    }

    return () => {
      if (listingId) {
        leaveConversation(listingId)
      }
    }
  }, [connected, listingId])

  // Écouter les événements Socket.IO
  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (message: Message) => {
      setMessages(prev => [...prev, message])
      
      // Marquer comme lu si c'est pour nous
      if (message.receiver_id === user?.id) {
        markMessagesRead([message.id])
      }
    }

    const handleMessagesHistory = (data: { messages: Message[] }) => {
      setMessages(data.messages)
    }

    const handleUserTyping = (data: { user_id: string, email: string, listing_id: string }) => {
      if (data.user_id !== user?.id) {
        setTyping(true)
        setTypingUser(data.email)
      }
    }

    const handleUserStopTyping = (data: { user_id: string, listing_id: string }) => {
      if (data.user_id !== user?.id) {
        setTyping(false)
        setTypingUser(null)
      }
    }

    socket.on('receive_message', handleReceiveMessage)
    socket.on('messages_history', handleMessagesHistory)
    socket.on('user_typing', handleUserTyping)
    socket.on('user_stop_typing', handleUserStopTyping)

    return () => {
      socket.off('receive_message', handleReceiveMessage)
      socket.off('messages_history', handleMessagesHistory)
      socket.off('user_typing', handleUserTyping)
      socket.off('user_stop_typing', handleUserStopTyping)
    }
  }, [socket, user?.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !connected) return

    setLoading(true)
    sendMessage(receiverId, newMessage.trim(), listingId)
    setNewMessage('')
    setLoading(false)
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (e.target.value.length > 0) {
      startTyping(listingId, receiverId)
    } else {
      stopTyping(listingId, receiverId)
    }
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Connexion à la messagerie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-lg font-medium text-gray-900">
          Conversation avec {receiverName}
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {connected ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucun message pour le moment. Commencez la conversation !
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {/* Indicateur de frappe */}
        {typing && typingUser && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
              <p className="text-sm">{typingUser} est en train d'écrire...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Tapez votre message..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </form>
    </div>
  )
}
