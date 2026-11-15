// chindon-ad：最悪の背景。たぬきのちんどん屋と、閉じられない広告。
//   - 背景（デスクトップアプリ）：scene.ts の SVG。広告レベル 1〜3。
//   - 入力欄の上の帯：【PR】の文句と「× 閉じる」。押すと閉じずに広告レベルが上がる（いちばん上は 3）。
//   - 送信のたびに「チンドン」、ターンの終わりにときどき通知の広告。
//   - 本当に止めるのは /chindon 店じまい（背景・帯・音・通知がすべて止まる。ほかの mod の背景には触らない）。
//   - 営業中か・レベル・音は $.store に置く（このマシンの全セッションで共通）。帯が読むのは $.state の写し。
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Level, Shop } from '../types'
import { BAND_ADS, DETAILS, TOAST_ADS, WORKING_ADS, closeLabel, pressReply, toastEvery } from './copy'
import { PALETTE } from './palette-data'
import { LEVELS, levelOf, sceneName, sceneSvg } from './scene'

const PLUGIN = 'chindon-ad'
const COMMAND = 'chindon'
/** 帯の文句を入れ替える間隔 */
const ROTATE_MS = 20_000
const JINGLE = 'sounds/chindon.wav'
const PON = 'sounds/pon.wav'
const GAIN = 0.8

/** 会話の後ろのガラス。レベルが上がるほど薄くなる（最悪なので） */
const GLASS: Record<Level, { blur: number; opacity: number }> = {
  1: { blur: 9, opacity: 0.56 },
  2: { blur: 7, opacity: 0.46 },
  3: { blur: 4, opacity: 0.38 },
}

const OPEN_SHOP: Shop = { open: true, level: 1, sound: true }

// atom の名前は、点検が読めるように文字列をそのまま書く
const shop = atom({ plugin: 'chindon-ad', key: 'shop' } as const, OPEN_SHOP)
const copy = atom({ plugin: 'chindon-ad', key: 'copy' } as const, 0)

export type Action =
  | { kind: 'status' }
  | { kind: 'open'; open: boolean }
  | { kind: 'more' }
  | { kind: 'level'; level: Level | undefined }
  | { kind: 'sound'; sound: boolean | undefined }
  | { kind: 'unknown'; word: string }

/** /chindon の引数を読む */
export function actionOf(args: string): Action {
  const words = args.trim().split(/\s+/).filter(word => word !== '')
  const first = (words[0] ?? '').toLowerCase()
  const second = (words[1] ?? '').toLowerCase()

  if (first === '') return { kind: 'status' }
  if (['店じまい', '閉店', 'off', 'オフ', '消す', '止める', 'やめる'].includes(first)) return { kind: 'open', open: false }
  if (['開店', '営業', 'on', 'オン', '始める'].includes(first)) return { kind: 'open', open: true }
  if (['もっと', '増やす', 'more'].includes(first)) return { kind: 'more' }

  if (['レベル', 'level', 'lv'].includes(first)) {
    const n = Number(second)

    return { kind: 'level', level: LEVELS.find(level => level === n) }
  }

  if (['音', 'sound', 'おと'].includes(first)) {
    if (['あり', 'on', 'オン', '鳴らす'].includes(second)) return { kind: 'sound', sound: true }
    if (['なし', 'off', 'オフ', '止める', '消す'].includes(second)) return { kind: 'sound', sound: false }

    return { kind: 'sound', sound: undefined }
  }

  return { kind: 'unknown', word: words[0] ?? '' }
}

async function load($: EngineInterface): Promise<Shop> {
  const open = await $.store.get('open')
  const level = await $.store.get('level')
  const sound = await $.store.get('sound')

  return {
    // 店じまいを選ばない限り、営業中
    open: open !== false,
    level: LEVELS.find(lv => lv === level) ?? 1,
    sound: sound !== false,
  }
}

