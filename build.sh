
#!/bin/bash
# Build script for WASM with LVGL

# Ensure we have the wasm32 target
rustup target add wasm32-unknown-unknown

# Clean previous builds
cargo clean

# Set the LVGL config path environment variable
export LV_CONF_PATH="$(pwd)"
export DEP_LV_CONFIG_PATH="$(pwd)"

echo "LVGL config directory: $DEP_LV_CONFIG_PATH"

# Build directly with cargo first to check for compilation issues
echo "Building with cargo..."
cargo build --target wasm32-unknown-unknown --release

if [ $? -eq 0 ]; then
    echo "Cargo build successful, now building with wasm-pack..."
    # Use wasm-pack with the environment variables
    LV_CONF_PATH="$(pwd)" DEP_LV_CONFIG_PATH="$(pwd)/lv_conf.h" wasm-pack build --target web --out-dir pkg --release
    
    echo "Build complete. Files are in the 'pkg' directory."
    echo "Starting server on port 8000..."
    
    # Serve the files
    python3 -m http.server 8000
else
    echo "Cargo build failed. Check the error messages above."
    exit 1
fi
