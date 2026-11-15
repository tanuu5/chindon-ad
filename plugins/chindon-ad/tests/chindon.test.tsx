import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

import { closeLabel, pressReply, toastEvery } from '../hooks/copy'
import { actionOf } from '../hooks/register'
import { LEVELS, levelOf, sceneName, sceneSvg } from '../hooks/scene'

// 入力欄から打った /chindon
const typed = (args: string) =>
  ({
    command: 'chindon',
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 100 },
  }) as const

const BAND = {
  plugin: 'chindon-ad',
  component: 'AbovePrompt',
  requestId: 'above-prompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

/** エンジンの代わり：store・theme・時計・通知を手元で持つ */
function fakeEngine(on: Parameters<TestBody>[1], seed: Record<string, unknown> = {}) {
  const store = new Map<string, unknown>(Object.entries(seed))
  const sets: { scene: string | undefined; opacity: number | undefined }[] = []
  const toasts: string[] = []
  const sounds: string[] = []
  let clears = 0

  on('command.register', () => ({ value: { command: 'chindon' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('store.get', (_, e) => ({ value: store.get(e.key) }))
  on('store.set', (_, e) => {
    store.set(e.key, e.value)

    return { value: undefined }
  })
  on('clock.now', () => ({ value: Date.UTC(2026, 10, 15, 3, 0) }))
  on('theme.set', (_, e) => {
    const backdrop = e.backdrop
    const scene = backdrop !== undefined && 'scene' in backdrop ? backdrop.scene : undefined
    const glass = backdrop !== undefined && 'scene' in backdrop && backdrop.glass !== false ? backdrop.glass?.opacity : undefined

    sets.push({ scene, opacity: glass })

    return { value: { isDrawn: true, requestId: 'theme' } } as const
  })
  on('theme.clear', () => {
    clears += 1

    return { value: { isDrawn: false, reason: 'cleared' } }
  })
  on('ui.toast', (_, e) => {
    toasts.push(e.text)

    return { value: undefined }
  })
  on('audio.play', (_, e) => {
    sounds.push('asset' in e.clip && e.clip.asset !== undefined ? e.clip.asset : '?')

    return { value: undefined }
  })

  return { store, sets, toasts, sounds, clears: () => clears }
}

test('どのレベルも、上限に収まる SVG になる', () => {
  for (const level of LEVELS) {
    const svg = sceneSvg(sceneName(level)) ?? ''

    expect(svg.startsWith('<svg ')).toBe(true)
    expect(svg.endsWith('</svg>')).toBe(true)
    expect(svg.length < 131072).toBe(true)
    expect(levelOf(sceneName(level))).toBe(level)
    // スクリプトは入れない
    expect(svg.includes('<script')).toBe(false)
  }

  // レベルが上がるほど広告が増える
  expect((sceneSvg('lv1') ?? '').length < (sceneSvg('lv3') ?? '').length).toBe(true)
  expect(sceneSvg('lv4')).toBe(undefined)
})

test('コマンドの言葉を読む', () => {
  expect(actionOf('')).toEqual({ kind: 'status' })
  expect(actionOf('店じまい')).toEqual({ kind: 'open', open: false })
  expect(actionOf('開店')).toEqual({ kind: 'open', open: true })
  expect(actionOf('レベル 3')).toEqual({ kind: 'level', level: 3 })
  expect(actionOf('レベル 9')).toEqual({ kind: 'level', level: undefined })
  expect(actionOf('音 なし')).toEqual({ kind: 'sound', sound: false })
  expect(actionOf('もっと')).toEqual({ kind: 'more' })
  expect(actionOf('宇宙')).toEqual({ kind: 'unknown', word: '宇宙' })
})

test('広告の文句', () => {
  expect(toastEvery(1)).toBe(3)
  expect(toastEvery(3)).toBe(1)
  expect(closeLabel(3).includes('効きません')).toBe(true)
  expect(pressReply(1, 1).includes('レベル 2')).toBe(true)
  expect(pressReply(3, 1).includes('店じまい')).toBe(true)
})

test('始まったらレベル 1 の背景を出し、店じまいで片づけ、開店で戻る', async ($, on) => {
  const engine = fakeEngine(on)

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(engine.sets).toEqual([{ scene: 'lv1', opacity: 0.56 }])

  const closed = await $.command.run(typed('店じまい'))

  expect(closed.text?.includes('営業は終了')).toBe(true)
  expect(engine.clears()).toBe(1)
  expect(engine.store.get('open')).toBe(false)

  const opened = await $.command.run(typed('開店'))

  expect(opened.text?.includes('開店')).toBe(true)
  expect(engine.sets.at(-1)).toEqual({ scene: 'lv1', opacity: 0.56 })

  await $.command.run(typed('レベル 3'))
  expect(engine.sets.at(-1)).toEqual({ scene: 'lv3', opacity: 0.38 })
})

test('店じまいしてあれば、始まっても何も出さない', async ($, on) => {
  const engine = fakeEngine(on, { open: false })

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(engine.sets).toEqual([])
  expect(engine.clears()).toBe(0)
})

test('送信のたびにチンドン。音なしなら鳴らさない', async ($, on) => {
  const engine = fakeEngine(on)

  on('prompt.submit', (_, e) => ({ text: e.text }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.prompt.submit({ text: 'こんにちは', wait: false, origin: { kind: 'composer' } })
  expect(engine.sounds).toEqual(['sounds/chindon.wav'])

  await $.command.run(typed('音 なし'))
  await $.prompt.submit({ text: 'もう一度', wait: false, origin: { kind: 'composer' } })
  expect(engine.sounds).toEqual(['sounds/chindon.wav'])
})

test('帯の「× 閉じる」を押すと、閉じずに広告が増える', async ($, on) => {
  const engine = fakeEngine(on)

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

  expect((await ui.find({ type: 'Text', text: /PR/ }))?.text).toBe(' PR ')
  await ui.press({ key: 'close' })
  expect(engine.store.get('level')).toBe(2)
  expect(engine.sets.at(-1)).toEqual({ scene: 'lv2', opacity: 0.46 })
  expect(engine.toasts.at(-1)?.includes('増やして')).toBe(true)
  expect(engine.sounds).toEqual(['sounds/pon.wav'])

  await ui.press({ key: 'close' })
  await ui.press({ key: 'close' })
  // いちばん上は 3
  expect(engine.store.get('level')).toBe(3)
  expect((await ui.find({ type: 'Button', key: 'close' }))?.text?.includes('効きません')).toBe(true)
  await ui.unmount()
})

test('店じまいしたら帯も出ない', async ($, on) => {
  fakeEngine(on, { open: false })

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

  expect(await ui.find({ type: 'Text', text: /PR/ })).toBe(undefined)
  await ui.unmount()
})

test('帯の「詳しく見る」は、詳しくない説明を出して鳴らす', async ($, on) => {
  const engine = fakeEngine(on)

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  const before = (await ui.find({ type: 'Text', text: /。|！|）/ }))?.text

  await ui.press({ key: 'detail' })
  expect(engine.toasts.at(-1)?.startsWith('【詳しく】')).toBe(true)
  expect(engine.sounds).toEqual(['sounds/chindon.wav'])
  // レベルは変わらない
  expect(engine.store.get('level')).toBe(undefined)
  // 帯の文句は次のものに替わる
  expect((await ui.find({ type: 'Text', text: /。|！|）/ }))?.text === before).toBe(false)
  await ui.unmount()
})
