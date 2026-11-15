// chindon-ad：背景の絵（SVG）を作る。
//   - 絵は 3 段階（広告レベル 1〜3）。レベルが上がるほど広告が増え、行列が速くなり、会話の後ろのガラスが薄くなる。
//   - たぬきのちんどん屋の行列が、画面の下のほうを左から右へ練り歩く（会話の後ろも通る）。
//   - 動きはわざと 8 コマ前後のカクカク（昔の GIF 広告の手ざわり。描き直しの回数も減る）。
//   - 画面全体の点滅はしない（光の点滅で気分が悪くなる人がいるので。点滅は小さな字と枠だけ）。
//   - スクリプトは使えないので、動きはすべて CSS アニメ。同じレベルなら毎回同じ文字列になる。

import type { Level } from '../types'

export const LEVELS: readonly Level[] = [1, 2, 3]

const W = 1600
const H = 1000
/** 行列の足もと */
const BASE = 790

const FUR = '#9b6a3c'
const DARK = '#3a2414'
const BELLY = '#ecd3a6'
const MUZZLE = '#f6e7c8'
const ARM = '#7d522e'

const MARU = `'Hiragino Maru Gothic ProN','Hiragino Sans','Yu Gothic',sans-serif`
const GOTH = `'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif`

export function sceneName(level: Level): string {
  return `lv${level}`
}

export function levelOf(scene: string): Level | undefined {
  const m = /^lv([123])$/.exec(scene)

  return m === null ? undefined : (Number(m[1]) as Level)
}

/** 文字を SVG に入れられる形に */
function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function txt(
  x: number,
  y: number,
  size: number,
  text: string,
  { fill = '#222', cls = 'g', anchor = 'middle', extra = '' }: { fill?: string; cls?: string; anchor?: string; extra?: string } = {},
): string {
  return `<text x="${x}" y="${y}" font-size="${size}" class="${cls}" fill="${fill}" text-anchor="${anchor}"${extra}>${esc(text)}</text>`
}

// ───────────────────────── 動き ─────────────────────────

function style(level: Level): string {
  const cascade = Array.from({ length: 6 }, (_, i) => {
    const at = (8 + i * 9).toFixed(0)

    return `@keyframes casc${i}{0%{opacity:0}${at}%{opacity:1}86%{opacity:0}100%{opacity:0}}.casc${i}{opacity:0;animation:casc${i} 7s steps(1,end) infinite}`
  }).join('')

  return [
    `.m{font-family:${MARU};font-weight:800}`,
    `.g{font-family:${GOTH};font-weight:700}`,
    '@keyframes dots{to{transform:translate(80px,80px)}}.dots{animation:dots 4s steps(16) infinite}',
    '@keyframes blink{50%{opacity:0}}.blink{animation:blink .8s steps(1,end) infinite}.blink2{animation:blink 1.4s steps(1,end) infinite}',
    '@keyframes rainbow{0%{fill:#ffe14d}25%{fill:#ff3bd4}50%{fill:#39ff6a}75%{fill:#00e5ff}}.rainbow{animation:rainbow 1.2s steps(1,end) infinite}',
    '@keyframes marquee{to{transform:translateX(-2400px)}}.marquee{animation:marquee 30s steps(300) infinite}',
    '@keyframes sway{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}.sway{animation:sway 1.6s steps(4) infinite}',
    '@keyframes bob{50%{transform:translateY(-7px)}}.bob{animation:bob .5s steps(1,end) infinite}',
    '@keyframes leg{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(18deg)}}.legA{animation:leg .5s steps(1,end) infinite}.legB{animation:leg .5s steps(1,end) -.25s infinite}',
    '@keyframes wag{50%{transform:rotate(16deg)}}.wag{animation:wag .6s steps(1,end) infinite}',
    '@keyframes hit{50%{transform:rotate(-26deg)}}.hit{animation:hit .5s steps(1,end) infinite}.hit2{animation:hit .5s steps(1,end) -.25s infinite}',
    '@keyframes wave{50%{transform:rotate(30deg)}}.wave{animation:wave .7s steps(1,end) infinite}',
    '@keyframes tilt{50%{transform:rotate(8deg)}}.tilt{animation:tilt .9s steps(1,end) infinite}',
    '@keyframes flutter{50%{transform:skewY(5deg)}}.flutter{animation:flutter .8s steps(1,end) infinite}',
    '@keyframes pop{0%,45%{opacity:1;transform:scale(1.15)}46%,100%{opacity:0;transform:scale(.6)}}.pop{animation:pop .5s steps(1,end) infinite}.pop2{animation:pop .5s steps(1,end) -.25s infinite}.popslow{animation:pop 1.4s steps(1,end) infinite}',
    '@keyframes note{0%{transform:translate(0,0);opacity:1}100%{transform:translate(34px,-130px);opacity:0}}.note{animation:note 1.8s steps(9) infinite}',
    '@keyframes pulse{50%{transform:scale(1.08)}}.pulse{animation:pulse .6s steps(1,end) infinite}',
    '@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 12s steps(48) infinite}',
    '@keyframes march{from{transform:translateX(-820px)}to{transform:translateX(1700px)}}.march{animation:march 44s steps(330) infinite}',
    '@keyframes march2{from{transform:translateX(3000px)}to{transform:translateX(-1500px)}}.march2{animation:march2 20s steps(160) infinite}',
    // スキップできない動画広告：5→1 と数えて「スキップ」が出たと思ったら、もう 1 本
    '@keyframes slot1{0%{opacity:1}11.11%,100%{opacity:0}}@keyframes slot2{0%{opacity:1}22.22%,100%{opacity:0}}',
    '.s0,.s1,.s2,.s3,.s4{opacity:0;animation:slot1 9s steps(1,end) infinite}.s5,.s7{opacity:0;animation:slot2 9s steps(1,end) infinite}',
    '.s1{animation-delay:1s}.s2{animation-delay:2s}.s3{animation-delay:3s}.s4{animation-delay:4s}.s5{animation-delay:5s}.s7{animation-delay:7s}',
    '@keyframes prog{from{transform:scaleX(0)}to{transform:scaleX(1)}}.prog{animation:prog 9s steps(18) infinite}',
    // 逃げる「×」と、それを追うマウスの矢印
    '@keyframes hop{0%{transform:translate(1526px,205px)}19%{transform:translate(1160px,402px)}39%{transform:translate(1158px,205px)}59%{transform:translate(1526px,402px)}79%{transform:translate(1526px,205px)}}',
    '.hop{animation:hop 7s step-end infinite}',
    '@keyframes chase{0%,100%{transform:translate(1340px,330px)}17%,19%{transform:translate(1534px,214px)}37%,39%{transform:translate(1168px,411px)}57%,59%{transform:translate(1166px,214px)}77%,79%{transform:translate(1534px,411px)}}',
    '.chase{animation:chase 7s steps(6,end) infinite}',
    '@keyframes shake{0%,88%,100%{transform:translate(0,0)}90%{transform:translate(-8px,4px)}92%{transform:translate(7px,-5px)}94%{transform:translate(-5px,-3px)}96%{transform:translate(8px,5px)}98%{transform:translate(-3px,2px)}}',
    '.shake{animation:shake 2.5s steps(1,end) infinite}',
    // 電飾：3 つおきに順番に光る
    '@keyframes bulb{0%{fill:#fffbd0}33.3%,100%{fill:#8a3a10}}.bk0,.bk1,.bk2{fill:#8a3a10;animation:bulb .6s steps(1,end) infinite}.bk1{animation-delay:-.4s}.bk2{animation-delay:-.2s}',
    '@keyframes bounce{50%{transform:translateY(9px)}}.bounce{animation:bounce .5s steps(1,end) infinite}.bounce2{animation:bounce .5s steps(1,end) -.25s infinite}',
    '@keyframes typing{0%,33%{transform:translateY(-4px)}34%,100%{transform:translateY(0)}}.t0{animation:typing .9s steps(1,end) infinite}.t1{animation:typing .9s steps(1,end) -.6s infinite}.t2{animation:typing .9s steps(1,end) -.3s infinite}',
    '@keyframes fall{from{transform:translateY(0) rotate(0)}to{transform:translateY(1060px) rotate(540deg)}}.cf{animation:fall 7s steps(28) infinite}',
    '@keyframes fly{from{transform:translateX(1900px)}to{transform:translateX(-700px)}}.fly{animation:fly 60s steps(240) -20s infinite}',
    '@keyframes drive{from{transform:translateX(1780px)}to{transform:translateX(-520px)}}.drive{animation:drive 30s steps(200) -8s infinite}',
    '@keyframes spinw{to{transform:rotate(-360deg)}}.spinw{animation:spinw .4s steps(4) infinite}',
    level === 3 ? cascade : '',
    '@media (prefers-reduced-motion: reduce){*{animation:none!important}.s0,.casc0,.casc1,.casc2{opacity:1}}',
  ].join('')
}

