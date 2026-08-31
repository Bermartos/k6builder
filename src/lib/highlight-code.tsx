import { Fragment, type ReactNode } from 'react'

const TOKEN =
  /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*")|\b(import|from|export|const|function|return|default|new|let|of|if|for|await|async)\b|\b(\d+(?:\.\d+)?)\b/g

/**
 * Naive single-line JS syntax highlighter. Tokenizes comments, strings,
 * a handful of keywords, and numbers using the shared `--code-*` design
 * tokens so every code preview in the app stays visually consistent.
 */
export function highlightLine(line: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  TOKEN.lastIndex = 0

  while ((match = TOKEN.exec(line)) !== null) {
    if (match.index > last) nodes.push(line.slice(last, match.index))
    const [full, comment, str, keyword, num] = match
    const key = `${match.index}-${full.length}`
    if (comment) {
      nodes.push(
        <span key={key} className="text-code-muted italic">
          {full}
        </span>,
      )
    } else if (str) {
      nodes.push(
        <span key={key} className="text-code-string">
          {full}
        </span>,
      )
    } else if (keyword) {
      nodes.push(
        <span key={key} className="text-code-key">
          {full}
        </span>,
      )
    } else if (num) {
      nodes.push(
        <span key={key} className="text-code-string">
          {full}
        </span>,
      )
    }
    last = match.index + full.length
  }
  if (last < line.length) nodes.push(line.slice(last))

  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>)
}

export function CodeLines({ code }: { code: string }) {
  const lines = code.split('\n')
  return (
    <code>
      {lines.map((line, i) => (
        <span key={i} className="flex gap-4">
          <span className="w-6 shrink-0 select-none text-right text-code-muted/60 tabular-nums">{i + 1}</span>
          <span className="min-w-0 whitespace-pre-wrap">{highlightLine(line)}</span>
        </span>
      ))}
    </code>
  )
}
