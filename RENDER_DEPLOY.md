# Render Configuration for Conexão 4 - Premium

# Deploy no Render
O Render.com oferece hospedagem gratuita para aplicações Node.js com Socket.io.

## Passo a Passo para Deploy

### 1. Prepare o Repositório GitHub
```bash
# No seu computador, crie um repositório Git
git init
git add .
git commit -m "Initial commit - Conexão 4 Premium"

# Suba para GitHub
git remote add origin https://github.com/seu-usuario/conexao4-online.git
git branch -M main
git push -u origin main
```

### 2. Crie uma Conta no Render
- Acesse https://render.com
- Clique em "Sign up"
- Use sua conta GitHub

### 3. Crie um Novo Serviço Web
1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `conexao4-online`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou Pro se quiser)

### 4. Deploy
- Clique em **"Deploy"**
- Espere o build completar (2-3 minutos)
- Seu app estará disponível em: `https://seu-nome.onrender.com`

---

## Configurações Importantes

### Variáveis de Ambiente (não necessárias, mas opcionais)
Se quiser adicionar variáveis, na tela de configuração do Render:
- Clique em **"Enviroment"**
- Adicione suas variáveis

Você pode deixar vazio, pois usamos padrões sensatos.

### CORS Automático
O servidor já está configurado para aceitar requisições de qualquer origem (útil para desenvolvimento).

Para produção mais segura, edite em `server.js`:
```javascript
const io = socketIo(server, {
  cors: {
    origin: "https://seu-dominio.onrender.com",
    methods: ["GET", "POST"]
  }
});
```

---

## Atualizações Futuras

Após fazer mudanças localmente:
```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

O Render fará auto-deploy automaticamente!

---

## Solução de Problemas

### "Build failed"
- Verifique se `package.json` está correto
- Certifique-se que `npm install` funciona localmente

### "Socket.io não conecta"
- Aguarde 1 minuto após o deploy (estabilização)
- Recarregue a página (hard refresh: Ctrl+Shift+R)
- Verifique CORS se tiver domínio customizado

### Servidor muito lento
- Plano Free do Render coloca app em "sleep" após 15 min de inatividade
- Faça upgrade para plano pago para sempre-online

---

## URL Após Deploy

Sua aplicação estará em:
```
https://seu-nome.onrender.com
```

Compartilhe com amigos para experimentarem! 🎉
