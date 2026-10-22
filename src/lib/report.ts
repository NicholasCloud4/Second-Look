import { distortionName } from '../data/distortions'
import type { EmotionRating, ThoughtRecord } from '../types'
import { averageRelief, distortionCounts, reliefPercent } from './metrics'

const CSS = `
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0; color: #1a241f;
    font: 10.5pt/1.5 'DM Sans Variable', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  h1, h2, .display { font-family: 'Plus Jakarta Sans Variable', system-ui, -apple-system, 'Segoe UI', sans-serif; }

  .masthead { background: #3d6351; color: #fff; border-radius: 10px; padding: 18pt 20pt; }
  .masthead .kicker { font-size: 8.5pt; letter-spacing: .14em; text-transform: uppercase; opacity: .8; margin: 0 0 4pt; }
  .masthead h1 { font-size: 24pt; font-weight: 700; line-height: 1.15; margin: 0; }
  .masthead .range { margin: 6pt 0 0; opacity: .9; }

  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10pt; margin: 12pt 0 4pt; }
  .stat { background: #e9efe9; border-radius: 8px; padding: 10pt 12pt; }
  .stat .num { font-family: 'Plus Jakarta Sans Variable', system-ui, sans-serif; font-size: 20pt; font-weight: 700; color: #3d6351; line-height: 1.1; }
  .stat .lbl { font-size: 9pt; color: #5a6960; margin-top: 2pt; }

  .entry { border: 1px solid #e7e3d8; border-left: 4px solid #3d6351; border-radius: 8px; padding: 12pt 14pt; margin-top: 12pt; break-inside: avoid; }
  .entry .top { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; font-size: 9pt; letter-spacing: .06em; text-transform: uppercase; color: #5a6960; }
  .entry .relief { color: #3d6351; font-weight: 700; }
  .entry h2 { font-size: 14pt; font-weight: 600; line-height: 1.3; margin: 4pt 0 2pt; }
  .situation { color: #5a6960; margin: 0; }
  .traps { margin: 8pt 0 0; color: #b45f06; font-weight: 600; }

  .label { font-family: 'Plus Jakarta Sans Variable', system-ui, sans-serif; font-size: 8.5pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #5a6960; margin: 10pt 0 3pt; }
  p.body { margin: 0; white-space: pre-wrap; }
  ul { margin: 0; padding-left: 14pt; }
  li { margin: 1pt 0; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt; }

  .balanced { background: #e9efe9; border-radius: 8px; padding: 9pt 12pt; margin-top: 10pt; }
  .balanced .label { margin-top: 0; color: #3d6351; }
  .balanced .belief { margin: 4pt 0 0; font-size: 9pt; color: #5a6960; }

  .feelings { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt; }
  .row { display: grid; grid-template-columns: 1fr 34pt; gap: 2pt 8pt; align-items: center; margin: 3pt 0; font-size: 9.5pt; }
  .row .val { text-align: right; color: #5a6960; font-variant-numeric: tabular-nums; }
  .track { grid-column: 1 / -1; height: 5pt; border-radius: 3pt; background: #e7e3d8; }
  .fill { height: 100%; border-radius: 3pt; }
  .before .fill { background: #b45f06; }
  .after .fill { background: #3d6351; }

  .foot { margin-top: 16pt; padding-top: 8pt; border-top: 1px solid #e7e3d8; color: #5a6960; font-size: 8.5pt; }
`

