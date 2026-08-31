export type EditorFile = {
  path: string
  name: string
  content: string
}

export type EditorFolder = {
  name: string
  files: EditorFile[]
  folders?: EditorFolder[]
}

export const PROJECT_ROOT = 'k6-project'

const envJs = `// Configuración compartida del entorno de pruebas
export const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';

export const thresholds = {
  http_req_duration: ['p(95)<400'],
  http_req_failed: ['rate<0.01'],
};

export const headers = {
  'Content-Type': 'application/json',
};
`

const loginJs = `import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, headers } from '../env.js';

// Autentica al usuario virtual y devuelve el token Bearer
export function login(vu) {
  const payload = JSON.stringify({
    username: \`vu-\${vu}@example.com\`,
    password: 'super-secret',
  });

  const res = http.post(\`\${BASE_URL}/auth/login\`, payload, { headers });

  check(res, {
    'login: status 200': (r) => r.status === 200,
    'login: token presente': (r) => !!r.json('token'),
  });

  return res.json('token');
}
`

const checkoutJs = `import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, headers } from '../env.js';

// Simula el flujo de checkout autenticado con el token recibido
export function checkout(token) {
  const authHeaders = {
    ...headers,
    Authorization: \`Bearer \${token}\`,
  };

  const cart = http.post(
    \`\${BASE_URL}/cart\`,
    JSON.stringify({ items: [{ sku: 'K6-TSHIRT', qty: 1 }] }),
    { headers: authHeaders },
  );

  check(cart, { 'cart: status 201': (r) => r.status === 201 });
  sleep(Math.random() * 2);

  const order = http.post(\`\${BASE_URL}/checkout\`, null, { headers: authHeaders });

  check(order, { 'checkout: status 200': (r) => r.status === 200 });
}
`

const mainJs = `import { sleep } from 'k6';
import { thresholds } from './env.js';
import { login } from './requests/login.js';
import { checkout } from './requests/checkout.js';

// Perfil de carga: rampa, meseta y descenso
export const options = {
  thresholds,
  stages: [
    { duration: '30s', target: 50 },
    { duration: '4m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const token = login(__VU);
  checkout(token);
  sleep(1);
}
`

export const editorProject: EditorFolder = {
  name: PROJECT_ROOT,
  files: [
    { path: 'main.js', name: 'main.js', content: mainJs },
    { path: 'env.js', name: 'env.js', content: envJs },
  ],
  folders: [
    {
      name: 'requests',
      files: [
        { path: 'requests/login.js', name: 'login.js', content: loginJs },
        { path: 'requests/checkout.js', name: 'checkout.js', content: checkoutJs },
      ],
    },
  ],
}

export function findFile(path: string): EditorFile | undefined {
  const all = [...editorProject.files, ...(editorProject.folders?.flatMap((f) => f.files) ?? [])]
  return all.find((f) => f.path === path)
}
