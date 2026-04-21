// 🏙️ MtBank City — ПОЛНАЯ ВЕРСИЯ СО ВСЕМИ 15 ЗДАНИЯМИ
console.log('🚀 city-game.js загружается...');

// ========== КОНФИГУРАЦИЯ ВСЕХ 15 ЗДАНИЙ ==========
const DEFS = [
  // КАТЕГОРИЯ 1 — СТАРТОВЫЕ (дешёвые)
  {id:'cafe', name:'Кофейня', cat:'⭐ Старт', inc:6, uc:80, maxLv:5, bc:50, bg:'#fff4e0', sprite:'cafe.png'},
  {id:'flower', name:'Цветочный', cat:'⭐ Старт', inc:5, uc:70, maxLv:5, bc:45, bg:'#ffe0f0', sprite:'flower.png'},
  {id:'minimarket', name:'Мини-маркет', cat:'⭐ Старт', inc:7, uc:90, maxLv:5, bc:60, bg:'#e0ffe0', sprite:'minimarket.png'},
  {id:'foodtruck', name:'Фудтрак', cat:'⭐ Старт', inc:8, uc:85, maxLv:5, bc:55, bg:'#ffe8d0', sprite:'foodtruck.png'},
  {id:'icecream', name:'Мороженое', cat:'⭐ Старт', inc:6, uc:75, maxLv:5, bc:40, bg:'#e0f0ff', sprite:'icecream.png'},
  
  // КАТЕГОРИЯ 2 — СРЕДНИЕ
  {id:'restaurant', name:'Ресторан', cat:'🏢 Средний', inc:18, uc:200, maxLv:5, bc:180, bg:'#f0e0e0', sprite:'restaurant.png'},
  {id:'store', name:'Магазин', cat:'🏢 Средний', inc:15, uc:170, maxLv:5, bc:150, bg:'#e0e0ff', sprite:'store.png'},
  {id:'autoservice', name:'Автосервис', cat:'🏢 Средний', inc:20, uc:220, maxLv:5, bc:200, bg:'#d0d0d0', sprite:'autoservice.png'},
  {id:'itoffice', name:'ИТ-офис', cat:'🏢 Средний', inc:22, uc:250, maxLv:5, bc:220, bg:'#c0e0ff', sprite:'itoffice.png'},
  {id:'gasstation', name:'Заправка', cat:'🏢 Средний', inc:17, uc:190, maxLv:5, bc:170, bg:'#ffe0c0', sprite:'gasstation.png'},
  
  // КАТЕГОРИЯ 3 — ЭЛИТНЫЕ
  {id:'bank', name:'Банк', cat:'🏦 Элит', inc:45, uc:400, maxLv:5, bc:500, bg:'#e0eeff', sprite:'bank.png'},
  {id:'cinema', name:'Кинотеатр', cat:'🏦 Элит', inc:50, uc:450, maxLv:5, bc:550, bg:'#e0d0ff', sprite:'cinema.png'},
  {id:'construction', name:'Стройка', cat:'🏦 Элит', inc:55, uc:500, maxLv:5, bc:600, bg:'#ffe8a0', sprite:'construction.png'},
  {id:'warehouse', name:'Склад', cat:'🏦 Элит', inc:40, uc:380, maxLv:5, bc:450, bg:'#d0c0a0', sprite:'warehouse.png'},
  {id:'mall', name:'ТЦ', cat:'🏦 Элит', inc:60, uc:550, maxLv:5, bc:700, bg:'#ffd0e0', sprite:'mall.png'}
];

const DM = {};
DEFS.forEach(d => DM[d.id] = d);

// Категории для фильтрации
const CATEGORIES = {
  starter: DEFS.slice(0, 5),
  medium: DEFS.slice(5, 10),
  elite: DEFS.slice(10, 15)
};

// Путь к спрайтам
const SPRITE_PATH = 'assets/sprites/buildings/';

