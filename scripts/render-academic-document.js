import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const input = path.join(root, 'docs', 'entrega_academica.md');
const output = path.join(root, 'entrega', 'entrega_academica.html');
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const inline = (value) => escapeHtml(value).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

function renderTable(lines) {
  const rows = lines.map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()));
  return `<table><thead><tr>${rows[0].map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(2).map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function markdownToHtml(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    if (line.startsWith('```')) {
      const language = line.slice(3).trim(); const code = []; i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i += 1; out.push(`<pre data-language="${escapeHtml(language)}"><code>${escapeHtml(code.join('\n'))}</code></pre>`); continue;
    }
    if (/^\|.*\|$/.test(line) && i + 1 < lines.length && /^\|?\s*:?-+/.test(lines[i + 1])) {
      const rows = [line]; i += 1;
      while (i < lines.length && /^\|.*\|$/.test(lines[i])) rows.push(lines[i++]);
      out.push(renderTable(rows)); continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { const level = heading[1].length; out.push(`<h${level}>${inline(heading[2])}</h${level}>`); i += 1; continue; }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\./.test(line); const items = []; const matcher = ordered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/;
      while (i < lines.length && matcher.test(lines[i])) { items.push(lines[i].match(matcher)[1]); i += 1; }
      const tag = ordered ? 'ol' : 'ul'; out.push(`<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</${tag}>`); continue;
    }
    if (line.startsWith('> ')) { out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); i += 1; continue; }
    const paragraph = [line]; i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s|^```|^\|.*\|$|^[-*]\s+|^\d+\.\s+|^> /.test(lines[i])) paragraph.push(lines[i++]);
    out.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return out.join('\n');
}

const body = markdownToHtml(fs.readFileSync(input, 'utf8'));
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Tueste Business Solutions</title><style>
@page{size:A4;margin:18mm 16mm 20mm}*{box-sizing:border-box}body{color:#1d2c24;font:10.5pt/1.48 Arial,sans-serif;max-width:180mm;margin:auto}h1{color:#173d29;font-size:25pt;border-bottom:3px solid #b97816;padding-bottom:8px;page-break-before:always}h1:first-child{page-break-before:auto;margin-top:38mm}h2{color:#22553b;font-size:17pt;margin-top:22px;border-bottom:1px solid #b7c8bc}h3{color:#73501c;font-size:13pt}p,li{text-align:justify}table{width:100%;border-collapse:collapse;margin:12px 0 18px;font-size:8.4pt}tr{page-break-inside:avoid}th{background:#173d29;color:white}th,td{border:1px solid #9aac9f;padding:5px;vertical-align:top}code{font-family:Consolas,monospace;background:#edf2ee;padding:1px 3px}pre{white-space:pre-wrap;background:#edf2ee;border-left:4px solid #b97816;padding:10px;font-size:8.5pt}blockquote{border-left:4px solid #b97816;margin:12px 0;padding:8px 14px;background:#fff7e9}a{color:#22553b}@media print{a{text-decoration:none}}
</style></head><body>${body}</body></html>`;
fs.mkdirSync(path.dirname(output), { recursive:true });
fs.writeFileSync(output, html, 'utf8');
console.log(output);
