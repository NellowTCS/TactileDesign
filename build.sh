#!/usr/bin/env bash
set -e
# Install dependencies (Linux only, skip on macOS/Windows)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
   if command -v apt-get >/dev/null 2>&1; then
      sudo apt-get update
      sudo apt-get install -y libsdl2-2.0-0 libsdl2-dev build-essential
   fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
   if command -v brew >/dev/null 2>&1; then
      brew install sdl2
   else
      echo "Warning: Homebrew not found. Please install Homebrew to proceed with dependency installation." >&2
   fi
fi

# Set EMSDK directory
if [ -z "$EMSDK" ]; then
   EMSDK_DIR="${HOME}/emsdk"
else
   EMSDK_DIR="$EMSDK"
fi

# Clone or update emsdk
if [ ! -d "$EMSDK_DIR" ]; then
   git clone https://github.com/emscripten-core/emsdk.git "$EMSDK_DIR"
fi
cd "$EMSDK_DIR"
git pull
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Build project
cd /workspaces/TactileDesign/lv_web_emscripten
git submodule update --init
mkdir -p cmbuild
cd cmbuild
emcmake cmake ..
emmake make -j$(nproc || sysctl -n hw.ncpu || echo 4)

# Copy build outputs
DEST="../../TactileDesignWeb/public/lvgl"
mkdir -p "$DEST"
cp -a index.html "$DEST/index.html"
cp -a index.js "$DEST/index.js"
cp -a index.wasm "$DEST/index.wasm"