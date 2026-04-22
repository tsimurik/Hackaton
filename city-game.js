// 🏙️ MtBank City — ИЗОМЕТРИЧЕСКАЯ ВЕРСИЯ (исправленная)
console.log('🚀 city-game.js загружается...');

// ========== КОНФИГУРАЦИЯ ==========
const DEFS = [
  {id:'cafe', name:'Кофейня', cat:'⭐ Старт', inc:50, uc:100, maxLv:5, bc:100, bg:'#fff4e0', sprite:'cafe.png', unlockLevel:1},
  {id:'flower', name:'Цветочный', cat:'⭐ Старт', inc:55, uc:110, maxLv:5, bc:110, bg:'#ffe0f0', sprite:'flower.png', unlockLevel:1},
  {id:'minimarket', name:'Мини-маркет', cat:'⭐ Старт', inc:45, uc:90, maxLv:5, bc:90, bg:'#e0ffe0', sprite:'minimarket.png', unlockLevel:1},
  {id:'foodtruck', name:'Фудтрак', cat:'⭐ Старт', inc:48, uc:95, maxLv:5, bc:95, bg:'#ffe8d0', sprite:'foodtruck.png', unlockLevel:1},
  {id:'icecream', name:'Мороженое', cat:'⭐ Старт', inc:42, uc:85, maxLv:5, bc:85, bg:'#e0f0ff', sprite:'icecream.png', unlockLevel:1},
  {id:'restaurant', name:'Ресторан', cat:'🏢 Средний', inc:100, uc:250, maxLv:5, bc:250, bg:'#f0e0e0', sprite:'restaurant.png', unlockLevel:2},
  {id:'store', name:'Магазин', cat:'🏢 Средний', inc:110, uc:280, maxLv:5, bc:280, bg:'#e0e0ff', sprite:'store.png', unlockLevel:2},
  {id:'autoservice', name:'Автосервис', cat:'🏢 Средний', inc:120, uc:300, maxLv:5, bc:300, bg:'#d0d0d0', sprite:'autoservice.png', unlockLevel:2},
  {id:'itoffice', name:'ИТ-офис', cat:'🏢 Средний', inc:140, uc:350, maxLv:5, bc:350, bg:'#c0e0ff', sprite:'itoffice.png', unlockLevel:2},
  {id:'gasstation', name:'Заправка', cat:'🏢 Средний', inc:115, uc:290, maxLv:5, bc:290, bg:'#ffe0c0', sprite:'gasstation.png', unlockLevel:2},
  {id:'business', name:'Бизнес-центр', cat:'🏦 Элит', inc:500, uc:1200, maxLv:5, bc:1200, bg:'#e0eeff', sprite:'business-center.png', unlockLevel:3},
  {id:'cinema', name:'Кинотеатр', cat:'🏦 Элит', inc:350, uc:800, maxLv:5, bc:800, bg:'#e0d0ff', sprite:'cinema.png', unlockLevel:3},
  {id:'construction', name:'Стройка', cat:'🏦 Элит', inc:320, uc:750, maxLv:5, bc:750, bg:'#ffe8a0', sprite:'construction.png', unlockLevel:3},
  {id:'warehouse', name:'Склад', cat:'🏦 Элит', inc:250, uc:600, maxLv:5, bc:600, bg:'#d0c0a0', sprite:'warehouse.png', unlockLevel:3},
  {id:'mall', name:'ТЦ', cat:'🏦 Элит', inc:450, uc:1100, maxLv:5, bc:1100, bg:'#ffd0e0', sprite:'mall.png', unlockLevel:3}
];

const TOWNHALL_DEF = {id:'bank', name:'🏦 МТБанк', cat:'👑 Ратуша', inc:0, uc:0, maxLv:3, bc:0, bg:'#f5e6a0', sprite:'bank.png'};

const DM = {};
DEFS.forEach(d => DM[d.id] = d);
DM['bank'] = TOWNHALL_DEF;

const CATEGORIES = {
  starter: DEFS.slice(0, 5),
  medium: DEFS.slice(5, 10),
  elite: DEFS.slice(10, 15)
};

const SPRITE_PATH = 'assets/sprites/buildings/';
const GRID = 5;

