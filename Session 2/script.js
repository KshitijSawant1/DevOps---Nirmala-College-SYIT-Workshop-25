// ---------- Helpers ----------
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const el = id => document.getElementById(id);

function hexToRgb(hex){
  hex = hex.trim();
  if(!hex) return null;
  if(hex[0] !== '#') hex = '#' + hex;
  if(hex.length === 4) hex = '#' + [...hex.slice(1)].map(x => x+x).join('');
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if(!m) return null;
  const int = parseInt(m[1], 16);
  return { r: (int>>16)&255, g: (int>>8)&255, b: int&255, hex: '#'+m[1].toLowerCase() };
}
const h2 = n => n.toString(16).padStart(2,'0');
const rgbToHex = ({r,g,b}) => `#${h2(r)}${h2(g)}${h2(b)}`;
const srgbToLinear = c => (c/=255) <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
const luminance = ({r,g,b}) => 0.2126*srgbToLinear(r)+0.7152*srgbToLinear(g)+0.0722*srgbToLinear(b);
const contrastRatio = (fg,bg) => {
  const L1 = luminance(fg), L2 = luminance(bg);
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
};
function rgbToHsl({r,g,b}){
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if(max===min){h=s=0}
  else{
    const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}
    h*=60;
  }
  return {h,s,l};
}
const fmt = (n,d=3)=>Number(n).toFixed(d);
const mixRGB = (a,b,t) => ({
  r: Math.round(a.r*(1-t)+b.r*t),
  g: Math.round(a.g*(1-t)+b.g*t),
  b: Math.round(a.b*(1-t)+b.b*t),
});

// ---------- Elements ----------
const bgPicker = el('bgPicker');
const fgPicker = el('fgPicker');
const bgHex = el('bgHex');
const fgHex = el('fgHex');

// ---------- Theming ----------
function applyTheme(bgHexVal, fgHexVal){
  document.documentElement.style.setProperty('--app-bg', bgHexVal);
  document.documentElement.style.setProperty('--app-fg', fgHexVal);

  const bg = hexToRgb(bgHexVal);
  const fg = hexToRgb(fgHexVal);

  const panel   = mixRGB(bg, fg, 0.16);
  const panel2  = mixRGB(bg, fg, 0.28);
  const border  = mixRGB(bg, fg, 0.55);
  const muted   = mixRGB(fg, bg, 0.55);

  document.documentElement.style.setProperty('--surface',   rgbToHex(panel));
  document.documentElement.style.setProperty('--surface-2', rgbToHex(panel2));
  document.documentElement.style.setProperty('--border',    rgbToHex(border));
  document.documentElement.style.setProperty('--muted',     rgbToHex(muted));

  el('sw-bg').style.background = bgHexVal;
  el('sw-fg').style.background = fgHexVal;
  el('chip-bg').style.background = rgbToHex(panel2);
  el('chip-fg').style.background = rgbToHex(panel2);
  el('lg-bg').style.background = bgHexVal;
  el('lg-fg').style.background = fgHexVal;

  const card = el('ui-normal');
  card.style.background = bgHexVal;
  card.style.color = fgHexVal;
  card.style.borderColor = rgbToHex(border);

  el('btnPrimary').style.background = fgHexVal;
  el('btnPrimary').style.color = bgHexVal;
  el('btnPrimary').style.borderColor = fgHexVal;

  el('btnSecondary').style.borderColor = fgHexVal;
  el('btnSecondary').style.color = fgHexVal;

  el('btnGhost').style.color = fgHexVal;
  el('demoLink').style.color = fgHexVal;

  const donut = el('donut');
  donut.querySelector('circle').setAttribute('fill', bgHexVal);
  donut.querySelector('text').setAttribute('fill', fgHexVal);
}

