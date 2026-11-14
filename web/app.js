/* Portfolio DECK */
(() => {
'use strict';

/* ---------- icons ---------- */
const I = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  trendUp:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  download:'<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:'<path d="M3 3l18 18"/><path d="M10.6 5.1A9.7 9.7 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4.1M6.5 6.6A17 17 0 002 12s3.6 7 10 7a9.6 9.6 0 004.1-.9"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  refresh:'<path d="M20 11a8 8 0 00-14.5-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0014.5 4.5L20 16"/><path d="M20 20v-4h-4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  wallet:'<path d="M3 7a2 2 0 012-2h13v4"/><path d="M3 7v10a2 2 0 002 2h14a1 1 0 001-1V9a1 1 0 00-1-1H5a2 2 0 01-2-1z"/><circle cx="16.5" cy="13.5" r="1.2"/>',
  pie:'<path d="M21 12A9 9 0 1112 3v9z"/><path d="M15 3.5A9 9 0 0120.5 9H15z"/>',
  az:'<path d="M4 7h10M4 12h7M4 17h4"/><path d="M18 6v12M15 15l3 3 3-3"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  edit:'<path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  hex:'<path d="M12 2.5l8.7 5v9L12 21.5l-8.7-5v-9z"/><path d="M12 7.5l3.9 2.25v4.5L12 16.5l-3.9-2.25v-4.5z"/>',
  up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
  hash:'<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>',
  dollar:'<path d="M12 3v18"/><path d="M16.5 7.5C16 6 14.3 5 12 5c-2.5 0-4 1.2-4 3s1.5 2.6 4 3 4 1.2 4 3-1.7 3-4 3c-2.3 0-4.2-1-4.7-2.7"/>',
  pct:'<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
  user:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8h4a2 2 0 010 4h-4h4.5a2 2 0 010 4H9.5M9.5 6.5V8m0 8v1.5"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  fund:'<path d="M12 3a9 9 0 109 9"/><path d="M12 3v9h9"/>',
  gem:'<path d="M6 4h12l4 6-10 11L2 10z"/><path d="M2 10h20M9 4l3 17 3-17"/>',
  dot:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/>',
  alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>',
  expand:'<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  upload:'<path d="M12 16V5"/><path d="M7 9l5-5 5 5"/><path d="M5 20h14"/>',
  csv:'<path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/><path d="M8 14V4m0 0L5 7m3-3l3 3"/><path d="M16 4v10m0 0l-3-3m3 3l3-3"/>',
};
const icon = n => `<svg class="ic" viewBox="0 0 24 24">${I[n]||''}</svg>`;
const hydrateIcons = (root=document) => root.querySelectorAll('[data-icon]').forEach(el => { if(!el.dataset.done){ el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); el.dataset.done=1; } });

/* ---------- storage (user_data folder via server, starting at 0 assets) ---------- */
const KEY='deck.portfolio.v2', WKEY='deck.watch.v2', CKEY='deck.settings.v2';
const CG_IDS = {BTC:'bitcoin',ETH:'ethereum',SOL:'solana',ADA:'cardano',XRP:'ripple',DOGE:'dogecoin',BNB:'binancecoin',USDC:'usd-coin',USDT:'tether',AVAX:'avalanche-2',DOT:'polkadot',LINK:'chainlink',LTC:'litecoin',BCH:'bitcoin-cash',XLM:'stellar',TRX:'tron',SHIB:'shiba-inu',TON:'the-open-network',SUI:'sui',NEAR:'near',APT:'aptos',UNI:'uniswap',ICP:'internet-computer',FIL:'filecoin',ATOM:'cosmos',ALGO:'algorand',ETC:'ethereum-classic',AAVE:'aave',PEPE:'pepe'};
const COMM = {gold:'GC=F',silver:'SI=F',oil:'CL=F','crude oil':'CL=F',crude:'CL=F',brent:'BZ=F','natural gas':'NG=F',gas:'NG=F',copper:'HG=F',platinum:'PL=F',palladium:'PA=F',wheat:'ZW=F',corn:'ZC=F',coffee:'KC=F',sugar:'SB=F',cotton:'CT=F'};
const QT = {Equity:['EQUITY'],Fund:['ETF','MUTUALFUND'],Commodity:['FUTURE']};
const PALETTE = ['#4f7cff','#8b5cf6','#22d3ee','#2ee6a6','#f59e0b','#ff6b9a','#64748b'];
const TYPES = [{k:'Crypto',ic:'coin'},{k:'Equity',ic:'chart'},{k:'Fund',ic:'fund'},{k:'Commodity',ic:'gem'},{k:'Other',ic:'dot'}];
const PH = {Crypto:'BTC · Ethereum',Equity:'AAPL · Apple',Fund:'VOO · Vanguard',Commodity:'Gold · GC=F'};
const CURS = ['USD','EUR','BTC','ETH'];

const readJSON = (k,d) => { try{ const v=JSON.parse(localStorage.getItem(k)); return v??d; }catch{ return d; } };
const S = {
  assets: Array.isArray(readJSON(KEY,null)) ? readJSON(KEY,null) : [],
  watch: Array.isArray(readJSON(WKEY,null)) ? readJSON(WKEY,null) : [],
  cfg: Object.assign({cmcKey:'', apis:[], theme:'dark', cur:'USD'}, readJSON(CKEY,{})),
  rates: { eurPerUsd: 0.92, btcUsd: 85000, ethUsd: 3000 },
  page:'portfolio', range:'1M', sort:{k:'value',dir:-1}, q:'', hide:false,
  edit:null, mode:'own', type:'Crypto', busy:false, hist:{}, lastUpdate:null, src:'', histReq:0,
  ad: null, adRange: '1M', adReq: 0,
};
const isCrypto = a => /crypto/i.test(a.category);
function normalizeAssets(){ [...S.assets,...S.watch].forEach(a => { if(!a.coingecko_id && isCrypto(a)) a.coingecko_id = CG_IDS[a.symbol]||''; }); }
normalizeAssets();
function save(){
  localStorage.setItem(KEY, JSON.stringify(S.assets));
  localStorage.setItem(WKEY, JSON.stringify(S.watch));
  localStorage.setItem(CKEY, JSON.stringify(S.cfg));
  if(API.proxy) fetch('/api/data', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({assets:S.assets, watch:S.watch, cfg:S.cfg})}).catch(()=>{});
}

