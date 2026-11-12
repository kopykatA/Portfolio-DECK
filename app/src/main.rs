use eframe::egui::{self, Align, Color32, FontId, Layout, RichText, Sense, Stroke, Vec2};
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fs;
use std::collections::{BTreeSet, HashMap};
use std::path::PathBuf;
use std::sync::mpsc::{self, Receiver, Sender, TryRecvError};
use std::sync::{Arc, Mutex};
use std::time::Duration;

const BG: Color32 = Color32::from_rgb(11, 17, 27);
const CARD: Color32 = Color32::from_rgb(20, 30, 45);
const CARD_ALT: Color32 = Color32::from_rgb(27, 40, 58);
const LINE: Color32 = Color32::from_rgb(42, 57, 77);
const TEXT: Color32 = Color32::from_rgb(238, 244, 250);
const MUTED: Color32 = Color32::from_rgb(145, 161, 181);
const ACCENT: Color32 = Color32::from_rgb(86, 224, 194);
const GREEN: Color32 = Color32::from_rgb(89, 217, 153);
const RED: Color32 = Color32::from_rgb(255, 117, 132);
const BLUE: Color32 = Color32::from_rgb(115, 167, 255);

#[derive(Clone, Debug, Serialize, Deserialize)]
struct Asset {
    symbol: String,
    name: String,
    category: String,
    units: f64,
    price: f64,
    average_cost: f64,
    daily_change_pct: f64,
    #[serde(default)]
    coingecko_id: String,
    #[serde(default)]
    watchlist: bool,
}

#[derive(Clone, Debug, Deserialize)]
struct CoinGeckoQuote {
    usd: f64,
    #[serde(default)]
    usd_24h_change: Option<f64>,
}

#[derive(Clone, Debug, Deserialize)]
struct CoinGeckoSearchResponse {
    coins: Vec<CoinGeckoCoin>,
}

#[derive(Clone, Debug, Deserialize)]
struct CoinGeckoCoin {
    id: String,
    symbol: String,
    name: String,
    market_cap_rank: Option<u64>,
}

impl Asset {
    fn value(&self) -> f64 {
        self.units * self.price
    }

    fn cost_basis(&self) -> f64 {
        self.units * self.average_cost
    }

    fn profit_loss(&self) -> f64 {
        self.value() - self.cost_basis()
    }

    fn day_change(&self) -> f64 {
        self.value() * self.daily_change_pct / 100.0
    }
}

#[derive(Clone, Default)]
struct AssetForm {
    symbol: String,
    name: String,
    category: String,
    units: String,
    price: String,
    average_cost: String,
    daily_change_pct: String,
    coingecko_id: String,
    watchlist: bool,
}

impl AssetForm {
    fn for_new() -> Self {
        Self {
            category: "Crypto".to_owned(),
            units: "1".to_owned(),
            price: String::new(),
            average_cost: String::new(),
            daily_change_pct: "0".to_owned(),
            ..Self::default()
        }
    }

    fn from_asset(asset: &Asset) -> Self {
        Self {
            symbol: asset.symbol.clone(),
            name: asset.name.clone(),
            category: asset.category.clone(),
            units: asset.units.to_string(),
            price: asset.price.to_string(),
            average_cost: asset.average_cost.to_string(),
            daily_change_pct: asset.daily_change_pct.to_string(),
            coingecko_id: asset.coingecko_id.clone(),
            watchlist: asset.watchlist,
        }
    }

    fn crypto_add_input(&self) -> Result<(String, f64, Option<f64>, bool), String> {
        let query = self.symbol.trim();
        if query.is_empty() {
            return Err("Enter a crypto name or symbol, such as Ethereum or ETH.".to_owned());
        }
        let units = parse_number(&self.units, "Amount held")?;
        if units <= 0.0 {
            return Err("Amount held must be greater than zero.".to_owned());
        }
        let purchase_price = if self.average_cost.trim().is_empty() {
            None
        } else {
            let price = parse_number(&self.average_cost, "Purchase price per unit")?;
            if price < 0.0 {
                return Err("Purchase price cannot be negative.".to_owned());
            }
            Some(price)
        };
        Ok((query.to_owned(), units, purchase_price, self.watchlist))
    }

    fn into_asset(self) -> Result<Asset, String> {
        let symbol = self.symbol.trim().to_uppercase();
        let name = self.name.trim().to_owned();
        let category = self.category.trim().to_owned();
        if symbol.is_empty() || name.is_empty() || category.is_empty() {
            return Err("Enter a symbol, an asset name, and a category.".to_owned());
        }
        let units = parse_number(&self.units, "Units")?;
        let price = parse_number(&self.price, "Current price")?;
        let average_cost = if self.average_cost.trim().is_empty() {
            price
        } else {
            parse_number(&self.average_cost, "Purchase price")?
        };
        let daily_change_pct = if self.daily_change_pct.trim().is_empty() { 0.0 } else { parse_number(&self.daily_change_pct, "Daily change")? };
        let mut coingecko_id = self.coingecko_id.trim().to_ascii_lowercase();
        if !coingecko_id.chars().all(|character| character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-') {
            return Err("CoinGecko ID can contain only letters, numbers, and hyphens.".to_owned());
        }
        if coingecko_id.is_empty() && category.eq_ignore_ascii_case("crypto") {
            coingecko_id = coingecko_id_for_symbol(&symbol).unwrap_or_default().to_owned();
        }
        if units < 0.0 || price < 0.0 || average_cost < 0.0 || daily_change_pct <= -100.0 {
            return Err("Units and prices cannot be negative; daily change must be above -100%.".to_owned());
        }
        Ok(Asset {
            symbol,
            name,
            category,
            units,
            price,
            average_cost,
            daily_change_pct,
            coingecko_id,
            watchlist: self.watchlist,
        })
    }
}

