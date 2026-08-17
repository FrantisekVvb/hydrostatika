#!/bin/zsh
cd "$(dirname "$0")"
echo "Spouštím Hydrostatika na http://localhost:3481"
echo "Ukončení: Ctrl+C"
node server.js
