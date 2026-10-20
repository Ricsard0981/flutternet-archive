# FlutterNet Service Archive

A short browser ARG / creepypasta, about 20–40 minutes long. Start at the archive page and look closely.

Everything is fiction. FlutterNet, its people and its places are made up, and all art is original SVG.

## For the author

The story lives in `_private/story.mjs`, which is **not committed** (it holds every answer). Each puzzle's content is encrypted with its answer, so the public repo cannot spoil anything.

After editing the story:

```bash
node tools/seal.mjs
```

That rewrites `js/sealed.js`; commit that file. Keep a backup of `_private/` somewhere safe, because it is the only plaintext copy.

Local preview: `npx serve .` then open http://localhost:3000. Add `?reset` to `login.html` to wipe your progress.
