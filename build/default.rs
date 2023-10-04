use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    // Js functions
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen(start)]
pub fn main() {
    // Your code here
    log("Hello from Rust!");
}