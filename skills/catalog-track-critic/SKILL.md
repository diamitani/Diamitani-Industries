---
name: catalog-track-critic
version: 1.0
owner: Diamitani Music (portfolio company of Diamitani Industries, Inc.)
status: active — metadata-informed mode until an audio-analysis tool is wired in
---

# Catalog Track Critic & Metadata Extraction

**What this skill does:** given a release (a track, single, or EP) somewhere in
the Diamitani Music catalog, this skill produces two things —

1. **Structured metadata** — a consistent record (title, artist, duration,
   platform links, tags) suitable for a catalog database, a sync-licensing
   one-sheet, or a distributor feed.
2. **A short, critic-voice description** of the track — two to three
   sentences written like liner notes, not like a press release.

It exists so every release in the catalog gets the same quality of write-up
without a human sitting down to draft copy for each one, and so that
write-up is always backed by a document you can hand to a sync agent, a
playlist curator, or a label partner.

## When to use this skill

- A new track is added to `data/diamitani-music/discography.json` (or any
  future catalog file with the same shape) and needs a description.
- An existing description needs to be upgraded from "metadata-informed" to
  a real listening pass.
- Someone asks for a "critic breakdown" of a song, an artist's catalog, or a
  release for a one-sheet / pitch document.

## Inputs

- The track's title, duration, and position in its parent release/tracklist.
- Whatever metadata is attached to it already: genre tags, artist project,
  release year, any existing platform description (YouTube video
  description, Spotify editorial copy, liner notes).
- **If available:** the actual audio (a streamable/downloadable file or a
  transcript/analysis of one). This is the one input that upgrades a
  description from *metadata-informed* to *listened*.

## Process

1. **Collect metadata.** Pull every fact already available: title, duration,
   tracklist order, artist/project name, platform IDs and links (Spotify
   track/artist ID, YouTube video ID), and any existing text (video
   descriptions, press copy).
2. **Check for an audio-analysis path.** If the runtime has access to an
   audio-listening or audio-transcription tool, use it: extract tempo,
   key/mode, instrumentation, structure (intro/verse/hook/outro or
   loop-based), and mood. Mark the resulting description `confidence:
   "listened"`.
   - If no audio tool is available, do **not** invent acoustic detail.
     Fall back to metadata-informed mode (step 3) and say so explicitly —
     never present a guess as a listen.
3. **Metadata-informed fallback.** Without audio access, extract every
   signal the metadata *itself* gives up honestly:
   - What does the title imply (mood, narrative, wordplay, instrumentation
     hints — e.g. a title like "Harp About It" is a reasonable signal that
     a harp is involved)?
   - What does the position in the tracklist suggest (opener vs. closer vs.
     midpoint turn)?
   - What does the runtime suggest relative to its neighbors (an outlier
     short track reads as a sketch/interlude; an outlier long track reads as
     the one with room to develop)?
   - What does the artist's established genre/project context suggest?
   - Mark the resulting description `confidence: "metadata-informed"`.
4. **Write the description.** Two to three sentences, critic voice — specific
   enough to be useful, honest enough to say when it's inferring rather than
   reporting. Avoid superlatives that aren't earned by any actual signal.
5. **Tag it.** 3–6 short lowercase tags (genre, instrumentation, mood,
   structural role) for filtering/search.
6. **Write the record.** Append/update the track's entry in the catalog JSON
   (schema below) and, for a full release or artist, add or refresh a
   consolidated Markdown "track-note dossier" document — the durable,
   shareable artifact a human can hand off (e.g.
   `diamitani-music/docs/<artist-slug>-track-notes.md`).

## Output schema (per track)

```json
{
  "id": "kebab-case-slug",
  "title": "Track Title",
  "duration": "m:ss",
  "order": 1,
  "youtubeVideoId": "or null if unknown — never invent one",
  "confidence": "metadata-informed | listened",
  "description": "Two to three sentences, critic voice.",
  "tags": ["lowercase", "tags"]
}
```

## Hard rules

- **Never fabricate a platform ID** (YouTube video ID, Spotify track URI,
  release date). If it isn't confirmed, the field is `null` and the
  description does not imply otherwise.
- **Never claim to have listened** unless an audio-analysis tool was
  actually used in that run. Say "metadata-informed" out loud, in the data,
  every time it applies.
- **Always tie a claim to a signal.** "This reads as an opener because it's
  track 1 and its title is a mission statement" is fine. "This is an upbeat
  synth-pop banger" without ever having heard it is not.
- **Re-runnable.** Running this skill again on the same track with the same
  inputs should produce a materially similar description — no random flair
  that can't be reproduced or defended.

## Upgrading a description to "listened"

When an audio-analysis tool becomes available (transcription, stem
separation, tempo/key detection, or a human listener relaying notes back to
the agent), re-run this skill per track:

1. Feed the tool the actual audio.
2. Replace the metadata-informed description with one grounded in what was
   actually heard (tempo, key, instrumentation, structure, mood — reported,
   not inferred).
3. Flip `confidence` to `"listened"`.
4. Note the change in the track-note dossier's changelog section.

## Where this is wired in

- Catalog data: `data/diamitani-music/discography.json`
- Backend: `GET /api/diamitani-music/discography`
- Dossiers (hosted documents): `diamitani-music/docs/*.md`
- Surfaced on: `/diamitani-music/#artists`, `/music/artists/`,
  `/music/artists/patdia/`, `/music/artists/patrickdiamitani/`
- Listed as a service in the label's operating model:
  `data/diamitani-music/operating-model.json` → "Catalog Intelligence"
