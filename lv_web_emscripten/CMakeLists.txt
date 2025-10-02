cmake_minimum_required(VERSION 3.12)
project (lv_emscripten)

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O2 -s USE_SDL=2")

include_directories(${PROJECT_SOURCE_DIR})

add_subdirectory(lvgl)
file(GLOB MY_SOURCES "./*.c")
set(SOURCES ${MY_SOURCES})

add_executable(index ${SOURCES} ${INCLUDES})

if(NOT LVGL_CHOSEN_DEMO)
    set(LVGL_CHOSEN_DEMO lv_example_noop)
endif()
set_source_files_properties(main.c PROPERTIES COMPILE_FLAGS -DCHOSEN_DEMO=${LVGL_CHOSEN_DEMO})

set(CMAKE_EXECUTABLE_SUFFIX ".html")
target_link_libraries(index
    lvgl
    lvgl_examples
    lvgl_demos
    lvgl_thorvg
    SDL2
)
# Export all functions marked with EMSCRIPTEN_KEEPALIVE in C code
set_target_properties(index PROPERTIES LINK_FLAGS "--shell-file ${PROJECT_SOURCE_DIR}/lvgl_shell.html -s SINGLE_FILE=0 -s INITIAL_MEMORY=33554432 -s EXPORT_ALL=0 -s EXPORTED_FUNCTIONS='[\"_main\",\"_free\",\"_lvgl_clear_screen\",\"_lvgl_create_label\",\"_lvgl_create_button\",\"_lvgl_create_container\",\"_lvgl_create_slider\",\"_lvgl_create_checkbox\",\"_lvgl_create_switch\",\"_lvgl_create_textarea\",\"_lvgl_create_dropdown\",\"_lvgl_create_arc\",\"_lvgl_create_spinner\",\"_lvgl_create_bar\",\"_lvgl_create_roller\"]' -s EXPORTED_RUNTIME_METHODS='[\"allocateUTF8\",\"UTF8ToString\",\"ccall\",\"cwrap\"]' -s ALLOW_TABLE_GROWTH=1")
