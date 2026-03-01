/**
 * CONEXÃO 4 - ULTIMATE
 * Chat avançado com Games, Áudio, Reações e muito mais!
 */

// ============================================
// SOCKET & DOM ELEMENTS
// ============================================

const socket = io();
let currentUser = null;
let selectedAvatar = '🔥';
let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];
let isRecording = false;

// DOM - Screens
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');

// DOM - Login
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const roomFullMessage = document.getElementById('room-full-message');

// DOM - Chat
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// DOM - Header
const userNameHeader = document.getElementById('user-name-header');
const userAvatarHeader = document.getElementById('user-avatar-header');
const btnLogout = document.getElementById('btn-logout');

// DOM - Sidebar
const onlineUsersList = document.getElementById('online-users');
const userCountElement = document.getElementById('user-count');
const lastChallengeDiv = document.getElementById('last-challenge');
const rankingList = document.getElementById('ranking-list');

// DOM - Games
const btnDrawChallenge = document.getElementById('btn-draw-challenge');
const btnQuiz = document.getElementById('btn-quiz');
const btnDuel = document.getElementById('btn-duel');
const btnRecord = document.getElementById('btn-record');
const btnChallengeBtn = document.querySelector('.btn-challenge-btn');

// DOM - Modals
const quizModal = document.getElementById('quiz-modal');
const duelModal = document.getElementById('duel-modal');
const challengeModal = document.getElementById('challenge-modal');
const quizClose = document.getElementById('quiz-close');

// ============================================
// AVATAR SELECTION
// ============================================

document.querySelectorAll('.avatar-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        selectedAvatar = this.getAttribute('data-avatar');
    });
});

document.querySelector('.avatar-option').classList.add('selected');

// ============================================
// LOGIN
// ============================================

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    
    if (!username || username.length < 2) {
        showLoginError('Por favor, digite um nome válido');
        return;
    }
    
    loginError.classList.remove('show');
    
    currentUser = { username, avatar: selectedAvatar };
    
    socket.emit('join-room', {
        username,
        avatar: selectedAvatar
    });
});

// ============================================
// SOCKET EVENTS
// ============================================

socket.on('connect', () => {
    console.log('✅ Conectado ao servidor');
    socket.emit('sync-data');
});

socket.on('users-list', (users) => {
    console.log('📋 Usuários:', users);
    updateUsersList(users);
    updateRanking(users);
    
    if (loginScreen.classList.contains('active') && currentUser) {
        enterChat();
    }
});

socket.on('room-full', (data) => {
    showRoomFullMessage(data.message);
    setTimeout(() => socket.disconnect(), 2000);
});

socket.on('room-stats', (stats) => {
    userCountElement.textContent = stats.onlineCount;
});

socket.on('receive-message', (message) => {
    addMessageToChat(message);
});

socket.on('system-message', (data) => {
    addSystemMessage(data.message);
});

socket.on('new-challenge', (data) => {
    displayChallenge(data);
});

socket.on('update-ranking', (users) => {
    updateRanking(users);
});

socket.on('quiz-started', (data) => {
    showQuizModal(data);
});

socket.on('quiz-correct', (data) => {
    showQuizResult(true, data);
});

socket.on('quiz-incorrect', (data) => {
    showQuizResult(false, data);
});

socket.on('quiz-ended', () => {
    closeQuizModal();
});

socket.on('duel-started', (data) => {
    showDuelModal(data);
});

socket.on('duel-winner', (data) => {
    const duelInfo = document.getElementById('duel-info');
    duelInfo.innerHTML = `<div style="color: #00b894; font-weight: bold; font-size: 1.2em;">🏆 ${data.avatar} ${data.username} venceu o duelo! (+${data.points} pts)</div>`;
    document.querySelectorAll('.duel-option').forEach(b => b.disabled = true);
    playConfetti();
    
    setTimeout(() => {
        closeDuelModal();
    }, 3000);
});

socket.on('duel-ended', () => {
    closeDuelModal();
});

