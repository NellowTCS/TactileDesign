
#!/bin/bash
# Build script for WASM
# Ensure we have the wasm32 target
rustup target add wasm32-unknown-unknown

# Clean previous builds
cargo clean

# Build with explicit target to avoid system dependencies
wasm-pack build --target web --out-dir pkg --release
