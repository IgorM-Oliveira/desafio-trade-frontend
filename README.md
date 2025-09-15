# Frontend — Campeonato (Angular)

Uma SPA (Single Page Application) em **Angular 20 + Material** para organizar e simular um campeonato eliminatório (quartas, semis, 3º lugar e final) consumindo a API do backend (Laravel).

> **Fluxo**: Login → Organize (criar/listar times, seleção de 8, seed) → Simular → Detalhe do torneio (chaveamento + standings) → Histórico.  
> Layout responsivo, standalone components, Signals e interceptador de token.

---

## 🔧 Stack & Decisões

- **Angular 20** com *standalone components* e **Signals**.
- **Angular Material** (Toolbar, Button, Card, Input, Checkbox, Icon, Progress Spinner, etc).
- **RxJS** para chamadas HTTP.
- **Roteamento** sem módulos: `/login`, `/organize`, `/tournaments/:id`, `/history`.
- **Token Interceptor**: anexa `Authorization: Bearer <token>` a todas as requisições.
- **Armazenamento do token**: `localStorage` (chave: `token`).

---

## 🚀 Começando

### Pré-requisitos
- **Node.js 18+ (recomendado 20+)**
- **npm 9+** (ou pnpm/yarn)
- Backend rodando (por padrão em `http://localhost` servindo `/api/...`).

### Instalação
```bash
# dentro da pasta do frontend
npm ci         # ou: npm install
```

### Ambiente
Configure a URL da API em `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: '' // string vazia = mesma origem (ex.: http://localhost:4200 → proxy/back mesmo host)
};
```
> Os services usam caminhos relativos (`/api/...`). Se o backend estiver em outra origem/porta, use:
> - URL completa no service, **ou**
> - um **proxy** do dev-server, **ou**
> - preencha `apiUrl` e concatene nos services.

### Rodando em desenvolvimento
```bash
npm start    # alias para: ng serve
# abre em http://localhost:4200
```

### Build de produção
```bash
npm run build        # gera dist/
# sirva como SPA (ver exemplos de deploy abaixo)
```

---

## 🔐 Autenticação

- **Login**: `POST /api/login` (retorna `{ token, user }`).
- Token salvo no `localStorage` e anexado pelo **TokenInterceptor**.
- `/login` faz *auto-redirect* para `/organize` se já existir token.
- Toolbar alterna **Login/Logout**; o logout limpa o token e redireciona.

> Credenciais padrão (exemplo): `admin@example.com` / `secret`.
