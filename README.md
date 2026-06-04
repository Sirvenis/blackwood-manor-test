# 001: Static Murder Mystery Loop

## Question

Given one scripted case JSON, when a player clicks through scenes, questions suspects, collects clues, and makes an accusation, does a static web app feel like a playable murder mystery dinner without needing a backend?

## Build target

A rough, playable 10-minute prototype using placeholder visuals first.

## Minimum loop

1. Arrival scene.
2. Meet guests around a table.
3. Murder event.
4. Question each suspect from fixed choices.
5. Collect clue cards.
6. Review notebook/clue board.
7. Make accusation: killer, motive, method, evidence.
8. Reveal solution and score.

## Run

Live test build:

https://sirvenis.github.io/blackwood-manor-test/

Local run:

```bash
cd /home/andrew/projects/active/murder-mystery-dinner-lab/spikes/001-static-murder-mystery-loop
python3 -m http.server 8131 --bind 127.0.0.1
# open http://127.0.0.1:8131/
```

## Verification performed

- `python3 scripts/smoke_case.py` validates 6 suspects, 12 clues, scene/location clue links, and solution IDs.
- Browser smoke test loaded the app, advanced through scenes, questioned a suspect, added clues, inspected a location, made the correct accusation, and reached a 4/4 result reveal.
- v2 polish added local progress saving, installable PWA metadata, service worker cache, and app/icon assets.
- v3 added the first local ComfyUI-generated SDXL image set: manor exterior, dining room, and locked medical vial clue.
- v7 test-ready build adds all suspect portraits, dining-room scene, evidence image wiring, clue feedback toasts, clue-progress notebook, duplicate-click prevention, and refreshed PWA cache/version metadata.
- v10 adds contained/non-cropped image display, clickable suspect cards, 10 ComfyUI clue closeups, clue images in notebook/location inspection, and a short generated intro video with dialogue.

## Verdict: VALIDATED

### What worked

- A plain static HTML/CSS/JS app can provide the core murder mystery dinner loop.
- Fixed question choices keep the evidence trail controlled and fair.
- A notebook/clue system plus final accusation screen is enough for a playable first prototype.

### What did not get solved yet

- Placeholder visuals only; no ComfyUI portraits/rooms yet.
- The first mystery is still short and mechanically simple.
- No save/resume, audio narration, or mobile family-user testing yet.

### Recommendation for the real build

Keep building one polished case first. Next improvement should be a cleaner mobile UI and stronger clue pacing before adding AI dialogue, multiplayer, or generated visuals.