/* ---------- math / format / icons ---------- */
const val = a => a.units*a.price, cost = a => a.units*a.average_cost, pl = a => val(a)-cost(a), dayv = a => val(a)*a.daily_change_pct/100;
const sum = (arr,f) => arr.reduce((s,a)=>s+f(a),0);
const fmtMoney = (v,d=2) => (v<0?'-':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtPrice = v => { const a=Math.abs(v); const d = a>=1?2:a>=.1?4:a>=.01?5:7; return '$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:d}); };
const fmtCompact = v => { const a=Math.abs(v); if(a>=1e6) return (v/1e6).toFixed(2)+'M'; if(a>=1e4) return (v/1e3).toFixed(1)+'K'; return v.toLocaleString('en-US',{maximumFractionDigits:2}); };
const fmtUnits = v => v>=1000? v.toLocaleString('en-US',{maximumFractionDigits:0}) : (+v.toFixed(4)).toString();
const fmtPct = v => (v>0?'+':'')+v.toFixed(2)+'%';
const signed = v => (v>0?'+':v<0?'-':'')+fmtMoney(Math.abs(v)).replace('-','');
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = (s,r=document) => r.querySelector(s), $$ = (s,r=document) => [...r.querySelectorAll(s)];
const hue = s => { let h=0; for(const c of s) h=(h*31+c.charCodeAt(0))%360; return h; };
const coinStyle = sym => { const h=hue(sym); return `background:linear-gradient(145deg,hsl(${h} 80% 62%),hsl(${(h+40)%360} 75% 42%))`; };
const hid = html => `<span class="num-h">${html}</span>`;

function assetIconUrl(a){
  if(a.icon) return a.icon;
  if(isCrypto(a)) return `https://assets.coincap.io/assets/icons/${encodeURIComponent(a.symbol.toLowerCase())}@2x.png`;
  if(a.category==='Equity'||a.category==='Fund') return `https://assets.parqet.com/logos/symbol/${encodeURIComponent(a.symbol)}?format=png`;
  return '';
}
function coinHtml(a){
  const u=assetIconUrl(a), ch=esc((a.symbol||'?')[0]);
  if(!u) return `<div class="coin" style="${coinStyle(a.symbol)}">${ch}</div>`;
  return `<div class="coin has-img" style="${coinStyle(a.symbol)}">${ch}<img src="${esc(u)}" alt="" loading="lazy" style="position:absolute;inset:0" onerror="this.parentElement.classList.remove('has-img');this.remove()"></div>`;
}

function conv(usd){
  if(S.cfg.cur==='EUR') return usd * S.rates.eurPerUsd;
  if(S.cfg.cur==='BTC') return S.rates.btcUsd ? usd / S.rates.btcUsd : 0;
  if(S.cfg.cur==='ETH') return S.rates.ethUsd ? usd / S.rates.ethUsd : 0;
  return usd;
}
function curSym(){ return S.cfg.cur==='EUR'?'€':S.cfg.cur==='BTC'?'₿':S.cfg.cur==='ETH'?'Ξ':'$'; }
function fmtDisplayCur(v, isSigned=false){
  const neg = v<0, av = Math.abs(v), pre = isSigned ? (v>0?'+':neg?'-':'') : (neg?'-':'');
  if(S.cfg.cur==='BTC'||S.cfg.cur==='ETH'){ const d = av>=10?3:av>=1?4:6; return `${pre}${curSym()}${av.toFixed(d)}`; }
  return `${pre}${curSym()}${av.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
}
function fmtAssetPriceCur(usd){
  const v = conv(usd), av = Math.abs(v), pre = v<0?'-':'';
  if(S.cfg.cur==='BTC'||S.cfg.cur==='ETH'){
    const d = av>=10?3:av>=1?4:av>=.01?5:7;
    return `${pre}${curSym()}${av.toFixed(d)}`;
  }
  const d = av>=1?2:av>=.1?4:av>=.01?5:7;
  return `${pre}${curSym()}${av.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:d})}`;
}

const rng = seed => { let a=seed>>>0; return () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
const seedOf = s => { let h=2166136261; for(const c of s) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0; };
function smooth(pts){
  if(pts.length<2) return '';
  let d=`M${pts[0][0]},${pts[0][1]}`;
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2, t=.18;
    d+=` C${p1[0]+(p2[0]-p0[0])*t},${p1[1]+(p2[1]-p0[1])*t} ${p2[0]-(p3[0]-p1[0])*t},${p2[1]-(p3[1]-p1[1])*t} ${p2[0]},${p2[1]}`;
  }
  return d;
}
function synthSeries(end, pct, n, seed){
  if(!end) return Array.from({length:n},()=>0);
  const r=rng(seed), start=end/(1+Math.max(-.6,Math.min(.9,pct/100))), vol=Math.abs(end-start)*.35+end*.012;
  const raw=[]; let w=0; for(let i=0;i<n;i++){ w+=(r()-.5)*2; raw.push(w); }
  const last=raw[n-1];
  return raw.map((x,i)=>{ const t=i/(n-1); return start+(end-start)*t+(x-last*t)*vol*.28; });
}
const ease = t => 1-Math.pow(1-t,4);
function tween(from,to,ms,cb){ const t0=performance.now(); const step=now=>{ const p=Math.min(1,(now-t0)/ms); cb(from+(to-from)*ease(p)); if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
const shown = new WeakMap();
function countTo(el,to,fmt,ms=1400){ const from=shown.get(el)??0; shown.set(el,to); if(matchMedia('(prefers-reduced-motion:reduce)').matches){ fmt(el,to); return; } tween(from,to,ms,v=>fmt(el,v)); }
const bigFmt = (el,v) => {
  const neg=v<0, av=Math.abs(v), sym=curSym();
  const decs = S.cfg.cur==='BTC' ? (av>=10?3:av>=1?4:6) : 2;
  const [w,d]=av.toFixed(decs).split('.');
  el.innerHTML=`<span class="cur">${neg?'-':''}${sym}</span>${Number(w).toLocaleString('en-US')}<span class="dec">.${d}</span>`;
};
const sleep = ms => new Promise(r=>setTimeout(r,ms));

/* ---------- market data providers ---------- */
const API = { proxy:false };
async function jget(url,headers){
  const r=await fetch(url,{headers});
  if(!r.ok){ const e=new Error(r.status===429?'Rate limited':'HTTP '+r.status); e.status=r.status; throw e; }
  return r.json();
}
const cgGet = p => jget((API.proxy?'/api/cg':'https://api.coingecko.com/api')+p);
const yfGet = p => { if(!API.proxy) throw new Error('Start server.js'); return jget('/api/yf'+p); };
const cmcGet = p => {
  if(!API.proxy) throw new Error('Start server.js');
  if(!S.cfg.cmcKey) throw new Error('CMC key ✗');
  return jget('/api/cmc'+p,{'x-cmc-key':S.cfg.cmcKey});
};
const apiKey = name => (S.cfg.apis||[]).find(x=>x.provider===name)?.key || '';
const fxCache={};
async function fx(cur){
  if(!cur||cur==='USD') return 1;
  if(cur==='GBp'||cur==='GBX') return .01*await fx('GBP');
  const c=fxCache[cur]; if(c&&Date.now()-c.t<36e5) return c.v;
  const j=await yfGet(`/v8/finance/chart/${cur}USD%3DX?range=1d&interval=1d`);
  const v=j.chart?.result?.[0]?.meta?.regularMarketPrice; if(!v) throw new Error('FX ✗');
  fxCache[cur]={t:Date.now(),v}; return v;
}
async function fetchRates(){
  const btc = [...S.assets,...S.watch].find(a=>a.symbol==='BTC'&&a.price>0);
  const eth = [...S.assets,...S.watch].find(a=>a.symbol==='ETH'&&a.price>0);
  if(btc) S.rates.btcUsd = btc.price;
  if(eth) S.rates.ethUsd = eth.price;
  try{
    const j=await cgGet('/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur');
    if(j.bitcoin?.usd && j.bitcoin?.eur){
      S.rates.btcUsd = j.bitcoin.usd;
      S.rates.eurPerUsd = j.bitcoin.eur / j.bitcoin.usd;
    }
    if(j.ethereum?.usd){
      S.rates.ethUsd = j.ethereum.usd;
    }
    if(j.bitcoin?.usd) return;
  }catch{}
  if(API.proxy){
    try{ const usdPerEur = await fx('EUR'); if(usdPerEur>0) S.rates.eurPerUsd = 1/usdPerEur; }catch{}
  }
}
async function yfQuote(t){
  try{
    const j=await yfGet(`/v8/finance/chart/${encodeURIComponent(t)}?range=1d&interval=1d`);
    const m=j.chart?.result?.[0]?.meta; if(!m||!isFinite(m.regularMarketPrice)) throw new Error(t+' ✗');
    const f=await fx(m.currency), prev=m.chartPreviousClose??m.previousClose;
    return {usd:m.regularMarketPrice*f, chg:prev?(m.regularMarketPrice/prev-1)*100:0, name:m.longName||m.shortName||t, symbol:m.symbol, type:m.instrumentType};
  }catch(err){
    const fh=apiKey('Finnhub'), av=apiKey('Alpha Vantage');
    if(fh && API.proxy){
      try{
        const q=await jget(`/api/fh/quote?symbol=${encodeURIComponent(t)}`,{'x-api-key':fh});
        if(isFinite(q.c)&&q.c>0) return {usd:q.c, chg:q.dp||0, name:t, symbol:t};
      }catch{}
    }
    if(av && API.proxy){
      try{
        const q=await jget(`/api/av/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(t)}`,{'x-api-key':av});
        const g=q['Global Quote']; const p=Number(g?.['05. price']);
        if(isFinite(p)&&p>0) return {usd:p, chg:parseFloat(g['10. change percent'])||0, name:t, symbol:t};
      }catch{}
    }
    throw err;
  }
}
async function cryptoQuotes(list){
  const ids=[...new Set(list.map(a=>a.coingecko_id).filter(Boolean))];
  let cgErr;
  if(ids.length){
    try{
      const q=await cgGet(`/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`);
      const map={}; Object.keys(q).forEach(k=>{ if(isFinite(q[k]?.usd)) map[k]={usd:q[k].usd,chg:q[k].usd_24h_change}; });
      if(Object.keys(map).length) return {map,src:'CG'};
      cgErr=new Error('empty');
    }catch(e){ cgErr=e; }
  }
  if(S.cfg.cmcKey && API.proxy){
    try{
      const syms=[...new Set(list.map(a=>a.symbol))];
      const j=await cmcGet(`/v2/cryptocurrency/quotes/latest?symbol=${encodeURIComponent(syms.join(','))}&convert=USD`);
      const map={};
      list.forEach(a=>{
        const c=[].concat(j.data?.[a.symbol]||[]).filter(Boolean).sort((x,y)=>(x.cmc_rank||1e9)-(y.cmc_rank||1e9))[0], u=c?.quote?.USD;
        if(u&&isFinite(u.price)) map[a.coingecko_id||a.symbol]={usd:u.price,chg:u.percent_change_24h};
      });
      if(Object.keys(map).length) return {map,src:'CMC'};
    }catch{}
  }
  if(API.proxy){
    const map={};
    const res=await Promise.allSettled(list.map(a=>yfQuote(`${a.symbol}-USD`)));
    res.forEach((r,i)=>{ if(r.status==='fulfilled') map[list[i].coingecko_id||list[i].symbol]={usd:r.value.usd,chg:r.value.chg}; });
    if(Object.keys(map).length) return {map,src:'YF'};
  }
  throw new Error(cgErr?.message||'Crypto quotes unavailable');
}
async function findCrypto(q){
  const qq=q.toLowerCase(), symUp=q.trim().toUpperCase(); let cgErr;
  try{
    const s=await cgGet('/v3/search?query='+encodeURIComponent(q));
    const m=(s.coins||[]).filter(c=>c.symbol.toLowerCase()===qq||c.name.toLowerCase()===qq).sort((x,y)=>((x.symbol.toLowerCase()===qq?0:1)-(y.symbol.toLowerCase()===qq?0:1))||((x.market_cap_rank||1e9)-(y.market_cap_rank||1e9)))[0];
    if(!m) throw new Error(`"${q}" ✗`);
    const p=await cgGet(`/v3/simple/price?ids=${m.id}&vs_currencies=usd&include_24hr_change=true`); const x=p[m.id];
    if(!x) throw new Error('$ ✗');
    return {symbol:m.symbol.toUpperCase(),name:m.name,category:'Crypto',price:x.usd,daily_change_pct:isFinite(x.usd_24h_change)?x.usd_24h_change:0,coingecko_id:m.id,ticker:'',icon:m.large||m.thumb||''};
  }catch(e){ cgErr=e; }
  if(S.cfg.cmcKey && API.proxy){
    try{
      const j=await cmcGet(`/v2/cryptocurrency/quotes/latest?symbol=${encodeURIComponent(symUp)}&convert=USD`);
      const c=[].concat(j.data?.[symUp]||[]).filter(Boolean).sort((x,y)=>(x.cmc_rank||1e9)-(y.cmc_rank||1e9))[0];
      if(c) return {symbol:c.symbol,name:c.name,category:'Crypto',price:c.quote.USD.price,daily_change_pct:c.quote.USD.percent_change_24h||0,coingecko_id:CG_IDS[c.symbol]||'',ticker:'',icon:''};
    }catch{}
  }
  if(API.proxy){
    try{
      let ticker=`${symUp}-USD`, name=null;
      try{
        const s=await yfGet(`/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=6&newsCount=0`);
        const hit=(s.quotes||[]).find(x=>x.quoteType==='CRYPTOCURRENCY' && /-USD$/i.test(x.symbol));
        if(hit){ ticker=hit.symbol; name=hit.shortname||hit.longname; }
      }catch{}
      const r=await yfQuote(ticker);
      const sym=ticker.replace(/-USD$/i,'');
      const cleanName=(name||r.name||sym).replace(/\s+USD$/i,'');
      return {symbol:sym,name:cleanName,category:'Crypto',price:r.usd,daily_change_pct:r.chg,coingecko_id:CG_IDS[sym]||'',ticker,icon:''};
    }catch{}
  }
  throw new Error(cgErr?.message||`"${q}" ✗`);
}
async function findYahoo(type,q){
  let ticker=null, name=null; const low=q.toLowerCase();
  if(type==='Commodity'&&COMM[low]) ticker=COMM[low];
  if(!ticker){
    try{
      const s=await yfGet(`/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`);
      const ok=(s.quotes||[]).filter(x=>QT[type].includes(x.quoteType));
      const hit=ok.find(x=>x.symbol.toLowerCase()===low)||ok[0];
      if(hit){ ticker=hit.symbol; name=hit.longname||hit.shortname; }
    }catch(e){ if(!/HTTP 4|✗/.test(e.message)) throw e; }
  }
  if(!ticker) ticker=q.toUpperCase();
  const r=await yfQuote(ticker).catch(()=>{ throw new Error(`"${q}" ✗`); });
  return {symbol:ticker.replace(/=F$/,''),name:name||r.name,category:type,price:r.usd,daily_change_pct:r.chg,coingecko_id:'',ticker,icon:''};
}
const findAsset = (type,q) => type==='Crypto'?findCrypto(q):findYahoo(type,q);

/* ---------- derived ---------- */
function visible(){
  const q=S.q.trim().toLowerCase();
  let list=S.assets.map((a,i)=>({a,i}));
  if(q) list=list.filter(({a})=>[a.symbol,a.name,a.category].some(s=>s.toLowerCase().includes(q)));
  const total=sum(S.assets,val)||1;
  const keyf={name:a=>a.name.toLowerCase(),price:a=>a.price,change:a=>a.daily_change_pct,value:val,pl:pl,alloc:a=>val(a)/total}[S.sort.k];
  list.sort((x,y)=>{ const A=keyf(x.a),B=keyf(y.a); return (A<B?-1:A>B?1:0)*S.sort.dir; });
  return list;
}
let firstRender=true;
function renderHero(){
  const total=sum(S.assets,val), day=sum(S.assets,dayv), costT=sum(S.assets,cost);
  const dayPct = total && (total-day)? day/(total-day)*100 : 0;
  $('#curPill').textContent = S.cfg.cur || 'USD';
  countTo($('#total'), conv(total), bigFmt, firstRender?1600:700);
  const up=day>=0;
  $('#dayDelta').innerHTML = `<span class="pill ${up?'up':'down'}">${icon(up?'up':'down')}${fmtPct(dayPct)}</span><span class="num ${up?'up':'down'} num-h">${fmtDisplayCur(conv(day),true)}</span>`;
  const L=$('#live'); L.classList.toggle('on',!!S.lastUpdate&&!S.busy); L.classList.toggle('busy',S.busy);
  $('#liveText').textContent = S.busy?'SYNC':S.lastUpdate?`LIVE · ${S.lastUpdate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}${S.src?' · '+S.src:''}`:'READY';
  S._dayPct=dayPct; S._total=total; S._cost=costT;
}

/* ---------- chart ---------- */
const RANGE_DAYS={ '1D':1,'1W':7,'1M':30,'3M':90,'1Y':365 };
const YF_RANGE={ '1D':['1d','5m'],'1W':['5d','30m'],'1M':['1mo','1d'],'3M':['3mo','1d'],'1Y':['1y','1d'] };
async function histFor(a,range){
  if(isCrypto(a)&&a.coingecko_id){ const j=await cgGet(`/v3/coins/${a.coingecko_id}/market_chart?vs_currency=usd&days=${RANGE_DAYS[range]}`); return (j.prices||[]).map(p=>p[1]); }
  if(a.ticker){ const [r,i]=YF_RANGE[range]; const j=await yfGet(`/v8/finance/chart/${encodeURIComponent(a.ticker)}?range=${r}&interval=${i}`); const res=j.chart.result[0], f=await fx(res.meta.currency); return res.indicators.quote[0].close.filter(x=>x!=null).map(x=>x*f); }
  throw new Error('no src');
}
async function fetchHistory(range){
  if(!S.assets.length) throw new Error('empty');
  const key=range+'|'+S.assets.map(a=>(a.coingecko_id||a.ticker)+a.units).join();
  const hit=S.hist[key]; if(hit&&Date.now()-hit.t<5*60e3) return hit.v;
  const N=64, top=[...S.assets].filter(a=>(isCrypto(a)&&a.coingecko_id)||a.ticker).sort((a,b)=>val(b)-val(a)).slice(0,4), series=[];
  for(const a of top){
    try{ const p=await histFor(a,range); if(p.length>=2){ series.push({a,out:Array.from({length:N},(_,i)=>p[Math.round(i*(p.length-1)/(N-1))])}); } }catch{}
    await sleep(220);
  }
  if(!series.length) throw new Error('no history');
  const tracked=series.map(s=>s.a), rest=sum(S.assets.filter(a=>!tracked.includes(a)),val), nowT=sum(tracked,val);
  const v=Array.from({length:N},(_,i)=>{ const t=series.reduce((s,{a,out})=>s+a.units*out[i],0); return t+rest*(rest&&nowT?t/nowT:1); });
  S.hist[key]={t:Date.now(),v}; return v;
}
function currentSeries(){ const total=S._total||sum(S.assets,val), pct=S._dayPct||0; return synthSeries(total,pct*Math.sqrt(RANGE_DAYS[S.range]),64,seedOf(S.range+S.assets.length)); }
let chartData=[], chartPts=[];
function drawLineChart(box, svg, series, estEl, est, animate=true){
  const W=box.clientWidth, H=box.clientHeight, pad=14; if(!W||!H) return [];
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const min=Math.min(...series), max=Math.max(...series), span=(max-min)||1;
  const pts=series.map((v,i)=>[i/(series.length-1)*W, span===1&&min===0 ? H*0.6 : pad+(1-(v-min)/span)*(H-pad*2-18)]);
  const line=smooth(pts), area=`${line} L${W},${H} L0,${H} Z`;
  const up=series[series.length-1]>=series[0], c=up?'#4f7cff':'#ff5d7a', c2=up?'#8fb0ff':'#ff9ab0';
  const grid=[0,1,2,3].map(i=>`<line x1="0" x2="${W}" y1="${pad+i*(H-pad*2-18)/3}" y2="${pad+i*(H-pad*2-18)/3}" stroke="rgba(128,140,165,.12)" stroke-dasharray="2 6"/>`).join('');
  svg.innerHTML=`<defs>
    <linearGradient id="ga_${svg.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".35"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>
    <linearGradient id="gl_${svg.id}" x1="0" x2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <filter id="gf_${svg.id}" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="7"/></filter></defs>
    ${grid}
    <path d="${area}" fill="url(#ga_${svg.id})" class="${animate?'area-in':''}"/>
    <path d="${line}" fill="none" stroke="${c}" stroke-width="6" opacity=".45" filter="url(#gf_${svg.id})" class="${animate?'draw':''}"/>
    <path id="lp_${svg.id}" d="${line}" fill="none" stroke="url(#gl_${svg.id})" stroke-width="2.4" stroke-linecap="round" class="${animate?'draw':''}"/>`;
  if(animate){ const len=$('#lp_'+svg.id).getTotalLength()+2; $$('.draw',svg).forEach(p=>p.style.setProperty('--len',len)); }
  if(estEl) estEl.classList.toggle('on',!!est && series.some(x=>x>0));
  return pts;
}
function drawChart(series,est,animate=true){
  chartData=series;
  chartPts=drawLineChart($('#chart'),$('#chartSvg'),series,$('#est'),est,animate);
}
async function updateChart(animate=true){
  const my=++S.histReq;
  drawChart(currentSeries(),true,animate);
  if(!S.assets.length) return;
  try{
    const real=await fetchHistory(S.range);
    if(my!==S.histReq) return;
    const k=(S._total||real[real.length-1])/real[real.length-1];
    drawChart(real.map(v=>v*k),false,true);
  }catch{}
}
function bindChartHover(box, cur, tip, getData, getPts, getRange, fmtVal){
  box.addEventListener('pointermove',e=>{
    const data=getData(), pts=getPts();
    if(!pts.length||!data.length) return;
    const r=box.getBoundingClientRect(), x=e.clientX-r.left;
    const i=Math.max(0,Math.min(data.length-1,Math.round(x/r.width*(data.length-1))));
    const [px,py]=pts[i]; cur.style.opacity=1; cur.style.transform=`translateX(${px}px)`;
    cur.querySelector('i').style.top=(py-6)+'px'; cur.classList.toggle('flip',px>r.width-190);
    const d=RANGE_DAYS[getRange()], t=new Date(Date.now()-(1-i/(data.length-1))*d*864e5);
    const fmt=d<=1?{hour:'2-digit',minute:'2-digit'}:d<=90?{month:'short',day:'numeric'}:{month:'short',year:'2-digit'};
    tip.innerHTML=`<b class="num">${fmtVal(data[i])}</b>${t.toLocaleString([],fmt)}`;
  });
  box.addEventListener('pointerleave',()=>cur.style.opacity=0);
}

/* ---------- allocation: top 3 on main card + full-page motion takeover ---------- */
function layout(items,x,y,w,h,out){
  if(!items.length || w<=0 || h<=0) return;
  const total=sum(items,i=>i.v);
  if(total<=0) return;
  const scaled=items.map(it=>({...it, area:it.v/total*w*h})).sort((a,b)=>b.area-a.area);
  const worst=(row,side)=>{
    if(!row.length||side<=0) return Infinity;
    const s=row.reduce((a,b)=>a+b.area,0);
    let mx=0, mn=Infinity;
    for(const r of row){ if(r.area>mx) mx=r.area; if(r.area<mn) mn=r.area; }
    const s2=s*s, l2=side*side;
    return Math.max((l2*mx)/s2, s2/(l2*mn));
  };
  let cx=x, cy=y, cw=w, ch=h, row=[];
  const placeRow=r=>{
    const s=r.reduce((a,b)=>a+b.area,0);
    if(cw>=ch){
      const rw=ch>0?s/ch:0;
      let ry=cy;
      for(const it of r){ const rh=rw>0?it.area/rw:0; out.push({...it,x:cx,y:ry,w:rw,h:rh}); ry+=rh; }
      cx+=rw; cw=Math.max(0,cw-rw);
    }else{
      const rh=cw>0?s/cw:0;
      let rx=cx;
      for(const it of r){ const rw=rh>0?it.area/rh:0; out.push({...it,x:rx,y:cy,w:rw,h:rh}); rx+=rw; }
      cy+=rh; ch=Math.max(0,ch-rh);
    }
  };
  for(const it of scaled){
    const side=Math.min(cw,ch);
    const next=[...row,it];
    if(!row.length || worst(next,side)<=worst(row,side)){
      row=next;
    }else{
      placeRow(row);
      row=[it];
    }
  }
  if(row.length) placeRow(row);
}
function renderTreemap(box, legend, items, total, animate, showAllLabels){
  if(!items.length || !total){
    box.innerHTML=`<div class="tmap-empty">No assets yet</div>`;
    legend.innerHTML='';
    return;
  }
  const W=box.clientWidth||300, H=box.clientHeight||200, tiles=[];
  layout(items.map((t,i)=>({...t,i})),0,0,W,H,tiles);
  tiles.sort((a,b)=>a.i-b.i);
  box.innerHTML=tiles.map(t=>{
    const big=showAllLabels ? (t.w>46&&t.h>36) : (t.w>62&&t.h>46);
    const pct=(t.v/total*100).toFixed(t.v/total<.1?1:0);
    return `<div class="tile ${animate?'':'no-anim'}" data-i="${t.i}" style="left:${t.x/W*100}%;top:${t.y/H*100}%;width:${t.w/W*100}%;height:${t.h/H*100}%;--c:${t.c};--n:${t.i}"><div class="tile-in">${big?`<b>${esc(t.label)}</b><small>${pct}%</small>`:''}</div></div>`;
  }).join('');
  legend.innerHTML=items.map((s,i)=>`<li data-i="${i}"><i style="background:${s.c}"></i>${esc(s.label)}<em>${(s.v/total*100).toFixed(1)}%</em></li>`).join('');
  const hl=i=>{ box.classList.toggle('hov',i!=null); $$('.tile',box).forEach(c=>c.classList.toggle('hl',+c.dataset.i===i)); $$('li',legend).forEach(l=>l.classList.toggle('hl',+l.dataset.i===i)); };
  $$('.tile',box).forEach(el=>{ el.onpointerenter=()=>hl(+el.dataset.i); el.onpointerleave=()=>hl(null); });
  $$('li',legend).forEach(el=>{ el.onpointerenter=()=>hl(+el.dataset.i); el.onpointerleave=()=>hl(null); });
}
function renderAlloc(animate=true){
  const total=sum(S.assets,val), box=$('#tmap'); if(!box) return;
  const items=[...S.assets].filter(a=>val(a)>0).sort((a,b)=>val(b)-val(a));
  const top3=items.slice(0,3).map((a,i)=>({label:a.symbol,v:val(a),c:PALETTE[i]}));
  $('#allocCount').textContent=items.length?`${Math.min(3,items.length)} / ${items.length}`:'0';
  $('#btnAllocAll').style.display=items.length?'':'none';
  renderTreemap(box, $('#legend'), top3, total, animate, false);
}
function openAllocOverlay(animate=true){
  const ov=$('#allocOverlay'); ov.classList.add('open'); ov.setAttribute('aria-hidden','false');
  const total=sum(S.assets,val);
  const items=[...S.assets].filter(a=>val(a)>0).sort((a,b)=>val(b)-val(a))
    .map((a,i)=>({label:a.symbol,v:val(a),c:PALETTE[i%PALETTE.length]}));
  $('#allocFullCount').textContent=`${items.length} assets`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>renderTreemap($('#tmapFull'), $('#legendFull'), items, total, animate, true)));
}
function closeAllocOverlay(){
  const ov=$('#allocOverlay'); ov.classList.remove('open'); ov.setAttribute('aria-hidden','true');
}

/* ---------- asset detail overlay ---------- */
let adData=[], adPts=[];
function renderAssetDetailBody(){
  if(!S.ad) return;
  const {a, owned}=S.ad, up=a.daily_change_pct>=0, cur=S.cfg.cur||'USD';
  const priceBox=$('#adPrice');
  priceBox.classList.add('clickable');
  priceBox.title='Click to switch USD / EUR / BTC / ETH';
  priceBox.innerHTML=`<b>${fmtAssetPriceCur(a.price)}</b><button type="button" class="cur-pill">${esc(cur)}</button><span class="pill ${up?'up':'down'}">${icon(up?'up':'down')}${Math.abs(a.daily_change_pct).toFixed(2)}%</span>`;
  priceBox.onclick=cycleCur;
  const total=sum(S.assets,val)||1, p=pl(a), c=cost(a);
  if(owned){
    const ret=c?p/c*100:0;
    $('#adStats').innerHTML=`
      <article class="card ad-stat"><em>Units Held</em><b class="num-h">${fmtUnits(a.units)}</b><small>${esc(a.symbol)}</small></article>
      <article class="card ad-stat"><em>Avg Cost</em><b class="num-h">${fmtAssetPriceCur(a.average_cost)}</b><small>per unit (${esc(cur)})</small></article>
      <article class="card ad-stat"><em>Cost Basis</em><b class="num-h">${fmtDisplayCur(conv(c))}</b><small>invested</small></article>
      <article class="card ad-stat"><em>Market Value</em><b class="num-h">${fmtDisplayCur(conv(val(a)))}</b><small>current</small></article>
      <article class="card ad-stat"><em>Profit / Loss</em><b class="num-h ${p>=0?'up':'down'}">${fmtDisplayCur(conv(p),true)}</b><small class="${ret>=0?'up':'down'}">${fmtPct(ret)}</small></article>
      <article class="card ad-stat"><em>Portfolio Share</em><b>${(val(a)/total*100).toFixed(2)}%</b><small>of total</small></article>`;
  }else{
    $('#adStats').innerHTML=`
      <article class="card ad-stat"><em>Current Price</em><b>${fmtAssetPriceCur(a.price)}</b><small>${esc(cur)}</small></article>
      <article class="card ad-stat"><em>24h Change</em><b class="${up?'up':'down'}">${fmtPct(a.daily_change_pct)}</b><small>daily</small></article>
      <article class="card ad-stat"><em>Category</em><b>${esc(a.category)}</b><small>asset type</small></article>
      <article class="card ad-stat"><em>Status</em><b>Watchlist</b><small>not held</small></article>`;
  }
}
function openAssetDetail(a, owned){
  S.ad={a,owned};
  const ov=$('#assetOverlay'); ov.classList.add('open'); ov.setAttribute('aria-hidden','false');
  $('#adId').innerHTML=`${coinHtml(a)}<div><h2>${esc(a.name)}</h2><small>${esc(a.symbol)} · ${esc(a.category)}</small></div>`;
  renderAssetDetailBody();
  $$('#adRanges button').forEach(b=>b.classList.toggle('on',b.dataset.r===S.adRange));
  requestAnimationFrame(()=>updateAssetChart(true));
}
function closeAssetDetail(){
  const ov=$('#assetOverlay'); ov.classList.remove('open'); ov.setAttribute('aria-hidden','true');
  S.ad=null;
}
async function updateAssetChart(animate=true){
  if(!S.ad) return;
  const {a}=S.ad, my=++S.adReq, range=S.adRange;
  const estSeries=synthSeries(a.price, a.daily_change_pct*Math.sqrt(RANGE_DAYS[range]), 64, seedOf(a.symbol+range));
  adData=estSeries; adPts=drawLineChart($('#adChart'),$('#adChartSvg'),estSeries,$('#adEst'),true,animate);
  try{
    const p=await histFor(a,range);
    if(my!==S.adReq || !S.ad || p.length<2) return;
    const N=64, sampled=Array.from({length:N},(_,i)=>p[Math.round(i*(p.length-1)/(N-1))]);
    const k=a.price/sampled[sampled.length-1];
    const real=sampled.map(v=>v*k);
    adData=real; adPts=drawLineChart($('#adChart'),$('#adChartSvg'),real,$('#adEst'),false,true);
  }catch{}
}

/* ---------- stats ---------- */
function spark(seed,up,w=84,h=30){
  const r=rng(seedOf(seed)), n=16, pts=[]; let y=.5;
  for(let i=0;i<n;i++){ y+=(r()-.5)*.35+(up?.025:-.025); pts.push([i/(n-1)*w, h-Math.max(.08,Math.min(.92,y))*h]); }
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" style="width:${w}px;height:${h}px"><path d="${smooth(pts)}" fill="none" stroke="${up?'var(--up)':'var(--down)'}" stroke-width="1.6" stroke-linecap="round" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:draw0 1.4s var(--ease) .6s forwards"/></svg>`;
}
const stat=(id,ic,label,valueHtml,subHtml)=>{ $(id).innerHTML=`<div class="stat-top"><span class="stat-ic">${icon(ic)}</span><em>${label}</em></div><div class="stat-val num">${valueHtml}</div><div class="stat-sub">${subHtml}</div>`; };
function renderStats(){
  const total=S._total, c=S._cost, p=total-c, ret=c?p/c*100:0, day=sum(S.assets,dayv), dUp=day>=0;
  const cats={}; S.assets.forEach(a=>{ const k=a.category||'Other'; cats[k]=(cats[k]||0)+1; });
  const catStr=Object.entries(cats).map(([k,n])=>`${esc(k)} - ${n}`).join(', ')||'none yet';
  stat('#s1','dollar','Invested',hid(fmtMoney(c,0)),`<small class="cap">cost basis</small>${spark('inv',true)}`);
  stat('#s2','trendUp','Total Profit / Loss',`<span class="${p>=0?'up':'down'}">${hid(signed(p).replace(/\.\d\d$/,''))}</span>`,`<span class="pill ${ret>=0?'up':'down'}">${icon(ret>=0?'up':'down')}${fmtCompact(ret)}%</span>${spark('pl',p>=0)}`);
  stat('#s3','clock','Today',`<span class="${dUp?'up':'down'}">${hid(signed(day).replace(/\.\d\d$/,''))}</span>`,`<span class="pill ${dUp?'up':'down'}">${icon(dUp?'up':'down')}${fmtPct(S._dayPct)}</span>${spark('day',dUp)}`);
  stat('#s4','layers','Assets',String(S.assets.length),`<small class="cap">${catStr}</small>${spark('cnt',true)}`);
}

