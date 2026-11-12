fn main() {
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let res = std::path::Path::new(&manifest_dir).join("src").join("deck.res");
    println!("cargo:rerun-if-changed={}", res.display());
    println!("cargo:rustc-link-arg-bin=PortfolioDECK={}", res.display());
}
