import React, { useState, useEffect } from "react";
import { 
  Square, 
  MousePointer, 
  Type, 
  Sliders, 
  CheckSquare, 
  ToggleLeft, 
  FileText, 
  ChevronDown, 
  RotateCw, 
  Loader, 
  BarChart3, 
  ListFilter,
  Code,
  Save,
  FolderOpen,
  Trash2
} from "lucide-react";

type WidgetType = "container" | "button" | "label" | "slider" | "checkbox" | "switch" | "textarea" | "dropdown" | "arc" | "spinner" | "bar" | "roller";

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

interface SliderWidget extends WidgetBase {
  type: "slider";
  min: number;
  max: number;
  value: number;
}

interface CheckboxWidget extends WidgetBase {
  type: "checkbox";
  text: string;
  checked: boolean;
}

interface SwitchWidget extends WidgetBase {
  type: "switch";
  checked: boolean;
}

interface TextareaWidget extends WidgetBase {
  type: "textarea";
  placeholder: string;
}

interface DropdownWidget extends WidgetBase {
  type: "dropdown";
  options: string;
}

interface ArcWidget extends WidgetBase {
  type: "arc";
  value: number;
}

interface SpinnerWidget extends WidgetBase {
  type: "spinner";
  speed: number;
}

interface BarWidget extends WidgetBase {
  type: "bar";
  value: number;
}

interface RollerWidget extends WidgetBase {
  type: "roller";
  options: string;
}

type Widget = LabelWidget | ButtonWidget | ContainerWidget | SliderWidget | CheckboxWidget | SwitchWidget | TextareaWidget | DropdownWidget | ArcWidget | SpinnerWidget | BarWidget | RollerWidget;

declare global {
  interface Window {
    Module?: unknown;
    LVGL?: {
      clear: () => void;
      label: (x: number, y: number, text: string) => void;
      button: (x: number, y: number, w: number, h: number, text: string) => void;
    };
  }
}