struct PortfolioApp {
    assets: Vec<Asset>,
    price_sender: Sender<Result<HashMap<String, CoinGeckoQuote>, String>>,
    price_receiver: Receiver<Result<HashMap<String, CoinGeckoQuote>, String>>,
    refreshing_prices: bool,
    add_sender: Sender<Result<Asset, String>>,
    add_receiver: Receiver<Result<Asset, String>>,
    adding_crypto: bool,
    query: String,
    form: AssetForm,
    form_open: bool,
    edit_index: Option<usize>,
    status: String,
    screenshot_path: Option<PathBuf>,
    screenshot_frames: u32,
    screenshot_result: Arc<Mutex<Option<Result<(), String>>>>,
}

impl PortfolioApp {
    fn new(
        cc: &eframe::CreationContext<'_>,
        screenshot_path: Option<PathBuf>,
        screenshot_result: Arc<Mutex<Option<Result<(), String>>>>,
    ) -> Self {
        let mut visuals = egui::Visuals::dark();
        visuals.panel_fill = BG;
        visuals.window_fill = CARD;
        visuals.widgets.noninteractive.bg_fill = CARD;
        visuals.widgets.noninteractive.fg_stroke = Stroke::new(1.0, TEXT);
        visuals.widgets.inactive.bg_fill = CARD_ALT;
        visuals.widgets.inactive.fg_stroke = Stroke::new(1.0, TEXT);
        visuals.widgets.hovered.bg_fill = Color32::from_rgb(43, 52, 63);
        visuals.widgets.hovered.fg_stroke = Stroke::new(1.0, TEXT);
        visuals.widgets.active.bg_fill = ACCENT;
        visuals.widgets.active.fg_stroke = Stroke::new(1.0, BG);
        visuals.selection.bg_fill = ACCENT;
        visuals.selection.stroke = Stroke::new(1.0, BG);
        cc.egui_ctx.set_visuals(visuals);

        let (assets, load_note) = load_assets();
        let (price_sender, price_receiver) = mpsc::channel();
        let (add_sender, add_receiver) = mpsc::channel();
        let mut app = Self {
            assets,
            price_sender,
            price_receiver,
            refreshing_prices: false,
            add_sender,
            add_receiver,
            adding_crypto: false,
            query: String::new(),
            form: AssetForm::for_new(),
            form_open: false,
            edit_index: None,
            status: load_note.unwrap_or_else(|| "Saved on this computer".to_owned()),
            screenshot_path,
            screenshot_frames: 0,
            screenshot_result,
        };
        if !crypto_price_ids(&app.assets).is_empty() {
            app.start_price_refresh();
        }
        app
    }

    fn open_new_asset(&mut self) {
        self.form = AssetForm::for_new();
        self.edit_index = None;
        self.form_open = true;
    }

    fn open_edit_asset(&mut self, index: usize) {
        if let Some(asset) = self.assets.get(index) {
            self.form = AssetForm::from_asset(asset);
            self.edit_index = Some(index);
            self.form_open = true;
        }
    }

    fn commit_form(&mut self) {
        if self.edit_index.is_none() && self.form.category.eq_ignore_ascii_case("crypto") {
            self.start_crypto_add();
            return;
        }
        match self.form.clone().into_asset() {
            Ok(asset) => {
                if let Some(index) = self.edit_index.take() {
                    if let Some(existing) = self.assets.get_mut(index) {
                        *existing = asset;
                        self.status = "Asset updated".to_owned();
                    } else {
                        self.status = "That asset is no longer available.".to_owned();
                        self.form_open = false;
                        return;
                    }
                } else {
                    self.assets.push(asset);
                    self.status = "Asset added to your portfolio".to_owned();
                }
                self.form_open = false;
                self.persist();
            }
            Err(error) => {
                self.status = error;
            }
        }
    }

    fn start_crypto_add(&mut self) {
        let (query, units, purchase_price, watchlist) = match self.form.crypto_add_input() {
            Ok(input) => input,
            Err(error) => {
                self.status = error;
                return;
            }
        };
        self.adding_crypto = true;
        self.status = format!("Finding {} on CoinGecko and fetching its live price...", query);
        let sender = self.add_sender.clone();
        std::thread::spawn(move || {
            let _ = sender.send(resolve_crypto_asset(&query, units, purchase_price, watchlist));
        });
    }

    fn apply_crypto_add(&mut self) {
        match self.add_receiver.try_recv() {
            Ok(Ok(asset)) => {
                self.adding_crypto = false;
                let label = format!("{} ({}) added from CoinGecko", asset.name, asset.symbol);
                self.assets.push(asset);
                self.form_open = false;
                self.persist();
                if !self.status.starts_with("Could not save portfolio:") {
                    self.status = label;
                }
            }
            Ok(Err(error)) => {
                self.adding_crypto = false;
                self.status = format!("Could not add crypto: {error}");
            }
            Err(TryRecvError::Empty) => {}
            Err(TryRecvError::Disconnected) => {
                self.adding_crypto = false;
                self.status = "Crypto lookup stopped before it could return results.".to_owned();
            }
        }
    }

    fn persist(&mut self) {
        match serde_json::to_vec_pretty(&self.assets)
            .map_err(|error| error.to_string())
            .and_then(|bytes| fs::write("northstar-portfolio.json", bytes).map_err(|error| error.to_string()))
        {
            Ok(()) => self.status = "Saved on this computer".to_owned(),
            Err(error) => self.status = format!("Could not save portfolio: {error}"),
        }
    }

    fn export_csv(&mut self) {
        let csv = export_assets_csv(&self.assets);
        match fs::write("northstar-portfolio-export.csv", csv) {
            Ok(()) => {
                self.status = format!("Exported {} assets to northstar-portfolio-export.csv", self.assets.len());
            }
            Err(error) => self.status = format!("Could not export portfolio: {error}"),
        }
    }