// ---------- Contrast display ----------
function badges({ratio}){
  const pf = el('pf');
  pf.innerHTML = '';
  const items = [
    {label:'AA Normal', pass: ratio >= 4.5},
    {label:'AA Large', pass: ratio >= 3.0},
    {label:'AAA Normal', pass: ratio >= 7.0},
    {label:'AAA Large', pass: ratio >= 4.5},
  ];
  const frag = document.createDocumentFragment();
  items.forEach(i => {
    const b = document.createElement('div');
    b.className = 'badge ' + (i.pass ? 'ok' : 'bad');
    b.textContent = i.label + ' ' + (i.pass ? 'PASS' : 'FAIL');
    frag.appendChild(b);
  });
  pf.appendChild(frag);

  const status = el('status-badges');
  status.innerHTML = '';
  const overall = document.createElement('div');
  overall.className = 'badge ' + (ratio >= 4.5 ? 'ok' : ratio >= 3 ? 'warn' : 'bad');
  overall.textContent = 'Contrast ' + fmt(ratio,2) + ':1';
  status.appendChild(overall);
}

function renderCssOutput(bg, fg){
  const css = `:root {
  --color-bg: ${bg};
  --color-fg: ${fg};
}

/* Normal theme */
.theme-1 { color: var(--color-fg); background-color: var(--color-bg); }

/* Inverse theme */
.theme-2 { color: var(--color-bg); background-color: var(--color-fg); }`;
  el('cssOut').textContent = css;
}

// suggestions grid
function hslToRgb(h, s, l){
  h = (h%360 + 360)%360; s=clamp(s,0,1); l=clamp(l,0,1);
  if(s===0){ const t=Math.round(l*255); return {r:t,g:t,b:t} }
  const q = l < 0.5 ? l*(1+s) : l + s - l*s;
  const p = 2*l - q;
  const hk = h/360;
  const tc = [hk+1/3, hk, hk-1/3].map(t => (t%1+1)%1);
  const f = t => t<1/6 ? p+(q-p)*6*t : t<1/2 ? q : t<2/3 ? p+(q-p)*(2/3-t)*6 : p;
  return { r:Math.round(f(tc[0])*255), g:Math.round(f(tc[1])*255), b:Math.round(f(tc[2])*255) };
}
function renderSuggestions(bgRGB, fgRGB){
  const container = el('suggestions');
  container.innerHTML='';
  const {h,s,l} = rgbToHsl(fgRGB);
  const bgHexCode = rgbToHex(bgRGB);
  for(let i=-5;i<=5;i++){
    const cand = hslToRgb(h, s, clamp(l + i*0.05, 0, 1));
    const ratio = contrastRatio(cand, bgRGB);
    const mini = document.createElement('div');
    mini.className = 'mini ' + (ratio>=4.5 ? 'pass' : '');
    mini.style.background = `linear-gradient(90deg, ${bgHexCode} 50%, ${rgbToHex(cand)} 50%)`;
    mini.dataset.ok = ratio>=4.5 ? 'PASS' : '';
    container.appendChild(mini);
  }
}

// ---------- Favorites ----------
const FAV_KEY = 'colorComboLab.favorites';
const loadFavs = () => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
};
function saveFav(){
  const bg = bgHex.value.toLowerCase();
  const fg = fgHex.value.toLowerCase();
  let favs = loadFavs();
  const key = `${bg}_${fg}`;
  if(!favs.find(f => f.key === key)){
    favs.unshift({ key, bg, fg, savedAt: new Date().toISOString() });
    if(favs.length > 20) favs = favs.slice(0, 20);
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  }
  const btn = el('cavedFav');
  const prev = btn.textContent;
  btn.textContent = 'Saved!';
  btn.disabled = true;
  setTimeout(()=>{ btn.textContent = prev; btn.disabled = false; }, 900);
  renderFavs();
}
function renderFavs(){
  const list = el('favList');
  if(!list) return;
  const favs = loadFavs();
  list.innerHTML = '';
  if(favs.length === 0){
    const empty = document.createElement('div');
    empty.className = 'tile';
    empty.textContent = 'No favorites yet. Click “Caved Fav” to save the current pair.';
    list.appendChild(empty);
    return;
  }
  favs.forEach(f => {
    const tile = document.createElement('div');
    tile.className = 'mini fav';
    tile.style.background = `linear-gradient(90deg, ${f.bg} 50%, ${f.fg} 50%)`;
    tile.title = `${f.bg} + ${f.fg}`;
    tile.dataset.bg = f.bg; tile.dataset.fg = f.fg;

    const del = document.createElement('button');
    del.className = 'del ring';
    del.type = 'button';
    del.title = 'Remove favorite';
    del.textContent = '×';
    tile.appendChild(del);

    list.appendChild(tile);
  });
}
// click-to-apply or delete (event delegation)
document.addEventListener('click', (e) => {
  const delBtn = e.target.closest('.mini .del');
  if(delBtn){
    const tile = delBtn.parentElement;
    let favs = loadFavs().filter(f => !(f.bg===tile.dataset.bg && f.fg===tile.dataset.fg));
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    renderFavs();
    return;
  }
  const tile = e.target.closest('.mini.fav');
  if(tile){
    bgHex.value = tile.dataset.bg;
    fgHex.value = tile.dataset.fg;
    update();
  }
});