// ───────────────────────── 部品 ─────────────────────────

function defs(): string {
  return (
    '<defs>' +
    '<pattern id="dots" width="80" height="80" patternUnits="userSpaceOnUse">' +
    '<circle cx="20" cy="20" r="9" fill="#4d1257"/><circle cx="60" cy="60" r="9" fill="#4d1257"/>' +
    '<circle cx="60" cy="20" r="3" fill="#6b1d6f"/><circle cx="20" cy="60" r="3" fill="#6b1d6f"/></pattern>' +
    '<pattern id="kohaku" width="80" height="60" patternUnits="userSpaceOnUse"><rect width="40" height="60" fill="#d7263d"/><rect x="40" width="40" height="60" fill="#fff"/></pattern>' +
    '<radialGradient id="hush" cx="50%" cy="50%" r="46%"><stop offset="0" stop-color="#12020f" stop-opacity="1"/><stop offset="1" stop-color="#12020f" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="#ff2bd6"/><stop offset="1" stop-color="#ff8a00"/></linearGradient>' +
    '<clipPath id="tailClip"><ellipse cx="-60" cy="-44" rx="17" ry="38" transform="rotate(-40 -60 -44)"/></clipPath>' +
    // しっぽ（しまもよう）
    `<g id="tTail"><g clip-path="url(#tailClip)"><rect x="-120" y="-100" width="120" height="120" fill="${FUR}"/>` +
    `<g transform="rotate(-40 -60 -44)" fill="${DARK}"><rect x="-90" y="-86" width="60" height="14"/><rect x="-90" y="-62" width="60" height="8"/><rect x="-90" y="-44" width="60" height="8"/><rect x="-90" y="-26" width="60" height="8"/></g></g></g>` +
    `<g id="tLeg"><rect x="-8" y="0" width="16" height="32" rx="7" fill="${DARK}"/></g>` +
    `<g id="tBody"><ellipse cx="0" cy="-64" rx="44" ry="50" fill="${FUR}"/><ellipse cx="0" cy="-56" rx="28" ry="33" fill="${BELLY}"/></g>` +
    // 頭：耳・目のまわりの黒いもよう・鼻づら・ねじりはちまき
    '<g id="tHead">' +
    `<circle cx="-24" cy="-158" r="11" fill="${DARK}"/><circle cx="24" cy="-158" r="11" fill="${DARK}"/>` +
    '<circle cx="-24" cy="-157" r="5" fill="#c99a66"/><circle cx="24" cy="-157" r="5" fill="#c99a66"/>' +
    `<circle cx="0" cy="-130" r="34" fill="${FUR}"/>` +
    `<ellipse cx="-14" cy="-131" rx="13" ry="9" fill="${DARK}" transform="rotate(20 -14 -131)"/>` +
    `<ellipse cx="14" cy="-131" rx="13" ry="9" fill="${DARK}" transform="rotate(-20 14 -131)"/>` +
    '<circle cx="-13" cy="-132" r="4" fill="#fff"/><circle cx="-12" cy="-131.5" r="2.2" fill="#111"/>' +
    '<circle cx="13" cy="-132" r="4" fill="#fff"/><circle cx="12" cy="-131.5" r="2.2" fill="#111"/>' +
    `<ellipse cx="0" cy="-114" rx="16" ry="12" fill="${MUZZLE}"/>` +
    '<ellipse cx="0" cy="-119" rx="5.5" ry="4" fill="#1b120b"/>' +
    '<path d="M-6,-111 Q-3,-107 0,-110 Q3,-107 6,-111" stroke="#1b120b" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<circle cx="-24" cy="-116" r="5" fill="#ff7a8a" opacity=".55"/><circle cx="24" cy="-116" r="5" fill="#ff7a8a" opacity=".55"/>' +
    '<rect x="-34" y="-157" width="68" height="9" rx="4" fill="#fff"/>' +
    '<path d="M-30,-156 l6,8 M-18,-157 l6,9 M-6,-157 l6,9 M6,-157 l6,9 M18,-157 l6,9" stroke="#d7263d" stroke-width="2"/>' +
    '<path d="M30,-156 l15,-9 l-2,11 z M31,-151 l15,6 l-9,5 z" fill="#fff"/>' +
    '</g>' +
    // ポップアップの × と、マウスの矢印
    '<g id="xbox"><rect width="20" height="18" rx="2" fill="#d6d3ce" stroke="#fff"/><text x="10" y="14" text-anchor="middle" font-size="14" class="g" fill="#111">×</text></g>' +
    '<path id="cursor" d="M0,0 L0,26 L7,20 L12,31 L17,29 L12,18 L21,18 Z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/>' +
    '</defs>'
  )
}

