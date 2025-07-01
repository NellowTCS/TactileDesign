#include "lvgl.h"
#include "lv_port_disp.h"
#include "lv_port_indev.h"

#include <stdio.h>
#define SDL_MAIN_HANDLED
#include <emscripten.h>

static void main_loop()
{
    lv_tick_inc(5);              // Increment LVGL internal tick
    lv_task_handler();           // Handle LVGL tasks
}

// Expose this function to JavaScript
#ifdef __cplusplus
extern "C" {
#endif
    EMSCRIPTEN_KEEPALIVE
    void start_lvgl()
    {
        lv_init();                   // Initialize LVGL
        lv_port_disp_init(480, 320); // Initialize display
        lv_port_indev_init(true);    // Initialize input

        emscripten_set_main_loop(main_loop, 0, 1); // Run main loop
    }
#ifdef __cplusplus
}
#endif
