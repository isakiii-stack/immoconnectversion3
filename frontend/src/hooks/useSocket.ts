import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './useAuth'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Créer la connexion Socket.IO
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: user.access_token
      }
    })

    newSocket.on('connect', () => {
      console.log('🔗 Connecté au serveur Socket.IO')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Déconnecté du serveur Socket.IO')
      setConnected(false)
    })

    newSocket.on('error', (error) => {
      console.error('❌ Erreur Socket.IO:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user])

  const sendMessage = (receiverId: string, content: string, listingId?: string) => {
    if (socket) {
      socket.emit('send_message', {
        receiver_id: receiverId,
        content,
        listing_id: listingId
      })
    }
  }

  const joinConversation = (listingId: string) => {
    if (socket) {
      socket.emit('join_conversation', listingId)
    }
  }

  const leaveConversation = (listingId: string) => {
    if (socket) {
      socket.emit('leave_conversation', listingId)
    }
  }

  const getMessages = (listingId: string, limit = 50, offset = 0) => {
    if (socket) {
      socket.emit('get_messages', {
        listing_id: listingId,
        limit,
        offset
      })
    }
  }

  const markMessagesRead = (messageIds: string[]) => {
    if (socket) {
      socket.emit('mark_messages_read', {
        message_ids: messageIds
      })
    }
  }

  const startTyping = (listingId: string, receiverId: string) => {
    if (socket) {
      socket.emit('typing_start', {
        listing_id: listingId,
        receiver_id: receiverId
      })
    }
  }

  const stopTyping = (listingId: string, receiverId: string) => {
    if (socket) {
      socket.emit('typing_stop', {
        listing_id: listingId,
        receiver_id: receiverId
      })
    }
  }

  return {
    socket,
    connected,
    sendMessage,
    joinConversation,
    leaveConversation,
    getMessages,
    markMessagesRead,
    startTyping,
    stopTyping
  }
}
