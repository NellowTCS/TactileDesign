/* tslint:disable */
/* eslint-disable */
export class TactileDesigner {
  free(): void;
  constructor();
  add_widget(widget_type: string, x: number, y: number, width: number, height: number): string;
  get_widget_count(): number;
  get_widget(index: number): Widget | undefined;
  update_widget_position(id: string, x: number, y: number): boolean;
  generate_cpp_code(): string;
}
export class Widget {
  private constructor();
  free(): void;
  readonly id: string;
  readonly widget_type: string;
  x: number;
  y: number;
  readonly width: number;
  readonly height: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_widget_free: (a: number, b: number) => void;
  readonly widget_id: (a: number) => [number, number];
  readonly widget_widget_type: (a: number) => [number, number];
  readonly widget_x: (a: number) => number;
  readonly widget_y: (a: number) => number;
  readonly widget_width: (a: number) => number;
  readonly widget_height: (a: number) => number;
  readonly widget_set_x: (a: number, b: number) => void;
  readonly widget_set_y: (a: number, b: number) => void;
  readonly __wbg_tactiledesigner_free: (a: number, b: number) => void;
  readonly tactiledesigner_new: () => number;
  readonly tactiledesigner_add_widget: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly tactiledesigner_get_widget_count: (a: number) => number;
  readonly tactiledesigner_get_widget: (a: number, b: number) => number;
  readonly tactiledesigner_update_widget_position: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly tactiledesigner_generate_cpp_code: (a: number) => [number, number];
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
