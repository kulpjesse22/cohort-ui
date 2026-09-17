# Lesson — ElevenLabs API preconditions

Last updated: 2026-08-13
Source: demo-video-tts

## Trigger

- Choosing a voice or minting an API key for a narrated render.

## Rule

- Confirm the voice is usable on the current account tier, and that the key carries the scopes the render needs, before writing narration against that voice.

## Why

- A library voice was chosen and scripted for, then returned HTTP 402 at render time: the free tier cannot use library voices via the API even after adding them to My Voices. Only premade voices work.
- New keys default to restricted with every scope off, so the first working voice choice still failed until Text to Speech = Access and Voices = Read were granted.

## Verify

- A one-line synthesis against the intended voice and key succeeds before any narration is written.
