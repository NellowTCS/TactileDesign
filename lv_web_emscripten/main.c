
/**
 * @file main
 *
 */

/*********************
 *      INCLUDES
 *********************/
#include <stdlib.h>
#include <unistd.h>
#define SDL_MAIN_HANDLED        /*To fix SDL's "undefined reference to WinMain" issue*/
#include <SDL2/SDL.h>
#include <emscripten.h>
#include "lvgl/lvgl.h"
#include "lvgl/demos/lv_demos.h"

#include "examplelist.h"

/*********************
 *      DEFINES
 *********************/

/*On OSX SDL needs different handling*/
#if defined(__APPLE__) && defined(TARGET_OS_MAC)
# if __APPLE__ && TARGET_OS_MAC
#define SDL_APPLE
# endif
#endif

/**********************
 *      TYPEDEFS
 **********************/

/**********************
 *  STATIC PROTOTYPES
 **********************/
static void hal_init(void);
static int tick_thread(void * data);
static void memory_monitor(lv_timer_t * param);

/**********************
 *  STATIC VARIABLES
 **********************/
int monitor_hor_res, monitor_ver_res;

/**********************
 *      MACROS
 **********************/

/**********************
 *   GLOBAL FUNCTIONS
 **********************/
void do_loop(void *arg);

/* Allows disabling CHOSEN_DEMO */
static void lv_example_noop(void) {
}

int main(int argc, char ** argv)
{

    extern const struct lv_ci_example lv_ci_example_list[];
    const struct lv_ci_example *ex = NULL;
    monitor_hor_res = atoi(argv[1]);
    monitor_ver_res = atoi(argv[2]);
    /* Check if a specific example is wanted (not "default") */
    if(argc >= 4 && strcmp(ex->name, "default")) {
        for(ex = &lv_ci_example_list[0]; ex->name != NULL; ex++) {
            if(!strcmp(ex->name, argv[3])) {
                break;
            }
        }
        if(ex->name == NULL) {
            fprintf(stderr, "Unable to find requested example\n");
        }
    }
    printf("Starting with screen resolution of %dx%d px\n", monitor_hor_res, monitor_ver_res);

    /*Initialize LittlevGL*/
    lv_init();

    /*Initialize the HAL (display, input devices, tick) for LittlevGL*/
    hal_init();

    /*Load a demo*/
    if(ex != NULL && ex->fn != NULL) {
        ex->fn();
    } else {
        extern void CHOSEN_DEMO(void);
        CHOSEN_DEMO();
    }

    emscripten_set_main_loop_arg(do_loop, NULL, -1, true);
}

void do_loop(void *arg)
{
    /* Periodically call the lv_task handler.
     * It could be done in a timer interrupt or an OS task too.*/
    lv_task_handler();
}

/**********************
 *   STATIC FUNCTIONS
 **********************/


/**
 * Initialize the Hardware Abstraction Layer (HAL) for the Littlev graphics library
 */
static void hal_init(void)
{
    lv_display_t * disp = lv_sdl_window_create(monitor_hor_res, monitor_ver_res);

    lv_group_t * g = lv_group_create();
    lv_group_set_default(g);

    lv_sdl_mouse_create();
    lv_sdl_mousewheel_create();
    lv_sdl_keyboard_create();
 
    lv_indev_t * mouse = lv_sdl_mouse_create();
    lv_indev_set_group(mouse, lv_group_get_default());
    
    lv_indev_t * mousewheel = lv_sdl_mousewheel_create();
    lv_indev_set_group(mousewheel, lv_group_get_default());

    lv_indev_t * keyboard = lv_sdl_keyboard_create();
    lv_indev_set_group(keyboard, lv_group_get_default());    
}

EMSCRIPTEN_KEEPALIVE void lvgl_clear_screen() {
    lv_obj_clean(lv_screen_active());
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_label(int x, int y, const char* text) {
    lv_obj_t* label = lv_label_create(lv_screen_active());
    lv_label_set_text(label, text);
    lv_obj_set_pos(label, x, y);
    return label;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_button(int x, int y, int w, int h, const char* text) {
    lv_obj_t* btn = lv_btn_create(lv_screen_active());
    lv_obj_t* label = lv_label_create(btn);
    lv_label_set_text(label, text);
    lv_obj_center(label);
    lv_obj_set_pos(btn, x, y);
    lv_obj_set_size(btn, w, h);
    return btn;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_container(int x, int y, int w, int h) {
    lv_obj_t* cont = lv_obj_create(lv_screen_active());
    lv_obj_set_pos(cont, x, y);
    lv_obj_set_size(cont, w, h);
    return cont;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_slider(int x, int y, int w, int h, int min, int max, int value) {
    lv_obj_t* slider = lv_slider_create(lv_screen_active());
    lv_obj_set_pos(slider, x, y);
    lv_obj_set_size(slider, w, h);
    lv_slider_set_range(slider, min, max);
    lv_slider_set_value(slider, value, LV_ANIM_OFF);
    return slider;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_checkbox(int x, int y, const char* text, int checked) {
    lv_obj_t* cb = lv_checkbox_create(lv_screen_active());
    lv_checkbox_set_text(cb, text);
    lv_obj_set_pos(cb, x, y);
    if (checked) {
        lv_obj_add_state(cb, LV_STATE_CHECKED);
    }
    return cb;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_switch(int x, int y, int checked) {
    lv_obj_t* sw = lv_switch_create(lv_screen_active());
    lv_obj_set_pos(sw, x, y);
    if (checked) {
        lv_obj_add_state(sw, LV_STATE_CHECKED);
    }
    return sw;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_textarea(int x, int y, int w, int h, const char* placeholder) {
    lv_obj_t* ta = lv_textarea_create(lv_screen_active());
    lv_obj_set_pos(ta, x, y);
    lv_obj_set_size(ta, w, h);
    lv_textarea_set_placeholder_text(ta, placeholder);
    return ta;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_dropdown(int x, int y, int w, const char* options) {
    lv_obj_t* dd = lv_dropdown_create(lv_screen_active());
    lv_obj_set_pos(dd, x, y);
    lv_obj_set_width(dd, w);
    lv_dropdown_set_options(dd, options);
    return dd;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_arc(int x, int y, int size, int value) {
    lv_obj_t* arc = lv_arc_create(lv_screen_active());
    lv_obj_set_pos(arc, x, y);
    lv_obj_set_size(arc, size, size);
    lv_arc_set_value(arc, value);
    return arc;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_spinner(int x, int y, int size, int speed) {
    lv_obj_t* spinner = lv_spinner_create(lv_screen_active());
    lv_obj_set_pos(spinner, x, y);
    lv_obj_set_size(spinner, size, size);
    lv_spinner_set_anim_params(spinner, speed, 90);
    return spinner;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_bar(int x, int y, int w, int h, int value) {
    lv_obj_t* bar = lv_bar_create(lv_screen_active());
    lv_obj_set_pos(bar, x, y);
    lv_obj_set_size(bar, w, h);
    lv_bar_set_value(bar, value, LV_ANIM_OFF);
    return bar;
}

EMSCRIPTEN_KEEPALIVE lv_obj_t* lvgl_create_roller(int x, int y, int h, const char* options) {
    lv_obj_t* roller = lv_roller_create(lv_screen_active());
    lv_obj_set_pos(roller, x, y);
    lv_obj_set_height(roller, h);
    lv_roller_set_options(roller, options, LV_ROLLER_MODE_NORMAL);
    return roller;
}