// The report lives in its own document, so the app's self-hosted fonts must be copied across.
function copyFontFaces(doc: Document) {
  let css = ''
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    const base = sheet.href ?? document.baseURI
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSFontFaceRule)) continue
      if (!/(Plus Jakarta Sans|DM Sans) Variable/.test(rule.style.getPropertyValue('font-family'))) continue
      css += rule.cssText.replace(/url\((["']?)(.*?)\1\)/g, (_m, _q, u: string) => `url("${new URL(u, base).href}")`) + '\n'
    }
  }
  const style = doc.createElement('style')
  style.textContent = css
  doc.head.append(style)
}

const el = <K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, className?: string, text?: string) => {
  const node = doc.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function labelled(doc: Document, parent: HTMLElement, label: string, value: string | string[] | undefined) {
  if (!value || (Array.isArray(value) && value.length === 0)) return
  const box = el(doc, 'div')
  box.append(el(doc, 'div', 'label', label))
  if (Array.isArray(value)) {
    const ul = el(doc, 'ul')
    for (const v of value) ul.append(el(doc, 'li', undefined, v))
    box.append(ul)
  } else {
    box.append(el(doc, 'p', 'body', value))
  }
  parent.append(box)
  return box
}

function feelings(doc: Document, kind: 'before' | 'after', title: string, list: EmotionRating[]) {
  const box = el(doc, 'div', kind)
  box.append(el(doc, 'div', 'label', title))
  for (const e of list) {
    const row = el(doc, 'div', 'row')
    row.append(el(doc, 'span', undefined, e.name), el(doc, 'span', 'val', String(e.intensity)))
    const track = el(doc, 'div', 'track')
    const fill = el(doc, 'div', 'fill')
    fill.style.width = `${Math.max(0, Math.min(100, e.intensity))}%`
    track.append(fill)
    row.append(track)
    box.append(row)
  }
  return box
}

function build(doc: Document, records: ThoughtRecord[]) {
  const sorted = [...records].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const day = (iso: string, style: 'medium' | 'long' = 'medium') => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { dateStyle: style })
  }

  const mast = el(doc, 'header', 'masthead')
  mast.append(el(doc, 'p', 'kicker', 'Second Look · Thought journal'), el(doc, 'h1', undefined, 'Thought record summary'))
  if (sorted.length) mast.append(el(doc, 'p', 'range', `${day(sorted[0].timestamp, 'long')} to ${day(sorted[sorted.length - 1].timestamp, 'long')}`))
  doc.body.append(mast)

  const avg = averageRelief(sorted)
  const topTrap = distortionCounts(sorted)[0]
  const stats = el(doc, 'div', 'stats')
  const tile = (num: string, lbl: string) => {
    const t = el(doc, 'div', 'stat')
    t.append(el(doc, 'div', 'num', num), el(doc, 'div', 'lbl', lbl))
    stats.append(t)
  }
  tile(String(sorted.length), sorted.length === 1 ? 'entry' : 'entries')
  if (avg !== null) tile(`${avg}%`, 'average drop in distress after reframing')
  if (topTrap) tile(topTrap.name, `most frequent thinking trap (${topTrap.count}×)`)
  doc.body.append(stats)

  for (const r of sorted) {
    const entry = el(doc, 'section', 'entry')
    const relief = reliefPercent(r)
    const top = el(doc, 'div', 'top')
    top.append(el(doc, 'span', undefined, day(r.timestamp)))
    if (relief !== null) top.append(el(doc, 'span', 'relief', `${relief}% relief`))
    entry.append(top, el(doc, 'h2', undefined, r.automaticThought ? `“${r.automaticThought}”` : 'Entry'))
    if (r.situation) entry.append(el(doc, 'p', 'situation', r.situation))
    if (r.distortions.length) entry.append(el(doc, 'p', 'traps', r.distortions.map(distortionName).join(' · ')))

    if (r.evidenceFor.length || r.evidenceAgainst.length) {
      const cols = el(doc, 'div', 'cols')
      labelled(doc, cols, 'Evidence for the thought', r.evidenceFor)
      labelled(doc, cols, 'Evidence against', r.evidenceAgainst)
      entry.append(cols)
    }
    labelled(doc, entry, 'Reflection', r.socraticAnswer)

    if (r.rationalReframe) {
      const bal = el(doc, 'div', 'balanced')
      bal.append(el(doc, 'div', 'label', 'Balanced thought'), el(doc, 'p', 'body', r.rationalReframe))
      bal.append(el(doc, 'p', 'belief', `Belief in the balanced thought: ${r.beliefInReframe}/100`))
      entry.append(bal)
    }

    if (r.initialEmotions.length || r.reratedEmotions.length) {
      const f = el(doc, 'div', 'feelings')
      f.append(feelings(doc, 'before', 'Feelings before (0–100)', r.initialEmotions), feelings(doc, 'after', 'Feelings after (0–100)', r.reratedEmotions))
      entry.append(f)
    }
    labelled(doc, entry, 'Notes', r.outcomeNotes)
    doc.body.append(entry)
  }

  doc.body.append(el(doc, 'p', 'foot', `Prepared ${day(new Date().toISOString(), 'long')} from the person’s own private journal. Self-reported, not a clinical assessment.`))
}

/** Opens the browser's print dialog on a printer-friendly report, where "Save as PDF" is an option. Nothing leaves the device. */
export async function printReport(records: ThoughtRecord[]) {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden'
  document.body.append(frame)

  const doc = frame.contentDocument
  const win = frame.contentWindow
  if (!doc || !win) {
    frame.remove()
    return false
  }
  doc.title = `Second Look journal ${new Date().toISOString().slice(0, 10)}`
  copyFontFaces(doc)
  const style = doc.createElement('style')
  style.textContent = CSS
  doc.head.append(style)
  build(doc, records)

  // Fonts load lazily; printing before they arrive would fall back to system fonts.
  try {
    await Promise.race([
      Promise.all([
        doc.fonts.load("400 10pt 'DM Sans Variable'"),
        doc.fonts.load("700 10pt 'DM Sans Variable'"),
        doc.fonts.load("600 10pt 'Plus Jakarta Sans Variable'"),
        doc.fonts.load("700 10pt 'Plus Jakarta Sans Variable'"),
      ]),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ])
  } catch {
    // fall back to system fonts
  }

  const cleanup = () => frame.remove()
  win.addEventListener('afterprint', cleanup, { once: true })
  win.focus()
  win.print()
  // Some browsers never fire afterprint; don't leave the frame behind forever.
  setTimeout(cleanup, 60_000)
  return true
}
