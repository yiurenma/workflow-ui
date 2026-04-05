# workflow-ui

Workflow editor UI (**React**, **TypeScript**, **Vite**, Ant Design, TanStack Router). It talks to **[workflow-operation-api](https://github.com/yiurenma/workflow-operation-api)** for management CRUD (workflows, entity settings). Optional calls to **[workflow-online-api](https://github.com/yiurenma/workflow-online-api)** use the same base-URL pattern.

Canonical repository: [yiurenma/workflow-ui](https://github.com/yiurenma/workflow-ui).

## Quick start

**Requirements:** Node.js 22+ (or current LTS), npm

```bash
npm install
npm run dev
```

Dev server defaults to the URL printed by Vite (typically `http://localhost:5173`).

Other scripts: `npm run build`, `npm run typecheck`, `npm run lint`.

## API bases and local dev

[`src/api/config.ts`](src/api/config.ts) resolves:

| Env variable | When unset (default) | Purpose |
|--------------|----------------------|---------|
| `VITE_OPERATION_API_BASE` | `/api/proxy/operation` | Management API (`/workflow`, `/workflow/entity-setting`, …) |
| `VITE_ONLINE_API_BASE` | `/api/proxy/online` | Online ingress (`POST /workflow`, …) |

[`vite.config.ts`](vite.config.ts) proxies those paths to the **Render** deployment URLs in development. To hit **local** Spring Boot instances instead, set full bases (include `/api` — paths in code are like `/workflow?…`):

```bash
# Example: Operation on 8080, Online on 8081 (see workflow-operation-api README for port split)
VITE_OPERATION_API_BASE=http://localhost:8080/api
VITE_ONLINE_API_BASE=http://localhost:8081/api
npm run dev
```

| Env variable | Purpose |
|--------------|---------|
| `VITE_USE_MOCK` | Set to `0` to disable the mock dev server (`vite-plugin-mock-dev-server`); default mock is on in development. |

OpenAPI for the management API lives on the Operation service: `GET /v3/api-docs` (e.g. `http://localhost:8080/v3/api-docs`).

## Related repositories

| Repository | Role |
|------------|------|
| [workflow-operation-api](https://github.com/yiurenma/workflow-operation-api) | Control plane REST + shared DB definitions |
| [workflow-online-api](https://github.com/yiurenma/workflow-online-api) | `POST /api/workflow` ingress + pipeline |

---

This project started from the Vite React TS template. Original template notes:

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc/README.md) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
