import React, { useState, useEffect } from "react";

type WidgetType = "container" | "button" | "label";

interface WidgetBase {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LabelWidget extends WidgetBase {
  type: "label";
  text: string;
}

interface ButtonWidget extends WidgetBase {
  type: "button";
  text: string;
}

interface ContainerWidget extends WidgetBase {
  type: "container";
  children: Widget[];
}

type Widget = LabelWidget | ButtonWidget | ContainerWidget;

declare global {
  interface Window {
    Module?: any;
  }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function App() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null);

  // Wait for WASM Module
  useEffect(() => {
    const waitForModule = async () => {
      while (!window.Module || !window.Module.ccall) {
        await new Promise((res) => setTimeout(res, 100));
      }
    };
    waitForModule();
  }, []);

  const onCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingType) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const baseWidget = {
      id: generateId(),
      type: draggingType,
      x,
      y,
      width: 100,
      height: 40,
    };

    let newWidget: Widget;
    if (draggingType === "container") {
      newWidget = { ...baseWidget, children: [] } as ContainerWidget;
    } else {
      newWidget = {
        ...baseWidget,
        text: draggingType === "label" ? "Label" : "Button",
      } as LabelWidget | ButtonWidget;
    }

    const updated = [...widgets, newWidget];
    setWidgets(updated);
    setDraggingType(null);
    renderToWasm(updated);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectWidget = (id: string) => setSelectedId(id);

  const updateWidget = (updated: Partial<Widget>) => {
    if (!selectedId) return;
    const newWidgets = widgets.map((w) =>
      w.id === selectedId ? { ...w, ...updated } : w
    );
    setWidgets(newWidgets);
    renderToWasm(newWidgets);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    const filtered = widgets.filter((w) => w.id !== selectedId);
    setWidgets(filtered);
    setSelectedId(null);
    renderToWasm(filtered);
  };

  const renderToWasm = (layout: Widget[]) => {
    if (!window.Module || !window.Module.ccall) return;
    window.Module.ccall("lvgl_clear_screen");

    for (const w of layout) {
      switch (w.type) {
        case "label":
          window.Module.ccall(
            "lvgl_create_label",
            null,
            ["number", "number", "string"],
            [w.x, w.y, (w as LabelWidget).text]
          );
          break;
        case "button":
          window.Module.ccall(
            "lvgl_create_button",
            null,
            ["number", "number", "string"],
            [w.x, w.y, (w as ButtonWidget).text]
          );
          break;
        // Add container sync here if needed
      }
    }
  };

  const generateCpp = () => {
    const code =
      `void onShow(AppContext& context, lv_obj_t* parent) {\n` +
      widgets
        .map((w) => {
          switch (w.type) {
            case "label":
              return `  auto ${w.id} = lv_label_create(parent);\n` +
                     `  lv_label_set_text(${w.id}, "${(w as LabelWidget).text}");\n` +
                     `  lv_obj_set_pos(${w.id}, ${w.x}, ${w.y});\n` +
                     `  lv_obj_set_size(${w.id}, ${w.width}, ${w.height});\n`;
            case "button":
              return `  auto ${w.id} = lv_btn_create(parent);\n` +
                     `  auto ${w.id}_label = lv_label_create(${w.id});\n` +
                     `  lv_label_set_text(${w.id}_label, "${(w as ButtonWidget).text}");\n` +
                     `  lv_obj_center(${w.id}_label);\n` +
                     `  lv_obj_set_pos(${w.id}, ${w.x}, ${w.y});\n` +
                     `  lv_obj_set_size(${w.id}, ${w.width}, ${w.height});\n`;
            case "container":
              return `  auto ${w.id} = lv_obj_create(parent);\n` +
                     `  lv_obj_set_pos(${w.id}, ${w.x}, ${w.y});\n` +
                     `  lv_obj_set_size(${w.id}, ${w.width}, ${w.height});\n`;
            default:
              return "";
          }
        })
        .join("\n") +
      `}\n`;
    alert("Generated C++ code:\n\n" + code);
  };

  const selectedWidget = widgets.find((w) => w.id === selectedId);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Left Sidebar */}
      <div style={{ width: 160, padding: 10, borderRight: "1px solid #ccc" }}>
        <h3>Widgets</h3>
        {(["label", "button", "container"] as WidgetType[]).map((type) => (
          <div
            key={type}
            onClick={() => setDraggingType(type)}
            style={{
              padding: 8,
              marginBottom: 8,
              background: draggingType === type ? "#007acc" : "#eee",
              color: draggingType === type ? "#fff" : "#000",
              textAlign: "center",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {type}
          </div>
        ))}
        <button onClick={generateCpp} style={{ width: "100%", marginTop: 10 }}>
          Generate C++
        </button>
      </div>

      {/* Canvas */}
      <div
        onClick={onCanvasClick}
        style={{
          flexGrow: 1,
          padding: 10,
          background: "#f0f0f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <iframe
          src="/src/lvgl/index.html?w=320&h=240"
          width={320}
          height={240}
          style={{
            border: "2px solid #444",
            pointerEvents: "none", // Prevent iframe stealing clicks
          }}
        />
      </div>

      {/* Right Sidebar */}
      <div style={{ width: 250, padding: 10, borderLeft: "1px solid #ccc" }}>
        <h3>Properties</h3>
        {!selectedWidget ? (
          <p>Select a widget</p>
        ) : (
          <>
            <p>Type: {selectedWidget.type}</p>
            {["x", "y", "width", "height"].map((prop) => (
              <label key={prop}>
                {prop.toUpperCase()}:
                <input
                  type="number"
                  value={(selectedWidget as any)[prop]}
                  onChange={(e) =>
                    updateWidget({ [prop]: +e.target.value } as any)
                  }
                  style={{ width: "100%", marginBottom: 8 }}
                />
              </label>
            ))}
            {"text" in selectedWidget && (
              <label>
                Text:
                <input
                  type="text"
                  value={(selectedWidget as any).text}
                  onChange={(e) => updateWidget({ text: e.target.value })}
                  style={{ width: "100%", marginBottom: 8 }}
                />
              </label>
            )}
            <button
              onClick={removeSelected}
              style={{
                marginTop: 10,
                background: "red",
                color: "white",
                width: "100%",
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
