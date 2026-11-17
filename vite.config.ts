import { defineConfig } from 'vite';

// GitHub Actions sets GITHUB_REPOSITORY=owner/repo; local development uses '/'.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = repo?.toLowerCase().endsWith('.github.io');
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' && repo && !isUserSite ? `/${repo}/` : '/',
});
