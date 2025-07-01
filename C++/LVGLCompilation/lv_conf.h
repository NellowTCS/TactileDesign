#ifndef LV_CONF_H
#define LV_CONF_H

#include <stdint.h>

/* WASM specific settings */
#ifdef __EMSCRIPTEN__
#define LV_TICK_CUSTOM 0   /* disable custom tick */
#define LV_NO_TASK_HANDLER 0
#endif


/* Display */
#define LV_HOR_RES_MAX          480
#define LV_VER_RES_MAX          320
#define LV_COLOR_DEPTH          16
#define LV_DPI_DEF              100

/* Memory management */
#define LV_MEM_SIZE             (128U * 1024U)
#define LV_MEM_CUSTOM           0

/* Rendering */
#define LV_DISP_DEF_REFR_PERIOD 30
#define LV_INDEV_DEF_READ_PERIOD 30

/* Features */
#define LV_USE_FILESYSTEM       0
#define LV_USE_USER_DATA        1
#define LV_USE_LOG              0
#define LV_USE_ASSERT_NULL      0
#define LV_USE_ASSERT_MALLOC    0
#define LV_USE_ASSERT_STYLE     0
#define LV_USE_ASSERT_MEM_INTEGRITY 0
#define LV_USE_ASSERT_OBJ       0

/* Widgets */
#define LV_USE_ARC              1
#define LV_USE_ANIMIMG          1
#define LV_USE_BAR              1
#define LV_USE_BTN              1
#define LV_USE_BTNMATRIX        1
#define LV_USE_CANVAS           1
#define LV_USE_CHECKBOX         1
#define LV_USE_DROPDOWN         1
#define LV_USE_IMG              1
#define LV_USE_LABEL            1
#define LV_USE_LINE             1
#define LV_USE_LIST             1
#define LV_USE_METER            1
#define LV_USE_MSGBOX           0
#define LV_USE_ROLLER           0
#define LV_USE_SLIDER           1
#define LV_USE_SWITCH           1
#define LV_USE_TEXTAREA         1
#define LV_USE_TABLE            0
#define LV_USE_TABVIEW          1

/* Themes */
#define LV_USE_THEME_DEFAULT    1
#define LV_USE_THEME_BASIC      0

/* Layouts */
#define LV_USE_FLEX             1
#define LV_USE_GRID             1

#endif
