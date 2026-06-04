#!/usr/bin/env python3
"""Smoke-test the static murder mystery case data."""
from __future__ import annotations
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
case = json.loads((root / 'case-blackwood-manor.json').read_text())
ids = {c['id'] for c in case['characters']}
clues = {c['id'] for c in case['clues']}
assert len(case['characters']) == 6, 'expected 6 suspects'
assert len(case['scenes']) >= 4, 'expected at least 4 scenes'
assert len(case['clues']) >= 10, 'expected at least 10 clues'
assert case['solution']['killer'] in ids
assert case['solution']['evidence'] in clues
for ch in case['characters']:
    assert len(ch['questions']) >= 3, f"{ch['name']} needs 3+ questions"
    for q in ch['questions']:
        if q.get('clue'):
            assert q['clue'] in clues, f"unknown clue {q['clue']}"
for loc in case['locations']:
    for clue in loc.get('clues', []):
        assert clue in clues, f"unknown location clue {clue}"
for scene in case['scenes']:
    for clue in scene.get('clues', []):
        assert clue in clues, f"unknown scene clue {clue}"
print('OK case data:', case['title'], len(case['characters']), 'suspects', len(case['clues']), 'clues')
