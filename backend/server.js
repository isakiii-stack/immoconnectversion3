const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configuration CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuration Socket.IO avec CORS
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes !');
  console.error('Vérifiez votre fichier .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Middleware d'authentification JWT
const authenticateToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Token d\'authentification manquant'));
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return next(new Error('Token invalide ou expiré'));
    }

    // Ajouter l'utilisateur au socket
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Erreur d\'authentification'));
  }
};

// Appliquer le middleware d'authentification
io.use(authenticateToken);

// Stockage des connexions utilisateurs
const connectedUsers = new Map();

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log(`🔗 Utilisateur connecté: ${socket.user.email} (ID: ${socket.id})`);
  
  // Stocker la connexion de l'utilisateur
  connectedUsers.set(socket.user.id, {
    socketId: socket.id,
    user: socket.user,
    connectedAt: new Date()
  });

  // Notifier les autres utilisateurs de la connexion
  socket.broadcast.emit('user_online', {
    userId: socket.user.id,
    email: socket.user.email
  });

  // Event: Envoyer un message
  socket.on('send_message', async (data) => {
    try {
      const { receiver_id, content, listing_id } = data;
      
      if (!receiver_id || !content) {
        socket.emit('error', { message: 'Données manquantes' });
        return;
      }

      // Créer le message dans Supabase
      const messageData = {
        sender_id: socket.user.id,
        receiver_id,
        content,
        listing_id: listing_id || null,
        created_at: new Date().toISOString()
      };

      const { data: message, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la sauvegarde du message:', error);
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
        return;
      }

      // Enrichir le message avec les données utilisateur
      const enrichedMessage = {
        ...message,
        sender: {
          id: socket.user.id,
          email: socket.user.email,
          user_metadata: socket.user.user_metadata
        }
      };

      // Envoyer le message au destinataire s'il est connecté
      const receiverConnection = connectedUsers.get(receiver_id);
      if (receiverConnection) {
        io.to(receiverConnection.socketId).emit('receive_message', enrichedMessage);
      }

      // Confirmer l'envoi à l'expéditeur
      socket.emit('message_sent', enrichedMessage);

      console.log(`📨 Message envoyé de ${socket.user.email} vers ${receiver_id}`);

    } catch (error) {
      console.error('Erreur dans send_message:', error);
      socket.emit('error', { message: 'Erreur interne du serveur' });
    }
  });

  // Event: Rejoindre une conversation
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`👥 ${socket.user.email} a rejoint la conversation ${conversationId}`);
  });

  // Event: Quitter une conversation
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`👋 ${socket.user.email} a quitté la conversation ${conversationId}`);
  });

  // Event: Marquer les messages comme lus
  socket.on('mark_messages_read', async (data) => {
    try {
      const { message_ids } = data;
      
      if (!message_ids || !Array.isArray(message_ids)) {
        socket.emit('error', { message: 'Données invalides' });
        return;
      }

      // Mettre à jour les messages comme lus
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', message_ids)
        .eq('receiver_id', socket.user.id);

      if (error) {
        console.error('Erreur lors de la mise à jour des messages:', error);
        socket.emit('error', { message: 'Erreur lors de la mise à jour' });
        return;
      }

      socket.emit('messages_marked_read', { message_ids });
      console.log(`✅ Messages marqués comme lus par ${socket.user.email}`);

    } catch (error) {
      console.error('Erreur dans mark_messages_read:', error);
      socket.emit('error', { message: 'Erreur interne du serveur' });
    }
  });

  // Event: Obtenir l'historique des messages
  socket.on('get_messages', async (data) => {
    try {
      const { listing_id, limit = 50, offset = 0 } = data;
      
      if (!listing_id) {
        socket.emit('error', { message: 'ID de listing manquant' });
        return;
      }

      // Récupérer les messages du listing
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, email, user_metadata),
          receiver:receiver_id(id, email, user_metadata)
        `)
        .eq('listing_id', listing_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        socket.emit('error', { message: 'Erreur lors de la récupération des messages' });
        return;
      }

      socket.emit('messages_history', { messages: messages.reverse() });
      console.log(`📚 ${messages.length} messages récupérés pour le listing ${listing_id}`);

    } catch (error) {
      console.error('Erreur dans get_messages:', error);
      socket.emit('error', { message: 'Erreur interne du serveur' });
    }
  });

  // Event: Typing indicator
  socket.on('typing_start', (data) => {
    const { listing_id, receiver_id } = data;
    const receiverConnection = connectedUsers.get(receiver_id);
    if (receiverConnection) {
      io.to(receiverConnection.socketId).emit('user_typing', {
        user_id: socket.user.id,
        email: socket.user.email,
        listing_id
      });
    }
  });

  socket.on('typing_stop', (data) => {
    const { listing_id, receiver_id } = data;
    const receiverConnection = connectedUsers.get(receiver_id);
    if (receiverConnection) {
      io.to(receiverConnection.socketId).emit('user_stop_typing', {
        user_id: socket.user.id,
        listing_id
      });
    }
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log(`🔌 Utilisateur déconnecté: ${socket.user.email} (ID: ${socket.id})`);
    
    // Supprimer de la liste des utilisateurs connectés
    connectedUsers.delete(socket.user.id);
    
    // Notifier les autres utilisateurs de la déconnexion
    socket.broadcast.emit('user_offline', {
      userId: socket.user.id,
      email: socket.user.email
    });
  });
});

// Routes Express
app.get('/', (req, res) => {
  res.json({
    message: 'Socket.io + Supabase backend fonctionne',
    status: 'OK',
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size
  });
});

// Route pour obtenir les utilisateurs connectés
app.get('/users/online', (req, res) => {
  const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
    id: user.user.id,
    email: user.user.email,
    connectedAt: user.connectedAt
  }));
  
  res.json({
    onlineUsers,
    count: onlineUsers.length
  });
});

// Route pour obtenir les statistiques
app.get('/stats', (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur Express:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log('🚀 Serveur ImmoConnect Socket.IO démarré !');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔗 Supabase: ${supabaseUrl ? '✅ Connecté' : '❌ Non configuré'}`);
  console.log('📨 Prêt pour la messagerie temps réel !');
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});
