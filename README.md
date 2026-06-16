# Tic-Tac-Toe PWA

Um jogo da velha responsivo em Progressive Web App (PWA) construído com um monorepo usando npm workspaces, Vite, React.js e Socket.IO.

## Estrutura do Monorepo

- `engine`: Lógica compartilhada do jogo, com algoritmo Minimax.
- `client`: Aplicação React/Vite responsável pelo frontend do PWA, gestão de temas e E2E tests.
- `server`: API e Servidor WebSocket construído com Express e Socket.io, para pareamento aleatório e via código.

## Documentação Completa
Veja as documentações nos arquivos abaixo para detalhes e decisões arquiteturais:
- PRD.md
- SDD.md

## Como Rodar Localmente

1. Na raiz do repositório, instale todas as dependências:
   ```bash
   npm install
   ```

2. Compile os projetos (essencial para que o client/server acessem o `engine`):
   ```bash
   npm run build --workspaces
   ```

3. Inicie o Servidor:
   ```bash
   cd server
   npm run dev \&
   ```

4. Em outro terminal, inicie o Cliente:
   ```bash
   cd client
   npm run dev \&
   ```

Acesse o cliente pelo navegador na URL padrão informada no terminal do Vite (ex: `http://localhost:5173`).

## Como rodar os Testes (TDD e E2E)

**Testes Unitários:** O projeto inteiro possui ~100% de cobertura nos testes de core logic usando o vitest. Rode-os na raiz do monorepo:
```bash
npm test
```

**Testes End-to-End (E2E):** O `client` possui fluxos de testes de interação utilizando o Playwright. Para executá-los, acesse a raiz de `/client` (certifique-se de que nada esteja ocupando a porta 5173 e 4173):
```bash
cd client
npx playwright test e2e/game.spec.ts
```