// Глобальные переменные
let cityCoins = 1500, cityLevel = 1, selectedKey = null, pendingTile = null;
const buildings = {};
const GRID = 5;
let isoContainer, coinDisplay, levelDisplay, tileElements = {}, popupOverlay, buildOverlay, notifEl, notifyTimeout;
let currentCategory = 'starter';

// ========== ФУНКЦИИ ДЛЯ PNG СПРАЙТОВ ==========
function getBldSpriteHTML(id, level) {
  const def = DM[id];
  if (!def) return '';
  
  const spritePath = SPRITE_PATH + def.sprite;
  const scale = 0.85 + (level * 0.04);
  const size = Math.floor(60 * scale);
  
  return `
    <div style="position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:${size}px;height:${size}px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;pointer-events:none;filter:drop-shadow(0 6px 4px rgba(0,0,0,0.35));">
      <img src="${spritePath}" alt="${def.name}" style="width:100%;height:100%;object-fit:contain;image-rendering:crisp-edges;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="display:none;width:100%;height:100%;background:${def.bg};border-radius:8px;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#333;border:2px dashed #999;">${def.name.charAt(0)}</div>
      <div style="margin-top:2px;background:rgba(0,0,0,0.6);color:#fff;padding:2px 6px;border-radius:12px;font-size:9px;font-weight:bold;white-space:nowrap;">Lv.${level}</div>
    </div>
  `;
}

function getPreviewSpriteHTML(id) {
  const def = DM[id];
  if (!def) return '';
  
  return `
    <div style="width:70px;height:70px;display:flex;align-items:center;justify-content:center;">
      <img src="${SPRITE_PATH}${def.sprite}" alt="${def.name}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 4px 4px rgba(0,0,0,0.3));" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="display:none;width:100%;height:100%;background:${def.bg};border-radius:12px;align-items:center;justify-content:center;font-size:32px;font-weight:bold;color:#555;">${def.name.charAt(0)}</div>
    </div>
  `;
}

// ========== ПЛИТКА ==========
function tileBg(r, c) {
  const sh = (r + c) % 2 === 0 ? '#72c85a' : '#68ba50';
  const lsh = '#50a038', rsh = '#427828';
  
  return `
    <svg viewBox="0 0 72 64" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:72px;height:64px;pointer-events:none">
      <polygon points="36,1 71,19 36,37 1,19" fill="${sh}" stroke="#58a840" stroke-width="0.8"/>
      <polygon points="1,19 36,37 36,52 1,34" fill="${lsh}"/>
      <polygon points="36,37 71,19 71,34 36,52" fill="${rsh}"/>
    </svg>
  `;
}