/* ---------- tables ---------- */
function renderRows(animate=true){
  const list=visible(), total=sum(S.assets,val)||1, rows=$('#rows');
  $('#empty').hidden=list.length>0;
  rows.innerHTML=list.map(({a,i},n)=>{
    const v=val(a), p=pl(a), up=a.daily_change_pct>=0, share=v/total*100;
    return `<div class="tr" data-i="${i}" style="--i:${animate?n:0}">
      ${coinHtml(a)}
      <div class="who"><b>${esc(a.name)}</b><small>${esc(a.symbol)} · ${esc(a.category)}</small></div>
      <div class="cell c-hold">${hid(fmtUnits(a.units))}</div>
      <div class="cell c-price">${fmtPrice(a.price)}</div>
      <div class="cell c-24"><span class="pill ${up?'up':'down'}">${icon(up?'up':'down')}${Math.abs(a.daily_change_pct).toFixed(2)}%</span></div>
      <div class="cell val c-val">${hid(fmtMoney(v))}</div>
      <div class="cell c-pl ${p>=0?'up':'down'}">${hid(signed(p))}<small>${cost(a)?fmtPct(p/cost(a)*100):''}</small></div>
      <div class="alloc c-alloc"><span>${share.toFixed(1)}%</span><div class="bar"><i data-w="${Math.max(2,share)}"></i></div></div>
      <div class="act c-act">
        <button data-a="star" class="${a.watchlist?'starred':''}" title="Watchlist">${icon('star')}</button>
        <button data-a="edit" title="Edit">${icon('edit')}</button>
        <button data-a="del" class="del" title="Remove">${icon('trash')}</button>
      </div></div>`;
  }).join('');
  requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.bar i',rows).forEach(b=>b.style.width=b.dataset.w+'%')));
  $$('.sort').forEach(s=>{ const on=s.dataset.k===S.sort.k; s.classList.toggle('on',on); s.classList.toggle('asc',on&&S.sort.dir===1); if(!s.querySelector('.arr')) s.insertAdjacentHTML('beforeend','<span class="arr">▼</span>'); });
}
function watchItems(){
  const q=S.q.trim().toLowerCase();
  let l=[...S.assets.map((a,i)=>({a,src:'own',i})).filter(x=>x.a.watchlist).sort((x,y)=>val(y.a)-val(x.a)), ...S.watch.map((a,i)=>({a,src:'watch',i}))];
  if(q) l=l.filter(({a})=>[a.symbol,a.name,a.category].some(s=>s.toLowerCase().includes(q)));
  return l;
}
function renderWatch(animate=true){
  const list=watchItems(), rows=$('#wrows');
  $('#watchCount').textContent=S.assets.filter(a=>a.watchlist).length+S.watch.length;
  $('#wempty').hidden=list.length>0;
  rows.innerHTML=list.map(({a,src,i},n)=>{
    const up=a.daily_change_pct>=0, owned=src==='own';
    return `<div class="tr wr" data-src="${src}" data-i="${i}" style="--i:${animate?n:0}">
      ${coinHtml(a)}
      <div class="who"><b>${esc(a.name)}</b><small>${esc(a.symbol)} · ${esc(a.category)}</small></div>
      <div class="cell">${fmtPrice(a.price)}</div>
      <div class="cell"><span class="pill ${up?'up':'down'}">${icon(up?'up':'down')}${Math.abs(a.daily_change_pct).toFixed(2)}%</span></div>
      <div class="cell c-spark">${spark(a.symbol+a.category,up,96,28)}</div>
      <div class="cell c-held">${owned?hid(fmtUnits(a.units))+'<small>'+hid(fmtMoney(val(a),0))+'</small>':'<span class="dash">—</span>'}</div>
      <div class="act c-act">${owned?`<button data-a="unstar" class="starred" title="Unwatch">${icon('star')}</button>`:`<button data-a="wdel" class="del" title="Remove">${icon('trash')}</button>`}</div></div>`;
  }).join('');
}
function applyTheme(t){
  S.cfg.theme = t==='light'?'light':'dark';
  document.documentElement.dataset.theme = S.cfg.theme;
  const b=$('#btnTheme'); if(b) b.innerHTML=icon(S.cfg.theme==='light'?'moon':'sun');
}
function renderAll(){
  applyTheme(S.cfg.theme);
  renderHero(); renderStats(); renderRows(firstRender); renderWatch(firstRender);
  document.body.classList.toggle('blur',S.hide);
  $('#btnHide').innerHTML=icon(S.hide?'eyeOff':'eye');
  if(S.page==='portfolio'){ renderAlloc(firstRender); if(firstRender) updateChart(true); }
  firstRender=false;
}
function redrawData(){ renderHero(); renderStats(); renderRows(false); renderWatch(false); if(S.page==='portfolio'){ renderAlloc(false); } }

