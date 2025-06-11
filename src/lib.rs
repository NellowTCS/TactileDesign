use wasm_bindgen::prelude::*;
use web_sys::console;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub struct Widget {
    id: String,
    widget_type: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

#[wasm_bindgen]
impl Widget {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> String {
        self.id.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn widget_type(&self) -> String {
        self.widget_type.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn x(&self) -> f64 {
        self.x
    }

    #[wasm_bindgen(getter)]
    pub fn y(&self) -> f64 {
        self.y
    }

    #[wasm_bindgen(getter)]
    pub fn width(&self) -> f64 {
        self.width
    }

    #[wasm_bindgen(getter)]
    pub fn height(&self) -> f64 {
        self.height
    }

    #[wasm_bindgen(setter)]
    pub fn set_x(&mut self, x: f64) {
        self.x = x;
    }

    #[wasm_bindgen(setter)]
    pub fn set_y(&mut self, y: f64) {
        self.y = y;
    }
}

#[wasm_bindgen]
pub struct TactileDesigner {
    widgets: Vec<Widget>,
    next_id: usize,
}

#[wasm_bindgen]
impl TactileDesigner {
    #[wasm_bindgen(constructor)]
    pub fn new() -> TactileDesigner {
        console_error_panic_hook::set_once();
        console::log_1(&"TactileDesigner initialized".into());

        TactileDesigner {
            widgets: Vec::new(),
            next_id: 0,
        }
    }

    #[wasm_bindgen]
    pub fn add_widget(
        &mut self,
        widget_type: &str,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
    ) -> String {
        let id = format!("widget_{}", self.next_id);
        self.next_id += 1;

        let widget = Widget {
            id: id.clone(),
            widget_type: widget_type.to_string(),
            x,
            y,
            width,
            height,
        };

        self.widgets.push(widget);
        console::log_1(&format!("Added widget: {} at ({}, {})", widget_type, x, y).into());

        id
    }

    #[wasm_bindgen]
    pub fn get_widget_count(&self) -> usize {
        self.widgets.len()
    }

    #[wasm_bindgen]
    pub fn get_widget(&self, index: usize) -> Option<Widget> {
        self.widgets.get(index).map(|w| Widget {
            id: w.id.clone(),
            widget_type: w.widget_type.clone(),
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height,
        })
    }

    #[wasm_bindgen]
    pub fn update_widget_position(&mut self, id: &str, x: f64, y: f64) -> bool {
        if let Some(widget) = self.widgets.iter_mut().find(|w| w.id == id) {
            widget.x = x;
            widget.y = y;
            true
        } else {
            false
        }
    }

    #[wasm_bindgen]
    pub fn generate_cpp_code(&self) -> String {
        let mut code = String::new();

        code.push_str("#include \"lvgl.h\"\n\n");
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
                        var_name, widget.x as i32, widget.y as i32
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_size({}, {}, {});\n",
                        var_name, widget.width as i32, widget.height as i32
                    ));
                }
                "label" => {
                    code.push_str(&format!(
                        "    lv_obj_t* {} = lv_label_create(parent);\n",
                        var_name
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_pos({}, {}, {});\n",
                        var_name, widget.x as i32, widget.y as i32
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
                        var_name, widget.x as i32, widget.y as i32
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_size({}, {}, {});\n",
                        var_name, widget.width as i32, widget.height as i32
                    ));
                }
                _ => {
                    code.push_str(&format!(
                        "    lv_obj_t* {} = lv_obj_create(parent);\n",
                        var_name
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_pos({}, {}, {});\n",
                        var_name, widget.x as i32, widget.y as i32
                    ));
                    code.push_str(&format!(
                        "    lv_obj_set_size({}, {}, {});\n",
                        var_name, widget.width as i32, widget.height as i32
                    ));
                }
            }
            code.push_str("\n");
        }

        code.push_str("}\n");
        code
    }
}
