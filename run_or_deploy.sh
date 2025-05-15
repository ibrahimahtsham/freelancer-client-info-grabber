#!/bin/bash

set -e

echo "Choose an option:"
echo "1) Start dev server (npm run dev)"
echo "2) Deploy to GitHub Pages (build & push to gh-pages branch)"
echo "3) Run lint and depcheck"
read -p "Enter your choice [1-3]: " choice

if [ "$choice" = "2" ]; then
  echo "Building project for production..."
  npm run build

  echo "Deploying to GitHub Pages using a temporary worktree..."
  TMP_WORKTREE=$(mktemp -d)
  git worktree add "$TMP_WORKTREE" gh-pages || git worktree add -B gh-pages "$TMP_WORKTREE" origin/gh-pages

  rm -rf "$TMP_WORKTREE"/*
  cp -r dist/* "$TMP_WORKTREE"

  cd "$TMP_WORKTREE"
  git add .
  git commit -m "Deploy to GitHub Pages" || echo "No changes to commit."
  git push origin gh-pages
  cd -

  git worktree remove "$TMP_WORKTREE"
  echo "Deployed to GitHub Pages!"
elif [ "$choice" = "3" ]; then
  echo "Running ESLint..."
  npm run lint
  echo "Running depcheck..."
  npx depcheck
else
  echo "Starting dev server..."
  npm run dev
fi