/* ---------- toast ---------- */
let tt;
function toast(msg,err){ const t=$('#toast'); t.className='toast'+(err?' err':''); t.innerHTML=icon(err?'alert':'check')+esc(msg); requestAnimationFrame(()=>t.classList.add('show')); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove('show'),3600); }

/* ---------- refresh ---------- */
async function refresh(silent){
  if(S.busy) return;
  const all=[...S.assets,...S.watch], cr=all.filter(isCrypto), yf=all.filter(a=>a.ticker&&!isCrypto(a));
  if(!cr.length&&!yf.length){ await fetchRates(); renderHero(); return; }
  S.busy=true; $('#btnRefresh').classList.add('spin'); renderHero();
  const srcs=[]; let ok=0, err='';
  await fetchRates();
  if(cr.length){
    try{ const {map,src}=await cryptoQuotes(cr); cr.forEach(a=>{ const x=map[a.coingecko_id||a.symbol]; if(x){ a.price=x.usd; if(isFinite(x.chg)&&x.chg>-100) a.daily_change_pct=x.chg; ok++; } }); srcs.push(src); }
    catch(e){ err=e.message; }
  }
  if(yf.length){
    const res=await Promise.allSettled(yf.map(a=>yfQuote(a.ticker)));
    res.forEach((r,i)=>{ if(r.status==='fulfilled'){ yf[i].price=r.value.usd; yf[i].daily_change_pct=r.value.chg; ok++; } else err=r.reason.message; });
    if(res.some(r=>r.status==='fulfilled')) srcs.push('YF');
  }
  if(ok){ S.lastUpdate=new Date(); S.src=srcs.join('+'); save(); }
  S.busy=false; $('#btnRefresh').classList.remove('spin');
  if(!silent) toast(ok?`${ok} ✓${err?' · '+err:''}`:(err||'Offline'),!ok);
  redrawData(); if(S.page==='portfolio') updateChart(true);
}

