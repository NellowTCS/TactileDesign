
use std::env;
use std::path::PathBuf;

fn main() {
    // Get the current directory
    let current_dir = env::current_dir().unwrap();
    
    // Set LVGL config paths - DEP_LV_CONFIG_PATH should be a directory, not a file
    println!("cargo:rustc-env=LV_CONF_PATH={}", current_dir.display());
    println!("cargo:rustc-env=DEP_LV_CONFIG_PATH={}", current_dir.display());
    
    // Also set them as regular environment variables for the build process
    env::set_var("LV_CONF_PATH", &current_dir);
    env::set_var("DEP_LV_CONFIG_PATH", &current_dir);
    
    // Tell cargo to invalidate the built crate whenever config changes
    println!("cargo:rerun-if-changed=lv_conf.h");
    println!("cargo:rerun-if-changed=build.rs");
    
    // For WebAssembly builds, we need to disable some features
    if env::var("TARGET").unwrap_or_default().contains("wasm32") {
        println!("cargo:rustc-cfg=target_arch=\"wasm32\"");
    }
    
    // Print debug info
    println!("cargo:warning=LV_CONF_PATH set to: {}", current_dir.display());
    println!("cargo:warning=DEP_LV_CONFIG_PATH set to: {}", current_dir.display());
}