socket.on('receive-audio', (data) => {
    console.log('🎤 Áudio recebido de:', data.username);
    addAudioMessage(data);
});

socket.on('reaction-received', (data) => {
    showFloatingReaction(data.reaction, data.x, data.y);
});

socket.on('disconnect', () => {
    console.log('Desconectado do servidor');
});

// ============================================
// CHAT FUNCTIONS
// ============================================

function enterChat() {
    userNameHeader.textContent = currentUser.username;
    userAvatarHeader.textContent = currentUser.avatar;
    
    loginScreen.classList.remove('active');
    chatScreen.classList.add('active');
    
    setTimeout(() => messageInput.focus(), 300);
}

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = messageInput.value.trim();
    if (!text) return;
    
    socket.emit('send-message', { text });
    messageInput.value = '';
    messageInput.focus();
});

function addMessageToChat(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.innerHTML = `
        <span class="message-avatar">${message.avatar}</span>
        <div class="message-content">
            <div class="message-header">
                <span class="message-username">${escapeHtml(message.username)}</span>
                <span class="message-time">${message.timestamp}</span>
            </div>
            <div class="message-text">${escapeHtml(message.text)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageEl);
    scrollToBottom();
}

function addSystemMessage(message) {
    const systemEl = document.createElement('div');
    systemEl.className = 'system-message';
    systemEl.textContent = message;
    
    messagesContainer.appendChild(systemEl);
    scrollToBottom();
    
    setTimeout(() => systemEl.remove(), 3000);
}

function addAudioMessage(data) {
    const audioEl = document.createElement('div');
    audioEl.className = 'audio-message';
    audioEl.innerHTML = `
        <span class="message-avatar">${data.avatar}</span>
        <div class="audio-player">
            <div style="flex: 1;">
                <div class="audio-message-header">
                    <span class="audio-message-username">${escapeHtml(data.username)}</span>
                    <span class="audio-message-time">${data.timestamp}</span>
                </div>
                <audio controls controlsList="nodownload" style="width: 100%; margin-top: 0.5rem;">
                    <source src="${data.audio}" type="audio/webm">
                    Seu navegador não suporta áudio.
                </audio>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(audioEl);
    scrollToBottom();
}

function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
}

// ============================================
// CHALLENGES
// ============================================

btnDrawChallenge.addEventListener('click', () => {
    socket.emit('draw-challenge');
    btnDrawChallenge.style.transform = 'scale(0.95)';
    setTimeout(() => { btnDrawChallenge.style.transform = 'scale(1)'; }, 100);
});

if (btnChallengeBtn) {
    btnChallengeBtn.addEventListener('click', () => {
        socket.emit('draw-challenge');
    });
}

function displayChallenge(data) {
    const challengeEl = document.createElement('div');
    challengeEl.className = 'challenge-display';
    challengeEl.innerHTML = `
        <div class="challenge-label">🎯 NOVO DESAFIO</div>
        <div class="challenge-text">${escapeHtml(data.challenge)}</div>
        <div class="challenge-drawn-by">Sorteado por ${escapeHtml(data.drawnBy)} • ${data.timestamp}</div>
    `;
    
    messagesContainer.appendChild(challengeEl);
    scrollToBottom();
    
    if (lastChallengeDiv) {
        lastChallengeDiv.innerHTML = `
            <p><strong>Último:</strong></p>
            <p>${escapeHtml(data.challenge)}</p>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">
                Por ${escapeHtml(data.drawnBy)}
            </p>
        `;
    }
}

// ============================================
// QUIZ
// ============================================

if (btnQuiz) {
    btnQuiz.addEventListener('click', () => {
        socket.emit('start-quiz');
    });
}

function showQuizModal(data) {
    const quizText = document.getElementById('quiz-text');
    const quizOptions = document.getElementById('quiz-options');
    
    quizText.textContent = data.question;
    quizOptions.innerHTML = '';
    
    data.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.addEventListener('click', () => {
            socket.emit('answer-quiz', { answerIndex: index });
            quizOptions.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
        });
        quizOptions.appendChild(btn);
    });
    
    startQuizTimer(data.timeLimit);
    quizModal.classList.add('active');
}