/* ---------- add / edit modal ---------- */
function openModal(idx=null){
  S.mode=S.page==='watch'&&idx==null?'watch':'own'; S.edit=idx;
  const a=idx!=null?S.assets[idx]:null; S.type=a?a.category:'Crypto';
  $('#fWatch').checked=a?a.watchlist:false; $('#starToggle').style.display=S.mode==='watch'?'none':'';
  $('#sheetTitle').innerHTML = a ? `${coinHtml(a)}<span>${esc(a.name)}</span>` : icon(S.mode==='watch'?'star':'plus');
  msg(''); renderTypes(); renderFields(a); show('#modal');
}
const show = id => { const m=$(id); m.classList.add('open'); m.setAttribute('aria-hidden','false'); setTimeout(()=>$('input',m)?.focus(),350); };
const hideModal = m => { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); };
function renderTypes(){
  const el=$('#types'), list=S.mode==='watch'?TYPES.filter(t=>t.k!=='Other'):TYPES;
  if(!list.some(t=>t.k===S.type)) S.type=list[0].k;
  el.innerHTML=list.map(t=>`<button type="button" class="type ${t.k===S.type?'on':''}" data-t="${t.k}" title="${t.k}">${icon(t.ic)}</button>`).join('');
  $$('.type',el).forEach(b=>b.onclick=()=>{ const keep=readFields(); S.type=b.dataset.t; renderTypes(); renderFields(null,keep); });
}
const fld=(id,ic,ph,v='',full=false,i=0)=>`<label class="field ${full?'full':''}" style="--i:${i}">${icon(ic)}<input id="${id}" placeholder="${ph}" value="${esc(v)}" inputmode="${/f(Units|Price|Cost|Chg)/.test(id)?'decimal':'text'}"></label>`;
const lookupMode = () => S.mode==='watch' || (S.edit==null && S.type!=='Other');
function renderFields(a,keep){
  const k=keep||{}, g=(n,d='')=>k[n]??(a?String(a[d]??''):''), symV=k.fSym??(a?a.symbol:''), nameV=k.fName??(a?a.name:'');
  let h;
  if(lookupMode()){
    h=fld('fSym','search',PH[S.type],symV,true,0);
    if(S.mode!=='watch') h+=fld('fUnits','hash','#',g('fUnits','units')||'1',false,1)+fld('fCost','dollar','$ (opt.)',g('fCost','average_cost'),false,2);
  }else{
    h=fld('fSym','search','Symbol',symV,false,0)+fld('fName','user','Name',nameV,false,1)
     +fld('fUnits','hash','#',g('fUnits','units')||'1',false,2)+fld('fPrice','tag','$',g('fPrice','price'),false,3)
     +fld('fCost','dollar','Ø $ (opt.)',g('fCost','average_cost'),false,4)+fld('fChg','pct','Δ %',g('fChg','daily_change_pct')||'0',false,5);
  }
  $('#fields').innerHTML=h;
}
function readFields(){ const o={}; $$('#fields input').forEach(i=>o[i.id]=i.value); return o; }
const num=(v,l)=>{ const x=Number(String(v).replace(',','.')); if(String(v).trim()===''||!isFinite(x)) throw new Error(l+' ✗'); return x; };
function msg(t,info){ const m=$('#formMsg'); m.textContent=t; m.className='form-msg'+(info?' info':''); }
async function submit(e){
  e.preventDefault();
  const f=readFields(), watch=$('#fWatch').checked, btn=$('#btnSave');
  try{
    if(lookupMode()){
      const q=(f.fSym||'').trim(); if(!q) throw new Error('⌕ ?');
      let units=0, buy=null;
      if(S.mode!=='watch'){ units=num(f.fUnits,'#'); if(units<=0) throw new Error('# > 0'); buy=(f.fCost||'').trim()===''?null:num(f.fCost,'$'); if(buy!=null&&buy<0) throw new Error('$ ≥ 0'); }
      btn.disabled=true; msg('⌕ …',true);
      const found=await findAsset(S.type,q);
      if(S.mode==='watch'){
        if([...S.assets,...S.watch].some(a=>a.symbol===found.symbol&&a.category===found.category)) throw new Error(found.symbol+' ✓ already');
        S.watch.push(found);
      }else S.assets.push({...found,units,average_cost:buy??found.price,watchlist:watch});
      toast(found.name+' ✓');
    }else{
      const symbol=(f.fSym||'').trim().toUpperCase(), name=(f.fName||'').trim();
      if(!symbol||!name) throw new Error('⌕ · Aa ?');
      const units=num(f.fUnits,'#'), price=num(f.fPrice,'$'), average_cost=(f.fCost||'').trim()===''?price:num(f.fCost,'Ø'), daily_change_pct=(f.fChg||'').trim()===''?0:num(f.fChg,'Δ');
      if(units<0||price<0||average_cost<0||daily_change_pct<=-100) throw new Error('≥ 0');
      const old=S.edit==null?null:S.assets[S.edit]; let id=old?.coingecko_id||''; if(S.type==='Crypto'&&!id) id=CG_IDS[symbol]||'';
      const rec={symbol,name,category:S.type,units,price,average_cost,daily_change_pct,coingecko_id:S.type==='Crypto'?id:'',ticker:old?.ticker||'',icon:old?.icon||'',watchlist:watch};
      if(old) S.assets[S.edit]=rec; else S.assets.push(rec);
      toast(name+' ✓');
    }
    save(); hideModal($('#modal')); S.hist={}; redrawData(); if(S.page==='portfolio') updateChart(true);
  }catch(err){ msg(err.message||'✗'); }
  btn.disabled=false;
}