function makeTile(r, c) {
  const key = `${r},${c}`;
  const b = buildings[key];
  const d = b ? DM[b.id] : null;
  
  const bldHTML = b ? getBldSpriteHTML(b.id, b.lv) : `
    <div style="position:absolute;top:5px;left:12px;width:48px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:rgba(255,255,255,.18);border:2px dashed rgba(255,255,255,.55);font-size:18px;color:rgba(255,255,255,.75);">+</div>
  `;
  
  const bub = b ? `<div class="city-bubble" id="bub-${key}">🪙+${d.inc * b.lv}/ч</div>` : '';
  const dot = b ? `<div class="city-dot" id="dot-${key}"></div>` : '';
  
  return tileBg(r, c) + bub + dot + bldHTML;
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========
function loadBuildings() {
  const saved = localStorage.getItem('mtbank_city_buildings');
  if (saved) {
    Object.assign(buildings, JSON.parse(saved));
  } else {
    // Стартовые здания
    [
      {r:0,c:1,id:'cafe'},{r:0,c:3,id:'flower'},{r:1,c:2,id:'restaurant'},
      {r:2,c:0,id:'bank'},{r:2,c:4,id:'cinema'},{r:3,c:2,id:'minimarket'},
      {r:4,c:1,id:'itoffice'},{r:4,c:3,id:'mall'}
    ].forEach(b => { buildings[`${b.r},${b.c}`] = {id:b.id, lv:1, acc:0, tick:Date.now()}; });
  }
  
  const user = window.getCurrentUser?.();
  if (user) { cityCoins = user.balanceMtBanks || 1500; updateCoins(); }
}

function saveBuildings() { localStorage.setItem('mtbank_city_buildings', JSON.stringify(buildings)); }

function renderGrid() {
  if (!isoContainer) return;
  
  const container = isoContainer.parentElement;
  const containerWidth = container.clientWidth;
  const scale = Math.min(1, containerWidth / 500);
  const TW = 90 * scale, TH = 48 * scale;
  
  const CW = GRID * TW, CH = GRID * (TH / 2) + TH + 80 * scale;
  isoContainer.style.width = CW + 'px';
  isoContainer.style.height = CH + 'px';
  isoContainer.innerHTML = '';
  tileElements = {};
  
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const sx = (c - r) * (TW / 2) + CW / 2 - TW / 2;
      const sy = (c + r) * (TH / 2) + 20 * scale;
      const key = `${r},${c}`;
      
      const div = document.createElement('div');
      div.className = 'city-tile';
      div.style.cssText = `left:${sx}px;top:${sy}px;width:${72*scale}px;height:${64*scale}px;transform:scale(${scale});transform-origin:top left;`;
      div.innerHTML = makeTile(r, c);
      div.onclick = () => onTileClick(r, c);
      
      isoContainer.appendChild(div);
      tileElements[key] = div;
    }
  }
  
  initBubbles(); updateDots();
}

function initBubbles() {
  Object.keys(buildings).forEach(k => {
    const el = document.getElementById('bub-' + k);
    if (el) setTimeout(() => el.classList.add('visible'), 400 + Math.random() * 500);
  });
}

function updateDots() {
  Object.entries(buildings).forEach(([k, b]) => {
    const d = document.getElementById('dot-' + k);
    if (d) d.style.display = b.acc >= 1 ? 'block' : 'none';
  });
}

function tickBuildings() {
  const now = Date.now();
  Object.entries(buildings).forEach(([k, b]) => {
    const d = DM[b.id];
    if (d) b.acc += d.inc * b.lv * ((now - b.tick) / 3600000);
    b.tick = now;
  });
  saveBuildings();
}

function refreshTile(key) {
  const [r, c] = key.split(',').map(Number);
  if (tileElements[key]) tileElements[key].innerHTML = makeTile(r, c);
  const el = document.getElementById('bub-' + key);
  if (el) setTimeout(() => el.classList.add('visible'), 250);
  updateDots();
}

function onTileClick(r, c) {
  const key = `${r},${c}`;
  buildings[key] ? openPopup(key) : (pendingTile = key, openBuildMenu());
}

function openPopup(key) {
  selectedKey = key;
  const b = buildings[key], d = DM[b.id];
  
  document.getElementById('popup-name').textContent = d.name + ' Lv' + b.lv;
  document.getElementById('popup-type').textContent = d.cat;
  document.getElementById('popup-income').textContent = (d.inc * b.lv) + ' MtB/ч';
  document.getElementById('popup-acc').textContent = Math.floor(b.acc) + ' MtB';
  document.getElementById('popup-level').textContent = b.lv;
  document.getElementById('popup-upcost').textContent = b.lv >= d.maxLv ? 'МАКС' : d.uc * b.lv + ' MtB';
  document.getElementById('popup-progress').style.width = (b.lv / d.maxLv * 100) + '%';
  document.getElementById('popup-progress-text').textContent = `Уровень ${b.lv} / ${d.maxLv}`;
  
  const preview = document.getElementById('popup-preview');
  preview.style.background = d.bg;
  preview.innerHTML = getPreviewSpriteHTML(b.id);
  
  document.getElementById('popup-collect').disabled = b.acc < 1;
  document.getElementById('popup-upgrade').disabled = b.lv >= d.maxLv || cityCoins < d.uc * b.lv;
  
  popupOverlay.classList.add('open');
}

