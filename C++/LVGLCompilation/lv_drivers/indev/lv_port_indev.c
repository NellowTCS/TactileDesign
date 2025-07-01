// SPDX-License-Identifier: MIT

#include "lv_port_indev.h"
#include "lvgl.h"
#ifdef NXDK
#include <SDL.h>
#else
#include <SDL2/SDL.h>
#endif

static lv_indev_drv_t indev_drv_mouse;
static lv_indev_drv_t indev_drv_keypad;
static lv_indev_t *indev_mouse;
static lv_indev_t *indev_keypad;
static lv_obj_t *mouse_cursor;
static int mouse_x = 0, mouse_y = 0;
static lv_quit_event_t quit_event = LV_QUIT_NONE;
static bool mouse_event = false;
static bool mouse_pressed = false;

#ifndef MOUSE_SENSITIVITY
#define MOUSE_SENSITIVITY 50 // pixels per input poll LV_INDEV_DEF_READ_PERIOD
#endif
#ifndef MOUSE_DEADZONE
#define MOUSE_DEADZONE 10 // Percent
#endif

static keyboard_map_t lvgl_keyboard_map[] =
{
    {.sdl_map = SDLK_ESCAPE, .lvgl_map = LV_KEY_ESC},
    {.sdl_map = SDLK_BACKSPACE, .lvgl_map = LV_KEY_BACKSPACE},
    {.sdl_map = SDLK_HOME, .lvgl_map = LV_KEY_HOME},
    {.sdl_map = SDLK_RETURN, .lvgl_map = LV_KEY_ENTER},
    {.sdl_map = SDLK_PAGEDOWN, .lvgl_map = LV_KEY_PREV},
    {.sdl_map = SDLK_PAGEUP, .lvgl_map = LV_KEY_NEXT},
    {.sdl_map = SDLK_TAB, .lvgl_map = LV_KEY_NEXT},
    {.sdl_map = SDLK_UP, .lvgl_map = LV_KEY_UP},
    {.sdl_map = SDLK_DOWN, .lvgl_map = LV_KEY_DOWN},
    {.sdl_map = SDLK_LEFT, .lvgl_map = LV_KEY_LEFT},
    {.sdl_map = SDLK_RIGHT, .lvgl_map = LV_KEY_RIGHT},
};

lv_quit_event_t lv_get_quit(void)
{
    return quit_event;
}

void lv_set_quit(lv_quit_event_t event)
{
    quit_event = event;
}

static void mouse_read(lv_indev_drv_t *indev_drv, lv_indev_data_t *data)
{
    (void)indev_drv; // unused

    data->state = mouse_pressed ? LV_INDEV_STATE_PRESSED : LV_INDEV_STATE_RELEASED;

    if (mouse_event)
    {
        uint32_t buttons = SDL_GetMouseState(&mouse_x, &mouse_y);
        data->point.x = mouse_x;
        data->point.y = mouse_y;
        data->state = (buttons & SDL_BUTTON_LMASK) ? LV_INDEV_STATE_PRESSED : LV_INDEV_STATE_RELEASED;
        mouse_event = false;
    }
    else
    {
        // Optional: no joystick / controller, so no analog movement here
        // Just keep previous mouse_x and mouse_y unchanged
        data->point.x = mouse_x;
        data->point.y = mouse_y;
    }
}

static void keypad_read(lv_indev_drv_t *indev_drv, lv_indev_data_t *data)
{
    (void)indev_drv; // unused
    data->key = 0;
    data->state = LV_INDEV_STATE_RELEASED;

    static SDL_Event e;
    if (SDL_PollEvent(&e))
    {
        if (e.type == SDL_WINDOWEVENT)
        {
            if (e.window.event == SDL_WINDOWEVENT_CLOSE)
            {
                quit_event = LV_QUIT;
            }
        }

        if (e.type == SDL_MOUSEMOTION || e.type == SDL_MOUSEBUTTONDOWN || e.type == SDL_MOUSEBUTTONUP)
        {
            mouse_event = true;
        }

        if ((e.type == SDL_MOUSEBUTTONDOWN || e.type == SDL_MOUSEBUTTONUP) && e.button.button == SDL_BUTTON_LEFT)
        {
            mouse_event = true;
            mouse_pressed = (e.type == SDL_MOUSEBUTTONDOWN);
        }

        if (e.type == SDL_KEYDOWN || e.type == SDL_KEYUP)
        {
            for (size_t i = 0; i < sizeof(lvgl_keyboard_map) / sizeof(lvgl_keyboard_map[0]); i++)
            {
                if (lvgl_keyboard_map[i].sdl_map == e.key.keysym.sym)
                {
                    data->key = lvgl_keyboard_map[i].lvgl_map;
                    data->state = (e.type == SDL_KEYDOWN) ? LV_INDEV_STATE_PRESSED : LV_INDEV_STATE_RELEASED;
                    break;
                }
            }
        }
    }

    data->continue_reading = (SDL_PollEvent(NULL) != 0);
}

void lv_port_indev_init(bool use_mouse_cursor)
{
    // No SDL_InitSubSystem for GameController here

    // Register keypad input (keyboard)
    lv_indev_drv_init(&indev_drv_keypad);
    indev_drv_keypad.type = LV_INDEV_TYPE_KEYPAD;
    indev_drv_keypad.read_cb = keypad_read;
    indev_keypad = lv_indev_drv_register(&indev_drv_keypad);

    if (use_mouse_cursor)
    {
        // Register mouse input
        lv_indev_drv_init(&indev_drv_mouse);
        indev_drv_mouse.type = LV_INDEV_TYPE_POINTER;
        indev_drv_mouse.read_cb = mouse_read;
        indev_mouse = lv_indev_drv_register(&indev_drv_mouse);

        mouse_cursor = lv_img_create(lv_scr_act());
        lv_img_set_src(mouse_cursor, LV_SYMBOL_PLUS);
        lv_indev_set_cursor(indev_mouse, mouse_cursor);
    }

    quit_event = LV_QUIT_NONE;
}

void lv_port_indev_deinit(void)
{
    // No SDL_QuitSubSystem for GameController here
}
