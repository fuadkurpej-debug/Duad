"""Sintetizuje originalnu zvučnu podlogu za trailer (bez autorskih prava): beat, udarci, whoosh, pop."""
import sys
import wave

import numpy as np

SR, DUR = 48000, 15.0
t = np.arange(int(SR * DUR)) / SR
out = np.zeros_like(t)
rng = np.random.default_rng(7)


def add(sig, at, gain=1.0):
    i = int(at * SR)
    n = min(len(sig), len(out) - i)
    out[i:i + n] += gain * sig[:n]


def kick(length=0.35):
    x = np.arange(int(SR * length)) / SR
    freq = 110 * np.exp(-x * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-x * 9)


def hat(length=0.05):
    x = np.arange(int(SR * length)) / SR
    return rng.standard_normal(len(x)) * np.exp(-x * 90) * 0.3


def impact():
    x = np.arange(int(SR * 0.9)) / SR
    boom = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-x * 6) + 35) / SR) * np.exp(-x * 4)
    crack = rng.standard_normal(len(x)) * np.exp(-x * 30) * 0.5
    return boom + crack


def whoosh(length=0.45):
    n = int(SR * length)
    noise = rng.standard_normal(n)
    # jednostavan low-pass čija se frekvencija penje
    y, prev = np.zeros(n), 0.0
    alpha = np.linspace(0.02, 0.35, n)
    for i in range(n):
        prev += alpha[i] * (noise[i] - prev)
        y[i] = prev
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return y * env * 1.6


def pop():
    x = np.arange(int(SR * 0.08)) / SR
    return np.sin(2 * np.pi * (900 - 4000 * x) * x) * np.exp(-x * 45) * 0.5


# beat 120 BPM od 3s do kraja, pauza u sceni 1
beat = 0.5
for k in range(int((DUR - 3) / beat)):
    at = 3 + k * beat
    add(kick(), at, 0.8)
    add(hat(), at + beat / 2, 1.0)

for at in (0.15, 0.7, 1.3, 11.4, 12.3):
    add(impact(), at, 0.9)
for at in (7.55, 8.35, 9.15, 10.9):
    add(whoosh(), at, 0.7)
for i in range(6):
    add(pop(), 3.2 + i * 0.5, 0.8)

out /= np.max(np.abs(out)) * 1.05
fade = int(SR * 0.4)
out[-fade:] *= np.linspace(1, 0, fade)
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
