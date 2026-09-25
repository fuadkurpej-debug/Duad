#!/usr/bin/env python3
"""Napravi vertikalni (9:16) Fuego Clipping klip iz dužeg videa.

Radi: isijecanje dijela videa, 9:16 format (zamućena pozadina ili crop),
titlove riječ-po-riječ u Fuego stilu, udicu (hook) na vrhu, kredit autoru,
logo vodeni žig i normalizaciju zvuka na -14 LUFS.

Primjer:
    python make_clip.py izvor.mp4 --start 1:23 --end 1:58 \
        --hook "He did NOT expect that 😭" --credit "@Druski" -o klip.mp4

Titlovi: po defaultu se prave automatski (faster-whisper). Umjesto toga
možeš dati svoj .srt fajl (--captions titl.srt) ili ih isključiti (--captions none).
"""

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FONT_DIR = REPO / "branding"
FONT_NAME = "Anton"
LOGO = REPO / "branding" / "watermark.png"

W, H = 1080, 1920
WORDS_PER_LINE = 3
# ASS boje su u formatu &HBBGGRR
WHITE = "&H00FFFFFF"
FUEGO = "&H00007AFF"  # #ff7a00
BLACK = "&H00000000"


def find_ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("ffmpeg nije pronađen. Instaliraj ga (ffmpeg.org) ili: pip install imageio-ffmpeg")


def parse_time(value):
    """'83', '1:23', '01:01:23.5' -> sekunde."""
    seconds = 0.0
    for part in value.split(":"):
        seconds = seconds * 60 + float(part)
    return seconds


def ass_time(t):
    t = max(t, 0)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def ass_escape(text):
    return text.replace("\\", "").replace("{", "(").replace("}", ")").replace("\n", " ")


# ---------- riječi s vremenima ----------

def words_from_whisper(ffmpeg, src, start, end, model_name, language):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("Za automatske titlove: pip install faster-whisper (ili --captions titl.srt / none)")
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "audio.wav"
        subprocess.run(
            [ffmpeg, "-v", "error", "-ss", str(start), "-to", str(end), "-i", str(src),
             "-vn", "-ac", "1", "-ar", "16000", "-y", str(wav)],
            check=True,
        )
        print(f"Transkribujem ({model_name})…")
        model = WhisperModel(model_name, device="auto", compute_type="int8")
        segments, _ = model.transcribe(str(wav), language=language, word_timestamps=True, vad_filter=True)
        return [(w.start, w.end, w.word.strip()) for seg in segments for w in seg.words if w.word.strip()]


def words_from_srt(path, start, end):
    """Čita .srt (vremena u odnosu na IZVORNI video) i ravnomjerno raspoređuje riječi."""
    text = Path(path).read_text(encoding="utf-8-sig")
    blocks = re.split(r"\n\s*\n", text.strip())
    stamp = re.compile(r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)")
    words = []
    for block in blocks:
        lines = block.strip().splitlines()
        for i, line in enumerate(lines):
            m = stamp.search(line)
            if not m:
                continue
            g = [int(x) for x in m.groups()]
            a = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000 - start
            b = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000 - start
            tokens = " ".join(lines[i + 1:]).split()
            if not tokens or b <= 0 or a >= end - start:
                break
            step = (b - a) / len(tokens)
            words += [(a + k * step, a + (k + 1) * step, tok) for k, tok in enumerate(tokens)]
            break
    return words


# ---------- ASS titlovi ----------

def build_ass(words, hook, hook_seconds, credit, duration):
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{FONT_NAME},96,{WHITE},{WHITE},{BLACK},&H80000000,0,0,0,0,100,100,2,0,1,7,3,2,60,60,560,1
Style: Hook,{FONT_NAME},78,{WHITE},{WHITE},{FUEGO},{FUEGO},0,0,0,0,100,100,1,0,3,18,0,8,70,70,260,1
Style: Credit,{FONT_NAME},44,&H30FFFFFF,{WHITE},{BLACK},&H80000000,0,0,0,0,100,100,2,0,1,3,0,2,60,60,300,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    if hook:
        events.append(f"Dialogue: 2,{ass_time(0)},{ass_time(min(hook_seconds, duration))},Hook,,0,0,0,,"
                      f"{{\\fad(0,250)}}{ass_escape(hook.upper())}")
    if credit:
        events.append(f"Dialogue: 1,{ass_time(0)},{ass_time(duration)},Credit,,0,0,0,,{ass_escape(credit)}")

    words = [(max(a, 0), min(b, duration), t) for a, b, t in words if b > 0 and a < duration]
    for i in range(0, len(words), WORDS_PER_LINE):
        group = words[i:i + WORDS_PER_LINE]
        next_start = words[i + WORDS_PER_LINE][0] if i + WORDS_PER_LINE < len(words) else group[-1][1]
        for j, (a, b, _) in enumerate(group):
            # riječ je istaknuta dok ne krene sljedeća; zadnja riječ ostaje do sljedeće grupe
            end = group[j + 1][0] if j + 1 < len(group) else max(b, min(next_start, b + 0.6))
            parts = []
            for k, (_, _, text) in enumerate(group):
                text = ass_escape(text.upper())
                parts.append(f"{{\\c{FUEGO}\\fscx110\\fscy110}}{text}{{\\r}}" if k == j else text)
            pop = "{\\fscx92\\fscy92\\t(0,80,\\fscx100\\fscy100)}" if j == 0 else ""
            events.append(f"Dialogue: 0,{ass_time(a)},{ass_time(end)},Cap,,0,0,0,,{pop}{' '.join(parts)}")
    return header + "\n".join(events) + "\n"