    fn start_price_refresh(&mut self) {
        if self.refreshing_prices {
            return;
        }
        let ids = crypto_price_ids(&self.assets);
        if ids.is_empty() {
            self.status = "No crypto assets have a CoinGecko ID. Add one in the asset editor.".to_owned();
            return;
        }
        self.refreshing_prices = true;
        self.status = format!("Fetching live prices for {} crypto assets from CoinGecko...", ids.len());
        let sender = self.price_sender.clone();
        std::thread::spawn(move || {
            let _ = sender.send(fetch_coingecko_prices(&ids));
        });
    }

    fn apply_price_updates(&mut self) {
        match self.price_receiver.try_recv() {
            Ok(Ok(quotes)) => {
                self.refreshing_prices = false;
                let requested: BTreeSet<_> = self.assets.iter()
                    .filter(|asset| asset.category.eq_ignore_ascii_case("crypto") && !asset.coingecko_id.is_empty())
                    .map(|asset| asset.coingecko_id.clone())
                    .collect();
                let missing = requested.iter().filter(|id| !quotes.contains_key(*id)).count();
                let mut updated = 0;
                for asset in &mut self.assets {
                    if asset.category.eq_ignore_ascii_case("crypto") {
                        if let Some(quote) = quotes.get(&asset.coingecko_id) {
                            asset.price = quote.usd;
                            if let Some(change) = quote.usd_24h_change.filter(|value| value.is_finite() && *value > -100.0) {
                                asset.daily_change_pct = change;
                            }
                            updated += 1;
                        }
                    }
                }
                self.persist();
                if !self.status.starts_with("Could not save portfolio:") {
                    self.status = if missing == 0 {
                        format!("Updated {updated} crypto assets from CoinGecko (USD)")
                    } else {
                        format!("Updated {updated} crypto assets; {missing} CoinGecko ID(s) returned no price")
                    };
                }
            }
            Ok(Err(error)) => {
                self.refreshing_prices = false;
                self.status = format!("Could not refresh CoinGecko prices: {error}");
            }
            Err(TryRecvError::Empty) => {}
            Err(TryRecvError::Disconnected) => {
                self.refreshing_prices = false;
                self.status = "Price refresh stopped before it could return results.".to_owned();
            }
        }
    }

    fn filtered_indices(&self) -> Vec<usize> {
        let query = self.query.trim().to_lowercase();
        self.assets
            .iter()
            .enumerate()
            .filter(|(_, asset)| {
                query.is_empty()
                    || asset.symbol.to_lowercase().contains(&query)
                    || asset.name.to_lowercase().contains(&query)
                    || asset.category.to_lowercase().contains(&query)
            })
            .map(|(index, _)| index)
            .collect()
    }

    fn totals(&self) -> (f64, f64, f64, f64) {
        let value: f64 = self.assets.iter().map(Asset::value).sum();
        let cost: f64 = self.assets.iter().map(Asset::cost_basis).sum();
        let day_change: f64 = self.assets.iter().map(Asset::day_change).sum();
        let day_percent = if value.abs() > f64::EPSILON {
            day_change / value * 100.0
        } else {
            0.0
        };
        (value, cost, value - cost, day_percent)
    }

