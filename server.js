/**
 * CONEXÃO 4 - ULTIMATE
 * Chat com Mini-Games, Desafios Avançados, Áudio e muito mais!
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// CONFIGURAÇÕES E CONSTANTES
// ============================================

const ROOM_NAME = 'sala-principal';
const MAX_USERS = 4;

// Desafios
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

// Quizzes
const QUIZZES = [
  {
    question: 'Qual é a capital do Brasil?',
    options: ['Rio de Janeiro', 'Brasília', 'São Paulo', 'Salvador'],
    correctAnswer: 1,
    timeLimit: 10,
    points: 10
  },
  {
    question: 'Em que ano o Brasil foi descoberto?',
    options: ['1500', '1520', '1492', '1450'],
    correctAnswer: 0,
    timeLimit: 10,
    points: 10
  },
  {
    question: 'Qual é o maior rio do Brasil?',
    options: ['Rio de Janeiro', 'Amazonas', 'São Francisco', 'Paraná'],
    correctAnswer: 1,
    timeLimit: 10,
    points: 10
  },
  {
    question: 'Quantas cores tem a bandeira do Brasil?',
    options: ['2', '3', '4', '5'],
    correctAnswer: 2,
    timeLimit: 10,
    points: 10
  },
  {
    question: 'Qual é o prato típico mais famoso do Brasil?',
    options: ['Pizza', 'Feijoada', 'Hambúrguer', 'Sushi'],
    correctAnswer: 1,
    timeLimit: 10,
    points: 10
  }
];

// ============================================
// ESTRUTURAS DE DADOS
// ============================================

let usersData = {}; // { socketId: { username, avatar, points } }
let lastChallenge = null;
let gameState = {
  currentGame: null,
  gameData: null,
  players: {},
  answers: {}
};

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
 * Seleciona um quiz aleatório
 */
function getRandomQuiz() {
  return QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
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
   * Evento: Iniciar Quiz
   */
  socket.on('start-quiz', () => {
    const user = usersData[socket.id];
    
    if (!user) return;

    // Selecionar quiz aleatório
    const quiz = getRandomQuiz();
    gameState.currentGame = 'quiz';
    gameState.gameData = quiz;
    gameState.answers = {};

    // Enviar quiz para todos
    io.to(ROOM_NAME).emit('quiz-started', {
      question: quiz.question,
      options: quiz.options,
      timeLimit: quiz.timeLimit
    });

    console.log(`📝 Quiz iniciado por ${user.username}`);

    // Término automático do quiz após timeLimit
    setTimeout(() => {
      if (gameState.currentGame === 'quiz') {
        io.to(ROOM_NAME).emit('quiz-ended');
        gameState.currentGame = null;
      }
    }, quiz.timeLimit * 1000 + 1000);
  });

  /**
   * Evento: Responder Quiz
   */
  socket.on('answer-quiz', (answerData) => {
    const user = usersData[socket.id];
    
    if (!user || gameState.currentGame !== 'quiz') return;

    // Verificar se resposta está correta
    const isCorrect = answerData.answerIndex === gameState.gameData.correctAnswer;

    if (isCorrect) {
      // Adicionar pontos
      usersData[socket.id].points += gameState.gameData.points;

      // Notificar para todos
      io.to(ROOM_NAME).emit('quiz-correct', {
        username: user.username,
        points: gameState.gameData.points
      });
    } else {
      // Notificar resposta incorreta
      io.to(ROOM_NAME).emit('quiz-incorrect', {
        username: user.username
      });
    }

    // Atualizar ranking
    io.to(ROOM_NAME).emit('update-ranking', getOnlineUsers());

    console.log(`📝 ${user.username} respondeu quiz: ${isCorrect ? 'CORRETO' : 'INCORRETO'}`);
  });

  /**
   * Evento: Término do Quiz
   */
  socket.on('end-quiz', () => {
    if (gameState.currentGame === 'quiz') {
      io.to(ROOM_NAME).emit('quiz-ended');
      gameState.currentGame = null;
    }
  });

  /**
   * Evento: Receber Áudio
   */
  socket.on('send-audio', (audioData) => {
    const user = usersData[socket.id];
    
    if (!user) return;

    const audioMessage = {
      username: user.username,
      avatar: user.avatar,
      audio: audioData.audio,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    io.to(ROOM_NAME).emit('receive-audio', audioMessage);
    console.log(`🎤 ${user.username} enviou mensagem de áudio`);
  });

  /**
   * Evento: Reação em Tempo Real
   */
  socket.on('send-reaction', (reactionData) => {
    const user = usersData[socket.id];
    
    if (!user) return;

    io.to(ROOM_NAME).emit('reaction-received', {
      username: user.username,
      reaction: reactionData.reaction,
      x: reactionData.x,
      y: reactionData.y
    });

    console.log(`💫 ${user.username} reagiu com ${reactionData.reaction}`);
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
  console.log(`\n🚀 CONEXÃO 4 - ULTIMATE iniciado!`);
  console.log(`📍 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`👥 Máximo de usuários: ${MAX_USERS}`);
  console.log(`🎯 Desafios disponíveis: ${CHALLENGES.length}`);
  console.log(`📝 Quizzes disponíveis: ${QUIZZES.length}\n`);
});
