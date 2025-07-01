/**
 * @file lv_port_indev.h
 *
 */

/* Copy this file as "lv_port_indev.h" and set this value to "1" to enable content */
#if 1

#ifndef LV_PORT_INDEV_H
#define LV_PORT_INDEV_H

#ifdef __cplusplus
extern "C" {
#endif

/*********************
 *      INCLUDES
 *********************/
#include "lvgl.h"
#ifdef NXDK
#include <SDL.h>
#else
#include <SDL2/SDL.h>
#endif

/*********************
 *      DEFINES
 *********************/
 typedef struct
{
    SDL_GameControllerButton sdl_map;
    lv_key_t lvgl_map;
} gamecontroller_map_t;

typedef struct
{
    SDL_Keycode sdl_map;
    lv_key_t lvgl_map;
} keyboard_map_t;
typedef enum
{
    LV_QUIT_NONE,
    LV_REBOOT,
    LV_SHUTDOWN,
    LV_QUIT,
    LV_QUIT_OTHER,
} lv_quit_event_t;

/**********************
 * GLOBAL PROTOTYPES
 **********************/

/**
 * Initialize the input devices for LVGL.
 * @param use_mouse_cursor true to show mouse cursor, false to disable.
 */
void lv_port_indev_init(bool use_mouse_cursor);

/**
 * Deinitialize the input devices.
 */
void lv_port_indev_deinit(void);

/**
 * Set the quit event status.
 */
void lv_set_quit(lv_quit_event_t event);

/**
 * Get the current quit event status.
 */
lv_quit_event_t lv_get_quit(void);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /*LV_PORT_INDEV_H*/

#endif /*Disable/Enable content*/
