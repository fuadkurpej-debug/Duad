#!/usr/bin/env python3
"""Objavi VLASTITI video (ili klip za koji imaš dozvolu) kao YouTube Short.

Koristi YouTube Data API v3 (videos.insert). Pri prvom pokretanju otvara se
preglednik za Google prijavu; token se čuva u token.json za sljedeće puta.

Primjer:
    python upload_short.py moj_video.mp4 \
        --title "Plava + žuta = ? 🎨" \
        --description "Učimo boje miješanjem plastelina." \
        --tags boje zadjecu plastelin \
        --privacy private --for-kids --i-own-this
"""

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
HERE = Path(__file__).resolve().parent
CLIENT_SECRET = HERE / "client_secret.json"
TOKEN = HERE / "token.json"

MAX_SHORT_SECONDS = 180
MAX_TITLE_LEN = 100
# YouTube kategorija 27 = Education, 24 = Entertainment
DEFAULT_CATEGORY = "24"


def get_credentials():
    creds = None
    if TOKEN.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN), SCOPES)
    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        if not CLIENT_SECRET.exists():
            sys.exit(
                f"Nedostaje {CLIENT_SECRET.name}. Preuzmi OAuth client (Desktop app) "
                "iz Google Cloud Console i sačuvaj ga pored ove skripte. Vidi README."
            )
        flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES)
        creds = flow.run_local_server(port=0)
    TOKEN.write_text(creds.to_json())
    return creds


def probe_video(path):
    """Vrati (širina, visina, trajanje) preko ffprobe, ili None ako ffprobe nije instaliran."""
    if not shutil.which("ffprobe"):
        return None
    out = subprocess.run(
        [
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=width,height:stream_tags=rotate:format=duration",
            "-of", "json", str(path),
        ],
        capture_output=True, text=True, check=True,
    )
    info = json.loads(out.stdout)
    stream = info["streams"][0]
    width, height = stream["width"], stream["height"]
    if stream.get("tags", {}).get("rotate") in ("90", "270", "-90"):
        width, height = height, width
    return width, height, float(info["format"]["duration"])


def check_short(path):
    probed = probe_video(path)
    if probed is None:
        print("Upozorenje: ffprobe nije pronađen, preskačem provjeru formata videa.")
        return
    width, height, duration = probed
    problems = []
    if width > height:
        problems.append(f"video je horizontalan ({width}x{height}); Short mora biti vertikalan ili kvadratan")
    if duration > MAX_SHORT_SECONDS:
        problems.append(f"video traje {duration:.0f}s; Short može trajati najviše {MAX_SHORT_SECONDS}s")
    if problems:
        sys.exit("Ovo neće biti Short:\n  - " + "\n  - ".join(problems))
    print(f"OK: {width}x{height}, {duration:.1f}s")


def build_body(args):
    title = args.title if "#shorts" in args.title.lower() else f"{args.title} #Shorts"
    if len(title) > MAX_TITLE_LEN:
        sys.exit(f"Naslov je predug ({len(title)} znakova, max {MAX_TITLE_LEN}).")
    return {
        "snippet": {
            "title": title,
            "description": args.description,
            "tags": args.tags,
            "categoryId": args.category,
            "defaultLanguage": args.language,
            "defaultAudioLanguage": args.language,
        },
        "status": {
            "privacyStatus": args.privacy,
            # COPPA: sadržaj namijenjen djeci MORA biti označen kao Made for Kids.
            "selfDeclaredMadeForKids": args.for_kids,
            "containsSyntheticMedia": args.synthetic,
        },
    }


def upload(youtube, path, body):
    media = MediaFileUpload(str(path), chunksize=8 * 1024 * 1024, resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Upload: {int(status.progress() * 100)}%")
    return response


def main():
    parser = argparse.ArgumentParser(description="Objavi vlastiti YouTube Short.")
    parser.add_argument("video", type=Path, help="putanja do tvog videa (.mp4)")
    parser.add_argument("--title", required=True)
    parser.add_argument("--description", default="")
    parser.add_argument("--tags", nargs="*", default=[])
    parser.add_argument("--category", default=DEFAULT_CATEGORY)
    audience = parser.add_mutually_exclusive_group(required=True)
    audience.add_argument(
        "--for-kids", dest="for_kids", action="store_true",
        help="video je namijenjen djeci (Made for Kids, COPPA)",
    )
    audience.add_argument(
        "--not-for-kids", dest="for_kids", action="store_false",
        help="video NIJE namijenjen djeci (npr. klipovi sa streamova/podcasta)",
    )
    parser.add_argument("--language", default="bs")
    parser.add_argument(
        "--privacy", choices=["private", "unlisted", "public"], default="private",
        help="podrazumijevano private, da video prvo pregledaš u YouTube Studiju",
    )
    parser.add_argument(
        "--synthetic", action="store_true",
        help="označi ako video sadrži realistične AI-generisane scene (YouTube to traži)",
    )
    parser.add_argument(
        "--i-own-this", action="store_true", required=True,
        help="potvrda da je video tvoj ili imaš dozvolu autora, i da imaš prava na muziku",
    )
    args = parser.parse_args()

    if not args.video.is_file():
        sys.exit(f"Video nije pronađen: {args.video}")
    check_short(args.video)

    youtube = build("youtube", "v3", credentials=get_credentials())
    try:
        response = upload(youtube, args.video, build_body(args))
    except HttpError as e:
        sys.exit(f"YouTube API greška: {e}")

    video_id = response["id"]
    print(f"Objavljeno ({args.privacy}): https://youtube.com/shorts/{video_id}")
    print("Provjeri u YouTube Studiju publiku (Made for Kids) i da nema copyright upozorenja.")


if __name__ == "__main__":
    main()