let cityCoins = 0, citySkillPoints = 0, cityBankLevel = 1, cityLevel = 1, selectedKey = null, pendingTile = null;
const buildings = {};
let isoContainer, coinDisplay, levelDisplay, skillDisplay, bankLevelDisplay, tileElements = {}, popupOverlay, buildOverlay, notifEl, notifyTimeout;
let currentCategory = 'starter';
let cameraZoom = 1.3;
let cameraX = 0, cameraY = 0;
let isDragging = false, hasMoved = false;
let dragStartX = 0, dragStartY = 0;
let dragCameraStartX = 0, dragCameraStartY = 0;
let buildModeActive = false;

// ========== ЗАГРУЗКА ДАННЫХ ИЗ ПРОФИЛЯ ==========
function loadFromProfile() {
  console.log("📂 Загрузка данных из профиля...");
  
  if (typeof window.getCurrentUser === 'function') {
    var user = window.getCurrentUser();
    if (user) {
      cityCoins = user.balanceMtBanks || 0;
      citySkillPoints = user.balanceSkillPoints || 0;
      cityBankLevel = user.mtbankLevel || 1;
      console.log("💰 Баланс из профиля:", cityCoins);
      console.log("⭐ Очки прокачки:", citySkillPoints);
      console.log("🏦 Уровень банка:", cityBankLevel);
    } else {
      console.log("⚠️ Пользователь не найден");
    }
  } else {
    console.log("❌ window.getCurrentUser не определён");
  }
  
  updateDisplays();
}

function updateDisplays() {
  if (coinDisplay) coinDisplay.textContent = cityCoins.toLocaleString();
  if (skillDisplay) skillDisplay.textContent = citySkillPoints.toLocaleString();
  if (bankLevelDisplay) bankLevelDisplay.textContent = cityBankLevel;
}

function syncToProfile() {
  console.log("💾 Синхронизация с профилем...");
  
  if (typeof window.syncCityBalanceToApp === 'function') {
    window.syncCityBalanceToApp(cityCoins);
  } else if (typeof window.getCurrentUser === 'function') {
    var user = window.getCurrentUser();
    if (user) {
      user.balanceMtBanks = cityCoins;
      user.balanceSkillPoints = citySkillPoints;
      user.mtbankLevel = cityBankLevel;
      if (typeof window.saveAllUsers === 'function') {
        var users = window.loadAllUsers ? window.loadAllUsers() : {};
        users[user.id] = user;
        window.saveAllUsers(users);
      }
      if (typeof window.syncBalancesToDom === 'function') {
        window.balanceMtBanks = cityCoins;
        window.balanceSkillPoints = citySkillPoints;
        window.syncBalancesToDom();
      }
    }
  }
  
  updateDisplays();
}

function spendSkillPoints(amount) {
  if (citySkillPoints >= amount) {
    citySkillPoints -= amount;
    syncToProfile();
    if (skillDisplay) skillDisplay.textContent = citySkillPoints.toLocaleString();
    return true;
  }
  return false;
}

function addCoins(amount) {
  cityCoins += amount;
  syncToProfile();
  if (coinDisplay) coinDisplay.textContent = cityCoins.toLocaleString();
}

// ========== ФУНКЦИИ ДЛЯ СПРАЙТОВ ==========
function getBldSpriteHTML(id, level, size) {
  const def = DM[id];
  if (!def) return '';
  const spriteSize = 55;
  return `
    <div style="position:absolute;bottom:28px;left:50%;transform:translateX(-50%);width:${spriteSize}px;height:${spriteSize}px;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;filter:drop-shadow(0 6px 4px rgba(0,0,0,0.25));z-index:10;">
      <img src="${SPRITE_PATH}${def.sprite}" alt="${def.name}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="display:none;width:100%;height:100%;background:${def.bg};border-radius:8px;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#333;border:2px dashed #999;">${def.name.charAt(0)}</div>
    </div>
  `;
}

function getPreviewSpriteHTML(id) {
  const def = DM[id];
  if (!def) return '';
  return `
    <div style="width:65px;height:65px;display:flex;align-items:center;justify-content:center;">
      <img src="${SPRITE_PATH}${def.sprite}" alt="${def.name}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 4px 4px rgba(0,0,0,0.3));" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="display:none;width:100%;height:100%;background:${def.bg};border-radius:12px;align-items:center;justify-content:center;font-size:32px;font-weight:bold;color:#555;">${def.name.charAt(0)}</div>
    </div>
  `;
}

