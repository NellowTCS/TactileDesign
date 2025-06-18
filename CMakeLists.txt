cmake_minimum_required(VERSION 3.13)

project(index C)

set(CMAKE_C_STANDARD 11)

# Set path to Emscripten SDK toolchain file if needed
# set(CMAKE_TOOLCHAIN_FILE /path/to/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake)

# Set build type
set(CMAKE_BUILD_TYPE Debug)

# Include LVGL sources
file(GLOB_RECURSE LVGL_SOURCES
    lvgl/src/*.c
)


# Include your driver sources
set(DRIVER_SOURCES
    lv_drivers/display/lv_sdl_disp.c
    lv_drivers/indev/lv_port_indev.c
)

# Your application source
set(APP_SOURCES
    src/main.c
)

add_executable(my_lvgl_wasm
    ${LVGL_SOURCES}
    ${DRIVER_SOURCES}
    ${APP_SOURCES}
)

target_include_directories(my_lvgl_wasm PRIVATE
    lvgl/src
    lv_drivers/display
    lv_drivers/indev
    src
)

# Emscripten specific flags
if("${CMAKE_SYSTEM_NAME}" STREQUAL "Emscripten")
    set(CMAKE_EXECUTABLE_SUFFIX ".html")

    target_compile_options(my_lvgl_wasm PRIVATE "-s" "USE_SDL=2")

    target_link_libraries(my_lvgl_wasm PRIVATE
        SDL2
        "-s USE_SDL=2"
        "-s USE_SDL_TTF=0"
        "-s USE_SDL_IMAGE=0"
        "-s ALLOW_MEMORY_GROWTH=1"
        "-s ASSERTIONS=1"
        "-s DISABLE_EXCEPTION_CATCHING=0"
        "-s ENVIRONMENT=web"
    )

    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -g")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g")
endif()

