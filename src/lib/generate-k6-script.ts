import { SAMPLE_COLLECTION, type ParsedCollection } from '@/lib/postman'

export type SourceType = 'postman' | 'swagger' | 'har' | 'curl'

export type BuilderConfig = {
  source: SourceType
  fileName: string | null
  vus: number
  rampUp: number
  duration: number
  checks200: boolean
  thinkTime: boolean
  authTokens: boolean
}

const SOURCE_LABEL: Record<SourceType, string> = {
  postman: 'Postman Collection',
  swagger: 'Swagger / OpenAPI',
  har: 'HAR (network capture)',
  curl: 'comando cURL',
}

const VAR_RE = /\{\{\s*([^}\s]+)\s*\}\}/g

// Convierte un valor de Postman ("{{baseUrl}}/users") en un template literal de
// JS (`${vars['baseUrl']}/users`) y registra las variables usadas.
function toTemplate(value: string, used: Set<string>): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
  const injected = escaped.replace(VAR_RE, (_, key: string) => {
    const name = key.trim()
    used.add(name)
    return '${vars[' + JSON.stringify(name) + ']}'
  })
  return '`' + injected + '`'
}

function indent(lines: string[], pad: string): string[] {
  return lines.map((l) => (l ? pad + l : l))
}

export function generateK6Script(config: BuilderConfig, collection?: ParsedCollection | null): string {
  const { vus, rampUp, duration, checks200, thinkTime, authTokens } = config
  const data = collection ?? SAMPLE_COLLECTION
  const steady = Math.max(duration - rampUp * 2, 0)
  const used = new Set<string>()

  // Imports dinámicos según opciones.
  const k6Named = ['group']
  if (checks200) k6Named.push('check')
  if (thinkTime) k6Named.push('sleep')

  const body: string[] = []

  data.requests.forEach((req, i) => {
    const hasBody = req.body != null && !['GET', 'HEAD'].includes(req.method)

    const headerPairs = req.headers.map(
      (h) => `      ${JSON.stringify(h.key)}: ${toTemplate(h.value, used)},`,
    )
    if (authTokens) headerPairs.push('      Authorization: `Bearer ${data.token}`,')

    const block: string[] = []
    block.push(`group(${JSON.stringify(req.name)}, function () {`)
    block.push('  const params = {')
    block.push('    headers: {')
    block.push(...headerPairs)
    block.push('    },')
    block.push('  };')
    block.push('')

    if (hasBody) {
      block.push(`  const payload = ${toTemplate(req.body as string, used)};`)
      block.push(`  const res = http.request(${JSON.stringify(req.method)}, ${toTemplate(req.url, used)}, payload, params);`)
    } else {
      block.push(`  const res = http.request(${JSON.stringify(req.method)}, ${toTemplate(req.url, used)}, null, params);`)
    }

    if (checks200) {
      block.push('  check(res, {')
      block.push("    'status es 2xx': (r) => r.status >= 200 && r.status < 300,")
      block.push("    'respuesta < 800ms': (r) => r.timings.duration < 800,")
      block.push('  });')
    }
    if (thinkTime) {
      block.push('')
      block.push('  sleep(Math.random() * 2 + 1); // think time del usuario')
    }
    block.push('});')

    body.push(...indent(block, '  '))
    if (i < data.requests.length - 1) body.push('')
  })

  // Bloque de variables: combina las de la colección con las referenciadas.
  const varKeys = new Set<string>([...Object.keys(data.variables), ...used])
  const varLines = [...varKeys].map((key) => {
    const value = data.variables[key] ?? ''
    return `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`
  })

  const lines: string[] = [
    '// Generado con k6 Script Builder',
    `// Fuente: ${SOURCE_LABEL[config.source]}${config.fileName ? ` (${config.fileName})` : ' (colección de ejemplo)'}`,
    `// Colección: ${data.name} · ${data.requests.length} solicitud(es)`,
    '',
    "import http from 'k6/http';",
    `import { ${k6Named.join(', ')} } from 'k6';`,
    '',
    '// Ajusta o sobreescribe estos valores con variables de entorno (--env / -e).',
    'const vars = {',
    ...(varLines.length ? varLines : ['  // sin variables detectadas']),
    '};',
    '',
    'export const options = {',
    '  stages: [',
    `    { duration: '${rampUp}s', target: ${vus} },`,
    `    { duration: '${steady}s', target: ${vus} },`,
    `    { duration: '${rampUp}s', target: 0 },`,
    '  ],',
    '  thresholds: {',
    "    http_req_failed: ['rate<0.01'],",
    "    http_req_duration: ['p(95)<800'],",
    '  },',
    '};',
  ]

  if (authTokens) {
    lines.push(
      '',
      'export function setup() {',
      "  const res = http.post(`${vars['baseUrl'] || __ENV.BASE_URL}/auth/login`, JSON.stringify({",
      '    username: __ENV.API_USER,',
      '    password: __ENV.API_PASSWORD,',
      "  }), { headers: { 'Content-Type': 'application/json' } });",
      '',
      "  return { token: res.json('access_token') };",
      '}',
    )
  }

  lines.push('', `export default function (${authTokens ? 'data' : ''}) {`, ...body, '}')

  return lines.join('\n')
}
