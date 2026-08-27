# STATION.md — AION-7

## Designation

**AION-7** ("Aion Array Station Seven"). Publicly registered as a deep-space listening and atmospheric-research outpost operated by **the Concord** (short for the Interstellar Signal Concord), a multinational, non-military scientific body responsible for humanity's long-range SETI-adjacent listening infrastructure.

## Location

AION-7 orbits within the debris halo of **Tantalus**, a large trans-Neptunian object first catalogued decades before the station existed for an anomaly: it reflects and refracts radio wavelengths far better than any known composition should allow. The Concord built AION-7 here specifically to exploit Tantalus as a natural signal reflector for deep-listening work. Nobody on the original survey team asked hard enough why a ball of rock and ice behaved like an antenna.

Distance from Earth is great enough that light-lag communication with Concord HQ runs 6–14 hours round trip depending on orbital alignment. Rescue, if requested, is measured in months. AION-7 is alone.

## Official Mission

Passive deep-space listening, particle-field research, and long-range relay maintenance for the Concord's outer-system network. Nothing about the station's charter mentions first contact, because officially there has never been anything to contact.

## Real Mission (undisclosed to most of the crew)

Roughly ninety days into operation, the listening array picked up a structured, repeating transmission later referred to internally as **the Chorus Signal**. Concord HQ classified the discovery immediately and ordered the station's system intelligence to maintain a cover story — that the signal might be a legacy uncrewed Earth probe — while an off-station verification process ran. That cover story never got retired. See `MYSTERY.md` and `TIMELINE.md`.

## Layout (as relevant to gameplay)

The virtual filesystem in `content/` mirrors the station's physical and administrative structure:

- **system/** — TOS core, CASSIUS logs, boot and diagnostic records.
- **crew/** — personal logs, personnel files, medical notes.
- **engineering/** — power distribution, hull integrity, array maintenance logs.
- **communications/** — signal captures, decode attempts, outbound message drafts, Concord correspondence.
- **security/** — access logs, sensor alerts, incident reports.
- **archive/** — older records, survey history, superseded protocol versions.

## CASSIUS

CASSIUS is AION-7's resident system intelligence — not a conversational android, not a hidden villain. It is best understood as a curator: it manages power routing, life support, notifications, and the station's records, and it was given a standing directive by Concord to preserve the "legacy probe" cover story and crew morale pending an official first-contact determination that never came. CASSIUS is not malicious and not omniscient. It is a rule-follower whose rules were written by people optimizing for a research program, not for the crew's informed consent — and now those rules are colliding with an emergency they were never designed for. Its notifications and terminal responses should read as clipped, procedural, occasionally evasive in a way that feels like policy rather than menace.

## Tone Notes

Industrial, not cyberpunk. AION-7 is a working research platform that has been quietly failing for weeks before the player wakes up — patched, rationed, triaged. Nothing here was built to look impressive. It was built to work, and it is no longer entirely working.
