sudo apt-get install libsdl2-2.0-0 libsdl2-dev build-essential

git clone https://github.com/emscripten-core/emsdk.git ~/emsdk
cd ~/emsdk
git pull
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

cd lv_web_emscripten
git submodule update --init
mkdir cmbuild
cd cmbuild
emcmake cmake ..
emmake make -j4
