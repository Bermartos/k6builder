import type { ParsedCollection, ParsedRequest } from '@/lib/postman'

function tokenize(command: string): string[] {
  const tokens: string[] = []
  let token = ''
  let quote: '"' | "'" | null = null
  let escaped = false

  for (const char of command.trim()) {
    if (escaped) {
      token += char
      escaped = false
    } else if (char === '\\' && quote !== "'") {
      escaped = true
    } else if (quote) {
      if (char === quote) quote = null
      else token += char
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (/\s/.test(char)) {
      if (token) {
        tokens.push(token)
        token = ''
      }
    } else {
      token += char
    }
  }
  if (escaped) token += '\\'
  if (token) tokens.push(token)
  return tokens
}

function commandsFrom(raw: string): string[] {
  return raw
    .replace(/\\\r?\n/g, ' ')
    .split(/(?=\bcurl\s)/i)
    .map((command) => command.trim())
    .filter((command) => /^curl(?:\s|$)/i.test(command))
}

function nextValue(tokens: string[], index: number): [string | undefined, number] {
  return [tokens[index + 1], index + 1]
}

function parseCommand(command: string, index: number): ParsedRequest {
  const tokens = tokenize(command)
  let method = ''
  let url = ''
  const headers: { key: string; value: string }[] = []
  const bodyParts: string[] = []
  let getRequest = false

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i]
    if (token === '-X' || token === '--request') {
      const [value, next] = nextValue(tokens, i)
      if (value) method = value.toUpperCase()
      i = next
    } else if (token === '-H' || token === '--header') {
      const [value, next] = nextValue(tokens, i)
      if (value) {
        const separator = value.indexOf(':')
        if (separator > 0) headers.push({ key: value.slice(0, separator).trim(), value: value.slice(separator + 1).trim() })
      }
      i = next
    } else if (['-d', '--data', '--data-raw', '--data-binary', '--data-urlencode'].includes(token)) {
      const [value, next] = nextValue(tokens, i)
      if (value) bodyParts.push(value)
      i = next
      if (!method) method = 'POST'
    } else if (token === '-G' || token === '--get') {
      getRequest = true
      method = 'GET'
    } else if (token === '--url') {
      const [value, next] = nextValue(tokens, i)
      if (value) url = value
      i = next
    } else if (!token.startsWith('-') && /^https?:\/\//i.test(token)) {
      url = token
    }
  }

  if (!url) throw new Error(`El comando cURL ${index + 1} no contiene una URL válida.`)
  if (!method) method = bodyParts.length && !getRequest ? 'POST' : 'GET'
  return {
    name: `${method} ${url}`,
    method,
    url,
    headers,
    body: bodyParts.length ? bodyParts.join('&') : null,
  }
}

export function parseCurl(raw: unknown): ParsedCollection {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('El archivo cURL está vacío.')
  const requests = commandsFrom(raw).map(parseCommand)
  if (!requests.length) throw new Error('No se encontró ningún comando cURL válido.')
  return { name: 'Comandos cURL importados', variables: {}, requests }
}