/** 肩（sx, sy）から手先（dx, dy だけ先）までの腕。cls があれば肩を軸に動く */
function arm(sx: number, sy: number, dx: number, dy: number, coat: string, cls = '', hold = ''): string {
  const body =
    `<path d="M0,0 L${dx},${dy}" stroke="${ARM}" stroke-width="13" stroke-linecap="round"/>` +
    `<path d="M0,0 L${(dx * 0.4).toFixed(1)},${(dy * 0.4).toFixed(1)}" stroke="${coat}" stroke-width="19" stroke-linecap="round"/>` +
    hold +
    `<circle cx="${dx}" cy="${dy}" r="7.5" fill="${DARK}"/>`

  return `<g transform="translate(${sx},${sy})">${cls === '' ? body : `<g class="${cls}">${body}</g>`}</g>`
}

/** 吹き出しの擬音（ちょっと大きくなって消える） */
function sound(x: number, y: number, text: string, cls: string, size = 26, fill = '#ffe14d'): string {
  return (
    `<g transform="translate(${x},${y})"><g class="${cls}">` +
    txt(0, 0, size, text, { fill, cls: 'm', extra: ' stroke="#3a0b2e" stroke-width="5" paint-order="stroke"' }) +
    '</g></g>'
  )
}

type Kind = 'flag' | 'chindon' | 'belly' | 'clarinet' | 'board'

/** たぬき 1 匹（足もとが原点）。kind で持ち物が変わる */
function tanuki(kind: Kind, coat: string, phase: number): string {
  let back = ''
  let front = ''

  if (kind === 'flag') {
    // のぼり旗
    const chars = ['大', '売', '出', 'し']
      .map((c, i) => txt(27, 54 + i * 42, 38, c, { fill: '#d7263d', cls: 'm' }))
      .join('')

    back =
      '<path d="M38,-14 L38,-340" stroke="#7a5230" stroke-width="6" stroke-linecap="round"/>' +
      `<g transform="translate(40,-334)"><g class="flutter"><rect width="54" height="200" fill="#fff" stroke="#d7263d" stroke-width="5"/><rect width="54" height="16" fill="#d7263d"/>${chars}</g></g>` +
      '<path d="M34,-334 L98,-334" stroke="#7a5230" stroke-width="5" stroke-linecap="round"/>'
    front =
      arm(30, -98, 8, -26, coat) +
      arm(-30, -98, -20, -36, coat, 'wave') +
      sound(-60, -190, 'いらっしゃい！', 'popslow', 20, '#fff')
  } else if (kind === 'chindon') {
    // ちんどん太鼓：鉦（かね）・締太鼓・大太鼓をからだの前に組んだもの
    front =
      '<path d="M-28,-80 L-38,-112 M28,-80 L40,-108" stroke="#555" stroke-width="3"/>' +
      '<circle cx="-40" cy="-118" r="12" fill="#f2c14e" stroke="#a37b16" stroke-width="3"/><circle cx="-40" cy="-118" r="4" fill="#a37b16"/>' +
      '<circle cx="42" cy="-116" r="17" fill="#f6ead0" stroke="#7a1a12" stroke-width="6"/>' +
      '<rect x="-30" y="-80" width="60" height="26" fill="#c1121f"/><ellipse cx="0" cy="-54" rx="30" ry="8" fill="#a50e1a"/>' +
      '<ellipse cx="0" cy="-80" rx="30" ry="8" fill="#f6ead0" stroke="#3a2414" stroke-width="2"/>' +
      '<path d="M-30,-76 L-22,-56 L-14,-76 L-6,-56 L2,-76 L10,-56 L18,-76 L26,-56" stroke="#f2c14e" stroke-width="2" fill="none"/>' +
      arm(-30, -98, -8, -20, coat, 'hit', '<path d="M-8,-20 L-2,-38" stroke="#d8b27a" stroke-width="4" stroke-linecap="round"/>') +
      arm(30, -98, 10, -6, coat, 'hit2', '<path d="M10,-6 L20,-22" stroke="#d8b27a" stroke-width="4" stroke-linecap="round"/>') +
      sound(-74, -162, 'チン', 'pop') +
      sound(82, -150, 'ドン', 'pop2', 30)
  } else if (kind === 'belly') {
    // 腹鼓（はらつづみ）
    front =
      '<ellipse cx="0" cy="-58" rx="33" ry="38" fill="#f3dcb2"/>' +
      arm(-32, -98, 16, 30, coat, 'hit') +
      arm(32, -98, -16, 30, coat, 'hit2') +
      sound(-70, -64, 'ポン！', 'pop') +
      sound(72, -54, 'ポコ！', 'pop2')
  } else if (kind === 'clarinet') {
    const notes = ['♪', '♫', '♪']
      .map(
        (n, i) =>
          `<g transform="translate(42,-36)"><g class="note" style="animation-delay:${(-i * 0.6).toFixed(1)}s">${txt(0, 0, 26, n, { fill: '#7dfcff', cls: 'm' })}</g></g>`,
      )
      .join('')

    front =
      '<g transform="translate(4,-112)"><g class="tilt">' +
      '<path d="M0,0 L26,74" stroke="#1d1d1d" stroke-width="7" stroke-linecap="round"/><path d="M20,70 L32,88 L40,68 Z" fill="#1d1d1d"/>' +
      '<circle cx="9" cy="25" r="2.2" fill="#c0c0c0"/><circle cx="14" cy="40" r="2.2" fill="#c0c0c0"/><circle cx="19" cy="55" r="2.2" fill="#c0c0c0"/>' +
      '</g></g>' +
      arm(-30, -98, 42, 12, coat) +
      arm(30, -96, -6, 30, coat) +
      notes +
      sound(-56, -186, 'ピーヒャラ♪', 'popslow', 20, '#7dfcff')
  } else {
    // サンドイッチマン
    front =
      '<rect x="-60" y="-100" width="120" height="88" rx="4" fill="#ffe14d" stroke="#d7263d" stroke-width="5"/>' +
      `<g class="blink2">${txt(0, -66, 24, '閉店セール', { fill: '#d7263d', cls: 'm' })}</g>` +
      txt(0, -41, 17, '毎日開催中', { fill: '#222', cls: 'm' }) +
      txt(0, -22, 11, '※明日もやります', { fill: '#444' }) +
      `<circle cx="-60" cy="-58" r="7.5" fill="${DARK}"/><circle cx="60" cy="-58" r="7.5" fill="${DARK}"/>`
  }

  const happi =
    `<path d="M-30,-104 Q-47,-90 -47,-60 L-45,-22 L-18,-20 L-10,-98 Z" fill="${coat}"/>` +
    `<path d="M30,-104 Q47,-90 47,-60 L45,-22 L18,-20 L10,-98 Z" fill="${coat}"/>` +
    '<path d="M-10,-98 L-18,-20 M10,-98 L18,-20" stroke="#fff" stroke-width="6"/>'

  return (
    '<ellipse cx="0" cy="3" rx="44" ry="7" fill="#000" opacity=".35"/>' +
    `<g class="bob" style="animation-delay:${(-phase).toFixed(2)}s">` +
    back +
    '<g transform="translate(-30,-50)"><g class="wag"><g transform="translate(30,50)"><use href="#tTail"/></g></g></g>' +
    '<g transform="translate(-16,-28)"><g class="legA"><use href="#tLeg"/></g></g>' +
    '<g transform="translate(16,-28)"><g class="legB"><use href="#tLeg"/></g></g>' +
    '<use href="#tBody"/>' +
    happi +
    '<use href="#tHead"/>' +
    front +
    '</g>'
  )
}