# ---------- ffmpeg ----------

def filter_graph(layout, crop_x, ass_path, watermark):
    ass = str(ass_path).replace("\\", "/").replace(":", "\\:")
    fonts = str(FONT_DIR).replace("\\", "/").replace(":", "\\:")
    if layout == "crop":
        # crop_x: 0 = lijevo, 0.5 = sredina, 1 = desno
        video = (f"[0:v]scale=-2:{H},crop={W}:{H}:(iw-{W})*{crop_x}:0,setsar=1[base]")
    else:
        video = (f"[0:v]split[a][b];"
                 f"[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30:3,eq=brightness=-0.12[bg];"
                 f"[b]scale={W}:-2[fg];"
                 f"[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[base]")
    graph = video + f";[base]ass='{ass}':fontsdir='{fonts}'[subbed]"
    if watermark:
        graph += ";[1:v]scale=110:110,format=rgba,colorchannelmixer=aa=0.85[logo];[subbed][logo]overlay=W-w-40:40[v]"
    else:
        graph += ";[subbed]null[v]"
    return graph


def main():
    p = argparse.ArgumentParser(description="Napravi 9:16 Fuego Clipping klip.")
    p.add_argument("source", type=Path, help="izvorni video (uz dozvolu autora / iz clipping kampanje)")
    p.add_argument("--start", required=True, help="početak, npr. 1:23 ili 83")
    p.add_argument("--end", required=True, help="kraj, npr. 1:58")
    p.add_argument("-o", "--output", type=Path, default=Path("fuego_clip.mp4"))
    p.add_argument("--hook", default="", help="tekst udice na vrhu u prvim sekundama")
    p.add_argument("--hook-seconds", type=float, default=3.0)
    p.add_argument("--credit", default="", help="kredit autoru, npr. @Druski")
    p.add_argument("--layout", choices=["blur", "crop"], default="blur",
                   help="blur = cijeli kadar preko zamućene pozadine, crop = izreži 9:16")
    p.add_argument("--crop-x", type=float, default=0.5, help="za --layout crop: 0 lijevo … 1 desno")
    p.add_argument("--captions", default="auto", help="auto (whisper), putanja do .srt, ili none")
    p.add_argument("--model", default="small", help="whisper model: tiny, base, small, medium, large-v3")
    p.add_argument("--language", default=None, help="jezik govora, npr. en (default: automatski)")
    p.add_argument("--no-watermark", action="store_true")
    args = p.parse_args()

    if not args.source.is_file():
        sys.exit(f"Video nije pronađen: {args.source}")
    start, end = parse_time(args.start), parse_time(args.end)
    if end <= start:
        sys.exit("--end mora biti poslije --start")
    duration = end - start
    if duration > 180:
        sys.exit(f"Klip traje {duration:.0f}s; Short može najviše 180s (idealno 20–45s).")

    ffmpeg = find_ffmpeg()
    if args.captions == "none":
        words = []
    elif args.captions == "auto":
        words = words_from_whisper(ffmpeg, args.source, start, end, args.model, args.language)
    else:
        words = words_from_srt(args.captions, start, end)

    watermark = not args.no_watermark and LOGO.exists()
    with tempfile.TemporaryDirectory() as tmp:
        ass_path = Path(tmp) / "captions.ass"
        ass_path.write_text(build_ass(words, args.hook, args.hook_seconds, args.credit, duration), encoding="utf-8")
        cmd = [ffmpeg, "-v", "error", "-stats", "-ss", str(start), "-to", str(end), "-i", str(args.source)]
        if watermark:
            cmd += ["-i", str(LOGO)]
        cmd += [
            "-filter_complex", filter_graph(args.layout, args.crop_x, ass_path, watermark),
            "-map", "[v]", "-map", "0:a?",
            "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
            "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2",
            "-movflags", "+faststart", "-y", str(args.output),
        ]
        subprocess.run(cmd, check=True)
    print(f"Gotovo: {args.output} ({duration:.1f}s, {W}x{H})")


if __name__ == "__main__":
    main()
