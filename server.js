/**
 * CONEXÃO 4 - PREMIUM
 * Chat em tempo real com desafios e pontuação
 * Servidor: Node.js + Express + Socket.io
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Configuração do servidor Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// CONFIGURAÇÕES E CONSTANTES
// ============================================

const ROOM_NAME = 'sala-principal';
const MAX_USERS = 4;
const CHALLENGES = [
  '🎤 Cante uma frase em português',
  '😂 Conte uma piada engraçada',
  '💃 Descreva seu estilo de dança',
  '👽 Imite um ET falando português',
  '🎬 Cite seu filme favorito',
  '🍕 Qual seu alimento favorito?',
  '⚽ Qual seu esporte preferido?',
  '🎮 Qual seu jogo favorito?',
  '🌍 Qual país você gostaria de visitar?',
  '📚 Qual livro marcou sua vida?',
  '🎵 Qual sua música favorita?',
  '🌙 Qual seu horário favorito do dia?',
  '😴 Quanto tempo você dorme por noite?',
  '☕ Café ou chá?',
  '🌊 Praia ou montanha?',
  '🎨 Descreva sua cor favorita',
  '🌟 Qual seu superpoder?',
  '🎪 Qual evento marcou você?',
  '💌 Envie um elogio para alguém da sala',
  '🎯 O que você quer conquistar este ano?'
];

// ============================================
// ESTRUTURAS DE DADOS
// ============================================

let usersData = {}; // { socketId: { username, avatar, points } }
let lastChallenge = null;
let users = {}; // Armazena dados dos usuários por socket ID

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Obtém lista de usuários online formatada
 */
function getOnlineUsers() {
  return Object.values(usersData).map(user => ({
    username: user.username,
    avatar: user.avatar,
    points: user.points
  }));
}

/**
 * Obtém informações da sala
 */
function getRoomStats() {
  return {
    onlineCount: Object.keys(usersData).length,
    maxUsers: MAX_USERS,
    isFull: Object.keys(usersData).length >= MAX_USERS
  };
}

/**
 * Seleciona um desafio aleatório
 */
function getRandomChallenge() {
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
}

/**
 * Envia mensagem de sistema para todos
 */
function broadcastSystemMessage(message) {
  io.to(ROOM_NAME).emit('system-message', {
    message,
    timestamp: new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  });
}

// ============================================
// SOCKET.IO EVENTOS
// ============================================

io.on('connection', (socket) => {
  console.log(`✅ Novo dispositivo conectado: ${socket.id}`);

  /**
   * Evento: Usuário entra na sala
   */
  socket.on('join-room', (userData) => {
    const { username, avatar } = userData;
    
    // Verificar se sala está cheia
    if (Object.keys(usersData).length >= MAX_USERS) {
      socket.emit('room-full', {
        message: 'A sala está cheia! Máximo de 4 usuários.',
        maxUsers: MAX_USERS
      });
      socket.disconnect();
      console.log(`❌ Conexão rejeitada: sala cheia - ${username}`);
      return;
    }

    // Adicionar usuário à estrutura de dados
    usersData[socket.id] = {
      username,
      avatar,
      points: 0
    };

    // Entrar na sala
    socket.join(ROOM_NAME);

    // Notificar entrada do usuário
    broadcastSystemMessage(`${avatar} ${username} entrou na sala`);

    // Enviar lista atualizada de usuários para todos
    io.to(ROOM_NAME).emit('users-list', getOnlineUsers());
    io.to(ROOM_NAME).emit('room-stats', getRoomStats());

    console.log(`✅ ${username} entrou na sala (${Object.keys(usersData).length}/${MAX_USERS})`);
  });

  /**
   * Evento: Receber mensagem de chat
   */
  socket.on('send-message', (messageData) => {
    const user = usersData[socket.id];
    
    if (!user) return;

    const message = {
      username: user.username,
      avatar: user.avatar,
      text: messageData.text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    io.to(ROOM_NAME).emit('receive-message', message);
    console.log(`💬 ${user.username}: ${messageData.text}`);
  });

  /**
   * Evento: Sortear desafio
   */
  socket.on('draw-challenge', () => {
    const user = usersData[socket.id];
    
    if (!user) return;

    // Adicionar ponto ao usuário
    usersData[socket.id].points += 1;

    // Gerar novo desafio
    lastChallenge = getRandomChallenge();

    // Enviar desafio para todos
    io.to(ROOM_NAME).emit('new-challenge', {
      challenge: lastChallenge,
      drawnBy: user.avatar + ' ' + user.username,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });

    // Atualizar ranking
    io.to(ROOM_NAME).emit('update-ranking', getOnlineUsers());

    console.log(`🎯 Desafio sorteado por ${user.username}: ${lastChallenge}`);
  });

  /**
   * Evento: Desconexão do usuário
   */
  socket.on('disconnect', () => {
    const user = usersData[socket.id];

    if (user) {
      // Remover usuário
      delete usersData[socket.id];

      // Notificar saída
      broadcastSystemMessage(`${user.avatar} ${user.username} saiu da sala`);

      // Atualizar lista e stats
      io.to(ROOM_NAME).emit('users-list', getOnlineUsers());
      io.to(ROOM_NAME).emit('room-stats', getRoomStats());

      console.log(`❌ ${user.username} desconectou (${Object.keys(usersData).length}/${MAX_USERS})`);
    }
  });

  /**
   * Evento: Sincronizar dados ao conectar
   */
  socket.on('sync-data', () => {
    socket.emit('sync-response', {
      users: getOnlineUsers(),
      roomStats: getRoomStats(),
      lastChallenge: lastChallenge
    });
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`\n🚀 CONEXÃO 4 - PREMIUM iniciado!`);
  console.log(`📍 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`👥 Máximo de usuários: ${MAX_USERS}`);
  console.log(`🎯 Desafios disponíveis: ${CHALLENGES.length}\n`);
});
