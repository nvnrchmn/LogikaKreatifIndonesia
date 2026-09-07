import type { ReactNode } from 'react'
import { Typography } from 'antd'

// Markdown mini-renderer (cukup utk dokumen internal yang kita kontrol).
// Mendukung: heading ##/###, list -, list 1., **bold**, `code`, fenced ```,
// paragraf, dan blok ---  (digambar sebagai divider).

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push(s.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) {
      out.push(<strong key={k++}>{tok.slice(2, -2)}</strong>)
    } else {
      out.push(<code key={k++} style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4, fontSize: '0.92em' }}>{tok.slice(1, -1)}</code>)
    }
    last = m.index + tok.length
  }
  if (last < s.length) out.push(s.slice(last))
  return out
}

export default function Markdown({ md }: { md: string }) {
  const lines = md.split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let k = 0
  let fence: string[] | null = null
  let list: { ordered: boolean; items: string[] } | null = null

  const flushList = () => {
    if (!list) return
    const items = list.items
    const el = list.ordered ? (
      <ol key={k++}>{items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ol>
    ) : (
      <ul key={k++} style={{ paddingLeft: 20 }}>{items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>
    )
    blocks.push(el)
    list = null
  }

  for (; i < lines.length; i++) {
    const ln = lines[i]
    if (fence) {
      if (ln.trim().startsWith('```')) {
        blocks.push(<pre key={k++} style={{ background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 8, overflowX: 'auto', fontSize: 12 }}>{fence.join('\n')}</pre>)
        fence = null
      } else fence.push(ln)
      continue
    }
    if (ln.trim().startsWith('```')) { flushList(); fence = []; continue }
    if (ln.trim() === '---') { flushList(); continue }
    if (/^## / .test(ln)) { flushList(); blocks.push(<Typography.Title key={k++} level={3} style={{ marginTop: 28 }}>{inline(ln.slice(3))}</Typography.Title>); continue }
    if (/^### /.test(ln)) { flushList(); blocks.push(<Typography.Title key={k++} level={4} style={{ marginTop: 18 }}>{inline(ln.slice(4))}</Typography.Title>); continue }
    if (/^[-*] /.test(ln)) {
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] } }
      list.items.push(ln.replace(/^[-*] /, ''))
      continue
    }
    if (/^\d+\. /.test(ln)) {
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] } }
      list.items.push(ln.replace(/^\d+\. /, ''))
      continue
    }
    if (ln.trim() === '') { flushList(); continue }
    flushList()
    // tabel sederhana (baris diawali |)
    if (ln.startsWith('|')) {
      const row = ln.split('|').filter((x, idx, arr) => !(idx === 0 || idx === arr.length - 1) || x.trim() !== '').map(x => x.trim())
      if (row.length >= 2) {
        const isHeader = /^[-\s|]+$/.test(row.join(''))
        if (isHeader) continue
        const widths = row.map(x => Math.max(1, x.length))
        blocks.push(
          <div key={k++} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            {row.map((cell, j) => <span key={j} style={{ flex: widths[j], fontWeight: /^\*\*/.test(cell) ? 700 : 400, fontSize: 13 }}>{inline(cell.replace(/^\*\*|\*\*$/g, ''))}</span>)}
          </div>
        )
      }
      continue
    }
    blocks.push(<Typography.Paragraph key={k++} style={{ marginBottom: 10 }}>{inline(ln)}</Typography.Paragraph>)
  }
  flushList()
  if (fence) blocks.push(<pre key={k++}>{fence.join('\n')}</pre>)
  return <div style={{ maxWidth: 860 }}>{blocks}</div>
}
