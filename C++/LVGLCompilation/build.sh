cd LVGLCompilation

git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

cd ../
git clone https://github.com/lvgl/lvgl.git
cd lvgl
git checkout v8.3.11
cd ../

emcmake cmake -B build
emmake make -C build

cp build/my_lvgl_wasm.wasm ../BuiltFiles/
cp build/my_lvgl_wasm.js ../BuiltFiles/
cp build/my_lvgl_wasm.html ../BuiltFiles/

rm -rf 'LVGLCompilation/build/my_lvgl_wasm.html' 'LVGLCompilation/build/my_lvgl_wasm.js' 'LVGLCompilation/build/my_lvgl_wasm.wasm' 