/* ---------- APIs & Data sources modal ---------- */
function renderSources(){
  const row=(n,d,on)=>`<li class="${on?'on':''}"><i></i><b>${n}</b><small>${d}</small></li>`;
  $('#sources').innerHTML=row('CoinGecko','Crypto · primary',true)
    +row('CoinMarketCap','Crypto · backup',!!S.cfg.cmcKey&&API.proxy)
    +row('Yahoo Finance','Stocks · Funds · Commodities',API.proxy)
    +(API.proxy?'':'<li class="warn"><i></i><b>Server</b><small>run: node server.js</small></li>');
  const apis = S.cfg.apis || [];
  $('#apiList').innerHTML = apis.map((x,i)=>`<div class="api-item"><b>${esc(x.provider)}</b><code>••••${esc(x.key.slice(-4))}</code><button type="button" data-rm-api="${i}" title="Remove">${icon('trash')}</button></div>`).join('');
}
function openSettings(){ $('#cmcKey').value=S.cfg.cmcKey||''; $('#apiNewKey').value=''; renderSources(); show('#settings'); }
function saveSettings(e){ e.preventDefault(); S.cfg.cmcKey=$('#cmcKey').value.trim(); save(); renderSources(); hideModal($('#settings')); toast('APIs ✓'); }