    fn topbar(&mut self, ui: &mut egui::Ui) {
        ui.horizontal(|ui| {
            ui.vertical(|ui| {
                ui.label(RichText::new("PORTFOLIO DESK").size(24.0).strong().color(TEXT));
                ui.label(RichText::new("Your assets, value, and allocation at a glance").size(11.0).color(MUTED));
            });
            ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                let add = ui.add_sized(
                    [132.0, 40.0],
                    egui::Button::new(RichText::new("+  Add asset").size(13.0).strong().color(BG))
                        .fill(ACCENT)
                        .corner_radius(egui::CornerRadius::same(10)),
                );
                if add.clicked() {
                    self.open_new_asset();
                }
                let refresh = ui.add_enabled(
                    !self.refreshing_prices,
                    egui::Button::new(if self.refreshing_prices { "Refreshing..." } else { "Refresh prices" })
                        .min_size(Vec2::new(122.0, 40.0))
                        .fill(CARD_ALT)
                        .corner_radius(egui::CornerRadius::same(10)),
                );
                if refresh.clicked() {
                    self.start_price_refresh();
                }
                let export = ui.add_sized(
                    [118.0, 40.0],
                    egui::Button::new(RichText::new("Export CSV").size(12.0).color(TEXT))
                        .fill(CARD_ALT)
                        .corner_radius(egui::CornerRadius::same(10)),
                );
                if export.clicked() {
                    self.export_csv();
                }
                let search = ui.add_sized(
                    [190.0, 38.0],
                    egui::TextEdit::singleline(&mut self.query)
                        .hint_text("Search assets")
                        .margin(egui::vec2(12.0, 8.0)),
                );
                search.on_hover_text("Search by name, symbol, or category");
                ui.label(RichText::new("LIVE CRYPTO").size(9.0).strong().color(ACCENT));
            });
        });
    }

    fn overview(&mut self, ui: &mut egui::Ui) {
        let (total, _, _, day_pct) = self.totals();
        let day_value: f64 = self.assets.iter().map(Asset::day_change).sum();
        ui.add_space(18.0);
        egui::Frame::new()
            .fill(CARD)
            .stroke(Stroke::new(1.0, LINE))
            .corner_radius(egui::CornerRadius::same(20))
            .inner_margin(egui::Margin::symmetric(28, 24))
            .show(ui, |ui| {
                ui.set_min_width(ui.available_width());
                ui.horizontal(|ui| {
                    ui.vertical(|ui| {
                        ui.label(RichText::new("PORTFOLIO VALUE").size(12.0).strong().color(MUTED));
                        ui.add_space(5.0);
                        ui.label(RichText::new(format_money(total)).size(42.0).strong().color(TEXT));
                        ui.add_space(8.0);
                        ui.horizontal(|ui| {
                            ui.label(RichText::new("TODAY'S CHANGE").size(11.0).strong().color(MUTED));
                            ui.label(RichText::new(format!("{}  ({})", format_signed_money(day_value), format_signed_percent(day_pct)))
                                .size(18.0).strong().color(if day_value >= 0.0 { GREEN } else { RED }));
                        });
                    });
                    ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                        ui.label(RichText::new(format!("{} ASSETS", self.assets.len())).size(12.0).strong().color(ACCENT));
                    });
                });
            });
        ui.add_space(18.0);
        self.asset_table(ui);
        ui.add_space(18.0);
        self.allocation_chart(ui, total);
    }

    fn allocation_chart(&self, ui: &mut egui::Ui, total: f64) {
        egui::Frame::new()
            .fill(CARD)
            .stroke(Stroke::new(1.0, LINE))
            .corner_radius(egui::CornerRadius::same(18))
            .inner_margin(egui::Margin::symmetric(22, 18))
            .show(ui, |ui| {
                ui.label(RichText::new("Portfolio allocation").size(17.0).strong().color(TEXT));
                ui.label(RichText::new("How each asset contributes to your portfolio").size(11.0).color(MUTED));
                ui.add_space(12.0);
                if total <= 0.0 || self.assets.is_empty() {
                    ui.label(RichText::new("Add an asset to see your portfolio mix.").color(MUTED));
                    return;
                }
                let mut ordered: Vec<_> = self.assets.iter().filter(|asset| asset.value() > 0.0).collect();
                ordered.sort_by(|a, b| b.value().total_cmp(&a.value()));
                if ordered.is_empty() {
                    ui.label(RichText::new("Assets with a positive value will appear here.").color(MUTED));
                    return;
                }
                let display_count = ordered.len().min(6);
                let mut slices: Vec<(String, f64, Color32)> = ordered.iter().take(display_count)
                    .enumerate()
                    .map(|(index, asset)| (asset.symbol.clone(), asset.value(), allocation_color(index)))
                    .collect();
                if ordered.len() > display_count {
                    let other_value: f64 = ordered.iter().skip(display_count).map(|asset| asset.value()).sum();
                    slices.push(("Other assets".to_owned(), other_value, allocation_color(display_count)));
                }
                ui.horizontal(|ui| {
                    draw_pie_chart(ui, &slices, total);
                    ui.add_space(18.0);
                    egui::ScrollArea::vertical().max_height(230.0).show(ui, |ui| {
                        for (symbol, value, color) in &slices {
                            ui.horizontal(|ui| {
                                let (swatch, _) = ui.allocate_exact_size(Vec2::splat(13.0), Sense::hover());
                                ui.painter().circle_filled(swatch.center(), 6.0, *color);
                                ui.add_sized([150.0, 25.0], egui::Label::new(RichText::new(symbol).size(14.0).strong().color(TEXT)));
                                ui.add_sized([86.0, 25.0], egui::Label::new(RichText::new(format!("{:.1}%", value / total * 100.0)).size(13.0).color(MUTED)));
                                ui.label(RichText::new(format_money(*value)).size(13.0).strong().color(TEXT));
                            });
                        }
                    });
                });
            });
    }

    fn asset_table(&mut self, ui: &mut egui::Ui) {
        egui::Frame::new()
            .fill(CARD)
            .stroke(Stroke::new(1.0, LINE))
            .corner_radius(egui::CornerRadius::same(16))
            .inner_margin(18.0)
            .show(ui, |ui| {
                ui.horizontal(|ui| {
                    ui.vertical(|ui| {
                        ui.label(RichText::new("Your assets").size(17.0).strong().color(TEXT));
                        ui.label(RichText::new("Crypto via CoinGecko; other prices are editable").size(11.0).color(MUTED));
                    });
                    ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                        ui.label(RichText::new(format!("{} tracked", self.assets.len())).size(11.0).color(MUTED));
                    });
                });
                ui.add_space(13.0);
                ui.separator();
                ui.add_space(5.0);
                let mut indices = self.filtered_indices();
                indices.sort_by(|a, b| self.assets[*b].value().total_cmp(&self.assets[*a].value()));
                if indices.is_empty() {
                    ui.add_space(18.0);
                    ui.vertical_centered(|ui| {
                        ui.label(RichText::new("Nothing here yet").size(14.0).strong().color(TEXT));
                        ui.label(RichText::new("Add an asset or adjust your search to get started.").size(11.0).color(MUTED));
                    });
                    ui.add_space(18.0);
                } else {
                    for index in indices {
                        self.asset_row(ui, index);
                    }
                }
            });
    }

    fn asset_row(&mut self, ui: &mut egui::Ui, index: usize) {
        let Some(asset) = self.assets.get(index).cloned() else { return };
        let value = asset.value();
        let profit = asset.profit_loss();
        egui::Frame::new()
            .fill(CARD_ALT)
            .corner_radius(egui::CornerRadius::same(13))
            .inner_margin(egui::Margin::symmetric(14, 11))
            .show(ui, |ui| {
                ui.horizontal(|ui| {
                    ui.allocate_ui_with_layout(Vec2::new(270.0, 48.0), Layout::left_to_right(Align::Center), |ui| {
                        let (icon, _) = ui.allocate_exact_size(Vec2::splat(38.0), Sense::hover());
                        ui.painter().circle_filled(icon.center(), 19.0, symbol_color(&asset.symbol));
                        ui.painter().text(icon.center(), egui::Align2::CENTER_CENTER, asset.symbol.chars().next().unwrap_or('?').to_string(), FontId::proportional(15.0), BG);
                        ui.add_space(12.0);
                        ui.vertical(|ui| {
                            ui.label(RichText::new(&asset.name).size(16.0).strong().color(TEXT));
                            ui.label(RichText::new(format!("{}  /  {}", asset.symbol, asset.category)).size(12.0).color(MUTED));
                        });
                    });
                    ui.add_sized([95.0, 44.0], egui::Label::new(RichText::new(format!("{} units", format_units(asset.units))).size(13.0).color(TEXT)));
                    ui.add_sized([128.0, 44.0], egui::Label::new(RichText::new(format!("{} each", format_money(asset.price))).size(13.0).color(TEXT)));
                    ui.add_sized([155.0, 44.0], egui::Label::new(RichText::new(format_money(value)).size(17.0).strong().color(TEXT)));
                    ui.add_sized([135.0, 44.0], egui::Label::new(RichText::new(format_signed_money(profit)).size(14.0).strong().color(if profit >= 0.0 { GREEN } else { RED })));
                    if ui.button("Edit").clicked() {
                        self.open_edit_asset(index);
                    }
                    if ui.button("Remove").clicked() {
                        self.assets.remove(index);
                        self.persist();
                    }
                });
            });
        ui.add_space(7.0);
    }

    fn asset_form(&mut self, ctx: &egui::Context) {
        if !self.form_open {
            return;
        }
        let title = if self.edit_index.is_some() { "Edit asset" } else { "Add an asset" };
        egui::Window::new(title)
            .collapsible(false)
            .resizable(false)
            .anchor(egui::Align2::CENTER_CENTER, Vec2::ZERO)
            .show(ctx, |ui| {
                ui.set_min_width(420.0);
                ui.label(RichText::new("Track your holdings with live crypto prices.").size(11.0).color(MUTED));
                ui.add_space(12.0);
                ui.horizontal(|ui| {
                    ui.add_sized([145.0, 29.0], egui::Label::new(RichText::new("Asset type").size(10.0).color(MUTED)));
                    egui::ComboBox::from_id_salt("asset-category")
                        .selected_text(&self.form.category)
                        .width(220.0)
                        .show_ui(ui, |ui| {
                            for category in ["Crypto", "Equity", "Fund", "Commodity", "Other"] {
                                ui.selectable_value(&mut self.form.category, category.to_owned(), category);
                            }
                        });
                });
                let is_crypto = self.form.category.eq_ignore_ascii_case("crypto");
                form_field(ui, if is_crypto { "Symbol or name" } else { "Symbol" }, &mut self.form.symbol, if is_crypto { "ETH or Ethereum" } else { "e.g. ACME" });
                if is_crypto {
                    if self.edit_index.is_some() {
                        form_field(ui, "Asset name", &mut self.form.name, "Ethereum");
                    } else {
                        ui.label(RichText::new("CoinGecko will identify it and fill in the live USD price.").size(10.0).color(MUTED));
                    }
                    form_field(ui, "Amount held", &mut self.form.units, "e.g. 0.5");
                    form_field(ui, "Purchase price / unit (optional)", &mut self.form.average_cost, "blank uses current price");
                    if self.edit_index.is_some() {
                        form_field(ui, "Current price (USD)", &mut self.form.price, "latest quote");
                        form_field(ui, "Today's change (%)", &mut self.form.daily_change_pct, "0");
                    }
                } else {
                    form_field(ui, "Asset name", &mut self.form.name, "e.g. Acme Industries");
                    form_field(ui, "Units", &mut self.form.units, "1");
                    form_field(ui, "Current price (USD)", &mut self.form.price, "100");
                    form_field(ui, "Purchase price / unit (optional)", &mut self.form.average_cost, "blank uses current price");
                    form_field(ui, "Today's change (%)", &mut self.form.daily_change_pct, "0");
                }
                ui.checkbox(&mut self.form.watchlist, "Include in watchlist");
                if self.adding_crypto || self.status.starts_with("Could not add crypto:") || self.status.starts_with("Enter a crypto") || self.status.starts_with("Amount held") || self.status.starts_with("Purchase price") {
                    ui.label(RichText::new(&self.status).size(10.0).color(if self.adding_crypto { ACCENT } else { RED }));
                }
                ui.add_space(10.0);
                ui.horizontal(|ui| {
                    if ui.button("Cancel").clicked() && !self.adding_crypto {
                        self.form_open = false;
                    }
                    let save_label = if self.adding_crypto { "Finding crypto..." } else if is_crypto && self.edit_index.is_none() { "Find & add crypto" } else { "Save asset" };
                    if ui.add_enabled(!self.adding_crypto, egui::Button::new(RichText::new(save_label).strong().color(BG)).fill(ACCENT)).clicked() {
                        self.commit_form();
                    }
                });
            });
    }

    fn screenshot_tick(&mut self, ctx: &egui::Context) {
        if self.screenshot_path.is_none() {
            return;
        }
        let image = ctx.input(|input| {
            input.raw.events.iter().find_map(|event| match event {
                egui::Event::Screenshot { image, .. } => Some(image.clone()),
                _ => None,
            })
        });
        if let Some(image) = image {
            let result = write_screenshot(self.screenshot_path.as_ref().expect("screenshot path"), &image);
            if let Ok(mut state) = self.screenshot_result.lock() {
                *state = Some(result);
            }
            ctx.send_viewport_cmd(egui::ViewportCommand::Close);
            return;
        }
        self.screenshot_frames += 1;
        if self.screenshot_frames >= 120 {
            ctx.send_viewport_cmd(egui::ViewportCommand::Screenshot(egui::UserData::default()));
        }
        ctx.request_repaint_after(Duration::from_millis(16));
    }
}

