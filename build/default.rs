use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    // Js functions
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn main() -> f64 {
    // Your code here
    log("Hello from Rust!");
    42.0
}
