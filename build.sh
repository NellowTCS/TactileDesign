sudo apt-get install libsdl2-2.0-0 libsdl2-dev build-essential

git clone https://github.com/emscripten-core/emsdk.git ~/emsd
cd emsdk
git pull
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh