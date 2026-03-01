/**
 * CONEXÃO 4 - PREMIUM
 * Script Frontend com Socket.io
 */

// ============================================
// CONFIGURAÇÃO INICIAL
// ============================================

const socket = io();
let currentUser = null;
let selectedAvatar = '🔥';

// Elementos do DOM
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const loginForm = document.getElementById('login-form');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages-container');
const onlineUsersList = document.getElementById('online-users');
const rankingList = document.getElementById('ranking-list');
const userCountElement = document.getElementById('user-count');
const userNameHeader = document.getElementById('user-name-header');
const userAvatarHeader = document.getElementById('user-avatar-header');
const lastChallengeDiv = document.getElementById('last-challenge');
const btnDrawChallenge = document.getElementById('btn-draw-challenge');
const btnLogout = document.getElementById('btn-logout');
const loginError = document.getElementById('login-error');
const roomFullMessage = document.getElementById('room-full-message');

// ============================================
// SELEÇÃO DE AVATAR
// ============================================

document.querySelectorAll('.avatar-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove seleção anterior
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Seleciona novo avatar
        this.classList.add('selected');
        selectedAvatar = this.getAttribute('data-avatar');
    });
});

// Pre-selecionar primeiro avatar
document.querySelector('.avatar-option').classList.add('selected');

// ============================================
// SUBMISSÃO DO LOGIN
// ============================================

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    
    if (!username || username.length < 2) {
        showLoginError('Por favor, digite um nome válido');
        return;
    }
    
    // Limpar erro
    loginError.classList.remove('show');
    
    // Definir usuário atual
    currentUser = {
        username,
        avatar: selectedAvatar
    };
    
    // Enviar dados para servidor
    socket.emit('join-room', {
        username,
        avatar: selectedAvatar
    });
});

// ============================================
// TRATAMENTO DE ENTRADA NA SALA
// ============================================

socket.on('connect', () => {
    console.log('✅ Conectado ao servidor');
    socket.emit('sync-data');
});

socket.on('sync-response', (data) => {
    // Sincronizar dados ao reconectar
    if (data.users && data.users.length > 0) {
        updateUsersList(data.users);
    }
});

socket.on('room-full', (data) => {
    console.log('❌ Sala cheia:', data.message);
    showRoomFullMessage(data.message);
    setTimeout(() => {
        socket.disconnect();
    }, 2000);
});

// ============================================
// ALTERNAR ENTRE TELAS
// ============================================

socket.on('connect', () => {
    console.log('Conectado ao servidor');
});

// Implementar lógica de entrada na sala no cliente
socket.on('users-list', (users) => {
    console.log('📋 Lista de usuários atualizada:', users);
    
    // Se estamos na tela de login e recebemos uma lista de usuários, entrar no chat
    if (loginScreen.classList.contains('active') && currentUser) {
        enterChat();
    }
    
    updateUsersList(users);
});

// Monitorar quando encerramos a conexão com a sala cheia
socket.on('disconnect', () => {
    console.log('Desconectado do servidor');
});

/**
 * Transição para tela de chat
 */
function enterChat() {
    // Atualizar header
    userNameHeader.textContent = currentUser.username;
    userAvatarHeader.textContent = currentUser.avatar;
    
    // Trocar telas
    loginScreen.classList.remove('active');
    chatScreen.classList.add('active');
    
    // Focar input
    setTimeout(() => {
        messageInput.focus();
    }, 300);
}

// ============================================
// CHAT EM TEMPO REAL
// ============================================

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = messageInput.value.trim();
    
    if (!text) return;
    
    // Enviar mensagem
    socket.emit('send-message', { text });
    
    // Limpar input
    messageInput.value = '';
    messageInput.focus();
});

/**
 * Receber mensagens do servidor
 */
socket.on('receive-message', (message) => {
    addMessageToChat(message);
});

/**
 * Receber mensagens de sistema
 */
socket.on('system-message', (data) => {
    addSystemMessage(data.message);
});

/**
 * Adicionar mensagem ao chat
 */
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

/**
 * Adicionar mensagem de sistema
 */
function addSystemMessage(message) {
    const systemEl = document.createElement('div');
    systemEl.className = 'system-message';
    systemEl.textContent = message;
    
    messagesContainer.appendChild(systemEl);
    scrollToBottom();
    
    // Remover após animação
    setTimeout(() => {
        systemEl.remove();
    }, 3000);
}

/**
 * Scroll automático até o final
 */