// ========== ПЛИТКА ==========
function tileBg(r, c) {
  const isTownhall = (r === 2 && c === 2);
  const sh = isTownhall ? '#FFD700' : ((r + c) % 2 === 0 ? '#5BC0BE' : '#4AB0AE');
  const lsh = isTownhall ? '#DAA520' : '#3AA8A0';
  const rsh = isTownhall ? '#B8860B' : '#2A8A82';
  const strokeColor = isTownhall ? '#FFD700' : 'rgba(255,255,255,0.4)';
  
  const key = `${r},${c}`;
  const isEmpty = !buildings[key];
  const emptyMarker = (isEmpty && !isTownhall) ? `<polygon points="36,12 52,20 36,28 20,20" fill="#4CAF50" opacity="0.7" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>` : '';
  
  return `
    <svg viewBox="0 0 72 64" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;">
      <polygon points="36,1 71,19 36,37 1,19" fill="${sh}" stroke="${strokeColor}" stroke-width="${isTownhall ? '2.5' : '1.5'}"/>
      <polygon points="1,19 36,37 36,52 1,34" fill="${lsh}"/>
      <polygon points="36,37 71,19 71,34 36,52" fill="${rsh}"/>
      ${emptyMarker}
    </svg>
  `;
}

function makeTile(r, c) {
  const key = `${r},${c}`;
  const b = buildings[key];
  
  const showPlus = !b && buildModeActive;
  const bldHTML = b ? getBldSpriteHTML(b.id, b.lv) : '';
  
  const labelHTML = b ? `
    <div style="position:absolute;bottom:17px;left:50%;transform:translateX(-50%);background:rgba(30,30,30,0.35);backdrop-filter:blur(6px);border-radius:18px;padding:2px 6px;z-index:15;white-space:nowrap;">
      <span style="font-size:8px;font-weight:600;color:white;">Lv.${b.lv}</span>
    </div>
  ` : '';
  
  const plusHTML = showPlus ? `
    <div style="position:absolute;top:35%;left:50%;transform:translate(-50%, -50%);width:40px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(100,100,100,0.45);border:2px dashed rgba(220,220,220,0.8);font-size:20px;font-weight:bold;color:white;pointer-events:none;z-index:20;">+</div>
  ` : '';
  
  const dot = b && b.acc >= 1 ? `<div class="city-dot" id="dot-${key}"></div>` : '';
  
  return tileBg(r, c) + dot + labelHTML + bldHTML + plusHTML;
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========
function loadBuildings() {
  for (var key in buildings) delete buildings[key];
  
  const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
  const storageKey = user ? `mtbank_city_buildings_${user.id}` : 'mtbank_city_buildings_v7';
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    try {
      const loaded = JSON.parse(saved);
      if (Object.keys(loaded).length === 0) {
        buildings['2,2'] = {id:'bank', lv:1, acc:0, tick:Date.now()};
      } else {
        Object.assign(buildings, loaded);
      }
    } catch (e) {
      buildings['2,2'] = {id:'bank', lv:1, acc:0, tick:Date.now()};
    }
  } else {
    buildings['2,2'] = {id:'bank', lv:1, acc:0, tick:Date.now()};
  }
  
  if (!buildings['2,2']) {
    buildings['2,2'] = {id:'bank', lv:1, acc:0, tick:Date.now()};
  }
}

function saveBuildings() { 
  const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
  const storageKey = user ? `mtbank_city_buildings_${user.id}` : 'mtbank_city_buildings_v7';
  localStorage.setItem(storageKey, JSON.stringify(buildings)); 
}

function renderGrid() {
  if (!isoContainer) return;
  
  const TW = 90, TH = 48;
  const CW = GRID * TW, CH = GRID * (TH / 2) + TH + 80;
  
  isoContainer.style.width = CW + 'px';
  isoContainer.style.height = CH + 'px';
  isoContainer.style.transformOrigin = 'center center';
  isoContainer.innerHTML = '';
  tileElements = {};
  
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const sx = (c - r) * (TW / 2) + CW / 2 - TW / 2;
      const sy = (c + r) * (TH / 2) + 15;
      const key = `${r},${c}`;
      
      const div = document.createElement('div');
      div.className = 'city-tile';
      div.style.cssText = `left:${sx}px;top:${sy}px;width:72px;height:64px;`;
      div.style.pointerEvents = 'auto';
      div.innerHTML = makeTile(r, c);
      div.onclick = () => onTileClick(r, c);
      
      isoContainer.appendChild(div);
      tileElements[key] = div;
    }
  }
  
  updateCameraTransform();
  updateDots();
}