/* ---------- csv ---------- */
function openCsvModal(){ show('#csvModal'); }
function exportCsv(){
  const cell=s=>`"${String(s).replace(/"/g,'""')}"`;
  let c='symbol,name,category,units,current_price_usd,average_cost_usd,daily_change_pct,market_value_usd,cost_basis_usd,unrealized_pl_usd,watchlist\n';
  S.assets.forEach(a=>{ c+=[cell(a.symbol),cell(a.name),cell(a.category),a.units,a.price,a.average_cost,a.daily_change_pct,val(a),cost(a),pl(a),a.watchlist].join(',')+'\n'; });
  if(window.webkit?.messageHandlers?.exportCsv){
    window.webkit.messageHandlers.exportCsv.postMessage({filename:'portfolio-deck-export.csv', content:c});
  } else if(window.AndroidBridge?.exportCsv){
    window.AndroidBridge.exportCsv('portfolio-deck-export.csv', c);
  } else {
    const url=URL.createObjectURL(new Blob([c],{type:'text/csv'})), l=document.createElement('a'); l.href=url; l.download='portfolio-deck-export.csv'; l.click(); URL.revokeObjectURL(url);
  }
  toast(`${S.assets.length} ↓`);
}
function parseCsvRows(text){
  const rows=[]; let row=[], val='', inQ=false;
  const s=text.replace(/^\uFEFF/,'');
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(inQ){
      if(ch==='"' && s[i+1]==='"'){ val+='"'; i++; }
      else if(ch==='"'){ inQ=false; }
      else val+=ch;
    }else{
      if(ch==='"') inQ=true;
      else if(ch===','){ row.push(val.trim()); val=''; }
      else if(ch==='\n' || ch==='\r'){
        if(ch==='\r' && s[i+1]==='\n') i++;
        row.push(val.trim());
        if(row.some(x=>x!=='')) rows.push(row);
        row=[]; val='';
      }else val+=ch;
    }
  }
  if(val!=='' || row.length){ row.push(val.trim()); if(row.some(x=>x!=='')) rows.push(row); }
  return rows;
}
function importCsvText(text, replace){
  const rows=parseCsvRows(text);
  if(rows.length<2) return toast('CSV is empty',true);
  const hdr=rows[0].map(h=>h.toLowerCase().replace(/[^a-z0-9_]/g,''));
  const idx=(...names)=>{ for(const n of names){ const k=hdr.indexOf(n); if(k>=0) return k; } return -1; };
  const iSym=idx('symbol','ticker','asset','coin'), iName=idx('name','assetname'), iCat=idx('category','type','class');
  const iUnits=idx('units','amount','quantity','qty','held'), iPrice=idx('current_price_usd','price','currentprice','price_usd');
  const iCost=idx('average_cost_usd','average_cost','avg_cost','cost','buy_price'), iChg=idx('daily_change_pct','change','change_24h','24h');
  const iWatch=idx('watchlist','watch','starred');
  if(iSym<0) return toast('Missing symbol column',true);
  const imported=[];
  for(let r=1;r<rows.length;r++){
    const c=rows[r], sym=(c[iSym]||'').trim().toUpperCase();
    if(!sym) continue;
    const catRaw=(iCat>=0?c[iCat]:'Crypto')||'Crypto';
    const cat=TYPES.find(t=>t.k.toLowerCase()===catRaw.toLowerCase())?.k || (/crypto/i.test(catRaw)?'Crypto':/stock|eq/i.test(catRaw)?'Equity':/etf|fund/i.test(catRaw)?'Fund':/comm|gold|silver|oil/i.test(catRaw)?'Commodity':'Other');
    const num=(i,d=0)=>{ const v=i>=0?parseFloat(String(c[i]).replace(/[$,%\s]/g,'')):NaN; return isFinite(v)?v:d; };
    const units=num(iUnits,0), price=num(iPrice,0), avg=num(iCost,price), chg=num(iChg,0);
    const w=iWatch>=0 && /^(true|1|yes|y)$/i.test(String(c[iWatch]).trim());
    imported.push({
      symbol:sym, name:(iName>=0&&c[iName])?c[iName]:sym, category:cat,
      units, price, average_cost:avg, daily_change_pct:chg,
      coingecko_id:cat==='Crypto'?(CG_IDS[sym]||''):'', watchlist:w
    });
  }
  if(!imported.length) return toast('No valid rows found',true);
  if(replace){ S.assets=[]; S.watch=[]; }
  imported.forEach(item=>{
    if(item.units===0 && item.watchlist){
      const wi=S.watch.findIndex(x=>x.symbol===item.symbol);
      if(wi>=0) S.watch[wi]=item; else S.watch.push(item);
    }else{
      const ai=S.assets.findIndex(x=>x.symbol===item.symbol);
      if(ai>=0) S.assets[ai]=item; else S.assets.push(item);
    }
  });
  normalizeAssets(); save(); S.hist={}; redrawData();
  if(S.page==='portfolio') updateChart(true);
  hideModal($('#csvModal'));
  toast(`${imported.length} ↑`);
  refresh(true);
}

/* ---------- pages / wiring ---------- */
function movePill(){
  const a=$('.rail-btn.active'), p=$('#railPill');
  if(!a||!p) return;
  const horiz=window.innerWidth<=760;
  p.style.transform=horiz?`translateX(${a.offsetLeft}px)`:`translateY(${a.offsetTop}px)`;
}
function moveRange(){ const b=$('#ranges .on'), p=$('.range-ind'); if(!b.offsetWidth) return; p.style.width=b.offsetWidth+'px'; p.style.transform=`translateX(${b.offsetLeft-4}px)`; }
function replay(root){ $$('.reveal',root).forEach(el=>{ el.style.animation='none'; void el.offsetHeight; el.style.animation=''; }); }
function setPage(p){
  S.page=p; $$('.rail-btn[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===p)); movePill();
  $('#pagePortfolio').hidden=p!=='portfolio'; $('#pageWatch').hidden=p!=='watch';
  $('#btnAdd').title=p==='watch'?'Add to watchlist':'Add asset';
  const page=p==='watch'?$('#pageWatch'):$('#pagePortfolio'); replay(page);
  if(p==='watch') renderWatch(true); else { renderRows(true); renderAlloc(true); moveRange(); updateChart(true); }
}
function cycleCur(){
  const idx=CURS.indexOf(S.cfg.cur||'USD');
  S.cfg.cur=CURS[(idx+1)%CURS.length];
  save(); renderHero();
  if(S.ad) renderAssetDetailBody();
}
async function loadServerData(){
  try{
    const ping=await fetch('/api/ping').then(r=>r.ok).catch(()=>false);
    API.proxy=ping;
    if(ping){
      try{ new EventSource('/api/events'); }catch{}
      const d=await fetch('/api/data').then(r=>r.json());
      if(Array.isArray(d.assets)) S.assets=d.assets;
      if(Array.isArray(d.watch)) S.watch=d.watch;
      if(d.cfg && typeof d.cfg==='object') S.cfg=Object.assign({cmcKey:'',apis:[],theme:'dark',cur:'USD'}, d.cfg);
      normalizeAssets();
      renderAll();
    }
  }catch{}
  refresh(true);
}
function init(){
  hydrateIcons();
  const st=document.createElement('style'); st.textContent='@keyframes draw0{to{stroke-dashoffset:0}}'; document.head.appendChild(st);
  $$('.rail-btn[data-page]').forEach(b=>b.onclick=()=>setPage(b.dataset.page));
  $$('#ranges button').forEach(b=>b.onclick=()=>{ $$('#ranges button').forEach(x=>x.classList.toggle('on',x===b)); S.range=b.dataset.r; moveRange(); updateChart(true); });
  $$('#adRanges button').forEach(b=>b.onclick=()=>{ $$('#adRanges button').forEach(x=>x.classList.toggle('on',x===b)); S.adRange=b.dataset.r; updateAssetChart(true); });
  $$('.sort').forEach(b=>b.onclick=()=>{ const k=b.dataset.k; S.sort=S.sort.k===k?{k,dir:-S.sort.dir}:{k,dir:k==='name'?1:-1}; renderRows(false); });
  $('#q').oninput=e=>{ S.q=e.target.value; renderRows(false); renderWatch(false); };
  addEventListener('keydown',e=>{ if(e.key==='/'&&!/INPUT|SELECT/.test(document.activeElement.tagName)){ e.preventDefault(); $('#q').focus(); } if(e.key==='Escape'){ $$('.modal.open').forEach(hideModal); closeAllocOverlay(); closeAssetDetail(); $('#q').blur(); } });
  $('#btnRefresh').onclick=()=>refresh(false);
  $('#btnAdd').onclick=()=>openModal();
  $('#btnExport').onclick=openCsvModal;
  $('#btnCsvExport').onclick=()=>{ exportCsv(); hideModal($('#csvModal')); };
  $('#btnCsvImport').onclick=()=>$('#csvFile').click();
  $('#csvFile').onchange=e=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>importCsvText(String(r.result||''), $('#csvReplace').checked);
    r.readAsText(f);
    e.target.value='';
  };
  $('#btnSettings').onclick=openSettings;
  $('#btnTheme').onclick=()=>{ applyTheme(S.cfg.theme==='dark'?'light':'dark'); save(); };
  $('#btnHide').onclick=()=>{ S.hide=!S.hide; document.body.classList.toggle('blur',S.hide); $('#btnHide').innerHTML=icon(S.hide?'eyeOff':'eye'); };
  $('#btnAllocAll').onclick=openAllocOverlay;
  $('#btnAllocClose').onclick=closeAllocOverlay;
  $('#btnAdClose').onclick=closeAssetDetail;
  $('#total').onclick=cycleCur;
  $('#curPill').onclick=cycleCur;
  $('#btnAddApi').onclick=()=>{
    const provider=$('#apiProvider').value, key=$('#apiNewKey').value.trim();
    if(!key) return toast('Enter API key',true);
    S.cfg.apis = (S.cfg.apis||[]).filter(x=>x.provider!==provider);
    S.cfg.apis.push({provider,key});
    $('#apiNewKey').value=''; save(); renderSources(); toast(provider+' ✓');
  };
  $('#apiList').onclick=e=>{
    const b=e.target.closest('[data-rm-api]'); if(!b) return;
    S.cfg.apis.splice(+b.dataset.rmApi,1); save(); renderSources();
  };
  $$('[data-close]').forEach(el=>el.onclick=()=>hideModal(el.closest('.modal')));
  $('#form').onsubmit=submit; $('#cfgForm').onsubmit=saveSettings;
  $('#rows').onclick=e=>{
    const row=e.target.closest('.tr'); if(!row) return;
    const b=e.target.closest('button[data-a]');
    const i=+row.dataset.i, a=S.assets[i]; if(!a) return;
    if(!b){ openAssetDetail(a,true); return; }
    if(b.dataset.a==='edit') openModal(i);
    if(b.dataset.a==='star'){ a.watchlist=!a.watchlist; save(); b.classList.toggle('starred',a.watchlist); renderStats(); renderWatch(false); }
    if(b.dataset.a==='del'){ row.classList.add('out'); setTimeout(()=>{ S.assets.splice(i,1); save(); S.hist={}; redrawData(); updateChart(true); toast(a.symbol+' ✕'); },420); }
  };
  $('#wrows').onclick=e=>{
    const row=e.target.closest('.tr'); if(!row) return;
    const b=e.target.closest('button[data-a]');
    const i=+row.dataset.i, src=row.dataset.src, a=src==='own'?S.assets[i]:S.watch[i]; if(!a) return;
    if(!b){ openAssetDetail(a,src==='own'); return; }
    const done=()=>{ save(); redrawData(); };
    if(b.dataset.a==='unstar'){ row.classList.add('out'); setTimeout(()=>{ S.assets[i].watchlist=false; done(); },420); }
    if(b.dataset.a==='wdel'){ row.classList.add('out'); setTimeout(()=>{ S.watch.splice(i,1); done(); },420); }
  };
  document.addEventListener('pointermove',e=>{ const c=e.target.closest?.('.glow'); if(c){ const r=c.getBoundingClientRect(); c.style.setProperty('--mx',(e.clientX-r.left)+'px'); c.style.setProperty('--my',(e.clientY-r.top)+'px'); } });
  $$('.magnetic').forEach(m=>{ m.addEventListener('pointermove',e=>{ const r=m.getBoundingClientRect(); m.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.25}px)`; }); m.addEventListener('pointerleave',()=>{ m.style.transition='transform .6s var(--ease)'; m.style.transform=''; setTimeout(()=>m.style.transition='',600); }); });
  addEventListener('pointermove',e=>{ const x=(e.clientX/innerWidth-.5), y=(e.clientY/innerHeight-.5); $$('.orb').forEach((o,i)=>o.style.translate=`${-x*(30+i*18)}px ${-y*(30+i*18)}px`); });
  let rz; addEventListener('resize',()=>{ clearTimeout(rz); rz=setTimeout(()=>{ movePill(); moveRange(); if(S.page==='portfolio'){ drawChart(chartData,$('#est').classList.contains('on'),false); renderAlloc(false); } if($('#allocOverlay').classList.contains('open')) openAllocOverlay(false); if(S.ad) adPts=drawLineChart($('#adChart'),$('#adChartSvg'),adData,$('#adEst'),$('#adEst').classList.contains('on'),false); },120); });
  bindChartHover($('#chart'),$('#cursor'),$('#tip'),()=>chartData,()=>chartPts,()=>S.range,v=>S.hide?'••••••':fmtDisplayCur(conv(v)));
  bindChartHover($('#adChart'),$('#adCursor'),$('#adTip'),()=>adData,()=>adPts,()=>S.adRange,v=>fmtAssetPriceCur(conv(v)));
  renderAll(); movePill(); moveRange();
  loadServerData();
  setInterval(()=>refresh(true),90e3);
}
init();
})();
