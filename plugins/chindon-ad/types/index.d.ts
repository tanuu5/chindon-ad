// chindon-ad が $.state に置く値の約束。

/** 広告レベル：1（ふつうに最悪）〜 3（MAX） */
export type Level = 1 | 2 | 3

/** お店の状態（$.store の写し。帯の描き直しに使う） */
export type Shop = {
  /** 営業中か（店じまいすると、背景・帯・音・通知がすべて止まる） */
  open: boolean
  level: Level
  /** 送信のたびに「チンドン」を鳴らすか */
  sound: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'chindon-ad': {
      shop: Shop
      /** 帯に出す文句の番号（20 秒ごとに 1 つ進む） */
      copy: number
    }
  }
}
