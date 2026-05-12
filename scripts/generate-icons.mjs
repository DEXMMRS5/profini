import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/icons')
mkdirSync(OUT, { recursive: true })

function svgIcon(size) {
  const s = size
  const pad = Math.round(s * 0.15)
  const r = Math.round(s * 0.22)
  const lw = Math.round(s * 0.065)

  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15355B"/>
      <stop offset="100%" stop-color="#0A2240"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${r}" fill="url(#bg)"/>

  <!-- P letter -->
  <path d="M${pad+lw} ${pad+lw} L${pad+lw} ${s-pad-lw}" stroke="white" stroke-width="${lw}" stroke-linecap="round" fill="none"/>
  <path d="M${pad+lw} ${pad+lw} L${Math.round(s*0.62)} ${pad+lw} Q${s-pad} ${pad+lw} ${s-pad} ${Math.round(s*0.38)} Q${s-pad} ${Math.round(s*0.56)} ${Math.round(s*0.62)} ${Math.round(s*0.48)} L${pad+lw} ${Math.round(s*0.48)}" stroke="white" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- Green checkmark -->
  <path d="M${Math.round(s*0.22)} ${Math.round(s*0.76)} L${Math.round(s*0.42)} ${Math.round(s*0.88)} L${Math.round(s*0.78)} ${Math.round(s*0.58)}" stroke="#2BA464" stroke-width="${Math.round(lw*1.2)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`
}

async function generate(size, filename) {
  const svg = Buffer.from(svgIcon(size))
  await sharp(svg).resize(size, size).png().toFile(join(OUT, filename))
  console.log(`✓ ${filename}`)
}

await generate(512, 'icon-512.png')
await generate(192, 'icon-192.png')
await generate(180, 'apple-touch-icon.png')
console.log('✓ Toutes les icônes générées dans public/icons/')