function startQuizTimer(seconds) {
    let remaining = seconds;
    const timerText = document.getElementById('timer-text');
    
    const interval = setInterval(() => {
        remaining--;
        timerText.textContent = remaining;
        
        if (remaining <= 0) {
            clearInterval(interval);
            socket.emit('end-quiz');
        }
    }, 1000);
}

function showQuizResult(isCorrect, data) {
    const result = document.getElementById('quiz-result');
    result.className = 'quiz-result ' + (isCorrect ? 'correct' : 'incorrect');
    result.textContent = isCorrect ? `✅ ${data.username} acertou!` : `❌ ${data.username} errou!`;
    result.style.display = 'block';
    
    if (isCorrect) {
        playConfetti();
    }
}

function closeQuizModal() {
    quizModal.classList.remove('active');
    document.getElementById('quiz-result').style.display = 'none';
}

if (quizClose) {
    quizClose.addEventListener('click', closeQuizModal);
}

// ============================================
// DUELO
// ============================================

if (btnDuel) {
    btnDuel.addEventListener('click', () => {
        socket.emit('start-duel');
    });
}

function showDuelModal(data) {
    const duelInfo = document.getElementById('duel-info');
    const duelQuestion = document.getElementById('duel-question');
    
    duelInfo.textContent = `Duelo iniciado por: ${data.initiatedBy}`;
    duelQuestion.innerHTML = `
        <div class="duel-question-text">${data.question}</div>
        <div class="duel-options">
    `;
    
    data.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'duel-option';
        btn.textContent = option;
        btn.addEventListener('click', () => {
            socket.emit('answer-duel', { answerIndex: index });
            document.querySelectorAll('.duel-option').forEach(b => b.disabled = true);
        });
        duelQuestion.querySelector('.duel-options').appendChild(btn);
    });
    
    startDuelTimer(data.timeLimit);
    duelModal.classList.add('active');
}

function startDuelTimer(seconds) {
    let remaining = seconds;
    const timerText = document.getElementById('duel-timer-text');
    
    const interval = setInterval(() => {
        remaining--;
        timerText.textContent = remaining;
        
        if (remaining <= 0) {
            clearInterval(interval);
            socket.emit('end-duel');
        }
    }, 1000);
}

function closeDuelModal() {
    duelModal.classList.remove('active');
}

// ============================================
// AUDIO RECORDING
// ============================================

if (btnRecord) {
    btnRecord.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(mediaStream);
                audioChunks = [];
                
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        socket.emit('send-audio', { audio: reader.result });
                        
                        // Parar todas as tracks do stream
                        mediaStream.getTracks().forEach(track => track.stop());
                        
                        btnRecord.classList.remove('recording');
                        const recordStatus = btnRecord.querySelector('#record-status');
                        if (recordStatus) recordStatus.textContent = '🎤 Gravar';
                        isRecording = false;
                    };
                    reader.readAsDataURL(audioBlob);
                };
                
                mediaRecorder.start();
                isRecording = true;
                btnRecord.classList.add('recording');
                const recordStatus = btnRecord.querySelector('#record-status');
                if (recordStatus) recordStatus.textContent = '⏹️ Parar';
            } catch (err) {
                console.error('Erro ao acessar microfone:', err);
                alert('Microfone não disponível ou permissão negada');
            }
        } else if (mediaRecorder) {
            mediaRecorder.stop();
        }
    });
}

// ============================================
// REACTIONS
// ============================================

document.querySelectorAll('.btn-reaction').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const reaction = btn.getAttribute('data-reaction');
        const x = e.clientX;
        const y = e.clientY;
        
        socket.emit('send-reaction', { reaction, x, y });
        showFloatingReaction(reaction, x, y);
    });
});