function openBuildMenu() {
  const grid = document.getElementById('build-grid');
  const categoryTabs = document.getElementById('build-categories');
  
  const renderCategory = (cat) => {
    currentCategory = cat;
    grid.innerHTML = '';
    
    // Обновляем активный таб
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.cat === cat);
    });
    
    const buildingsList = CATEGORIES[cat] || DEFS;
    buildingsList.forEach(d => {
      const div = document.createElement('div');
      div.className = 'build-item';
      div.innerHTML = `
        <div style="width:58px;height:65px;position:relative;overflow:visible">${getPreviewSpriteHTML(d.id)}</div>
        <div class="build-item-name">${d.name}</div>
        <div class="build-item-cost">🪙${d.bc}</div>
      `;
      
      div.onclick = () => {
        if (!pendingTile) { notify('Нажми на пустую клетку'); closeBuildMenu(); return; }
        if (buildings[pendingTile]) { notify('Клетка занята!'); return; }
        if (cityCoins < d.bc) { notify('Недостаточно MtB!'); return; }
        
        cityCoins -= d.bc;
        buildings[pendingTile] = {id: d.id, lv: 1, acc: 0, tick: Date.now()};
        refreshTile(pendingTile); updateCoins(); saveBuildings(); syncBalance(); burst();
        notify(`${d.name} построена! 🏗`);
        pendingTile = null; closeBuildMenu(); updateCityLevel();
      };
      
      grid.appendChild(div);
    });
  };
  
  // Создаём табы если их нет
  if (!categoryTabs) {
    const tabsDiv = document.createElement('div');
    tabsDiv.id = 'build-categories';
    tabsDiv.style.cssText = 'display:flex;gap:5px;margin-bottom:12px';
    tabsDiv.innerHTML = `
      <button class="category-tab active" data-cat="starter" style="flex:1;padding:8px;border:none;border-radius:20px;background:#7dbe9e;color:#1a3a2e;font-weight:bold;cursor:pointer;box-shadow:0 3px 0 #4a7a62;">⭐ Старт</button>
      <button class="category-tab" data-cat="medium" style="flex:1;padding:8px;border:none;border-radius:20px;background:#b8a07c;color:#1a3a2e;font-weight:bold;cursor:pointer;box-shadow:0 3px 0 #8a7050;">🏢 Средние</button>
      <button class="category-tab" data-cat="elite" style="flex:1;padding:8px;border:none;border-radius:20px;background:#d4af37;color:#1a3a2e;font-weight:bold;cursor:pointer;box-shadow:0 3px 0 #a08020;">🏦 Элит</button>
    `;
    const menuHeader = document.querySelector('.build-menu div');
    menuHeader.parentNode.insertBefore(tabsDiv, grid);
    
    tabsDiv.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        renderCategory(tab.dataset.cat);
      });
    });
  }
  
  renderCategory('starter');
  buildOverlay.classList.add('open');
}

function closeBuildMenu() { buildOverlay.classList.remove('open'); pendingTile = null; }
function closePopup() { popupOverlay.classList.remove('open'); selectedKey = null; }

function collectFromPopup() {
  if (!selectedKey) return;
  const b = buildings[selectedKey], amt = Math.floor(b.acc);
  if (amt < 1) return;
  
  b.acc -= amt; cityCoins += amt; updateCoins(); syncBalance(); floatCoin(amt);
  notify(`+${amt} MtB собрано! 💰`);
  openPopup(selectedKey); updateCityLevel(); saveBuildings();
}

