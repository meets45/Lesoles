#!/usr/bin/env bash

# Preserve the usual Git Bash configuration, then activate this workspace's Node version.
if [ -f "$HOME/.bashrc" ]; then
  . "$HOME/.bashrc"
fi

NVS_HOME="$(cygpath "$LOCALAPPDATA")/nvs"

if [ -f "$NVS_HOME/nvs.sh" ]; then
  . "$NVS_HOME/nvs.sh"
  nvs use node/24.21.0/x64
else
  printf 'NVS setup file not found: %s\n' "$NVS_HOME/nvs.sh" >&2
fi