/** ちんどん屋の一行（いちばん右が先頭の旗持ち） */
function troupe(): string {
  const members: [number, Kind, string, number][] = [
    [20, 'board', '#8b2fc9', 0.05],
    [170, 'clarinet', '#e0761a', 0.37],
    [320, 'belly', '#1f8a4c', 0.25],
    [470, 'chindon', '#2b3a8f', 0.12],
    [630, 'flag', '#d7263d', 0],
  ]

  return members.map(([x, kind, coat, phase]) => `<g transform="translate(${x},0)">${tanuki(kind, coat, phase)}</g>`).join('')
}

/** ポップアップの窓（× なしも選べる） */
function popup(x: number, y: number, w: number, h: number, title: string, body: string, close = true): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="5" y="6" width="${w}" height="${h}" fill="#000" opacity=".4"/>` +
    `<rect width="${w}" height="${h}" fill="#f2efe4" stroke="#5a1050" stroke-width="2"/>` +
    `<rect x="2" y="2" width="${w - 4}" height="25" fill="url(#bar)"/>` +
    txt(10, 20, 13, title, { fill: '#fff', anchor: 'start' }) +
    (close ? `<use href="#xbox" transform="translate(${w - 25},5)"/>` : '') +
    body +
    '</g>'
  )
}

function button(cx: number, cy: number, w: number, label: string, fill: string, size = 16, cls = ''): string {
  const inner =
    `<rect x="${-w / 2}" y="-17" width="${w}" height="34" rx="7" fill="${fill}" stroke="#00000055" stroke-width="2"/>` +
    txt(0, size * 0.36, size, label, { fill: '#fff', cls: 'm' })

  return `<g transform="translate(${cx},${cy})">${cls === '' ? inner : `<g class="${cls}">${inner}</g>`}</g>`
}

// ───────────────────────── 広告 ─────────────────────────

/** 当選のお知らせ（× が逃げる） */
function prize(): string {
  const body =
    '<rect x="10" y="34" width="380" height="50" fill="#d7263d"/>' +
    txt(200, 68, 26, 'おめでとうございます！！', { cls: 'm rainbow', fill: '#ffe14d' }) +
    txt(200, 108, 15, 'あなたは 本日 1,000,000 人目の') +
    txt(200, 130, 15, 'ご利用者さまに 選ばれました') +
    button(200, 168, 230, '賞品を 受け取る ▶', '#1f9d3a', 18, 'pulse') +
    txt(200, 214, 10, '※賞品は たぬきの葉っぱです。気づくと葉っぱに戻ります', { fill: '#777' })

  return (
    popup(1150, 200, 400, 230, 'お知らせ ── とても重要', body, false) +
    `<g class="hop"><use href="#xbox"/>${txt(10, -6, 11, '逃げます', { fill: '#ff2bd6', cls: 'm' })}</g>` +
    '<g class="chase"><use href="#cursor"/></g>'
  )
}

/** スキップできない動画広告 */
function skipAd(): string {
  const slots: [string, string][] = [
    ['s0', '5 秒後に スキップ'],
    ['s1', '4 秒後に スキップ'],
    ['s2', '3 秒後に スキップ'],
    ['s3', '2 秒後に スキップ'],
    ['s4', '1 秒後に スキップ'],
    ['s5', '広告を スキップ ▶|'],
    ['s7', '…もう 1 本 どうぞ'],
  ]

  return (
    '<g transform="translate(1180,470)">' +
    '<rect x="5" y="6" width="370" height="210" fill="#000" opacity=".4"/>' +
    '<rect width="370" height="210" fill="#111" stroke="#555" stroke-width="2"/>' +
    '<rect x="10" y="10" width="46" height="22" fill="#ffd400"/>' +
    txt(33, 27, 14, '広告', { fill: '#111' }) +
    txt(185, 92, 34, 'ちんどん商店街', { cls: 'm rainbow', fill: '#ffe14d' }) +
    txt(185, 128, 19, '大売り出し 毎日開催中', { cls: 'm', fill: '#fff' }) +
    '<rect x="196" y="148" width="164" height="36" fill="#000" opacity=".8" stroke="#888"/>' +
    slots.map(([cls, label]) => `<g class="${cls}">${txt(278, 172, 15, label, { fill: '#fff' })}</g>`).join('') +
    '<rect x="0" y="200" width="370" height="6" fill="#333"/>' +
    '<g transform="translate(0,200)"><rect class="prog" width="370" height="6" fill="#ffd400"/></g>' +
    '</g>'
  )
}

/** コンテキストのおどし */
function contextAd(): string {
  const body =
    '<g transform="translate(42,84)"><path d="M0,-24 L26,20 L-26,20 Z" fill="#ffd400" stroke="#222" stroke-width="2" stroke-linejoin="round"/>' +
    txt(0, 15, 26, '!', { cls: 'm', fill: '#222' }) +
    '</g>' +
    txt(84, 66, 17, 'コンテキストが', { anchor: 'start', cls: 'm' }) +
    `<g class="blink">${txt(84, 90, 17, '残りわずかです！', { anchor: 'start', cls: 'm', fill: '#d7263d' })}</g>` +
    txt(84, 114, 12, '今なら ご契約で 2 倍に（※気のせい）', { anchor: 'start', fill: '#555' }) +
    button(95, 148, 150, '今すぐ増やす', '#2b5bd7', 15) +
    button(255, 148, 140, 'あとで（また出ます）', '#9a9a9a', 11)

  return popup(40, 230, 340, 180, 'システムの お知らせ（たぶん）', body)
}

/** 閉店セールの星（レベル 2〜） */
function starburst(): string {
  const points = Array.from({ length: 36 }, (_, i) => {
    const r = i % 2 === 0 ? 112 : 88
    const a = (Math.PI * i) / 18

    return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`
  }).join(' ')

  return (
    '<g transform="translate(210,560)">' +
    `<g class="spin"><polygon points="${points}" fill="#ffd400" stroke="#d7263d" stroke-width="6" stroke-linejoin="round"/></g>` +
    '<g class="pulse"><g transform="rotate(-12)">' +
    txt(0, -18, 40, '閉店', { cls: 'm', fill: '#d7263d' }) +
    txt(0, 24, 34, 'セール', { cls: 'm', fill: '#d7263d' }) +
    txt(0, 52, 17, '毎日開催', { cls: 'm', fill: '#222' }) +
    '</g></g></g>'
  )
}

