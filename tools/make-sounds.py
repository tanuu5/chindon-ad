"""chindon-ad の効果音を合成する（標準ライブラリだけ。素材は使わない）。

使い方：python3 tools/make-sounds.py [書き出し先フォルダ]
  省くと plugins/chindon-ad/sounds/ に書く。

- chindon.wav：送信のたびに鳴る「チン・ドン・チン・ドン・ドドン」とクラリネットの短い節（約 1.7 秒）
- pon.wav：広告の「× 閉じる」を押したときの腹鼓「ポン」と鉦「チン」
"""

import math
import os
import random
import struct
import sys
import wave

RATE = 22050


def blank(seconds):
    return [0.0] * int(seconds * RATE)


def mix(buf, sound, at, gain=1.0):
    start = int(at * RATE)
    for i, v in enumerate(sound):
        j = start + i
        if j >= len(buf):
            break
        buf[j] += v * gain


def kane(length=0.45):
    """鉦（かね）：金属の、倍音がそろわない明るい音"""
    rng = random.Random(1)
    partials = [(1870, 1.0), (2650, 0.6), (3910, 0.4), (5230, 0.25)]
    out = []
    for i in range(int(length * RATE)):
        t = i / RATE
        v = sum(a * math.sin(2 * math.pi * f * t) for f, a in partials) * math.exp(-t / 0.12)
        if t < 0.005:
            v += (rng.random() * 2 - 1) * 0.8 * (1 - t / 0.005)
        out.append(v * 0.35)
    return out


def drum(length=0.4, low=60, high=110, decay=0.22):
    """太鼓：叩いた瞬間に高く、すぐ低く沈む音"""
    rng = random.Random(2)
    out = []
    phase = 0.0
    for i in range(int(length * RATE)):
        t = i / RATE
        f = low + high * math.exp(-t / 0.04)
        phase += 2 * math.pi * f / RATE
        v = math.sin(phase) * math.exp(-t / decay)
        if t < 0.01:
            v += (rng.random() * 2 - 1) * 0.5 * (1 - t / 0.01)
        out.append(v)
    return out


def clarinet(freq, length):
    """クラリネットらしい音：奇数倍音だけ、ゆるいビブラート"""
    harmonics = [(1, 1.0), (3, 0.45), (5, 0.25), (7, 0.12)]
    out = []
    phase = 0.0
    for i in range(int(length * RATE)):
        t = i / RATE
        f = freq * (1 + 0.006 * math.sin(2 * math.pi * 5.5 * t))
        phase += 2 * math.pi * f / RATE
        v = sum(a * math.sin(h * phase) for h, a in harmonics)
        env = min(1.0, t / 0.02) * min(1.0, (length - t) / 0.04)
        out.append(v * max(env, 0.0) * 0.28)
    return out


def note(name):
    table = {'A4': 440.0, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99}
    return table[name]


def chindon():
    step = 0.18
    buf = blank(1.75)
    for k in range(4):
        mix(buf, kane(), k * 2 * step, 0.9)
    for at in (1, 3, 5, 5.5, 7):
        mix(buf, drum(), at * step, 1.0 if at != 7 else 1.2)
    melody = [('E5', 1), ('E5', 1), ('D5', 0.5), ('E5', 0.5), ('G5', 1), ('E5', 1), ('D5', 1), ('C5', 1), ('A4', 2)]
    at = 0.0
    for name, beats in melody:
        mix(buf, clarinet(note(name), beats * step * 0.95), at, 0.8)
        at += beats * step
    return buf


def pon():
    buf = blank(0.7)
    mix(buf, drum(0.5, low=95, high=70, decay=0.18), 0.0, 1.2)
    mix(buf, kane(0.4), 0.22, 0.7)
    return buf


def write(path, buf, peak=0.8):
    top = max(abs(v) for v in buf) or 1.0
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h', int(v / top * peak * 32767)) for v in buf))
    print(f'{path}: {len(buf) / RATE:.2f} 秒')


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, '..', 'plugins', 'chindon-ad', 'sounds')
    os.makedirs(out, exist_ok=True)
    write(os.path.join(out, 'chindon.wav'), chindon())
    write(os.path.join(out, 'pon.wav'), pon())


if __name__ == '__main__':
    main()
