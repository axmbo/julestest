# Software Design Document (SDD)
## Jogo da Velha (Tic-Tac-Toe) PWA

### 1. Arquitetura Geral
O sistema será estruturado como um monorepo contendo projetos principais:
- `engine`: Regras do jogo e AI (código compartilhado).
- `client`: Aplicação Frontend (PWA).
- `server`: Servidor Backend para gerenciamento de partidas multiplayer.

A arquitetura seguirá uma abordagem de separação de responsabilidades (Client-Server), onde a lógica central é compartilhada no pacote local.

### 2. Stack Tecnológico

**Frontend (Client)**
- React.js + Vite + vite-plugin-pwa
- Estado gerenciado via React Hooks
- Testes: Vitest + Playwright

**Backend (Server)**
- Node.js + Express.js + Socket.io
- Testes: Vitest

### 3. Decisões de Design
- Engine isolada no workspace.
- Comunicação bidirecional Server-Client via Socket.io.
- Temas alternáveis via CSS variables em `:root`.
- TDD com 100% de cobertura no código núcleo.