function upgradeFromPopup() {
  if (!selectedKey) return;
  const b = buildings[selectedKey], d = DM[b.id];
  if (b.lv >= d.maxLv) return;
  const cost = d.uc * b.lv;
  if (cityCoins < cost) { notify('Недостаточно MtB!'); return; }
  
  cityCoins -= cost; b.lv++; updateCoins(); syncBalance(); refreshTile(selectedKey); burst();
  notify(`${d.name} улучшен до Lv${b.lv}! ⬆`);
  openPopup(selectedKey); saveBuildings();
}

function collectAll() {
  let tot = 0;
  Object.entries(buildings).forEach(([k, b]) => { const a = Math.floor(b.acc); if (a > 0) { b.acc -= a; tot += a; } });
  if (tot > 0) { cityCoins += tot; updateCoins(); syncBalance(); floatCoin(tot); notify(`Собрано +${tot} MtB! 💰`); updateCityLevel(); saveBuildings(); }
  else notify('Пока нечего собирать...');
}

function showStats() {
  let inc = 0;
  Object.values(buildings).forEach(b => { const d = DM[b.id]; if (d) inc += d.inc * b.lv; });
  notify(`Доход: ${inc} MtB/ч | Зданий: ${Object.keys(buildings).length}`);
}

function updateCityLevel() {
  const n = Math.max(1, Math.floor(Object.keys(buildings).length / 3) + 1);
  if (n > cityLevel) { cityLevel = n; levelDisplay.textContent = cityLevel; notify('Город вырос! Lv' + cityLevel + ' 🌟'); burst(); }
}

function updateCoins() { if (coinDisplay) coinDisplay.textContent = cityCoins.toLocaleString(); }

function syncBalance() {
  const user = window.getCurrentUser?.();
  if (user) { user.balanceMtBanks = cityCoins; const users = window.loadAllUsers?.(); if (users) { users[user.id] = user; window.saveAllUsers?.(users); } window.balanceMtBanks = cityCoins; window.syncBalancesToDom?.(); }
}

function notify(msg) {
  if (!notifEl) return;
  notifEl.textContent = msg; notifEl.classList.add('show');
  clearTimeout(notifyTimeout); notifyTimeout = setTimeout(() => notifEl.classList.remove('show'), 2400);
}

function floatCoin(amt) {
  const el = document.createElement('div'); el.className = 'city-float-coin'; el.textContent = '+' + amt + ' MtB';
  el.style.cssText = `left:${window.innerWidth/2-30}px;top:${window.innerHeight*.44}px`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 960);
}

function burst() {
  ['⭐','✨','🌟'].forEach((s, i) => {
    const el = document.createElement('div'); el.className = 'city-sparkle'; el.textContent = s;
    el.style.cssText = `left:${window.innerWidth/2-16+i*20}px;top:${window.innerHeight*.28}px`;
    document.body.appendChild(el); setTimeout(() => el.remove(), 680);
  });
}