function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
}

// ============================================
// DESAFIOS
// ============================================

btnDrawChallenge.addEventListener('click', () => {
    socket.emit('draw-challenge');
    
    // Animação no botão
    btnDrawChallenge.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btnDrawChallenge.style.transform = 'scale(1)';
    }, 100);
});

/**
 * Receber novo desafio
 */
socket.on('new-challenge', (data) => {
    displayChallenge(data);
    scrollToBottom();
});

/**
 * Exibir desafio na tela
 */
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
    
    // Atualizar último desafio na sidebar
    lastChallengeDiv.innerHTML = `
        <p><strong>Último:</strong></p>
        <p>${escapeHtml(data.challenge)}</p>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">
            Por ${escapeHtml(data.drawnBy)}
        </p>
    `;
}

// ============================================
// RANKING E PONTUAÇÃO
// ============================================

socket.on('update-ranking', (users) => {
    updateRanking(users);
});

/**
 * Atualizar ranking
 */
function updateRanking(users) {
    rankingList.innerHTML = '';
    
    // Ordenar por pontos
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
// LISTA DE USUÁRIOS ONLINE
// ============================================

socket.on('users-list', (users) => {
    updateUsersList(users);
    updateRanking(users);
});

/**
 * Atualizar lista de usuários online
 */
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

/**
 * Atualizar estatísticas da sala
 */
socket.on('room-stats', (stats) => {
    userCountElement.textContent = stats.onlineCount;
});

// ============================================
// BOTÃO SAIR
// ============================================

btnLogout.addEventListener('click', () => {
    if (confirm('Desconectar da sala?')) {
        // Desconectar do socket
        socket.disconnect();
        
        // Voltar à tela de login
        currentUser = null;
        chatScreen.classList.remove('active');
        loginScreen.classList.add('active');
        
        // Limpar formulário
        document.getElementById('username').value = '';
        document.getElementById('message-input').value = '';
        messagesContainer.innerHTML = '<div class="welcome-message"><h3>Bem-vindo ao Conexão 4</h3><p>Aproveite o chat com seus amigos!</p></div>';
        
        // Reconectar socket
        socket.connect();
    }
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

/**
 * Exibir erro de login
 */
function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    
    // Remover após 5 segundos
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 5000);
}

/**
 * Exibir mensagem de sala cheia
 */
function showRoomFullMessage(message) {
    roomFullMessage.textContent = '❌ ' + message;
    roomFullMessage.classList.add('show');
    
    loginError.classList.remove('show');
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Escapar HTML para prevenir XSS
 */
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

// ============================================
// AJUSTES PARA MOBILE
// ============================================

// Ajustar tamanho da font do input para evitar zoom no iOS
if (window.innerWidth < 768) {
    messageInput.style.fontSize = '16px';
    document.getElementById('username').style.fontSize = '16px';
}

// ============================================
// USAR ENTER PARA ENVIAR (DESKTOP) E SHIFT+ENTER (MOBILE)
// ============================================

messageInput.addEventListener('keydown', (e) => {
    const isMobile = window.innerWidth < 768;
    
    if (e.key === 'Enter') {
        if (isMobile && !e.shiftKey) {
            // Em mobile, permitir nova linha normal
            return;
        }
        
        if (!isMobile || e.shiftKey) {
            // Em desktop: enviar com Enter
            // Em mobile: enviar com Shift+Enter
            e.preventDefault();
            messageForm.dispatchEvent(new Event('submit'));
        }
    }
});

// ============================================
// NOTIFICAÇÃO DE NOVA MENSAGEM
// ============================================

let isPageFocused = true;

window.addEventListener('focus', () => {
    isPageFocused = true;
});

window.addEventListener('blur', () => {
    isPageFocused = false;
});

socket.on('receive-message', (message) => {
    if (!isPageFocused && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${message.username} disse:`, {
            body: message.text,
            icon: message.avatar
        });
    }
});

// Solicitar permissão de notificação
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// ============================================
// EVENT LISTENERS ADICIONAIS
// ============================================

// Fechar conexão logicamente quando sair da página
window.addEventListener('beforeunload', () => {
    socket.emit('disconnect');
});

// Sincronizar dados ao reconectar
socket.on('reconnect', () => {
    console.log('Reconectado ao servidor');
    socket.emit('sync-data');
});

socket.on('reconnect_error', (error) => {
    console.error('Erro ao reconectar:', error);
});

console.log('✅ Script do frontend carregado');