/** 窓の角に貼った「NEW!」のようなシール */
function sticker(x: number, y: number, text: string, fill: string, rot: number): string {
  const points = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 === 0 ? 34 : 27
    const a = (Math.PI * i) / 12

    return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`
  }).join(' ')

  return (
    `<g transform="translate(${x},${y}) rotate(${rot})"><g class="pulse">` +
    `<polygon points="${points}" fill="${fill}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>` +
    txt(0, 6, 16, text, { cls: 'm', fill: '#fff' }) +
    '</g></g>'
  )
}

/** いちばん上の紅白幕 */
function curtain(): string {
  let rope = 'M0,58'

  for (let x = 0; x < W; x += 200) rope += ` Q${x + 100},74 ${x + 200},58`

  const tassels = Array.from(
    { length: 9 },
    (_, i) =>
      `<g transform="translate(${i * 200},58)"><circle r="6" fill="#ffd400"/><path d="M-3,4 L-4,22 M0,4 L0,24 M3,4 L4,22" stroke="#ffd400" stroke-width="2"/></g>`,
  ).join('')

  return (
    `<rect width="${W}" height="60" fill="url(#kohaku)"/><rect width="${W}" height="8" fill="#5a0f1c"/>` +
    `<path d="${rope}" stroke="#ffd400" stroke-width="5" fill="none"/>${tassels}`
  )
}

/** 開店祝いの花輪（スタンドつき） */
function wreath(cx: number, cy: number, from: string): string {
  const colors = ['#ff5fa2', '#ffd400', '#ffffff', '#ff3b3b', '#c77dff']
  const ring = (n: number, r: number, size: number, turn: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (2 * Math.PI * i) / n + turn
      const x = (cx + r * Math.cos(a)).toFixed(1)
      const y = (cy + r * Math.sin(a)).toFixed(1)

      return (
        `<circle cx="${x}" cy="${y}" r="${size}" fill="${colors[i % colors.length]}" stroke="#00000033" stroke-width="2"/>` +
        `<circle cx="${x}" cy="${y}" r="${(size * 0.35).toFixed(1)}" fill="#fff" opacity=".55"/>`
      )
    }).join('')
  const card = ['祝', '開', '店'].map((c, i) => txt(cx, cy - 20 + i * 26, 22, c, { cls: 'm', fill: '#d7263d' })).join('')
  const name = [...from].map((c, i) => txt(cx, cy + 112 + i * 17, 14, c, { cls: 'm' })).join('')

  return (
    `<path d="M${cx - 30},${cy + 40} L${cx - 58},${H} M${cx + 30},${cy + 40} L${cx + 58},${H} M${cx - 46},${cy + 160} L${cx + 46},${cy + 160}" stroke="#6b4a2b" stroke-width="7"/>` +
    `<circle cx="${cx}" cy="${cy}" r="78" fill="#2f8f3a"/>` +
    ring(16, 62, 15, 0) +
    ring(10, 37, 12, 0.3) +
    `<rect x="${cx - 17}" y="${cy - 46}" width="34" height="88" fill="#fff" stroke="#d7263d" stroke-width="3"/>${card}` +
    `<rect x="${cx - 14}" y="${cy + 94}" width="28" height="${from.length * 17 + 12}" fill="#fff"/>${name}`
  )
}

