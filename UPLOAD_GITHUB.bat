@echo off
REM Script para fazer upload do projeto para GitHub
REM Execute este arquivo na pasta do projeto

echo.
echo ========================================
echo   CONEXAO 4 - UPLOAD PARA GITHUB
echo ========================================
echo.

REM Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Git não está instalado!
    echo Baixe em: https://git-scm.com/download
    pause
    exit /b 1
)

echo [1] Configurando Git...
git init
echo [OK] Git inicializado

echo.
echo [2] Adicionando arquivos...
git add .
echo [OK] Arquivos adicionados

echo.
echo [3] Criando commit...
git commit -m "Conexão 4 Premium - Deploy inicial"
echo [OK] Commit criado

echo.
echo ========================================
echo   PRÓXIMO PASSO
echo ========================================
echo.
echo 1. Acesse: https://github.com/new
echo 2. Crie um repositório chamado: conexao4-online
echo 3. Copie o link do repositório (ex: https://github.com/seu-usuario/conexao4-online.git)
echo.

set /p REPO_URL="Cole aqui o link do seu repositório: "

echo.
echo [4] Conectando ao repositório GitHub...
git branch -M main
git remote add origin %REPO_URL%
echo [OK] Repositório conectado

echo.
echo [5] Enviando para GitHub...
git push -u origin main

echo.
echo ========================================
echo   SUCESSO!
echo ========================================
echo.
echo Seu código está no GitHub!
echo.
echo Próximo passo:
echo 1. Acesse: https://render.com
echo 2. Faça login com GitHub
echo 3. Clique em "New +" e selecione "Web Service"
echo 4. Conecte seu repositório conexao4-online
echo 5. Deploy automático!
echo.
pause
