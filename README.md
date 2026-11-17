# Son's Workroom — v0.4 (locked visual design)

This version uses the **exact approved screenshot** as the full-stage art, with functional task/timer panels positioned over the original panel areas. No redesigned room. The artwork itself is static; ambient CSS overlays provide light rain, aquarium movement, steam, and typing sparkle. It is **not** a fully separated character sprite animation.

## Run

Requires Node.js 20+.

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Create a new repository (for example `my-workroom`).
2. Push all files from this folder to the root of the `main` branch, **including `.github/workflows/deploy.yml`**.
3. In GitHub repository **Settings → Pages**, choose **GitHub Actions** as the source.
4. Check the **Actions** tab. After successful deployment, visit `https://USERNAME.github.io/REPOSITORY/`.

The Vite config automatically uses the repository name as the base URL during GitHub Actions builds. No secrets or API keys needed.

## Features

- Three job filters and task CRUD, due dates, priorities, completion tracking
- Focus timer (25/50 minutes), session history, XP, progress
- Week indicator, mood buttons, ambient effects toggle, JSON export
- Browser localStorage persistence
- Approved reference image kept as background

## Important

- Task information is stored **only in your current browser**, not synchronized across devices.
- GitHub Pages is static hosting. Avoid uploading confidential work data into the repository.
- On small screens, the 1648×928 reference layout is preserved and can be scrolled horizontally rather than reflowed. This intentionally maintains the agreed visual design.
- The background includes baked-in illustrated text and elements; interactive panels cover the main baked-in UI areas.