function showFloatingReaction(reaction, x, y) {
    const floatingReaction = document.createElement('div');
    floatingReaction.className = 'floating-reaction';
    floatingReaction.textContent = reaction;
    floatingReaction.style.left = x + 'px';
    floatingReaction.style.top = y + 'px';
    
    document.body.appendChild(floatingReaction);
    
    setTimeout(() => floatingReaction.remove(), 2000);
}

// ============================================
// RANKING
// ============================================

function updateRanking(users) {
    rankingList.innerHTML = '';
    
    const sorted = [...users].sort((a, b) => b.points - a.points);
    
    if (sorted.length === 0) {
        rankingList.innerHTML = '<p class="placeholder">Sem usuários</p>';
        return;
    }
    
    sorted.forEach((user, index) => {
        const ranking = index + 1;
        let medal = '';
        let positionClass = '';
        
        if (ranking === 1) {
            medal = '🥇';
            positionClass = 'gold';
        } else if (ranking === 2) {
            medal = '🥈';
            positionClass = 'silver';
        } else if (ranking === 3) {
            medal = '🥉';
            positionClass = 'bronze';
        }
        
        const rankingItemEl = document.createElement('div');
        rankingItemEl.className = 'ranking-item';
        rankingItemEl.innerHTML = `
            <div class="ranking-position ${positionClass}">${medal || ranking}</div>
            <div class="ranking-info">
                <div class="ranking-name">${user.avatar} ${escapeHtml(user.username)}</div>
            </div>
            <div class="ranking-points">${user.points} pts</div>
        `;
        
        rankingList.appendChild(rankingItemEl);
    });
}

// ============================================
// USERS LIST
// ============================================

function updateUsersList(users) {
    onlineUsersList.innerHTML = '';
    
    if (users.length === 0) {
        onlineUsersList.innerHTML = '<p class="placeholder">Nenhum usuário</p>';
        return;
    }
    
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'user-item';
        userEl.innerHTML = `
            <span class="user-item-avatar">${user.avatar}</span>
            <span class="user-item-name">${escapeHtml(user.username)}</span>
            <span class="user-item-points">${user.points}pts</span>
        `;
        
        onlineUsersList.appendChild(userEl);
    });
}

// ============================================
// LOGOUT
// ============================================

btnLogout.addEventListener('click', () => {
    if (confirm('Desconectar da sala?')) {
        socket.disconnect();
        
        currentUser = null;
        chatScreen.classList.remove('active');
        loginScreen.classList.add('active');
        
        document.getElementById('username').value = '';
        messageInput.value = '';
        messagesContainer.innerHTML = '<div class="welcome-message"><h3>Bem-vindo ao Conexão 4</h3><p>Aproveite o chat com seus amigos!</p></div>';
        
        socket.connect();
    }
});

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 5000);
}

function showRoomFullMessage(message) {
    roomFullMessage.textContent = '❌ ' + message;
    roomFullMessage.classList.add('show');
    loginError.classList.remove('show');
}

// ============================================
// VISUAL EFFECTS
// ============================================

function playConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = ['#6c5ce7', '#fd79a8', '#00b894', '#00d4ff'][Math.floor(Math.random() * 4)];
        confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s ease-in forwards`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// ============================================
// PAGE INTERACTIVITY
// ============================================

if (window.innerWidth < 768) {
    document.getElementById('username').style.fontSize = '16px';
    messageInput.style.fontSize = '16px';
}

messageInput.addEventListener('keydown', (e) => {
    const isMobile = window.innerWidth < 768;
    
    if (e.key === 'Enter') {
        if (isMobile && !e.shiftKey) return;
        
        if (!isMobile || e.shiftKey) {
            e.preventDefault();
            messageForm.dispatchEvent(new Event('submit'));
        }
    }
});

window.addEventListener('focus', () => {
    document.title = 'Conexão 4 Ultimate';
});

window.addEventListener('beforeunload', () => {
    socket.emit('disconnect');
});

if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

console.log('✅ Script ULTIMATE carregado!');