function updateCameraTransform() {
  if (isoContainer) {
    isoContainer.style.transform = `translate(${cameraX}px, ${cameraY}px) scale(${cameraZoom})`;
  }
}

function resetCamera() {
  cameraX = 0;
  cameraY = 0;
  cameraZoom = 1.3;
  updateCameraTransform();
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
    if (d && d.inc > 0) {
      const income = d.inc * b.lv;
      b.acc += income * ((now - b.tick) / 3600000);
    }
    b.tick = now;
  });
  saveBuildings();
  updateDots();
}

function refreshTile(key) {
  const [r, c] = key.split(',').map(Number);
  if (tileElements[key]) tileElements[key].innerHTML = makeTile(r, c);
  updateDots();
}

function onTileClick(r, c) {
  if (hasMoved) return;
  const key = `${r},${c}`;
  
  if (buildings[key]) {
    openPopup(key);
  } else if (buildModeActive) {
    pendingTile = key;
    openBuildMenu();
  }
}

function openPopup(key) {
  selectedKey = key;
  const b = buildings[key], d = DM[b.id];
  const upgradeCost = b.lv >= d.maxLv ? 'МАКС' : (d.uc * b.lv) + ' ⭐';
  
  const nameEl = document.getElementById('popup-name');
  const typeEl = document.getElementById('popup-type');
  const incomeEl = document.getElementById('popup-income');
  const accEl = document.getElementById('popup-acc');
  const levelEl = document.getElementById('popup-level');
  const upcostEl = document.getElementById('popup-upcost');
  const progressEl = document.getElementById('popup-progress');
  const progressTextEl = document.getElementById('popup-progress-text');
  const previewEl = document.getElementById('popup-preview');
  const collectBtn = document.getElementById('popup-collect');
  const upgradeBtn = document.getElementById('popup-upgrade');
  
  if (nameEl) nameEl.textContent = d.name + ' Lv' + b.lv;
  if (typeEl) typeEl.textContent = d.cat;
  if (incomeEl) incomeEl.textContent = (d.inc * b.lv) + ' MtB/ч';
  if (accEl) accEl.textContent = Math.floor(b.acc) + ' MtB';
  if (levelEl) levelEl.textContent = b.lv;
  if (upcostEl) upcostEl.textContent = upgradeCost;
  if (progressEl) progressEl.style.width = (b.lv / d.maxLv * 100) + '%';
  if (progressTextEl) progressTextEl.textContent = `Уровень ${b.lv} / ${d.maxLv}`;
  
  if (previewEl) {
    previewEl.style.background = d.bg;
    previewEl.innerHTML = getPreviewSpriteHTML(b.id);
  }
  
  const canUpgrade = b.lv < d.maxLv && citySkillPoints >= (d.uc * b.lv);
  if (collectBtn) collectBtn.disabled = b.acc < 1;
  if (upgradeBtn) upgradeBtn.disabled = !canUpgrade;
  
  if (popupOverlay) popupOverlay.classList.add('open');
}

