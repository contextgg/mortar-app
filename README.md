# mortar-app

Desktop client for the [ctx.gg](https://ctx.gg) platform, built with Tauri 2.

**Tauri 2** | **React** | **TypeScript** | **TailwindCSS**

## Prerequisites

- Node.js 20+
- [Rust](https://rustup.rs/) (for Tauri)
- System dependencies: see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Development

```bash
npm install

# Frontend only (no Tauri)
npm run dev

# Full Tauri app
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

Produces platform-specific installers in `src-tauri/target/release/bundle/`.

## Features

- Browse and search community maps
- Launch mortar games directly from the app
- Player profiles and stats
- Tournament browser — join, track brackets
- GitHub and Discord authentication

## Architecture

```
src/
  components/   Sidebar, MapCard
  pages/        Maps, Profile, Tournaments, Settings
  lib/          API client, game launcher
src-tauri/
  src/          Rust backend (Tauri shell plugin)
  tauri.conf.json
```

## License

MIT
