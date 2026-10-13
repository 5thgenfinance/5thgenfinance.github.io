
# Duet Evening — single-device starter

An original pass-and-play prototype inspired by cooperative word-clue games. No official artwork or official word deck is included. All supplied activity cards are non-graphic and optional.

## Requirements and local use

Install a supported Node.js LTS release (Node 22 is recommended), then in this project directory:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To try on a phone on the same trusted Wi-Fi, use your computer's LAN IP and the displayed port. The dev script binds to all interfaces; do not expose this development server to the public internet.

```sh
npm run test:smoke
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

The browser app needs no Python or running backend. Node is used for development, build and tests. Dependencies require an internet connection to install. No lockfile is supplied because dependency installation was not run by the generator; commit the generated package-lock.json after installing and verifying.

## Play

1. Enter two names, clothing counts and turn limit. Review enabled cards together.
2. The first giver opens their private key while the partner looks away.
3. Select only a number. Hide the key, say the clue aloud, and pass the device.
4. The guesser opens the neutral board. Guesses resolve against the giver's key.
5. End a turn whenever desired. Resolve or pass any activity. Roles alternate.

Green means agent; tan means bystander; rose means assassin. Labels supplement colors. Found agents are shared globally. Bystander/assassin misses are tracked separately per key, because a tile can have a different role under the other player's key.

The generator makes nine agents per key, with three shared agents (15 distinct agents), and three assassins per key. It does not reproduce the exact official double-sided assassin overlap distribution; this is a configurable house-rule prototype, not a complete official rules implementation.

## Default house rules

- Four clothing items each; nine alternating turns.
- Clue 1 offers one giver clothing item before guessing.
- First-guess bystander offers one guesser clothing item; turn ends.
- One correct then bystander is neutral unless a tourniquet is elected.
- Tourniquet: one item, one replacement attempt, at most once per turn and twice per player per game. Only after at least one correct and only for bystanders.
- Default maximum attempts is clue number plus one. A player may stop earlier.
- Two correct at turn end offers a kiss. Three or more draws one enabled romantic card. Rewards do not stack.
- Assassin: increment shared strike count, end turn, offer an optional reset card. No clothing penalty stacks. Three strikes ends the board.
- After a miss, already-earned rewards are retained. All 15 found agents or the turn limit also ends the board, after pending activities resolve.
- No clothing available: optionally offer a romantic card to the partner for one available partner item. If both accept, that item is immediately spent. No activity debt or enforceable promise is created.
- Passing a mandatory-style clothing activity waives it. Passing an optional tourniquet/exchange ends that turn; it does not buy continued guessing. No further penalty applies.
- All activities, including clothing removal and exchanges, may be declined. If both players have zero clothing, pass and continue without debts.

## Save/load and privacy

Save JSON exports the exact board, keys, counters, rule settings, deck order, pending activity and draw positions. Load validates the state and starts behind a pause curtain. The original spoken clue is not stored; repeat it after resuming.

Automatic recovery writes to localStorage after actions. It is not a guaranteed backup. Browser clearing/private mode can remove it. Export JSON for a portable copy. Loading saves from another origin works via file selection; localStorage itself is origin-specific.

This is trust-based single-device play: both secret keys exist in memory, recovery storage and exported JSON. It is not resistant to browser inspection, file inspection or impersonation. No external analytics, fonts, audio or gameplay requests are included. A hosting provider will still receive ordinary site requests.

On tab hiding or pause, the key is removed and the game is placed behind a curtain. Exporting can briefly leave a private view visible until the document is hidden; save from the pause screen for maximum discretion. Pass buttons never require an explanation.

## Content editing

Edit `content/words.json` (at least 25 distinct short words), `content/romantic-cards.json`, and `content/assassin-cards.json`. Cards require unique `id`, `name`, `text` and optional `duration_sec` (null or 0–3600). Existing saves embed their original cards; changes affect new games.

Enabled romantic cards can be selected at setup. Assassin reset cards are supplied as mild optional activities. No on-screen custom-deck upload or per-player private preference editor is implemented yet.

Edit `src/engine/rules.js` for other default rules. Changing constants does not alter existing saved settings. Card acceptance is a mutual in-person acknowledgment, not independently authenticated digital consent.

## Deploy later

`npm run build` creates `dist/`. Deploy that directory to a static host. Relative asset paths are configured for subdirectory hosting, including GitHub project sites. Preview the production build before uploading.

For GitHub Pages: build with a Pages workflow and upload `dist/` as the Pages artifact, or use your preferred static-host deployment. This archive does not create a repository or deploy anything. Keep personal decks out of a public bundle or public repository.

Suggested later additions: a local custom-deck importer, configurable rule settings UI, accessible modal focus management, encrypted exports, offline PWA, and server-backed two-device play. Do not add cloud secret-key claims without a real authenticated backend.

## Testing status

See BUILD_STATUS.md. Automated tests are included, but npm/Vitest/Playwright execution requires Node and downloaded dependencies. No unverified passing results are claimed.