function openBuildMenu() {
  const grid = document.getElementById('build-grid');
  
  const renderCategory = (cat) => {
    currentCategory = cat;
    if (grid) grid.innerHTML = '';
    
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.cat === cat);
    });
    
    const buildingsList = CATEGORIES[cat] || DEFS;
    buildingsList.forEach(d => {
      const isUnlocked = cityBankLevel >= (d.unlockLevel || 1);
      const canAfford = citySkillPoints >= d.bc;
      
      const div = document.createElement('div');
      div.className = 'build-item';
      if (!isUnlocked) div.classList.add('build-item--locked');
      
      div.innerHTML = `
        <div style="width:58px;height:65px;opacity:${isUnlocked ? 1 : 0.5};">${getPreviewSpriteHTML(d.id)}</div>
        <div class="build-item-name">${d.name}</div>
        <div class="build-item-cost">⭐ ${d.bc}</div>
        ${!isUnlocked ? '<div class="build-item-locked">🔒 Ур. МТБанка ' + d.unlockLevel + '</div>' : ''}
        ${isUnlocked && !canAfford ? '<div class="build-item-locked">💰 Недостаточно ⭐</div>' : ''}
      `;
      
      if (isUnlocked && canAfford) {
        div.onclick = () => {
          if (!pendingTile) { 
            notify('Нажми на пустую клетку'); 
            closeBuildMenu(); 
            return; 
          }
          if (buildings[pendingTile]) { 
            notify('Клетка занята!'); 
            return; 
          }
          
          if (spendSkillPoints(d.bc)) {
            buildings[pendingTile] = {id: d.id, lv: 1, acc: 0, tick: Date.now()};
            refreshTile(pendingTile); 
            saveBuildings(); 
            burst();
            notify(`${d.name} построена! 🏗`);
            
            pendingTile = null; 
            closeBuildMenu(); 
            updateCityLevel();
            buildModeActive = false;
            const btn = document.getElementById('city-build-btn');
            if (btn) btn.style.background = '#34d399';
            renderGrid();
          } else {
            notify('Недостаточно очков прокачки!');
          }
        };
      }
      
      if (grid) grid.appendChild(div);
    });
  };
  
  if (!document.getElementById('build-categories')) {
    const tabsDiv = document.createElement('div');
    tabsDiv.id = 'build-categories';
    tabsDiv.style.cssText = 'display:flex;gap:5px;margin-bottom:12px';
    tabsDiv.innerHTML = `
      <button class="category-tab active" data-cat="starter">⭐ Старт</button>
      <button class="category-tab" data-cat="medium">🏢 Средние</button>
      <button class="category-tab" data-cat="elite">🏦 Элит</button>
    `;
    const menuHeader = document.querySelector('.build-menu div:first-child');
    if (menuHeader && menuHeader.parentNode) {
      menuHeader.parentNode.insertBefore(tabsDiv, grid);
    }
    
    tabsDiv.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        renderCategory(tab.dataset.cat);
      });
    });
  }
  
  renderCategory('starter');
  if (buildOverlay) buildOverlay.classList.add('open');
}

function closeBuildMenu() { 
  if (buildOverlay) buildOverlay.classList.remove('open'); 
  pendingTile = null; 
}

function closePopup() { 
  if (popupOverlay) popupOverlay.classList.remove('open'); 
  selectedKey = null; 
}

function collectFromPopup() {
  if (!selectedKey) return;
  const b = buildings[selectedKey], amt = Math.floor(b.acc);
  if (amt < 1) return;
  
  b.acc -= amt; 
  addCoins(amt);
  floatCoin(amt);
  notify(`+${amt} MtB собрано! 💰`);
  updateCityLevel(); 
  saveBuildings();
  if (selectedKey) openPopup(selectedKey);
}

function upgradeFromPopup() {
  if (!selectedKey) return;
  const b = buildings[selectedKey], d = DM[b.id];
  if (b.lv >= d.maxLv) return;
  
  const cost = d.uc * b.lv;
  
  if (spendSkillPoints(cost)) {
    b.lv++; 
    refreshTile(selectedKey); 
    burst();
    notify(`${d.name} улучшен до Lv${b.lv}! ⬆`);
    saveBuildings();
    if (selectedKey) openPopup(selectedKey);
  } else {
    notify('Недостаточно очков прокачки!');
  }
}

function collectAll() {
  let tot = 0;
  Object.entries(buildings).forEach(([k, b]) => { 
    const a = Math.floor(b.acc); 
    if (a > 0) { 
      b.acc -= a; 
      tot += a; 
    } 
  });
  if (tot > 0) { 
    addCoins(tot);
    floatCoin(tot); 
    notify(`Собрано +${tot} MtB! 💰`); 
    updateCityLevel(); 
    saveBuildings();
  } else {
    notify('Пока нечего собирать...');
  }
}

function updateCityLevel() {
  const n = Math.max(1, Math.floor(Object.keys(buildings).length / 3) + 1);
  if (n > cityLevel) { 
    cityLevel = n; 
    if (levelDisplay) levelDisplay.textContent = cityLevel; 
    notify('Город вырос! Lv' + cityLevel + ' 🌟'); 
    burst(); 
  }
}

function notify(msg) {
  if (!notifEl) return;
  notifEl.textContent = msg; 
  notifEl.classList.add('show');
  clearTimeout(notifyTimeout); 
  notifyTimeout = setTimeout(() => notifEl.classList.remove('show'), 2400);
}

function floatCoin(amt) {
  const el = document.createElement('div'); 
  el.className = 'city-float-coin'; 
  el.textContent = '+' + amt + ' MtB';
  el.style.cssText = `left:${window.innerWidth/2-30}px;top:${window.innerHeight*.44}px`;
  document.body.appendChild(el); 
  setTimeout(() => el.remove(), 960);
}