impl eframe::App for PortfolioApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        self.apply_price_updates();
        self.apply_crypto_add();
        if self.refreshing_prices || self.adding_crypto {
            ctx.request_repaint_after(Duration::from_millis(100));
        }
        self.screenshot_tick(ctx);
        egui::CentralPanel::default()
            .frame(egui::Frame::new().fill(BG).inner_margin(egui::Margin::same(28)))
            .show(ctx, |ui| {
                self.topbar(ui);
                ui.add_space(15.0);
                ui.separator();
                egui::ScrollArea::vertical().auto_shrink([false, false]).show(ui, |ui| {
                    self.overview(ui);
                    ui.add_space(12.0);
                    ui.label(RichText::new(&self.status).size(10.0).color(MUTED));
                });
            });
        self.asset_form(ctx);
    }
}

fn form_field(ui: &mut egui::Ui, label: &str, value: &mut String, hint: &str) {
    ui.horizontal(|ui| {
        ui.add_sized([145.0, 29.0], egui::Label::new(RichText::new(label).size(10.0).color(MUTED)));
        ui.add_sized([220.0, 29.0], egui::TextEdit::singleline(value).hint_text(hint));
    });
}

fn allocation_color(index: usize) -> Color32 {
    [ACCENT, BLUE, GREEN, RED, Color32::from_rgb(223, 163, 255), Color32::from_rgb(255, 190, 105), Color32::from_rgb(103, 207, 226)][index % 7]
}

