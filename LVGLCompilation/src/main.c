#include "lvgl.h"
#include "lv_port_disp.h"
#include "lv_port_indev.h"

#include <stdio.h>
#include <emscripten.h>

static void main_loop()
{
    lv_tick_inc(5);              // Increment LVGL internal tick
    lv_task_handler();           // Handle LVGL tasks
}

int main()
{
    lv_init();                   // Initialize LVGL
    lv_port_disp_init(640, 480); // Initialize display
    lv_port_indev_init(true);    // Initialize input

    emscripten_set_main_loop(main_loop, 0, 1); // Run main loop

    return 0;
}