interface IFrameWindow extends Window {
  LVGL?: {
    clear: () => void;
    label: (x: number, y: number, text: string) => void;
    button: (x: number, y: number, w: number, h: number, text: string) => void;
    container: (x: number, y: number, w: number, h: number) => void;
    slider: (x: number, y: number, w: number, h: number, min: number, max: number, value: number) => void;
    checkbox: (x: number, y: number, text: string, checked: number) => void;
    switch: (x: number, y: number, checked: number) => void;
    textarea: (x: number, y: number, w: number, h: number, placeholder: string) => void;
    dropdown: (x: number, y: number, w: number, options: string) => void;
    arc: (x: number, y: number, size: number, value: number) => void;
    spinner: (x: number, y: number, size: number, speed: number) => void;
    bar: (x: number, y: number, w: number, h: number, value: number) => void;
    roller: (x: number, y: number, h: number, options: string) => void;
  };
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const widgetIcons: Record<WidgetType, React.ComponentType<{ size?: number; className?: string }>> = {
  label: Type,
  button: MousePointer,
  container: Square,
  slider: Sliders,
  checkbox: CheckSquare,
  switch: ToggleLeft,
  textarea: FileText,
  dropdown: ChevronDown,
  arc: RotateCw,
  spinner: Loader,
  bar: BarChart3,
  roller: ListFilter,
};

export default function App() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Wait for WASM Module
  useEffect(() => {
    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'lvglReady') {
        console.log("Received LVGL ready message from iframe");
        // Now we can access the iframe's LVGL interface
        if (iframeRef.current?.contentWindow) {
          console.log("LVGL module ready in iframe!");
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const onCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingType) return;
    
    // Get click position relative to the iframe
    if (!iframeRef.current) return;
    const iframeRect = iframeRef.current.getBoundingClientRect();
    const x = Math.floor(e.clientX - iframeRect.left);
    const y = Math.floor(e.clientY - iframeRect.top);
    
    // Check if click is within iframe bounds
    if (x < 0 || y < 0 || x > iframeRect.width || y > iframeRect.height) {
      console.log("Click outside iframe bounds");
      return;
    }
    
    console.log(`Creating ${draggingType} at (${x}, ${y})`);

    const baseWidget = {
      id: generateId(),
      type: draggingType,
      x,
      y,
      width: 100,
      height: 40,
    };

    let newWidget: Widget;
    switch (draggingType) {
      case "container":
        newWidget = { ...baseWidget, children: [] } as ContainerWidget;
        break;
      case "label":
        newWidget = { ...baseWidget, text: "Label" } as LabelWidget;
        break;
      case "button":
        newWidget = { ...baseWidget, text: "Button" } as ButtonWidget;
        break;
      case "slider":
        newWidget = { ...baseWidget, width: 150, min: 0, max: 100, value: 50 } as SliderWidget;
        break;
      case "checkbox":
        newWidget = { ...baseWidget, width: 120, height: 30, text: "Checkbox", checked: false } as CheckboxWidget;
        break;
      case "switch":
        newWidget = { ...baseWidget, width: 50, height: 25, checked: false } as SwitchWidget;
        break;
      case "textarea":
        newWidget = { ...baseWidget, width: 150, height: 80, placeholder: "Enter text..." } as TextareaWidget;
        break;
      case "dropdown":
        newWidget = { ...baseWidget, width: 120, options: "Option 1\nOption 2\nOption 3" } as DropdownWidget;
        break;
      case "arc":
        newWidget = { ...baseWidget, width: 80, height: 80, value: 50 } as ArcWidget;
        break;
      case "spinner":
        newWidget = { ...baseWidget, width: 50, height: 50, speed: 1000 } as SpinnerWidget;
        break;
      case "bar":
        newWidget = { ...baseWidget, width: 150, height: 20, value: 50 } as BarWidget;
        break;
      case "roller":
        newWidget = { ...baseWidget, width: 100, height: 100, options: "Option 1\nOption 2\nOption 3\nOption 4" } as RollerWidget;
        break;
      default:
        return;
    }

    const updated = [...widgets, newWidget];
    setWidgets(updated);
    setDraggingType(null);
    renderToWasm(updated);
  };



  const updateWidget = (updated: Partial<WidgetBase & { 
    text?: string; 
    checked?: boolean; 
    min?: number; 
    max?: number; 
    value?: number; 
    placeholder?: string; 
    options?: string; 
    speed?: number;
  }>) => {
    if (!selectedId) return;
    const newWidgets = widgets.map((w) =>
      w.id === selectedId ? { ...w, ...updated } : w
    ) as Widget[];
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
    // Access LVGL from the iframe's window
    const iframeWindow = iframeRef.current?.contentWindow as IFrameWindow | null;
    if (!iframeWindow?.LVGL) {
      console.warn("LVGL not ready in iframe");
      return;
    }
    
    console.log("Rendering to LVGL:", layout);
    iframeWindow.LVGL.clear();

    for (const w of layout) {
      switch (w.type) {
        case "label":
          iframeWindow.LVGL.label(w.x, w.y, (w as LabelWidget).text);
          break;
        case "button":
          iframeWindow.LVGL.button(w.x, w.y, w.width, w.height, (w as ButtonWidget).text);
          break;
        case "container":
          iframeWindow.LVGL.container(w.x, w.y, w.width, w.height);
          break;
        case "slider": {
          const s = w as SliderWidget;
          iframeWindow.LVGL.slider(w.x, w.y, w.width, w.height, s.min ?? 0, s.max ?? 100, s.value ?? 50);
          break;
        }
        case "checkbox": {
          const cb = w as CheckboxWidget;
          iframeWindow.LVGL.checkbox(w.x, w.y, cb.text || "Checkbox", cb.checked ? 1 : 0);
          break;
        }
        case "switch": {
          const sw = w as SwitchWidget;
          iframeWindow.LVGL.switch(w.x, w.y, sw.checked ? 1 : 0);
          break;
        }
        case "textarea": {
          const ta = w as TextareaWidget;
          iframeWindow.LVGL.textarea(w.x, w.y, w.width, w.height, ta.placeholder || "");
          break;
        }
        case "dropdown": {
          const dd = w as DropdownWidget;
          iframeWindow.LVGL.dropdown(w.x, w.y, w.width, dd.options || "Option 1\nOption 2");
          break;
        }
        case "arc": {
          const arc = w as ArcWidget;
          iframeWindow.LVGL.arc(w.x, w.y, w.width, arc.value ?? 50);
          break;
        }
        case "spinner": {
          const sp = w as SpinnerWidget;
          iframeWindow.LVGL.spinner(w.x, w.y, w.width, sp.speed ?? 1000);
          break;
        }
        case "bar": {
          const bar = w as BarWidget;
          iframeWindow.LVGL.bar(w.x, w.y, w.width, w.height, bar.value ?? 50);
          break;
        }
        case "roller": {
          const roller = w as RollerWidget;
          iframeWindow.LVGL.roller(w.x, w.y, w.height, roller.options || "Option 1\nOption 2\nOption 3");
          break;
        }
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
    setGeneratedCode(code);
  };

  const selectedWidget = widgets.find((w) => w.id === selectedId);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", background: "#f5f5f5" }}>
      {/* Left Sidebar */}
      <div style={{ width: 220, padding: 16, borderRight: "1px solid #ddd", background: "#fff", overflowY: "auto" }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600 }}>Widgets</h2>
        
        {/* Basic */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 600, color: "#666", textTransform: "uppercase" }}>Basic</h4>
          {(["label", "button", "container"] as WidgetType[]).map((type) => (
            <div
              key={type}
              onClick={() => setDraggingType(type)}
              style={{
                padding: "10px 12px",
                marginBottom: 6,
                background: draggingType === type ? "#007acc" : "#f8f8f8",
                color: draggingType === type ? "#fff" : "#333",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                border: draggingType === type ? "2px solid #005a9e" : "2px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (draggingType !== type) {
                  e.currentTarget.style.background = "#e8e8e8";
                }
              }}
              onMouseLeave={(e) => {
                if (draggingType !== type) {
                  e.currentTarget.style.background = "#f8f8f8";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {React.createElement(widgetIcons[type], { size: 16 })}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 600, color: "#666", textTransform: "uppercase" }}>Input</h4>
          {(["checkbox", "switch", "slider", "textarea", "dropdown", "roller"] as WidgetType[]).map((type) => (
            <div
              key={type}
              onClick={() => setDraggingType(type)}
              style={{
                padding: "10px 12px",
                marginBottom: 6,
                background: draggingType === type ? "#007acc" : "#f8f8f8",
                color: draggingType === type ? "#fff" : "#333",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                border: draggingType === type ? "2px solid #005a9e" : "2px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (draggingType !== type) {
                  e.currentTarget.style.background = "#e8e8e8";
                }
              }}
              onMouseLeave={(e) => {
                if (draggingType !== type) {
                  e.currentTarget.style.background = "#f8f8f8";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {React.createElement(widgetIcons[type], { size: 16 })}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            </div>
          ))}
        </div>

        {/* Visualization */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 600, color: "#666", textTransform: "uppercase" }}>Visualization</h4>
          {(["arc", "bar", "spinner"] as WidgetType[]).map((type) => (
            <div
              key={type}
              onClick={() => setDraggingType(type)}
              style={{
                padding: "10px 12px",
                marginBottom: 6,
                background: draggingType === type ? "#007acc" : "#f8f8f8",
                color: draggingType === type ? "#fff" : "#333",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                border: draggingType === type ? "2px solid #005a9e" : "2px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (draggingType !== type) {
                  e.currentTarget.style.background = "#e8e8e8";
                }
              }}
              onMouseLeave={(e) => {
                if (draggingType !== type) {
                  e.currentTarget.style.background = "#f8f8f8";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {React.createElement(widgetIcons[type], { size: 16 })}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={generateCpp} 
          style={{ 
            width: "100%", 
            padding: 12, 
            background: "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: 6, 
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            marginTop: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Code size={16} />
            Generate C++
          </div>
        </button>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button 
            onClick={() => localStorage.setItem("tactileDesign", JSON.stringify(widgets))} 
            style={{ 
              flex: 1, 
              padding: 10, 
              background: "#007acc", 
              color: "white", 
              border: "none", 
              borderRadius: 6, 
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <Save size={14} />
              Save
            </div>
          </button>
          <button 
            onClick={() => {
              const saved = localStorage.getItem("tactileDesign");
              if (saved) {
                const loadedWidgets = JSON.parse(saved) as Widget[];
                setWidgets(loadedWidgets);
                setSelectedId(null);
                renderToWasm(loadedWidgets);
              }
            }} 
            style={{ 
              flex: 1, 
              padding: 10, 
              background: "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: 6, 
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <FolderOpen size={14} />
              Load
            </div>
          </button>
        </div>
        {generatedCode && (
          <div style={{ marginTop: 10 }}>
            <h4>Generated C++ Code</h4>
            <textarea
              value={generatedCode}
              readOnly
              style={{ width: "100%", height: 200, fontFamily: "monospace" }}
            />
          </div>
        )}
        <h4 style={{ 
          marginTop: 16, 
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 600,
          color: "#333",
          borderBottom: "2px solid #e0e0e0",
          paddingBottom: 6,
        }}>
          Widget Tree
        </h4>
        <div style={{ 
          maxHeight: 200, 
          overflowY: "auto",
          background: "#fafafa",
          borderRadius: 6,
          padding: 4,
        }}>
          {widgets.length === 0 ? (
            <div style={{
              padding: 20,
              textAlign: "center",
              color: "#999",
              fontSize: 13,
            }}>
              No widgets yet. Click on canvas to add!
            </div>
          ) : (
            widgets.map((w) => (
              <div
                key={w.id}
                onClick={() => setSelectedId(w.id)}
                style={{
                  padding: 8,
                  marginBottom: 4,
                  background: selectedId === w.id ? "#007acc" : "#fff",
                  color: selectedId === w.id ? "#fff" : "#333",
                  cursor: "pointer",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: selectedId === w.id ? 500 : 400,
                  border: selectedId === w.id ? "1px solid #005a9e" : "1px solid #e0e0e0",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (selectedId !== w.id) {
                    e.currentTarget.style.background = "#f0f0f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedId !== w.id) {
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {React.createElement(widgetIcons[w.type], { size: 16 })}
                  <div style={{ fontWeight: 500, flex: 1 }}>
                    {w.type.charAt(0).toUpperCase() + w.type.slice(1)}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>
                    #{w.id.slice(-4)}
                  </div>
                </div>
                <div style={{ 
                  fontSize: 11, 
                  opacity: 0.8,
                  marginLeft: 24,
                }}>
                  {w.x},{w.y} • {w.width}×{w.height}
                  {"text" in w && w.text && (
                    <div style={{ marginTop: 2, fontStyle: "italic" }}>
                      "{w.text.length > 15 ? w.text.slice(0, 15) + "..." : w.text}"
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
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
          ref={iframeRef}
          src="/lvgl/index.html?w=800&h=600"
          width={800}
          height={600}
          style={{
            border: "2px solid #444",
            pointerEvents: draggingType ? "none" : "auto",
            backgroundColor: "#000",
          }}
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => console.log("Iframe loaded")}
          onError={(e) => console.error("Iframe error:", e)}
        />
      </div>

      {/* Right Sidebar */}
      <div style={{ width: 280, padding: 16, borderLeft: "1px solid #ddd", background: "#fff", overflowY: "auto" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600 }}>Properties</h3>
        {!selectedWidget ? (
          <div style={{ color: "#666", fontSize: 14, textAlign: "center", marginTop: 40 }}>
            Select a widget to edit its properties
          </div>
        ) : (
          <div>
            {/* Widget Type Header */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              marginBottom: 16, 
              padding: 12, 
              background: "#f8f9fa", 
              borderRadius: 8,
              border: "1px solid #e9ecef"
            }}>
              {React.createElement(widgetIcons[selectedWidget.type], { size: 20 })}
              <span style={{ fontSize: 16, fontWeight: 600, textTransform: "capitalize" }}>
                {selectedWidget.type}
              </span>
            </div>

            {/* Position & Size */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#495057" }}>Position & Size</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>X</label>
                  <input
                    type="number"
                    value={selectedWidget.x}
                    onChange={(e) => updateWidget({ x: +e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>Y</label>
                  <input
                    type="number"
                    value={selectedWidget.y}
                    onChange={(e) => updateWidget({ y: +e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>Width</label>
                  <input
                    type="number"
                    value={selectedWidget.width}
                    onChange={(e) => updateWidget({ width: +e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>Height</label>
                  <input
                    type="number"
                    value={selectedWidget.height}
                    onChange={(e) => updateWidget({ height: +e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Widget-specific properties */}
            {(selectedWidget.type === "label" || selectedWidget.type === "button") && "text" in selectedWidget && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#495057" }}>Content</h4>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>Text</label>
                  <input
                    type="text"
                    value={selectedWidget.text}
                    onChange={(e) => updateWidget({ text: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            )}

            {selectedWidget.type === "checkbox" && "text" in selectedWidget && "checked" in selectedWidget && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#495057" }}>Checkbox</h4>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>Label</label>
                  <input
                    type="text"
                    value={selectedWidget.text}
                    onChange={(e) => updateWidget({ text: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={selectedWidget.checked}
                      onChange={(e) => updateWidget({ checked: e.target.checked })}
                    />
                    Checked
                  </label>
                </div>
              </div>
            )}

            {selectedWidget.type === "switch" && "checked" in selectedWidget && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#495057" }}>Switch</h4>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={selectedWidget.checked}
                      onChange={(e) => updateWidget({ checked: e.target.checked })}
                    />
                    On
                  </label>
                </div>
              </div>
            )}

            {selectedWidget.type === "slider" && "min" in selectedWidget && "max" in selectedWidget && "value" in selectedWidget && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#495057" }}>Slider</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>Min</label>
                    <input
                      type="number"
                      value={selectedWidget.min}
                      onChange={(e) => updateWidget({ min: +e.target.value })}
                      style={{ 
                        width: "100%", 
                        padding: 8, 
                        border: "1px solid #ced4da", 
                        borderRadius: 4, 
                        fontSize: 14,
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>Max</label>
                    <input
                      type="number"
                      value={selectedWidget.max}
                      onChange={(e) => updateWidget({ max: +e.target.value })}
                      style={{ 
                        width: "100%", 
                        padding: 8, 
                        border: "1px solid #ced4da", 
                        borderRadius: 4, 
                        fontSize: 14,
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>Value</label>
                  <input
                    type="number"
                    value={selectedWidget.value}
                    onChange={(e) => updateWidget({ value: +e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            )}

            {selectedWidget.type === "textarea" && "placeholder" in selectedWidget && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#495057" }}>Textarea</h4>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>Placeholder</label>
                  <input
                    type="text"
                    value={selectedWidget.placeholder}
                    onChange={(e) => updateWidget({ placeholder: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            )}

            {(selectedWidget.type === "dropdown" || selectedWidget.type === "roller") && "options" in selectedWidget && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#495057" }}>Options</h4>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>
                    Options (one per line)
                  </label>
                  <textarea
                    value={selectedWidget.options}
                    onChange={(e) => updateWidget({ options: e.target.value })}
                    rows={4}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      resize: "vertical"
                    }}
                  />
                </div>
              </div>
            )}

            {(selectedWidget.type === "arc" || selectedWidget.type === "bar") && "value" in selectedWidget && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#495057" }}>Value</h4>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>
                    Value (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedWidget.value}
                    onChange={(e) => updateWidget({ value: +e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            )}

            {selectedWidget.type === "spinner" && "speed" in selectedWidget && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#495057" }}>Animation</h4>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 4 }}>
                    Speed (ms)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    step="100"
                    value={selectedWidget.speed}
                    onChange={(e) => updateWidget({ speed: +e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ced4da", 
                      borderRadius: 4, 
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Delete Button */}
            <button
              onClick={removeSelected}
              style={{
                width: "100%",
                padding: 12,
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                marginTop: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <Trash2 size={16} />
                Delete Widget
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