fn draw_pie_chart(ui: &mut egui::Ui, slices: &[(String, f64, Color32)], total: f64) {
    let (rect, _) = ui.allocate_exact_size(Vec2::splat(220.0), Sense::hover());
    let center = rect.center();
    let radius = 96.0;
    let painter = ui.painter();
    let mut start = -std::f32::consts::FRAC_PI_2;
    for (_, value, color) in slices {
        let fraction = (*value / total).clamp(0.0, 1.0) as f32;
        let end = start + std::f32::consts::TAU * fraction;
        let steps = ((fraction * 96.0).ceil() as usize).max(2);
        let mut points = Vec::with_capacity(steps + 2);
        points.push(center);
        for step in 0..=steps {
            let angle = start + (end - start) * step as f32 / steps as f32;
            points.push(center + Vec2::new(angle.cos(), angle.sin()) * radius);
        }
        painter.add(egui::Shape::convex_polygon(points, *color, Stroke::new(1.0, BG)));
        start = end;
    }
}

fn parse_number(value: &str, label: &str) -> Result<f64, String> {
    let parsed = value
        .trim()
        .parse::<f64>()
        .map_err(|_| format!("{label} must be a number."))?;
    if !parsed.is_finite() {
        return Err(format!("{label} must be a finite number."));
    }
    Ok(parsed)
}

fn resolve_crypto_asset(query: &str, units: f64, purchase_price: Option<f64>, watchlist: bool) -> Result<Asset, String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(20))
        .user_agent("NorthstarPortfolio/0.1")
        .build()
        .map_err(|error| error.to_string())?;
    let response: CoinGeckoSearchResponse = client
        .get("https://api.coingecko.com/api/v3/search")
        .query(&[("query", query)])
        .send()
        .map_err(|error| error.to_string())?
        .error_for_status()
        .map_err(|error| error.to_string())?
        .json()
        .map_err(|error| error.to_string())?;
    let normalized = query.trim();
    let mut matches: Vec<_> = response.coins.into_iter()
        .filter(|coin| coin.symbol.eq_ignore_ascii_case(normalized) || coin.name.eq_ignore_ascii_case(normalized))
        .collect();
    matches.sort_by_key(|coin| {
        (
            if coin.symbol.eq_ignore_ascii_case(normalized) { 0 } else { 1 },
            coin.market_cap_rank.unwrap_or(u64::MAX),
        )
    });
    let coin = matches.into_iter().next().ok_or_else(|| {
        format!("no crypto exactly matching '{normalized}' was found. Try its ticker (ETH) or full name (Ethereum).")
    })?;
    let quotes = fetch_coingecko_prices(std::slice::from_ref(&coin.id))?;
    let quote = quotes.get(&coin.id).ok_or_else(|| format!("CoinGecko has no current USD quote for {}.", coin.name))?;
    Ok(Asset {
        symbol: coin.symbol.to_ascii_uppercase(),
        name: coin.name,
        category: "Crypto".to_owned(),
        units,
        price: quote.usd,
        average_cost: purchase_price.unwrap_or(quote.usd),
        daily_change_pct: quote.usd_24h_change.filter(|change| change.is_finite() && *change > -100.0).unwrap_or(0.0),
        coingecko_id: coin.id,
        watchlist,
    })
}

fn crypto_price_ids(assets: &[Asset]) -> Vec<String> {
    assets.iter()
        .filter(|asset| asset.category.eq_ignore_ascii_case("crypto") && !asset.coingecko_id.is_empty())
        .map(|asset| asset.coingecko_id.clone())
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect()
}

fn fetch_coingecko_prices(ids: &[String]) -> Result<HashMap<String, CoinGeckoQuote>, String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(20))
        .user_agent("NorthstarPortfolio/0.1")
        .build()
        .map_err(|error| error.to_string())?;
    let response: HashMap<String, CoinGeckoQuote> = client
        .get("https://api.coingecko.com/api/v3/simple/price")
        .query(&[("ids", ids.join(",")), ("vs_currencies", "usd".to_owned()), ("include_24hr_change", "true".to_owned())])
        .send()
        .map_err(|error| error.to_string())?
        .error_for_status()
        .map_err(|error| error.to_string())?
        .json()
        .map_err(|error| error.to_string())?;
    if response.is_empty() {
        return Err("No quotes were returned. Check the CoinGecko IDs and try again.".to_owned());
    }
    if response.values().any(|quote| !quote.usd.is_finite() || quote.usd < 0.0) {
        return Err("CoinGecko returned an invalid USD price.".to_owned());
    }
    Ok(response)
}

