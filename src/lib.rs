use lvgl::{self as lv, widgets::*, Align, Color, Part, State, Style};
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{console, CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

// Global display buffer
static mut DISPLAY_BUFFER: [u8; 800 * 600 * 4] = [0; 800 * 600 * 4];

#[wasm_bindgen]
pub struct TactileDesigner {
    widgets: Vec<WidgetInfo>,
    next_id: usize,
    canvas: Option<HtmlCanvasElement>,
    context: Option<CanvasRenderingContext2d>,
    display: Option<lv::Display>,
    screen: Option<lv::Obj>,
}

#[derive(Clone)]
struct WidgetInfo {
    id: String,
    widget_type: String,
    obj: Option<lv::Obj>,
    x: i16,
    y: i16,
    width: i16,
    height: i16,
}

#[wasm_bindgen]
impl TactileDesigner {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<TactileDesigner, JsValue> {
        console_error_panic_hook::set_once();
        console::log_1(&"Initializing LVGL...".into());

        // Initialize LVGL
        lv::init();

        let mut designer = TactileDesigner {
            widgets: Vec::new(),
            next_id: 0,
            canvas: None,
            context: None,
            display: None,
            screen: None,
        };

        console::log_1(&"LVGL initialized successfully".into());
        Ok(designer)
    }

    #[wasm_bindgen]
    pub fn setup_display(&mut self, canvas_id: &str) -> Result<(), JsValue> {
        let document = web_sys::window().unwrap().document().unwrap();
        let canvas = document
            .get_element_by_id(canvas_id)
            .unwrap()
            .dyn_into::<HtmlCanvasElement>()?;

        let context = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()?;

        self.canvas = Some(canvas.clone());
        self.context = Some(context);

        // Create LVGL display
        let display = lv::Display::create(800, 600)?;

        // Set up display driver callback
        let canvas_clone = canvas.clone();
        let context_clone = self.context.as_ref().unwrap().clone();

        display.set_flush_cb(move |_disp, area, color_p| {
            // Convert LVGL color buffer to ImageData
            let width = (area.x2 - area.x1 + 1) as u32;
            let height = (area.y2 - area.y1 + 1) as u32;

            let mut img_data = Vec::with_capacity((width * height * 4) as usize);

            for i in 0..(width * height) {
                let color = unsafe { *color_p.offset(i as isize) };
                let r = ((color >> 16) & 0xFF) as u8;
                let g = ((color >> 8) & 0xFF) as u8;
                let b = (color & 0xFF) as u8;
                let a = 255u8;

                img_data.push(r);
                img_data.push(g);
                img_data.push(b);
                img_data.push(a);
            }

            // Create ImageData and draw to canvas
            let img_data_js = ImageData::new_with_u8_clamped_array_and_sh(
                wasm_bindgen::Clamped(&img_data),
                width,
                height,
            )
            .unwrap();

            context_clone
                .put_image_data(&img_data_js, area.x1 as f64, area.y1 as f64)
                .unwrap();

            // Tell LVGL we're done flushing
            lv::disp_flush_ready();
        });

        self.display = Some(display);

        // Create main screen
        let screen = lv::Obj::create(None)?;
        screen.set_size(800, 600);
        self.screen = Some(screen);

        console::log_1(&"Display setup complete".into());
        Ok(())
    }

    #[wasm_bindgen]
    pub fn add_widget(
        &mut self,
        widget_type: &str,
        x: i16,
        y: i16,
        width: i16,
        height: i16,
    ) -> Result<String, JsValue> {
        let id = format!("widget_{}", self.next_id);
        self.next_id += 1;

        let obj = if let Some(ref mut screen) = self.screen {
            let obj = match widget_type {
                "button" => {
                    let mut btn = Button::create(screen)?;
                    btn.set_pos(x, y);
                    btn.set_size(width, height);

                    // Add button text
                    let mut label = Label::create(&mut btn)?;
                    label.set_text("Button")?;
                    label.center();

                    Ok(btn.into())
                }
                "label" => {
                    let mut label = Label::create(screen)?;
                    label.set_pos(x, y);
                    label.set_size(width, height);
                    label.set_text("Label")?;
                    Ok(label.into())
                }
                "slider" => {
                    let mut slider = Slider::create(screen)?;
                    slider.set_pos(x, y);
                    slider.set_size(width, height);
                    slider.set_value(50, lv::anim::Anim::OFF)?;
                    Ok(slider.into())
                }
                "switch" => {
                    let mut switch = Switch::create(screen)?;
                    switch.set_pos(x, y);
                    switch.set_size(width, height);
                    Ok(switch.into())
                }
                "bar" => {
                    let mut bar = Bar::create(screen)?;
                    bar.set_pos(x, y);
                    bar.set_size(width, height);
                    bar.set_value(50, lv::anim::Anim::OFF)?;
                    Ok(bar.into())
                }
                _ => {
                    let mut obj = lv::Obj::create(screen)?;
                    obj.set_pos(x, y);
                    obj.set_size(width, height);
                    Ok(obj)
                }
            };

            obj
        } else {
            return Err(JsValue::from_str("Display not initialized"));
        };

        let widget_info = WidgetInfo {
            id: id.clone(),
            widget_type: widget_type.to_string(),
            obj: Some(obj?),
            x,
            y,
            width,
            height,
        };

        self.widgets.push(widget_info);

        console::log_1(&format!("Added LVGL widget: {} at ({}, {})", widget_type, x, y).into());
        Ok(id)
    }

    #[wasm_bindgen]
    pub fn update_widget_position(&mut self, id: &str, x: i16, y: i16) -> bool {
        if let Some(widget) = self.widgets.iter_mut().find(|w| w.id == id) {
            widget.x = x;
            widget.y = y;

            if let Some(ref mut obj) = widget.obj {
                obj.set_pos(x, y);
                return true;
            }
        }
        false
    }

    #[wasm_bindgen]
    pub fn update_widget_size(&mut self, id: &str, width: i16, height: i16) -> bool {
        if let Some(widget) = self.widgets.iter_mut().find(|w| w.id == id) {
            widget.width = width;
            widget.height = height;

            if let Some(ref mut obj) = widget.obj {
                obj.set_size(width, height);
                return true;
            }
        }
        false
    }

    #[wasm_bindgen]
    pub fn refresh_display(&self) {
        // Trigger LVGL refresh
        lv::task_handler();

        // Force display update
        if let Some(ref display) = self.display {
            display.refr_now();
        }
    }

    #[wasm_bindgen]
    pub fn tick(&self) {
        lv::tick_inc(5); // 5ms tick
        lv::task_handler();
    }

    #[wasm_bindgen]
    pub fn get_widget_count(&self) -> usize {
        self.widgets.len()
    }

    #[wasm_bindgen]
    pub fn generate_cpp_code(&self) -> String {
        let mut code = String::new();

        code.push_str("#include \"lvgl.h\"\n");
        code.push_str("#include \"tactility.h\"\n\n");
        code.push_str("void create_ui(lv_obj_t* parent) {\n");

        for (i, widget) in self.widgets.iter().enumerate() {
            let var_name = format!("obj_{}", i);

            match widget.widget_type.as_str() {
                "button" => {
                    code.push_str(&format!(
                        "    lv_obj_t* {} = lv_btn_create(parent);\n",
                        var_name
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_pos({}, {}, {});\n",
                        var_name, widget.x, widget.y
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_size({}, {}, {});\n",
                        var_name, widget.width, widget.height
                    ));
                    code.push_str(&format!(
                        "    lv_obj_t* label_{} = lv_label_create({});\n",
                        i, var_name
                    ));
                    code.push_str(&format!(
                        "    lv_label_set_text(label_{}, \"Button\");\n",
                        i
                    ));
                    code.push_str(&format!("    lv_obj_center(label_{});\n", i));
                }
                "label" => {
                    code.push_str(&format!(
                        "    lv_obj_t* {} = lv_label_create(parent);\n",
                        var_name
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_pos({}, {}, {});\n",
                        var_name, widget.x, widget.y
                    ));
                    code.push_str(&format!(
                        "    lv_label_set_text({}, \"Label\");\n",
                        var_name
                    ));
                }
                "slider" => {
                    code.push_str(&format!(
                        "    lv_obj_t* {} = lv_slider_create(parent);\n",
                        var_name
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_pos({}, {}, {});\n",
                        var_name, widget.x, widget.y
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_size({}, {}, {});\n",
                        var_name, widget.width, widget.height
                    ));
                    code.push_str(&format!(
                        "    lv_slider_set_value({}, 50, LV_ANIM_OFF);\n",
                        var_name
                    ));
                }
                "switch" => {
                    code.push_str(&format!(
                        "    lv_obj_t* {} = lv_switch_create(parent);\n",
                        var_name
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_pos({}, {}, {});\n",
                        var_name, widget.x, widget.y
                    ));
                }
                "bar" => {
                    code.push_str(&format!(
                        "    lv_obj_t* {} = lv_bar_create(parent);\n",
                        var_name
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_pos({}, {}, {});\n",
                        var_name, widget.x, widget.y
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_size({}, {}, {});\n",
                        var_name, widget.width, widget.height
                    ));
                    code.push_str(&format!(
                        "    lv_bar_set_value({}, 50, LV_ANIM_OFF);\n",
                        var_name
                    ));
                }
                _ => {
                    code.push_str(&format!(
                        "    lv_obj_t* {} = lv_obj_create(parent);\n",
                        var_name
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_pos({}, {}, {});\n",
                        var_name, widget.x, widget.y
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_size({}, {}, {});\n",
                        var_name, widget.width, widget.height
                    ));
                }
            }
            code.push_str("\n");
        }

        code.push_str("}\n");
        code
    }
}

// Start the LVGL tick timer
#[wasm_bindgen(start)]
pub fn main() {
    console::log_1(&"LVGL WASM module loaded".into());
}