/** 偽の「今すぐダウンロード」 */
function download(): string {
  return (
    '<g transform="translate(300,880)">' +
    `<g class="bounce">${txt(-178, 12, 34, '▼', { cls: 'm', fill: '#39ff6a' })}</g>` +
    `<g class="bounce2">${txt(178, 12, 34, '▼', { cls: 'm', fill: '#39ff6a' })}</g>` +
    '<g class="pulse"><rect x="-150" y="-34" width="300" height="68" rx="12" fill="#1f9d3a" stroke="#0b4f1b" stroke-width="4"/>' +
    '<rect x="-144" y="-30" width="288" height="26" rx="10" fill="#fff" opacity=".18"/>' +
    txt(0, 9, 25, '今すぐダウンロード', { cls: 'm', fill: '#fff' }) +
    '</g>' +
    txt(0, 52, 11, '（何も落ちてきません。そもそも押せません）', { fill: '#f6d6ec' }) +
    '</g>'
  )
}

/** オペレーター たぬ子（チャットの窓） */
function chat(): string {
  const dots = [32, 44, 56].map((x, i) => `<g transform="translate(${x},136)"><circle class="t${i}" r="4" fill="#888"/></g>`).join('')

  return (
    '<g transform="translate(1150,712)">' +
    '<rect x="5" y="6" width="300" height="196" rx="12" fill="#000" opacity=".4"/>' +
    '<rect width="300" height="196" rx="12" fill="#fff" stroke="#ff2bd6" stroke-width="3"/>' +
    '<path d="M0,12 Q0,0 12,0 L288,0 Q300,0 300,12 L300,42 L0,42 Z" fill="#ff2bd6"/>' +
    `<circle cx="24" cy="21" r="14" fill="${FUR}"/><ellipse cx="18" cy="20" rx="5.5" ry="4" fill="${DARK}"/><ellipse cx="30" cy="20" rx="5.5" ry="4" fill="${DARK}"/>` +
    `<circle cx="18" cy="19.5" r="1.6" fill="#fff"/><circle cx="30" cy="19.5" r="1.6" fill="#fff"/><ellipse cx="24" cy="28" rx="5.5" ry="3.8" fill="${MUZZLE}"/>` +
    txt(46, 19, 14, 'オペレーター たぬ子', { anchor: 'start', fill: '#fff' }) +
    '<circle cx="50" cy="31" r="3.5" fill="#39ff6a"/>' +
    txt(58, 35, 10, 'オンライン（年中無休で化けています）', { anchor: 'start', fill: '#fff' }) +
    '<rect x="14" y="52" width="170" height="30" rx="12" fill="#eee"/>' +
    txt(24, 72, 13, '何かお困りですか？', { anchor: 'start' }) +
    '<rect x="14" y="88" width="266" height="30" rx="12" fill="#eee"/>' +
    txt(24, 108, 12, 'いまなら 葉っぱ 3 枚で ご案内します♪', { anchor: 'start' }) +
    `<rect x="14" y="124" width="60" height="24" rx="12" fill="#eee"/>${dots}` +
    '<rect x="12" y="158" width="276" height="28" rx="8" fill="#f6f0f6" stroke="#ddd"/>' +
    txt(22, 177, 11, 'メッセージを入力…（できません）', { anchor: 'start', fill: '#aaa' }) +
    `<g transform="translate(298,2)"><g class="pulse"><circle r="13" fill="#ff1744" stroke="#fff" stroke-width="2"/>${txt(0, 5, 14, '3', { cls: 'm', fill: '#fff' })}</g></g>` +
    '</g>'
  )
}

/** いちばん下のクッキー同意バー（どちらを押しても同意） */
function cookieBar(): string {
  return (
    `<rect y="944" width="${W}" height="56" fill="#16051a" opacity=".94"/><rect y="944" width="${W}" height="3" fill="#ff2bd6"/>` +
    '<g transform="translate(40,973)"><circle r="16" fill="#c98a3d" stroke="#8a5a20" stroke-width="2"/>' +
    '<circle cx="-6" cy="-5" r="2.5" fill="#4a2c10"/><circle cx="5" cy="-7" r="2.2" fill="#4a2c10"/><circle cx="6" cy="5" r="2.5" fill="#4a2c10"/><circle cx="-4" cy="7" r="2" fill="#4a2c10"/></g>' +
    txt(68, 967, 14, '当サイトは 葉っぱ（クッキー）を 使用しています。', { anchor: 'start', fill: '#fff' }) +
    txt(68, 988, 11, 'このまま使うと 同意したことになります（もうなっています）', { anchor: 'start', fill: '#d8a8cc' }) +
    button(1215, 972, 120, '同意する', '#ff2bd6', 14) +
    button(1350, 972, 120, '同意する', '#1f9d3a', 14, 'pulse') +
    txt(1500, 977, 11, '（拒否は ありません）', { fill: '#d8a8cc' })
  )
}

/** 紙吹雪。並びは毎回同じ（同じレベルなら同じ絵） */
function confetti(count: number): string {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647

    return seed / 2147483647
  }
  const colors = ['#ff2bd6', '#ffd400', '#39ff6a', '#00e5ff', '#ff3b3b', '#ffffff']

  return Array.from({ length: count }, (_, i) => {
    const x = Math.round(rand() * W)
    const dur = 5 + rand() * 4
    const delay = rand() * dur
    const w = 8 + Math.round(rand() * 6)
    const h = 5 + Math.round(rand() * 3)

    return (
      `<g transform="translate(${x},-30)"><rect class="cf" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${colors[i % colors.length]}" ` +
      `style="animation-duration:${dur.toFixed(1)}s;animation-delay:-${delay.toFixed(1)}s"/></g>`
    )
  }).join('')
}