fn coingecko_id_for_symbol(symbol: &str) -> Option<&'static str> {
    match symbol {
        "BTC" => Some("bitcoin"),
        "ETH" => Some("ethereum"),
        "SOL" => Some("solana"),
        "ADA" => Some("cardano"),
        "XRP" => Some("ripple"),
        "DOGE" => Some("dogecoin"),
        "BNB" => Some("binancecoin"),
        "USDC" => Some("usd-coin"),
        "USDT" => Some("tether"),
        "AVAX" => Some("avalanche-2"),
        "DOT" => Some("polkadot"),
        "LINK" => Some("chainlink"),
        "LTC" => Some("litecoin"),
        "BCH" => Some("bitcoin-cash"),
        "XLM" => Some("stellar"),
        "TRX" => Some("tron"),
        "SHIB" => Some("shiba-inu"),
        "TON" => Some("the-open-network"),
        "SUI" => Some("sui"),
        "NEAR" => Some("near"),
        "APT" => Some("aptos"),
        "UNI" => Some("uniswap"),
        "ICP" => Some("internet-computer"),
        "FIL" => Some("filecoin"),
        "ATOM" => Some("cosmos"),
        "ALGO" => Some("algorand"),
        "ETC" => Some("ethereum-classic"),
        "AAVE" => Some("aave"),
        "PEPE" => Some("pepe"),
        _ => None,
    }
}

fn load_assets() -> (Vec<Asset>, Option<String>) {
    match fs::read("northstar-portfolio.json") {
        Ok(bytes) => match serde_json::from_slice::<Vec<Asset>>(&bytes) {
            Ok(mut assets) => {
                for asset in &mut assets {
                    if asset.coingecko_id.is_empty() && asset.category.eq_ignore_ascii_case("crypto") {
                        asset.coingecko_id = coingecko_id_for_symbol(&asset.symbol).unwrap_or_default().to_owned();
                    }
                }
                (assets, None)
            }
            Err(error) => (
                demo_assets(),
                Some(format!("Could not read saved portfolio: {error}. Showing demo assets.")),
            ),
        },
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => (demo_assets(), None),
        Err(error) => (
            demo_assets(),
            Some(format!("Could not open saved portfolio: {error}. Showing demo assets.")),
        ),
    }
}

fn demo_assets() -> Vec<Asset> {
    vec![
        Asset { symbol: "BTC".to_owned(), name: "Bitcoin".to_owned(), category: "Crypto".to_owned(), units: 0.72, price: 68450.0, average_cost: 58200.0, daily_change_pct: 2.4, coingecko_id: "bitcoin".to_owned(), watchlist: true },
        Asset { symbol: "WIDE".to_owned(), name: "Global Equity Fund".to_owned(), category: "Fund".to_owned(), units: 18.5, price: 102.8, average_cost: 95.5, daily_change_pct: 0.7, coingecko_id: String::new(), watchlist: false },
        Asset { symbol: "GOLD".to_owned(), name: "Gold Reserve".to_owned(), category: "Commodity".to_owned(), units: 6.4, price: 221.65, average_cost: 214.1, daily_change_pct: -0.3, coingecko_id: String::new(), watchlist: true },
    ]
}

fn csv_cell(value: &str) -> String {
    format!("\"{}\"", value.replace('"', "\"\""))
}

fn export_assets_csv(assets: &[Asset]) -> String {
    let mut csv = String::from("symbol,name,category,units,current_price_usd,average_cost_usd,daily_change_pct,market_value_usd,cost_basis_usd,unrealized_pl_usd,watchlist\n");
    for asset in assets {
        csv.push_str(&format!(
            "{},{},{},{},{},{},{},{},{},{},{}\n",
            csv_cell(&asset.symbol),
            csv_cell(&asset.name),
            csv_cell(&asset.category),
            asset.units,
            asset.price,
            asset.average_cost,
            asset.daily_change_pct,
            asset.value(),
            asset.cost_basis(),
            asset.profit_loss(),
            asset.watchlist,
        ));
    }
    csv
}

fn format_money(value: f64) -> String {
    let sign = if value < 0.0 { "-" } else { "" };
    let value = value.abs();
    let raw = format!("{value:.2}");
    let (whole, decimal) = raw.split_once('.').unwrap_or((&raw, "00"));
    let grouped = whole
        .chars()
        .rev()
        .enumerate()
        .fold(String::new(), |mut output, (index, character)| {
            if index > 0 && index % 3 == 0 {
                output.push(',');
            }
            output.push(character);
            output
        })
        .chars()
        .rev()
        .collect::<String>();
    format!("{sign}${grouped}.{decimal}")
}

fn format_signed_money(value: f64) -> String {
    if value > 0.0 {
        format!("+{}", format_money(value))
    } else {
        format_money(value)
    }
}

fn format_signed_percent(value: f64) -> String {
    if value > 0.0 {
        format!("+{value:.2}%")
    } else {
        format!("{value:.2}%")
    }
}

fn format_units(value: f64) -> String {
    let formatted = format!("{value:.4}");
    formatted.trim_end_matches('0').trim_end_matches('.').to_owned()
}

fn symbol_color(symbol: &str) -> Color32 {
    match symbol.bytes().fold(0u8, |sum, byte| sum.wrapping_add(byte)) % 4 {
        0 => ACCENT,
        1 => BLUE,
        2 => GREEN,
        _ => Color32::from_rgb(223, 163, 255),
    }
}

