# Script PowerShell para upload para GitHub
# Execute no PowerShell na pasta do projeto

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONEXAO 4 - UPLOAD PARA GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git está instalado
try {
    git --version | Out-Null
} catch {
    Write-Host "[ERRO] Git não está instalado!" -ForegroundColor Red
    Write-Host "Baixe em: https://git-scm.com/download" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "[1] Inicializando Git..." -ForegroundColor Yellow
git init
Write-Host "[OK] Git inicializado" -ForegroundColor Green

Write-Host ""
Write-Host "[2] Adicionando arquivos..." -ForegroundColor Yellow
git add .
Write-Host "[OK] Arquivos adicionados" -ForegroundColor Green

Write-Host ""
Write-Host "[3] Criando commit..." -ForegroundColor Yellow
git commit -m "Conexão 4 Premium - Upload inicial"
Write-Host "[OK] Commit criado" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMO PASSO - CRIAR REPOSITÓRIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Acesse: https://github.com/new" -ForegroundColor White
Write-Host "2. Preencha o formulário:" -ForegroundColor White
Write-Host "   - Repository name: conexao4-online" -ForegroundColor Gray
Write-Host "   - Visibility: Public" -ForegroundColor Gray
Write-Host "3. Clique em 'Create repository'" -ForegroundColor White
Write-Host "4. Copie o link do repositório" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "Cole aqui o link do seu repositório (ex: https://github.com/usuario/conexao4-online.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "[ERRO] Link vazio!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[4] Conectando ao repositório GitHub..." -ForegroundColor Yellow
git branch -M main
git remote add origin $repoUrl
Write-Host "[OK] Repositório conectado" -ForegroundColor Green

Write-Host ""
Write-Host "[5] Enviando para GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SUCESSO! ✅" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Seu código está no GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "PRÓXIMO PASSO - Deploy no Render:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://render.com" -ForegroundColor White
Write-Host "2. Faça login com GitHub" -ForegroundColor White
Write-Host "3. Clique em 'New +' → 'Web Service'" -ForegroundColor White
Write-Host "4. Conecte o repositório: conexao4-online" -ForegroundColor White
Write-Host "5. Clique 'Create Web Service'" -ForegroundColor White
Write-Host "6. Aguarde 2-3 minutos e pronto!" -ForegroundColor White
Write-Host ""

Read-Host "Pressione Enter para abrir o Render"
Start-Process "https://render.com"
