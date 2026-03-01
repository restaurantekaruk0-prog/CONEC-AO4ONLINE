# 🚀 Conexão 4 - Premium

Um chat em tempo real moderno e elegante para até 4 pessoas, com desafios sincronizados e sistema de pontuação.

## ✨ Características

- ✅ **Chat em Tempo Real**: Comunicação instantânea com Socket.io
- ✅ **Limite de Usuários**: Máximo 4 pessoas na sala
- ✅ **Avatares Personalizados**: 🔥 💘 🌙 ⭐
- ✅ **Sistema de Desafios**: Desafios aleatórios sincronizados
- ✅ **Ranking ao Vivo**: Pontuação atualizada em tempo real
- ✅ **Design Moderno**: Interface elegante com animações suaves
- ✅ **Responsivo**: Funciona perfeitamente em celular, tablet e desktop
- ✅ **Mensagens de Sistema**: Notificações automáticas de entrada/saída
- ✅ **Scroll Automático**: Acompanhamento automático das mensagens

## 📋 Requisitos

- **Node.js** v14+ (https://nodejs.org/)
- **npm** (incluído no Node.js)

## 🛠️ Instalação

### 1. Navegar até a pasta do projeto
```bash
cd conexao4-online
```

### 2. Instalar dependências
```bash
npm install
```

Isso vai instalar:
- **express**: Framework web
- **socket.io**: Comunicação em tempo real
- **nodemon**: Auto-reload durante desenvolvimento (opcional)

## ▶️ Como Executar

### Modo Produção
```bash
npm start
```

### Modo Desenvolvimento (com auto-reload)
```bash
npm run dev
```

O servidor será iniciado em **http://localhost:3000**

Abra no seu navegador e convide amigos para entrar!

## 🎮 Como Usar

### 1. **Login**
- Digite seu nome (máximo 20 caracteres)
- Escolha um dos 4 avatares disponíveis
- Clique em "Entrar na Sala"

### 2. **Chat**
- Veja a lista de usuários online na barra lateral
- Envie mensagens em tempo real
- Mensagens de sistema notificam entradas e saídas

### 3. **Desafios**
- Clique em "Sortear Desafio"
- Todos recebem o mesmo desafio simultaneamente
- Você ganha 1 ponto por desafio sorteado
- O desafio fica exibido na sidebar

### 4. **Ranking**
- Veja a classificação em tempo real
- 🥇 Ouro, 🥈 Prata, 🥉 Bronze para os 3 primeiros
- Pontuação atualizada automaticamente

## 📁 Estrutura do Projeto

```
conexao4-online/
│
├── server.js              # Servidor Node.js + Express + Socket.io
├── package.json           # Dependências do projeto
│
└── public/                # Arquivos estáticos
    ├── index.html         # Interface HTML
    ├── style.css          # Estilos CSS (design moderno)
    └── script.js          # Lógica frontend com Socket.io
```

## 🎨 Design & Interface

### Cores Principais
- **Primária**: Roxo vibrante (#6c5ce7)
- **Secundária**: Verde limão (#00b894)
- **Acentuação**: Rosa (#fd79a8)
- **Background**: Gradiente dark (#0a0e27 → #1a1f3a)

### Animações
- ✨ Fade-in ao trocar telas
- 🌟 Glow contínuo nos botões
- 🎯 Pop animation nos desafios
- 💬 Slide-in nas mensagens
- 🌙 Pulse nos avatares dos usuários

### Responsividade
- **Desktop (1200px+)**: Layout com 3 colunas
- **Tablet (900px-1200px)**: Layout ajustado
- **Mobile (<768px)**: Layout em coluna única, sidebars Hidden
- **Smartphone (<480px)**: Interface compacta e otimizada

## 🔧 Configuração

### Mudar a Porta
Edite a variável de ambiente:
```bash
PORT=5000 npm start
```

### Adicionar Mais Desafios
Edite o array `CHALLENGES` em `server.js`:
```javascript
const CHALLENGES = [
    '🎤 Novo desafio aqui',
    // ... mais desafios
];
```

### Alterar Limite de Usuários
Em `server.js`, mude:
```javascript
const MAX_USERS = 4; // Altere para o número desejado
```

## 📡 Comunicação Socket.io

### Eventos Server → Client
- `users-list`: Lista de usuários atualizada
- `receive-message`: Nova mensagem
- `system-message`: Mensagem de sistema
- `new-challenge`: Novo desafio sorteado
- `update-ranking`: Ranking atualizado
- `room-stats`: Estatísticas da sala
- `room-full`: Sala cheia (conexão rejeitada)

### Eventos Client → Server
- `join-room`: Usuário entra na sala
- `send-message`: Enviar mensagem
- `draw-challenge`: Sortear desafio
- `sync-data`: Sincronizar dados ao reconectar

## 🛡️ Segurança

- ✅ Sanitização de entrada HTML (previne XSS)
- ✅ Limite de comprimento em inputs
- ✅ Validação de dados no servidor
- ✅ CORS configurado

## 💡 Funcionalidades Extras

- 🔔 Notificações do navegador (com permissão)
- 📱 Suporte completo a touch events em mobile
- ⌨️ Keyboard shortcuts (Enter para enviar)
- 🔄 Auto-reconnect em caso de desconexão
- 📊 Sincronização automática de dados

## 🐛 Troubleshooting

### "Porta 3000 já está em uso"
```bash
PORT=3001 npm start
```

### "Socket.io não carrega"
Certifique-se de que o servidor está rodando

### "Sala cheia"
A sala permite apenas 4 usuários. Espere alguém sair.

## 📝 Licença

MIT - Livre para usar comercialmente

## 👨‍💻 Autor

Criado com ❤️ para chat em tempo real

## 📞 Suporte

Para problemas, verifique:
1. Node.js está instalado: `node --version`
2. npm está instalado: `npm --version`
3. Porta 3000 está disponível
4. JavaScript está ativado no navegador

---

## 🚀 Deploy no Render (Hospedagem Gratuita)

Para hospedar sua aplicação online GRÁTIS no Render:

1. **Suba seu código para GitHub**
2. **Acesse https://render.com**
3. **Conecte seu repositório**
4. **Configure conforme [GUIA_RENDER.md](GUIA_RENDER.md)**

Sua app estará online em minutos! 🌍

Leia o guia completo em [GUIA_RENDER.md](GUIA_RENDER.md)

---

**Divirta-se conversando! 🎉**