fn write_screenshot(path: &PathBuf, image: &egui::ColorImage) -> Result<(), String> {
    if let Some(parent) = path.parent().filter(|parent| !parent.as_os_str().is_empty()) {
        fs::create_dir_all(parent).map_err(|error| format!("Could not create screenshot folder: {error}"))?;
    }
    let mut rgba = Vec::with_capacity(image.pixels.len() * 4);
    for pixel in &image.pixels {
        rgba.extend_from_slice(&pixel.to_array());
    }
    image::save_buffer_with_format(
        path,
        &rgba,
        image.size[0] as u32,
        image.size[1] as u32,
        image::ColorType::Rgba8,
        image::ImageFormat::Png,
    )
    .map_err(|error| format!("Could not save screenshot: {error}"))
}

fn screenshot_argument() -> Result<Option<PathBuf>, String> {
    let mut args = std::env::args().skip(1);
    let mut output = None;
    while let Some(argument) = args.next() {
        if argument == "--screenshot" {
            let path = args.next().ok_or_else(|| "--screenshot needs a PNG path".to_owned())?;
            if output.replace(PathBuf::from(path)).is_some() {
                return Err("--screenshot may be supplied only once".to_owned());
            }
        } else {
            return Err(format!("Unknown argument: {argument}"));
        }
    }
    Ok(output)
}

fn main() -> Result<(), Box<dyn Error>> {
    let screenshot_path = match screenshot_argument() {
        Ok(path) => path,
        Err(error) => {
            eprintln!("{error}");
            std::process::exit(2);
        }
    };
    let screenshot_mode = screenshot_path.is_some();
    let completion = Arc::new(Mutex::new(None));
    let app_completion = Arc::clone(&completion);
    let viewport = egui::ViewportBuilder::default()
        .with_inner_size([1360.0, 900.0])
        .with_min_inner_size([1050.0, 700.0])
        .with_title("PORTFOLIO DESK")
        .with_active(!screenshot_mode)
        .with_window_level(if screenshot_mode {
            egui::WindowLevel::AlwaysOnBottom
        } else {
            egui::WindowLevel::Normal
        });
    let options = eframe::NativeOptions { viewport, ..Default::default() };
    eframe::run_native(
        "PORTFOLIO DESK",
        options,
        Box::new(move |cc| Ok(Box::new(PortfolioApp::new(cc, screenshot_path, app_completion)))),
    )?;
    if screenshot_mode {
        match completion.lock() {
            Ok(state) => match state.as_ref() {
                Some(Ok(())) => {}
                Some(Err(error)) => return Err(error.clone().into()),
                None => return Err("The screenshot window closed before a picture was saved.".into()),
            },
            Err(error) => return Err(format!("Screenshot status lock failed: {error}").into()),
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{crypto_price_ids, Asset, AssetForm};

    #[test]
    fn startup_refresh_targets_unique_crypto_ids_only() {
        let assets = vec![
            Asset { symbol: "BTC".into(), name: "Bitcoin".into(), category: "Crypto".into(), units: 1.0, price: 1.0, average_cost: 1.0, daily_change_pct: 0.0, coingecko_id: "bitcoin".into(), watchlist: false },
            Asset { symbol: "BTC2".into(), name: "Bitcoin copy".into(), category: "crypto".into(), units: 1.0, price: 1.0, average_cost: 1.0, daily_change_pct: 0.0, coingecko_id: "bitcoin".into(), watchlist: false },
            Asset { symbol: "TEST".into(), name: "No ID".into(), category: "Crypto".into(), units: 1.0, price: 1.0, average_cost: 1.0, daily_change_pct: 0.0, coingecko_id: String::new(), watchlist: false },
            Asset { symbol: "FUND".into(), name: "Fund".into(), category: "Fund".into(), units: 1.0, price: 1.0, average_cost: 1.0, daily_change_pct: 0.0, coingecko_id: "not-crypto".into(), watchlist: false },
        ];

        assert_eq!(crypto_price_ids(&assets), vec!["bitcoin"]);
    }

    #[test]
    fn crypto_add_accepts_purchase_price_without_current_price() {
        let form = AssetForm {
            category: "Crypto".to_owned(),
            symbol: "Ethereum".to_owned(),
            units: "0.5".to_owned(),
            average_cost: "1800".to_owned(),
            price: String::new(),
            ..AssetForm::for_new()
        };

        let (query, units, purchase_price, watchlist) = form.crypto_add_input().unwrap();
        assert_eq!(query, "Ethereum");
        assert_eq!(units, 0.5);
        assert_eq!(purchase_price, Some(1800.0));
        assert!(!watchlist);
    }

    #[test]
    fn crypto_add_allows_blank_purchase_price() {
        let form = AssetForm {
            category: "Crypto".to_owned(),
            symbol: "ETH".to_owned(),
            units: "0.5".to_owned(),
            average_cost: String::new(),
            ..AssetForm::for_new()
        };

        let (_, _, purchase_price, _) = form.crypto_add_input().unwrap();
        assert_eq!(purchase_price, None);
    }

    #[test]
    fn manual_asset_defaults_blank_purchase_price_to_current_price() {
        let form = AssetForm {
            symbol: "ACME".to_owned(),
            name: "Acme".to_owned(),
            category: "Equity".to_owned(),
            units: "2".to_owned(),
            price: "50".to_owned(),
            average_cost: String::new(),
            ..AssetForm::for_new()
        };

        let asset = form.into_asset().unwrap();
        assert_eq!(asset.average_cost, 50.0);
    }

    #[test]
    fn crypto_add_rejects_missing_name() {
        let form = AssetForm {
            symbol: "  ".to_owned(),
            ..AssetForm::for_new()
        };

        assert!(form.crypto_add_input().unwrap_err().contains("Enter a crypto name"));
    }
}