function bindEvents() {
  document.getElementById('city-stats-btn')?.addEventListener('click', showStats);
  document.getElementById('city-build-btn')?.addEventListener('click', () => { pendingTile = null; openBuildMenu(); });
  document.getElementById('city-collect-all-btn')?.addEventListener('click', collectAll);
  document.getElementById('popup-close-btn')?.addEventListener('click', closePopup);
  document.getElementById('popup-collect')?.addEventListener('click', collectFromPopup);
  document.getElementById('popup-upgrade')?.addEventListener('click', upgradeFromPopup);
  popupOverlay?.addEventListener('click', e => { if (e.target === popupOverlay) closePopup(); });
  buildOverlay?.addEventListener('click', e => { if (e.target === buildOverlay) closeBuildMenu(); });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
window.initCity = function() {
  console.log('🏗 initCity запущен');
  const panel = document.getElementById('panel-game');
  if (!panel) return;
  
  panel.innerHTML = `
    <div class="city-game-wrap" style="height:100%;display:flex;flex-direction:column;">
      <div class="city-bg"></div>
      <div class="city-hud">
        <div class="city-coins"><div class="coin-icon">M</div><span id="city-coin-display">1500</span></div>
        <div class="city-title">🏙 MtBank City</div>
        <div class="city-level">Lv.<span id="city-level-display">1</span></div>
      </div>
      <div class="city-game-area" style="flex:1;display:flex;align-items:center;justify-content:center;overflow:visible;min-height:0;">
        <div id="city-iso" style="position:relative;"></div>
      </div>
      <div class="city-bar">
        <button class="city-bar-btn" id="city-stats-btn"><span class="city-bar-icon">📊</span><span class="city-bar-label">Статы</span></button>
        <button class="city-bar-btn primary" id="city-build-btn"><span class="city-bar-icon">🏗</span><span class="city-bar-label">Строить</span></button>
        <button class="city-bar-btn" id="city-collect-all-btn"><span class="city-bar-icon">💰</span><span class="city-bar-label">Собрать</span></button>
      </div>
    </div>
    <div class="city-popup-overlay" id="city-popup"><div class="city-popup"><div class="popup-header"><div><div class="popup-name" id="popup-name">Здание</div><div class="popup-type" id="popup-type">Тип</div></div><button class="popup-close" id="popup-close-btn">✕</button></div><div class="popup-preview" id="popup-preview"></div><div class="popup-progress-bar"><div class="popup-progress" id="popup-progress" style="width:20%"></div></div><div class="popup-progress-text" id="popup-progress-text">Уровень 1 / 5</div><div class="popup-stats"><div class="stat-card"><div class="stat-label">Доход/час</div><div class="stat-value gold" id="popup-income">5 MtB</div></div><div class="stat-card"><div class="stat-label">Накоплено</div><div class="stat-value gold" id="popup-acc">0 MtB</div></div><div class="stat-card"><div class="stat-label">Уровень</div><div class="stat-value" id="popup-level">1</div></div><div class="stat-card"><div class="stat-label">Апгрейд</div><div class="stat-value gold" id="popup-upcost">100 MtB</div></div></div><div class="popup-buttons"><button class="btn-collect" id="popup-collect">💰 Забрать</button><button class="btn-upgrade" id="popup-upgrade">⬆ Улучшить</button></div></div></div>
    <div class="build-overlay" id="build-overlay"><div class="build-menu"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><div style="font-family:'Nunito',sans-serif;font-size:17px;font-weight:900;color:#152a20">Выберите здание</div><button class="popup-close" id="build-close-btn">✕</button></div><div class="build-grid" id="build-grid"></div></div></div>
    <div class="city-notif" id="city-notif"></div>
  `;
  
  coinDisplay = document.getElementById('city-coin-display');
  levelDisplay = document.getElementById('city-level-display');
  isoContainer = document.getElementById('city-iso');
  popupOverlay = document.getElementById('city-popup');
  buildOverlay = document.getElementById('build-overlay');
  notifEl = document.getElementById('city-notif');
  
  loadBuildings();
  renderGrid();
  bindEvents();
  updateCoins();
  
  // Добавляем кнопку закрытия для меню постройки
  document.getElementById('build-close-btn')?.addEventListener('click', closeBuildMenu);
  
  setInterval(() => { tickBuildings(); updateDots(); }, 3000);
  setInterval(updateDots, 700);
  
  // Ресайз при изменении окна
  window.addEventListener('resize', () => { if (isoContainer) renderGrid(); });
  
  console.log('✅ Город отрисован со всеми 15 зданиями');
};

// Запуск
var waitInterval = setInterval(function() {
  var panel = document.getElementById('panel-game');
  if (panel) {
    clearInterval(waitInterval);
    console.log('🚀 Запускаем город');
    window.initCity();
  }
}, 300);

console.log('✅ city-game.js загружен (15 зданий, 3 категории)');