/** 飛行船（レベル 2〜。右から左へ、上の紅白幕の前を横切る） */
function blimp(): string {
  return (
    '<g transform="translate(0,52)"><g class="fly">' +
    '<path d="M110,0 L170,6" stroke="#555" stroke-width="2"/>' +
    '<rect x="170" y="-10" width="270" height="34" fill="#fff" stroke="#d7263d" stroke-width="3"/>' +
    txt(305, 14, 18, '大売り出し 毎日開催中', { cls: 'm', fill: '#d7263d' }) +
    '<path d="M90,-10 L126,-36 L126,-8 Z M90,10 L126,36 L126,8 Z" fill="#d7263d"/>' +
    '<ellipse rx="112" ry="34" fill="#f0eef8" stroke="#9a96b0" stroke-width="2"/>' +
    '<path d="M-104,-12 Q0,-24 104,-12" stroke="#ff2bd6" stroke-width="4" fill="none"/>' +
    txt(-4, 9, 21, 'ちんどん商店街', { cls: 'm', fill: '#d7263d' }) +
    '<rect x="-24" y="30" width="48" height="14" rx="4" fill="#555"/>' +
    '</g></g>'
  )
}

/** 宣伝カー（レベル 2〜。下のほうを右から左へ） */
function truck(): string {
  const wheel = (x: number) =>
    `<g transform="translate(${x},-10)"><circle r="18" fill="#111"/><g class="spinw"><circle r="8" fill="#ccc"/><path d="M-8,0 L8,0 M0,-8 L0,8" stroke="#555" stroke-width="2"/></g></g>`

  return (
    '<g transform="translate(0,940)"><g class="drive">' +
    '<ellipse cx="0" cy="4" rx="150" ry="9" fill="#000" opacity=".35"/>' +
    '<rect x="-60" y="-104" width="200" height="80" rx="6" fill="#ffd400" stroke="#8a6d00" stroke-width="3"/>' +
    txt(40, -72, 24, 'ちんどん商店街', { cls: 'm', fill: '#d7263d' }) +
    txt(40, -44, 16, '宣伝カー 巡回中', { cls: 'm', fill: '#222' }) +
    '<path d="M-150,-24 L-150,-70 Q-148,-86 -130,-90 L-70,-90 L-62,-24 Z" fill="#2b5bd7" stroke="#14316f" stroke-width="3"/>' +
    '<path d="M-140,-64 Q-138,-80 -124,-82 L-84,-82 L-80,-60 Z" fill="#bfe6ff"/>' +
    '<rect x="-156" y="-28" width="300" height="12" fill="#333"/>' +
    wheel(-110) +
    wheel(90) +
    '<path d="M-10,-104 L-10,-116 M90,-104 L90,-116" stroke="#555" stroke-width="4"/>' +
    '<path d="M-12,-120 L-40,-134 L-40,-106 Z M92,-120 L120,-134 L120,-106 Z" fill="#bbb" stroke="#666" stroke-width="2"/>' +
    '<g class="blink"><path d="M-50,-130 Q-58,-120 -50,-110 M-60,-136 Q-72,-120 -60,-104 M130,-130 Q138,-120 130,-110 M140,-136 Q152,-120 140,-104" stroke="#fff" stroke-width="3" fill="none"/></g>' +
    sound(-40, -150, 'ただいま 大売り出し中〜♪', 'popslow', 18, '#fff') +
    '</g></g>'
  )
}

/** たぬき不動産（レベル 2〜） */
function realEstate(): string {
  return (
    '<g transform="translate(480,650)">' +
    '<rect x="5" y="6" width="360" height="140" rx="6" fill="#000" opacity=".4"/>' +
    '<rect width="360" height="140" rx="6" fill="#f7ecd4" stroke="#6b4a2b" stroke-width="4"/>' +
    '<path d="M2,36 L2,8 Q2,2 8,2 L352,2 Q358,2 358,8 L358,36 Z" fill="#1f8a4c"/>' +
    txt(180, 27, 21, 'たぬき不動産', { cls: 'm', fill: '#fff' }) +
    '<g transform="translate(34,88) rotate(-30)"><path d="M0,-22 Q18,0 0,22 Q-18,0 0,-22 Z" fill="#3fa34d"/><path d="M0,-20 L0,28" stroke="#2a6b33" stroke-width="2"/></g>' +
    txt(66, 72, 16, '駅から 徒歩 0 分（駅の中）', { anchor: 'start', cls: 'm' }) +
    txt(66, 100, 16, '家賃 0 円（葉っぱ払い OK）', { anchor: 'start', cls: 'm' }) +
    txt(66, 124, 11, '※ 朝になると 森に戻ります', { anchor: 'start', fill: '#666' }) +
    '</g>'
  )
}

/** 広告ブロッカーのお願い（レベル 2〜。会話の後ろ） */
function blockerAd(): string {
  const body =
    txt(220, 66, 17, '広告ブロッカーを 検出しました（気のせい）', { cls: 'm' }) +
    txt(220, 92, 13, '広告を 見てくれると、たぬき が 喜びます', { fill: '#555' }) +
    button(130, 124, 170, '広告を 許可する', '#1f9d3a', 15) +
    button(310, 124, 170, 'もっと 許可する', '#1f9d3a', 15, 'pulse')

  return popup(580, 270, 440, 150, 'お願い', body)
}

/** 「本当に閉じますか？」が増えていく（レベル 3） */
function cascade(): string {
  return Array.from({ length: 6 }, (_, i) => {
    const body =
      txt(150, 58, 16, '本当に 閉じますか？', { cls: 'm' }) +
      button(80, 88, 100, 'はい', '#2b5bd7', 15) +
      button(214, 88, 130, 'はい（推奨）', '#2b5bd7', 15)

    return `<g class="casc${i}">${popup(860 + i * 26, 250 + i * 26, 300, 112, '確認', body)}</g>`
  }).join('')
}