// ---------- Actions ----------
function copyCss(){
  navigator.clipboard.writeText(el('cssOut').textContent).then(() => {
    const btn = el('copyCss'); const prev = btn.textContent;
    btn.textContent = 'Copied!'; setTimeout(()=> btn.textContent = prev, 1200);
  });
}
function randomHex(){ const r=()=>Math.floor(Math.random()*256); return rgbToHex({r:r(), g:r(), b:r()}); }
function randomize(){ bgHex.value = randomHex(); fgHex.value = randomHex(); update(); }
function swap(){ const b = bgHex.value; bgHex.value = fgHex.value; fgHex.value = b; update(); }
function suggestFG(){
  const bg = hexToRgb(bgHex.value);
  const black = {r:0,g:0,b:0}, white = {r:255,g:255,b:255};
  const chosen = contrastRatio(black,bg) > contrastRatio(white,bg) ? black : white;
  const {h,s,l} = rgbToHsl(chosen);
  const nudged = hslToRgb(h, s, chosen===black ? 0.06 : 0.94);
  fgHex.value = rgbToHex(nudged); update();
}

// ---------- Update ----------
function update(){
  const bg = hexToRgb(bgHex.value);
  const fg = hexToRgb(fgHex.value);
  if(!bg || !fg) return;

  bgPicker.value = bg.hex;
  fgPicker.value = fg.hex;

  applyTheme(bg.hex, fg.hex);

  const Lbg = luminance(bg);
  const Lfg = luminance(fg);
  const ratio = contrastRatio(fg, bg);
  el('ratio').textContent = `${fmt(ratio,2)}:1`;
  el('lumFg').textContent = fmt(Lfg,6);
  el('lumBg').textContent = fmt(Lbg,6);
  el('lumDelta').textContent = fmt(Math.abs(Lfg - Lbg),6);

  badges({ratio});
  renderCssOutput(bg.hex, fg.hex);
  renderSuggestions(bg, fg);

  try { localStorage.setItem('colorComboLab', JSON.stringify({bg:bg.hex, fg:fg.hex})); } catch {}
}

// ---------- Bindings ----------
bgPicker.addEventListener('input', e => { bgHex.value = e.target.value; update(); });
fgPicker.addEventListener('input', e => { fgHex.value = e.target.value; update(); });
bgHex.addEventListener('input', e => { if(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e.target.value)) update(); });
fgHex.addEventListener('input', e => { if(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e.target.value)) update(); });

el('swap').addEventListener('click', swap);
el('randomize').addEventListener('click', randomize);
el('copyCss').addEventListener('click', copyCss);
el('bgAuto').addEventListener('click', suggestFG);
el('cavedFav').addEventListener('click', saveFav);

// ---------- Init ----------
(function init(){
  const url = new URL(location.href);
  const bgQ = url.searchParams.get('bg'), fgQ = url.searchParams.get('fg');
  if(bgQ && fgQ){ bgHex.value = '#'+bgQ; fgHex.value = '#'+fgQ; }
  else {
    try{
      const last = JSON.parse(localStorage.getItem('colorComboLab')||'{}');
      if(last.bg && last.fg){ bgHex.value = last.bg; fgHex.value = last.fg; }
    } catch {}
  }
  bgPicker.value = bgHex.value; fgPicker.value = fgHex.value;
  update();
  renderFavs(); // <- show saved favorites on load
})();