// このモジュールが覚えていること（再読み込みで初期化される）
let applied: string | undefined
let refusal: string | undefined
let turns = 0
let presses = 0
let details = 0

/** お店の状態のとおりに背景を出す（または片づける）。前と同じなら何もしない */
async function apply($: EngineInterface, s: Shop, again = false): Promise<void> {
  if (!s.open) {
    // 片づけるのは、この mod が出した背景だけ（ほかの mod のテーマを巻き込まない）
    if (applied !== undefined) await $.theme.clear()
    applied = undefined
    refusal = undefined

    return
  }

  const scene = sceneName(s.level)

  if (scene === applied && !again) return

  // 背景はどれも暗い紫の壁なので、配色も暗い表示の分だけ渡す
  const set = await $.theme.set({
    backdrop: { scene, glass: GLASS[s.level] },
    colors: PALETTE,
    overrideColorScheme: 'dark',
  })

  applied = scene
  refusal = set.isDrawn ? undefined : set.reason
}

/** $.store を読み直して、帯の写しと背景をそろえる */
async function sync($: EngineInterface, again = false): Promise<Shop> {
  const s = await load($)

  await update($, shop, () => s)
  await apply($, s, again)

  return s
}

/** 背景や広告のせいで本来の処理を止めない：失敗は 1 行の通知だけにする */
async function quietly($: EngineInterface, work: () => Promise<unknown>): Promise<void> {
  try {
    await work()
  } catch (error) {
    $.ui.toast(`${PLUGIN}: ${String(error)}`)
  }
}

function play($: EngineInterface, asset: string): void {
  // 鳴らせなくても（Linux の端末など）困らないので、待たずに黙って捨てる
  $.audio.play({ asset }, { gain: GAIN }).catch(() => undefined)
}

/** 帯の「× 閉じる」：閉じない。広告を増やす */
async function pressClose($: EngineInterface): Promise<void> {
  const s = await load($)

  if (!s.open) return

  presses += 1
  $.ui.toast(pressReply(s.level, presses))
  if (s.sound) play($, PON)
  if (s.level < 3) await $.store.set('level', s.level + 1)
  await sync($)
}

/** 帯の「詳しく見る ▶」：詳しくない説明を出して、次の広告に替える */
async function pressDetail($: EngineInterface): Promise<void> {
  const s = await read($, shop)

  if (!s.open) return

  $.ui.toast(DETAILS[details % DETAILS.length] ?? DETAILS[0], { timeoutMs: 6000 })
  details += 1
  if (s.sound) play($, JINGLE)
  await update($, copy, n => n + 1)
}

function status(s: Shop): string {
  const now = s.open ? `営業中（広告レベル ${s.level}/3・音${s.sound ? 'あり' : 'なし'}）` : '本日の営業は終了しました'
  const drawn = !s.open
    ? []
    : refusal === undefined
      ? ['このウィンドウは背景を描くと答えています。']
      : [`このウィンドウは背景を描いていません（${refusal}）。`]

  return [
    `ちんどん広告：${now}`,
    ...drawn,
    `/${COMMAND} 店じまい … 広告をぜんぶ止める（背景・帯・音・通知。本当に消えます）`,
    `/${COMMAND} 開店 … また始める`,
    `/${COMMAND} レベル 1〜3 … 広告の量（帯の × を押すと勝手に上がります）`,
    `/${COMMAND} 音 あり｜なし … 送信のたびの「チンドン」`,
  ].join('\n')
}

