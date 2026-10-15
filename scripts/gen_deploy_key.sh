#!/usr/bin/env bash
set -euo pipefail
KEY="${HOME}/.ssh/wakeuprender_deploy"
mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"
if [[ -f "$KEY" ]]; then
  echo "KEY_EXISTS"
else
  ssh-keygen -t ed25519 -f "$KEY" -N "" -C "wakeuprender-deploy"
fi
echo "PUBLIC_KEY_BEGIN"
cat "${KEY}.pub"
echo "PUBLIC_KEY_END"