function burst() {
  ['⭐','✨','🌟'].forEach((s, i) => {
    const el = document.createElement('div'); 
    el.className = 'city-sparkle'; 
    el.textContent = s;
    el.style.cssText = `left:${window.innerWidth/2-16+i*20}px;top:${window.innerHeight*.28}px`;
    document.body.appendChild(el); 
    setTimeout(() => el.remove(), 680);
  });
}

function setupCameraControls() {
  const gameArea = document.querySelector('.city-game-area');
  if (!gameArea) return;
  
  gameArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    cameraZoom = Math.min(2.2, Math.max(0.9, cameraZoom + delta));
    updateCameraTransform();
  }, { passive: false });
  
  gameArea.addEventListener('mousedown', (e) => {
    if (e.target.closest('.city-tile') || e.target.closest('button')) return;
    isDragging = true;
    hasMoved = false;
    dragStartX = e.clientX; 
    dragStartY = e.clientY;
    dragCameraStartX = cameraX; 
    dragCameraStartY = cameraY;
    gameArea.style.cursor = 'grabbing';
    e.preventDefault();
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
    cameraX = dragCameraStartX + dx;
    cameraY = dragCameraStartY + dy;
    updateCameraTransform();
  });
  
  window.addEventListener('mouseup', () => { 
    isDragging = false; 
    if (gameArea) gameArea.style.cursor = 'grab';
    setTimeout(() => { hasMoved = false; }, 50);
  });
  
  gameArea.style.cursor = 'grab';
}

function bindEvents() {
  const resetCamBtn = document.getElementById('city-reset-camera');
  if (resetCamBtn) resetCamBtn.addEventListener('click', resetCamera);
  
  const buildBtn = document.getElementById('city-build-btn');
  if (buildBtn) {
    buildBtn.addEventListener('click', () => {
      buildModeActive = !buildModeActive;
      if (buildModeActive) {
        buildBtn.style.background = '#ff9800';
        notify('🏗 Режим строительства включён. Нажмите на пустую клетку');
        pendingTile = null;
      } else {
        buildBtn.style.background = '#34d399';
        notify('👀 Режим осмотра');
        closeBuildMenu();
      }
      renderGrid();
    });
  }
  
  const collectAllBtn = document.getElementById('city-collect-all-btn');
  if (collectAllBtn) collectAllBtn.addEventListener('click', collectAll);
  
  const popupCloseBtn = document.getElementById('popup-close-btn');
  if (popupCloseBtn) popupCloseBtn.addEventListener('click', closePopup);
  
  const popupCollectBtn = document.getElementById('popup-collect');
  if (popupCollectBtn) popupCollectBtn.addEventListener('click', collectFromPopup);
  
  const popupUpgradeBtn = document.getElementById('popup-upgrade');
  if (popupUpgradeBtn) popupUpgradeBtn.addEventListener('click', upgradeFromPopup);
  
  if (popupOverlay) {
    popupOverlay.addEventListener('click', e => { if (e.target === popupOverlay) closePopup(); });
  }
  if (buildOverlay) {
    buildOverlay.addEventListener('click', e => { if (e.target === buildOverlay) closeBuildMenu(); });
  }
}