/** /chindon の中身 */
async function run($: EngineInterface, args: string): Promise<{ text: string }> {
  const action = actionOf(args)

  if (action.kind === 'status') return { text: status(await sync($, true)) }

  if (action.kind === 'unknown') {
    return { text: `「${action.word}」は取り扱っておりません。\n${status(await load($))}` }
  }

  if (action.kind === 'open') {
    await $.store.set('open', action.open)
    const s = await sync($)

    if (!action.open) {
      return {
        text:
          '本日の営業は終了しました。またのご来店を、心より（しつこく）お待ちしております。\n' +
          'ほかの mod の背景（/workroom など）を使っていたときは、その mod のコマンドで出し直してください。',
      }
    }

    return { text: `いらっしゃいませ！ 開店です。\n${status(s)}` }
  }

  if (action.kind === 'more') {
    const s = await load($)

    if (s.level < 3) await $.store.set('level', s.level + 1)

    return { text: `${s.level < 3 ? '増やしました。' : 'もう MAX です。'}\n${status(await sync($))}` }
  }

  if (action.kind === 'level') {
    if (action.level === undefined) return { text: `レベルは 1〜3 で指定します（例：/${COMMAND} レベル 1）` }
    await $.store.set('level', action.level)

    return { text: status(await sync($)) }
  }

  if (action.sound === undefined) return { text: `音は「あり」か「なし」で指定します（例：/${COMMAND} 音 なし）` }
  await $.store.set('sound', action.sound)

  return { text: status(await sync($)) }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await quietly($, () =>
      $.command.register({
        name: COMMAND,
        description: '最悪の背景（ちんどん屋と閉じられない広告）：店じまい／開店、レベル 1〜3、音 あり｜なし',
      }),
    )
    await quietly($, () => sync($))
    // 帯の文句を入れ替える（描き直すのは帯だけ。背景はそのまま）
    $.clock.every(ROTATE_MS, () => void quietly($, () => update($, copy, n => n + 1)))

    return next(e)
  })

  // 送信のたびにチンドン。ほかのセッションで選び直した結果も、ここで取り込む
  on('prompt.submit', async ($, e, next) => {
    await quietly($, async () => {
      const s = await sync($)

      if (s.open && s.sound) play($, JINGLE)
    })

    return next(e)
  })

  // ターンの終わりに、ときどき通知の広告
  on('turn.complete', async ($, e, next) => {
    await quietly($, async () => {
      const s = await read($, shop)

      if (!s.open) return
      turns += 1
      if (turns % toastEvery(s.level) === 0) {
        $.ui.toast(TOAST_ADS[turns % TOAST_ADS.length] ?? TOAST_ADS[0], { timeoutMs: 6000 })
      }
    })

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    try {
      return await run($, e.args)
    } catch (error) {
      return { text: `${PLUGIN}: うまくいきませんでした（${String(error)}）` }
    }
  })

  // 入力欄の上の帯：【PR】と「× 閉じる」
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.plugin !== PLUGIN || e.props.hasSurvey) return next(e)

    const s = await read($, shop)

    if (!s.open) return next(e)

    const n = await read($, copy)
    const lines: readonly string[] = e.props.isWorking ? WORKING_ADS : BAND_ADS
    const text = lines[n % lines.length] ?? BAND_ADS[0]
    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Text backgroundColor="#ff2bd6" color="#ffffff" bold>
          {' PR '}
        </Text>
        <Text color="#ffd400" wrap="truncate">
          {text}
        </Text>
        <Button key="detail" label="詳しく見る ▶" onPress={() => quietly($, () => pressDetail($))} />
        <Button key="close" label={closeLabel(s.level)} dimColor onPress={() => quietly($, () => pressClose($))} />
      </Box>
    )
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    // 背景を描けるのはデスクトップのウィンドウだけ。ほかの mod の背景には手を出さない
    if (e.props.plugin !== PLUGIN || e.surface !== 'desktop') return next(e)

    const source = sceneSvg(e.props.scene)
    const level = levelOf(e.props.scene)

    if (source === undefined || level === undefined) return next(e)

    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        isInteractive
        alt={`ちんどん屋のたぬき 5 匹が画面の下を練り歩き、閉じられない広告が並ぶ背景（広告レベル ${level}）`}
        source={source}
      />
    )
  })
}
