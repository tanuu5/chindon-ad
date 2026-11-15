// hooks/palette-data.ts を作り直す。
// 使い方：node tools/make-palette.mjs <make-colors.js のパス> [書き出し先]
//   make-colors.js は、Claude Code の plugin-authoring スキルのフォルダにある（デザインシステムから生成されたファイル）。
//   このリポジトリには入れていないので、手元の Claude Code のものを指す。Claude Code が上がったら作り直す。
//   書き出し先を省くと plugins/chindon-ad/hooks/palette-data.ts。
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// 安い看板の色：赤紫の壁に、クリーム色の字。強調はどぎついピンク、名前は赤、文字列は蛍光の緑、数は水色
const ROLES = { accent: '#ff2bd6', danger: '#ff3b3b', success: '#39ff6a', warning: '#ffd400', pro: '#00e5ff' }
const ANCHORS = {
  'surface-0': '#1e061b',
  'surface-1': '#270925',
  'surface-2': '#300c2d',
  'surface-3': '#360e33',
  'text-primary': '#fff4c2',
  'text-secondary': '#f6d6ec',
  'text-muted': '#d8a8cc',
}

const [maker, target] = process.argv.slice(2)

if (maker === undefined) {
  console.error('使い方：node tools/make-palette.mjs <make-colors.js のパス> [書き出し先]')
  process.exit(1)
}

const { makeColors } = await import(pathToFileURL(resolve(maker)).href)
const { theme, problems } = makeColors({
  label: 'Chindon',
  id: 'chindon-ad',
  only: 'dark',
  roles: ROLES,
  dark: { gray: { anchors: ANCHORS } },
})
const stops = problems.filter(line => line.startsWith("Desktop won't paint"))

console.log(`${Object.keys(theme.inputs.dark ?? {}).length} 色、指摘 ${problems.length} 件（塗られない ${stops.length} 件）`)
for (const line of problems) console.log(`  ${line}`)

const here = dirname(fileURLToPath(import.meta.url))
const file = target === undefined ? resolve(here, '../plugins/chindon-ad/hooks/palette-data.ts') : resolve(target)
const text =
  `// tools/make-palette.mjs が作るファイル。手で直さない（色を変えるときは tools/make-palette.mjs を直して作り直す）。\n` +
  `import type { ThemeColors } from 'claude-code'\n\n` +
  `export const PALETTE: ThemeColors = ${JSON.stringify(theme, null, 2)}\n`

writeFileSync(file, text)
console.log(`書き出し：${file}`)
process.exit(stops.length === 0 ? 0 : 2)
