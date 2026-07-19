# Next-Step Prompts — Diamitani Music

Ready-to-paste prompts for a new agent session, one per outstanding item in
`handoff/context-manifest.json` → `openItems`. Each is self-contained — you
don't need to paste anything else alongside it, though pasting
`handoff/NEXT_AGENT_PROMPT.md` first never hurts.

---

## 1. Confirm YouTube video IDs — Patrick Diamitani (high priority)

```
Open data/diamitani-music/discography.json. Every track under the
"patrick-diamitani" artist has youtubeVideoId: null. Find the real,
confirmed YouTube video ID for each of these 10 tracks — check the
"Patrick Diamitani - Topic" channel (https://www.youtube.com/channel/
UCDvHMHDma9vJMb3I6bj625g), the "Patrick Diamitani Music" uploads channel
(https://www.youtube.com/@patrickdiamitanimusic6241), and "Delaly Records"
(https://www.youtube.com/@DelalyRecords).

Do not guess or infer an ID from search-result prose — only use an ID you
can verify points to the correct track (e.g. by confirming the video title
matches, or via a tool/API call that returns the ID directly, not a
generic web search synthesis). For any track you can't confirm, leave
youtubeVideoId as null — that's expected and fine.

For every ID you do confirm:
  1. Update discography.json.
  2. Update diamitani-music/docs/patrick-diamitani-track-notes.md with the
     new YouTube link, and add a changelog line.
  3. Re-run the local test harness pattern described in
     handoff/TRANSCRIPT.md (Turn 3) — or write an equivalent — to confirm
     music/artists/patrickdiamitani/ now renders a YouTube embed for that
     track (embed-grid child count should go up).

Follow skills/catalog-track-critic/SKILL.md's hard rules throughout.
```

---

## 2. Confirm the "Go West Young Man" video ID (medium priority)

```
Pat Dia's other 4 tracks (Sunshine, Sway, Deep, Harp About It) all have
confirmed YouTube video IDs in data/diamitani-music/discography.json; "Go
West Young Man" does not. Check the "Pat Dia - Topic" channel
(https://www.youtube.com/channel/UCdPNIf6ug_MxkMO8u5XHgPg) for it, confirm
the ID against the actual video title, add it to discography.json, update
diamitani-music/docs/pat-dia-track-notes.md (including its changelog), and
verify music/artists/patdia/ picks it up (embed-grid should go from 5 to 6
children).
```

---

## 3. Upgrade track descriptions from "metadata-informed" to "listened" (high priority)

```
Every track in data/diamitani-music/discography.json currently has
confidence: "metadata-informed" — the descriptions were written from
title/duration/tracklist signals only, because no audio-listening tool was
available. If you have access to an audio-analysis tool (transcription,
stem separation, tempo/key detection) or can relay notes from an actual
listen, re-run the catalog-track-critic skill (skills/catalog-track-critic/
SKILL.md) properly this time:

  1. For each track, get the actual audio and analyze it (or have a human
     listener describe it to you).
  2. Replace the description with one grounded in what was actually heard
     — tempo, key, instrumentation, structure, mood, reported not inferred.
  3. Flip confidence to "listened".
  4. Update diamitani-music/docs/<artist>-track-notes.md's changelog to
     note the upgrade and when it happened.

Do this for one artist at a time (start with Pat Dia — 5 tracks, smaller
batch) so it's easy to review before doing the other.
```

---

## 4. Resolve the Delaly Records / uploads-channel numeric IDs (low priority)

```
@DelalyRecords and @patrickdiamitanimusic6241 are handle-based YouTube
channels referenced in data/diamitani-music/discography.json by their
handle URL only — their numeric channel IDs (the UC... form) were never
resolved, because generic web search returned an unsourced/unreliable
answer that was deliberately not used. If you have YouTube Data API access
(or the repo owner can just tell you), resolve the numeric IDs and add them
to discography.json's youtube object for the "patrick-diamitani" artist.
This is only needed if something later requires the numeric ID directly
(e.g. an RSS feed at youtube.com/feeds/videos.xml?channel_id=...) — the
handle URLs already work fine as plain links.
```

---

## 5. Verify (or drop) "Twelve 43, Burn Me" (low priority)

```
data/diamitani-music/discography.json has an "additionalKnownSingles" entry
for Patrick Diamitani — "Twelve 43, Burn Me" (2022) — logged as
confidence: "unverified — surfaced via a YouTube Music catalog search, not
currently in the Spotify Top Tracks list." Verify whether this is a real,
correctly-attributed release (check Spotify's full discography, not just
Top Tracks, and/or the YouTube channel under UC-Ma5IiJjm6lA1ETnVXC0Iw).
If confirmed: promote it into the main "tracks" array with a proper
metadata-informed (or listened, if you also do step 3) description, order
number, and confidence. If it can't be confirmed: remove the entry and note
why in the patrick-diamitani-track-notes.md changelog.
```

---

## 6. Verify or add a Pandora presence (low priority)

```
No verified Pandora artist profile was found for Pat Dia or Patrick
Diamitani in this session — search results returned only unrelated people
(an actor, a Pandora employee). If a real Pandora artist profile exists for
either project, verify the URL points to the correct artist (matching
track titles), then add it to the relevant artist's "otherLinks" array in
data/diamitani-music/discography.json, and to the corresponding "Elsewhere"
links section on music/artists/patdia/ or /patrickdiamitani/ (this happens
automatically once otherLinks is populated — music/artists/app.js already
renders whatever's in that array). Do not add a Pandora link unless you've
confirmed it's the correct profile.
```

---

## 7. Deploy and verify live (high priority)

```
Nothing in this repo has been deployed yet — everything was tested against
a local Node harness that mimics Vercel's routing, plus a jsdom DOM-
execution pass. Import the repo into Vercel (see README.md § Deploy for the
6-domain list and DNS records needed), attach the domains, and then
verify live:
  - https://label.diamitani.com/ and https://label.diamitani.com/#artists
  - https://music.diamitani.com/artists/, /artists/patdia/,
    /artists/patrickdiamitani/
  - GET https://<any-domain>/api/diamitani-music/{roster,releases,
    operating-model,discography}
  - POST https://<any-domain>/api/diamitani-music/royalties with a real
    body, e.g. {"artistId":"pat-dia","revenue":4200}
Report back anything that doesn't match what worked locally — the most
likely failure mode is a vercel.json rewrite rule that isn't excluding
api/ or assets/ correctly for a given host.
```

---

## 8. PR review pass (medium priority)

```
PR #1 (https://github.com/diamitani/Diamitani-Industries/pull/1) has two
commits on it (d3590da, 45ae4aa) and is still a draft against main. Review
the diff for anything that should change before it's marked ready for
review — do not merge, close, or mark it ready-for-review yourself unless
explicitly asked to. Flag anything you'd want a human to weigh in on.
```