/** 上の電光掲示板 */
function marquee(): string {
  const line =
    '♪ いらっしゃいませ、いらっしゃいませ ♪ ちんどん商店街 大売り出し ♪ 閉店セール 毎日開催中 ♪ 本日かぎり（毎日）♪ この広告は 消せません ♪ たぬき不動産 入居者募集中 ♪ ポンポコ 大サービス '
  const one = (x: number) =>
    `<text x="${x}" y="36" font-size="26" class="m" fill="#ffe14d" textLength="2400" lengthAdjust="spacing">${esc(line)}</text>`
  // 上下のふちの電飾
  const bulbs = (y: number) =>
    Array.from({ length: 50 }, (_, i) => `<circle class="bk${i % 3}" cx="${16 + i * 32}" cy="${y}" r="4.5"/>`).join('')

  return (
    '<g transform="translate(0,92)">' +
    `<rect width="${W}" height="54" fill="#c1121f"/><rect width="${W}" height="10" fill="#ffd400"/><rect y="44" width="${W}" height="10" fill="#ffd400"/>` +
    bulbs(5) +
    bulbs(49) +
    `<g class="marquee">${one(0)}${one(2400)}</g>` +
    '</g>'
  )
}

/** ちょうちんの列 */
function lanterns(): string {
  const chars = ['ち', 'ん', 'ど', 'ん', '商', '店', '街', '大', '売', '出', 'し', '中']
  const xs = chars.map((_, i) => 70 + i * 132)
  let string = 'M0,150'

  for (const x of xs) string += ` Q${x - 66},168 ${x},154`
  string += ` Q${W - 20},168 ${W},150`

  const lamps = chars
    .map(
      (c, i) =>
        `<g transform="translate(${xs[i]},154)"><g class="sway" style="animation-delay:${(-(i % 4) * 0.4).toFixed(1)}s">` +
        '<path d="M0,0 L0,8" stroke="#222" stroke-width="2"/><rect x="-10" y="8" width="20" height="6" fill="#222"/>' +
        '<ellipse cx="0" cy="36" rx="21" ry="25" fill="#e0262f"/>' +
        '<path d="M-19,24 Q0,28 19,24 M-21,36 Q0,40 21,36 M-19,48 Q0,52 19,48" stroke="#a3141c" stroke-width="1.5" fill="none"/>' +
        txt(0, 43, 19, c, { cls: 'm', fill: '#fff' }) +
        '<rect x="-10" y="58" width="20" height="6" fill="#222"/><path d="M0,64 L0,78" stroke="#ffd400" stroke-width="3"/>' +
        '</g></g>',
    )
    .join('')

  return `<path d="${string}" stroke="#222" stroke-width="2" fill="none"/>${lamps}`
}

/** 背景：水玉が流れる紫の壁。会話の乗る中央は少し暗くする（レベルが上がるほど暗くしない） */
function ground(level: Level): string {
  const hush = level === 1 ? 0.6 : level === 2 ? 0.48 : 0.34
  // 薄い透かしの文字（レベル 2 からは数も増える）
  const words = level === 1 ? ['SALE', '激安', '特価', '爆安'] : ['SALE', '激安', '爆安', '驚安', '特価', 'SALE', '激安', '半額']
  const sale = words
    .map((word, i) => {
      const x = 560 + ((i * 337) % 520)
      const y = 300 + ((i * 211) % 560)

      return `<g class="${i % 2 === 0 ? 'blink2' : 'blink'}">${txt(x, y, 72, word, { cls: 'm', fill: '#ff3bd4', extra: ` opacity=".2" transform="rotate(-14 ${x} ${y})"` })}</g>`
    })
    .join('')

  return (
    `<rect width="${W}" height="${H}" fill="#2a0838"/>` +
    `<g class="dots"><rect x="-80" y="-80" width="${W + 160}" height="${H + 160}" fill="url(#dots)"/></g>` +
    sale +
    `<rect width="${W}" height="${H}" fill="url(#hush)" opacity="${hush}"/>`
  )
}

// ───────────────────────── 組み立て ─────────────────────────

const cache = new Map<Level, string>()

/** 背景の SVG。知らない名前なら undefined */
export function sceneSvg(scene: string): string | undefined {
  const level = levelOf(scene)

  if (level === undefined) return undefined

  const hit = cache.get(level)

  if (hit !== undefined) return hit

  const speed = level === 1 ? 44 : level === 2 ? 34 : 26
  // 会話の列（まん中）の左右に、すき間なく詰める
  const ads =
    contextAd() +
    starburst() +
    (level >= 2 ? blockerAd() + realEstate() : '') +
    skipAd() +
    chat() +
    download() +
    prize() +
    sticker(1150, 200, 'NEW!', '#ff2bd6', -14) +
    sticker(1548, 472, 'HOT!', '#ff3b3b', 12) +
    sticker(378, 232, '必見!', '#ff8a00', 10) +
    (level === 3 ? cascade() : '')

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">` +
    `<style>${style(level)}</style>` +
    defs() +
    ground(level) +
    curtain() +
    wreath(75, 740, 'たぬき一同') +
    wreath(1525, 740, 'ちんどん会') +
    lanterns() +
    (level === 3
      ? `<g transform="translate(800,600)"><g class="pulse"><g transform="rotate(-8)">${txt(0, 0, 120, '大フィーバー', { cls: 'm rainbow', fill: '#ffe14d', extra: ' stroke="#3a0b2e" stroke-width="10" paint-order="stroke"' })}</g></g></g>` +
        `<g transform="translate(0,520) scale(.55)"><g class="march2" style="animation-delay:-6s">${troupe()}</g></g>` +
        `<g class="blink">${txt(800, 262, 30, '⚠ 警告：広告が 増殖しています ⚠', { cls: 'm', fill: '#ff1744', extra: ' stroke="#ffd400" stroke-width="4" paint-order="stroke"' })}</g>`
      : '') +
    (level === 3 ? `<g class="shake">${ads}</g>` : ads) +
    cookieBar() +
    (level >= 2 ? truck() : '') +
    // 出した瞬間から画面の中を歩いているように、途中から始める
    `<g transform="translate(0,${BASE})"><g class="march" style="animation-duration:${speed}s;animation-delay:-${(speed * 0.4).toFixed(1)}s">${troupe()}</g></g>` +
    confetti(level === 3 ? 56 : 28) +
    (level >= 2 ? blimp() : '') +
    marquee() +
    (level === 3
      ? `<g class="blink"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="#ff1744" stroke-width="14"/>` +
        txt(W - 24, 934, 22, '広告レベル MAX', { cls: 'm', fill: '#ff1744', anchor: 'end' }) +
        '</g>'
      : '') +
    '</svg>'

  cache.set(level, svg)

  return svg
}
