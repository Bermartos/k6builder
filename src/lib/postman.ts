// Parser de colecciones de Postman v2.1 -> estructura intermedia neutra
// que luego consume el generador de k6.

export type ParsedRequest = {
  name: string
  method: string
  url: string
  headers: { key: string; value: string }[]
  body: string | null
}

export type ParsedCollection = {
  name: string
  variables: Record<string, string>
  requests: ParsedRequest[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractUrl(url: any): string {
  if (!url) return ''
  if (typeof url === 'string') return url
  if (typeof url.raw === 'string' && url.raw) return url.raw

  const protocol = url.protocol ? `${url.protocol}://` : ''
  const host = Array.isArray(url.host) ? url.host.join('.') : url.host || ''
  const path = Array.isArray(url.path) ? url.path.join('/') : url.path || ''
  let out = `${protocol}${host}${path ? `/${path}` : ''}`

  if (Array.isArray(url.query) && url.query.length) {
    const query = url.query
      .filter((q: any) => q && !q.disabled && q.key)
      .map((q: any) => `${q.key}=${q.value ?? ''}`)
      .join('&')
    if (query) out += `?${query}`
  }
  return out
}

function extractHeaders(header: any): { key: string; value: string }[] {
  if (!Array.isArray(header)) return []
  return header
    .filter((h: any) => h && !h.disabled && h.key)
    .map((h: any) => ({ key: String(h.key), value: String(h.value ?? '') }))
}

function extractBody(body: any): string | null {
  if (!body || typeof body !== 'object') return null

  if (body.mode === 'raw' && typeof body.raw === 'string' && body.raw.trim()) {
    return body.raw
  }
  if (body.mode === 'urlencoded' && Array.isArray(body.urlencoded)) {
    const entries = body.urlencoded
      .filter((p: any) => p && !p.disabled && p.key)
      .map((p: any) => [String(p.key), String(p.value ?? '')])
    if (entries.length) return JSON.stringify(Object.fromEntries(entries), null, 2)
  }
  if (body.mode === 'formdata' && Array.isArray(body.formdata)) {
    const entries = body.formdata
      .filter((p: any) => p && !p.disabled && p.type !== 'file' && p.key)
      .map((p: any) => [String(p.key), String(p.value ?? '')])
    if (entries.length) return JSON.stringify(Object.fromEntries(entries), null, 2)
  }
  return null
}

function walk(items: any[], out: ParsedRequest[]) {
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    // Carpeta: contiene sub-items -> recorrer en profundidad.
    if (Array.isArray(item.item)) {
      walk(item.item, out)
      continue
    }
    if (item.request) {
      const req = item.request
      const method = String(req.method || 'GET').toUpperCase()
      out.push({
        name: String(item.name || `${method} request`),
        method,
        url: extractUrl(req.url),
        headers: extractHeaders(req.header),
        body: extractBody(req.body),
      })
    }
  }
}

export function parsePostman(raw: unknown): ParsedCollection {
  const data = raw as any
  if (!data || typeof data !== 'object' || !data.info || !Array.isArray(data.item)) {
    throw new Error('El archivo no parece una colección de Postman v2.1 (faltan "info" o "item").')
  }

  const requests: ParsedRequest[] = []
  walk(data.item, requests)

  if (!requests.length) {
    throw new Error('La colección se leyó correctamente pero no contiene ninguna solicitud.')
  }

  const variables: Record<string, string> = {}
  if (Array.isArray(data.variable)) {
    for (const v of data.variable) {
      if (v && v.key) variables[String(v.key)] = String(v.value ?? '')
    }
  }

  return {
    name: String(data.info?.name || 'Colección importada'),
    variables,
    requests,
  }
}

// Colección de ejemplo (Postman v2.1) usada cuando el usuario genera sin subir archivo.
export const SAMPLE_POSTMAN_COLLECTION = {
  info: {
    name: 'Demo Store API',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: 'https://api.demo-store.com' },
    { key: 'apiVersion', value: 'v1' },
  ],
  item: [
    {
      name: 'Listar productos',
      request: {
        method: 'GET',
        header: [{ key: 'Accept', value: 'application/json' }],
        url: {
          raw: '{{baseUrl}}/{{apiVersion}}/products?limit=20',
          host: ['{{baseUrl}}'],
          path: ['{{apiVersion}}', 'products'],
          query: [{ key: 'limit', value: '20' }],
        },
      },
    },
    {
      name: 'Detalle de producto',
      request: {
        method: 'GET',
        header: [{ key: 'Accept', value: 'application/json' }],
        url: {
          raw: '{{baseUrl}}/{{apiVersion}}/products/SKU-1042',
          host: ['{{baseUrl}}'],
          path: ['{{apiVersion}}', 'products', 'SKU-1042'],
        },
      },
    },
    {
      name: 'Crear pedido',
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: '{\n  "sku": "SKU-1042",\n  "qty": 1\n}',
          options: { raw: { language: 'json' } },
        },
        url: {
          raw: '{{baseUrl}}/{{apiVersion}}/orders',
          host: ['{{baseUrl}}'],
          path: ['{{apiVersion}}', 'orders'],
        },
      },
    },
  ],
}

export const SAMPLE_COLLECTION: ParsedCollection = parsePostman(SAMPLE_POSTMAN_COLLECTION)