// ========== ВОЗВРАТ В РЕЖИМ 1 ==========
function switchToMode1() {
  console.log('⬅️ Возврат в режим 1');
  
  syncToProfile();
  
  // Используем глобальную функцию из app.js
  if (typeof window.forceSwitchToMode1 === 'function') {
    window.forceSwitchToMode1();
  } else {
    // Fallback
    if (typeof window.currentGameMode !== 'undefined') {
      window.currentGameMode = 1;
    }
    localStorage.setItem("rr_game_mode", "1");
    
    const mode2Container = document.getElementById('mode2-container');
    const mode1Container = document.getElementById('mode1-container');
    if (mode2Container) mode2Container.style.display = 'none';
    if (mode1Container) mode1Container.style.display = 'block';
    
    if (typeof window.renderMinecraftGrid === 'function') window.renderMinecraftGrid();
    if (typeof window.updateGameBalanceDisplay === 'function') window.updateGameBalanceDisplay();
    if (typeof window.syncBalancesToDom === 'function') window.syncBalancesToDom();
  }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
let cityInitialized = false;

window.initCity = function() {
  const panel = document.getElementById('panel-game');
  if (!panel) {
    console.error('❌ panel-game не найден');
    return;
  }
  
  if (cityInitialized) {
    console.log('⚠️ Город уже инициализирован');
    loadFromProfile();
    renderGrid();
    return;
  }
  
  console.log('🏗 initCity запущен');
  
  panel.innerHTML = `
    <div class="city-game-wrap" style="height:100%;display:flex;flex-direction:column;">
      <div class="city-hud">
        <div class="city-coins"><div class="coin-icon">💰</div><span id="city-coin-display">0</span><span style="font-size:10px;margin-left:4px;">MTB</span></div>
        <div class="city-skill"><div class="skill-icon">⭐</div><span id="city-skill-display">0</span><span style="font-size:10px;margin-left:4px;">очки</span></div>
        <div class="city-bank-level"><div class="bank-icon">🏦</div><span id="city-bank-level">1</span><span style="font-size:10px;margin-left:4px;">ур.</span></div>
        <div class="city-title">🏙 MtBank City</div>
        <div class="city-level">Lv.<span id="city-level-display">1</span></div>
      </div>
      <div class="city-game-area" style="flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;">
        <div id="city-iso" style="position:relative;"></div>
      </div>
      <div class="city-bar">
        <button class="city-bar-btn" id="city-reset-camera"><span>🎯</span><span>Центр</span></button>
        <button class="city-bar-btn primary" id="city-build-btn"><span>🏗</span><span>Строить</span></button>
        <button class="city-bar-btn" id="city-collect-all-btn"><span>💰</span><span>Собрать</span></button>
        <button class="city-bar-btn back-btn" id="city-back-to-mode1"><span>⬅️</span><span>Выйти</span></button>
      </div>
    </div>
    <div class="city-popup-overlay" id="city-popup"><div class="city-popup"><div class="popup-header"><div><div class="popup-name" id="popup-name"></div><div class="popup-type" id="popup-type"></div></div><button class="popup-close" id="popup-close-btn">✕</button></div><div class="popup-preview" id="popup-preview"></div><div class="popup-progress-bar"><div class="popup-progress" id="popup-progress"></div></div><div class="popup-progress-text" id="popup-progress-text"></div><div class="popup-stats"><div class="stat-card"><div class="stat-label">Доход/час</div><div class="stat-value gold" id="popup-income"></div></div><div class="stat-card"><div class="stat-label">Накоплено</div><div class="stat-value gold" id="popup-acc"></div></div><div class="stat-card"><div class="stat-label">Уровень</div><div class="stat-value" id="popup-level"></div></div><div class="stat-card"><div class="stat-label">Апгрейд</div><div class="stat-value gold" id="popup-upcost"></div></div></div><div class="popup-buttons"><button class="btn-collect" id="popup-collect">💰 Забрать</button><button class="btn-upgrade" id="popup-upgrade">⬆ Улучшить</button></div></div></div>
    <div class="build-overlay" id="build-overlay"><div class="build-menu"><div style="display:flex;justify-content:space-between;margin-bottom:14px"><div>Выберите здание</div><button id="build-close-btn">✕</button></div><div class="build-grid" id="build-grid"></div></div></div>
    <div class="city-notif" id="city-notif"></div>
  `;
  
  coinDisplay = document.getElementById('city-coin-display');
  skillDisplay = document.getElementById('city-skill-display');
  bankLevelDisplay = document.getElementById('city-bank-level');
  levelDisplay = document.getElementById('city-level-display');
  isoContainer = document.getElementById('city-iso');
  popupOverlay = document.getElementById('city-popup');
  buildOverlay = document.getElementById('build-overlay');
  notifEl = document.getElementById('city-notif');
  
  if (!isoContainer) {
    console.error('❌ isoContainer не создан');
    return;
  }
  
  loadFromProfile();
  loadBuildings();
  renderGrid();
  bindEvents();
  setupCameraControls();
  
  const closeBuildBtn = document.getElementById('build-close-btn');
  if (closeBuildBtn) closeBuildBtn.addEventListener('click', closeBuildMenu);
  
  // Кнопка возврата
  const backBtn = document.getElementById('city-back-to-mode1');
  if (backBtn) {
    const newBackBtn = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(newBackBtn, backBtn);
    newBackBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      switchToMode1();
    });
  }
  
  setInterval(() => { tickBuildings(); updateDots(); }, 3000);
  
  cityInitialized = true;
  console.log('✅ Город отрисован!');
};