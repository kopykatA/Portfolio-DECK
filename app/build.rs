fn main() {
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let target_os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    let target_env = std::env::var("CARGO_CFG_TARGET_ENV").unwrap_or_default();
    if target_os != "windows" {
        return;
    }

    if target_env == "gnu" {
        let rc = std::path::Path::new(&manifest_dir).join("src").join("deck.rc");
        let out_dir = std::env::var("OUT_DIR").unwrap();
        let obj = std::path::Path::new(&out_dir).join("deck_res.o");
        println!("cargo:rerun-if-changed={}", rc.display());
        let status = std::process::Command::new("x86_64-w64-mingw32-windres")
            .arg(&rc)
            .arg("-O")
            .arg("coff")
            .arg("-o")
            .arg(&obj)
            .status()
            .expect("failed to run x86_64-w64-mingw32-windres");
        assert!(status.success(), "windres failed");
        println!("cargo:rustc-link-arg-bin=PortfolioDECK={}", obj.display());
    } else {
        let res = std::path::Path::new(&manifest_dir).join("src").join("deck.res");
        println!("cargo:rerun-if-changed={}", res.display());
        println!("cargo:rustc-link-arg-bin=PortfolioDECK={}", res.display());
    }
}
