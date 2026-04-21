// 🏙️ MtBank City — ФИНАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ
console.log('🚀 city-game.js загружается...');

// ========== КОНФИГУРАЦИЯ ВСЕХ 15 ЗДАНИЙ ==========
const DEFS = [
  // КАТЕГОРИЯ 1 — СТАРТОВЫЕ
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
  {id:'business', name:'Бизнес-центр', cat:'🏦 Элит', inc:45, uc:400, maxLv:5, bc:500, bg:'#e0eeff', sprite:'business-center.png'},
  {id:'cinema', name:'Кинотеатр', cat:'🏦 Элит', inc:50, uc:450, maxLv:5, bc:550, bg:'#e0d0ff', sprite:'cinema.png'},
  {id:'construction', name:'Стройка', cat:'🏦 Элит', inc:55, uc:500, maxLv:5, bc:600, bg:'#ffe8a0', sprite:'construction.png'},
  {id:'warehouse', name:'Склад', cat:'🏦 Элит', inc:40, uc:380, maxLv:5, bc:450, bg:'#d0c0a0', sprite:'warehouse.png'},
  {id:'mall', name:'ТЦ', cat:'🏦 Элит', inc:60, uc:550, maxLv:5, bc:700, bg:'#ffd0e0', sprite:'mall.png'}
];

const TOWNHALL_DEF = {id:'bank', name:'🏦 БАНК (Ратуша)', cat:'👑 Ратуша', inc:30, uc:500, maxLv:5, bc:0, bg:'#f5e6a0', sprite:'bank.png'};

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

let cityCoins = 2000, cityLevel = 1, selectedKey = null, pendingTile = null;
const buildings = {};
let isoContainer, coinDisplay, levelDisplay, tileElements = {}, popupOverlay, buildOverlay, notifEl, notifyTimeout;
let currentCategory = 'starter';
let cameraZoom = 1.3;
let cameraX = 0, cameraY = 0;
let isDragging = false, hasMoved = false;
let dragStartX = 0, dragStartY = 0;
let dragCameraStartX = 0, dragCameraStartY = 0;
let initialPinchDistance = 0, initialZoom = 1.3;
let buildModeActive = false; // Режим строительства

// ========== ФУНКЦИИ ДЛЯ PNG СПРАЙТОВ ==========
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
// В начало файла добавьте:
window.resetCity = function() {
  console.log('🔄 Полный сброс города');
  
  // Сбрасываем флаг
  cityInitialized = false;
  
  // Очищаем все здания из памяти
  for (var key in buildings) {
    delete buildings[key];
  }
  
  // Очищаем контейнер
  var panel = document.getElementById('panel-game');
  if (panel) {
    panel.innerHTML = '';
  }
  
  // Сбрасываем глобальные переменные
  cityCoins = 2000;
  cityLevel = 1;
  selectedKey = null;
  pendingTile = null;
  tileElements = {};
  
  // Останавливаем интервалы (если нужно)
  if (window._cityInterval) {
    clearInterval(window._cityInterval);
    window._cityInterval = null;
  }
  
  console.log('✅ Город полностью сброшен');
};
// ========== ПЛИТКА ==========
function tileBg(r, c, size) {
  const isTownhall = (r === 2 && c === 2);
  
  const sh = isTownhall ? '#F5D060' : ((r + c) % 2 === 0 ? '#5BC0BE' : '#4AB0AE');
  const lsh = isTownhall ? '#D4A020' : '#3AA8A0';
  const rsh = isTownhall ? '#B08010' : '#2A8A82';
  const strokeColor = isTownhall ? '#FFD700' : 'rgba(255,255,255,0.4)';
  
  // Зелёный маркер-ромбик для пустой клетки
  const key = `${r},${c}`;
  const isEmpty = !buildings[key];
  const emptyMarker = (isEmpty && !isTownhall) ? `
    <polygon points="36,12 52,20 36,28 20,20" fill="#4CAF50" opacity="0.7" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
  ` : '';
  
  return `
    <svg viewBox="0 0 72 64" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;">
      <polygon points="36,1 71,19 36,37 1,19" fill="${sh}" stroke="${strokeColor}" stroke-width="${isTownhall ? '2.5' : '1.5'}"/>
      <polygon points="1,19 36,37 36,52 1,34" fill="${lsh}"/>
      <polygon points="36,37 71,19 71,34 36,52" fill="${rsh}"/>
      ${emptyMarker}
    </svg>
  `;
}
function getDecorForTile(r, c) {
  const seed = (r * 7 + c * 13) % 100;
  const size = 72;
  
  // Разные декорации в зависимости от seed
  if (seed < 15) {
    // Группа травинок
    return `
      <g opacity="0.7">
        <line x1="18" y1="22" x2="15" y2="12" stroke="#2d6e2d" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="22" y1="20" x2="24" y2="10" stroke="#3a8a3a" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="26" y1="21" x2="29" y2="13" stroke="#2d6e2d" stroke-width="1" stroke-linecap="round"/>
        <line x1="20" y1="23" x2="17" y2="15" stroke="#4a9a4a" stroke-width="1" stroke-linecap="round"/>
      </g>
    `;
  } else if (seed < 25) {
    // Камушки
    return `
      <g opacity="0.6">
        <ellipse cx="45" cy="28" rx="5" ry="3" fill="#8a8a7a"/>
        <ellipse cx="50" cy="30" rx="3.5" ry="2.5" fill="#a0a090"/>
        <ellipse cx="42" cy="31" rx="2.5" ry="2" fill="#7a7a6a"/>
      </g>
    `;
  } else if (seed < 32) {
    // Маленький кустик
    return `
      <g opacity="0.65">
        <circle cx="30" cy="22" r="6" fill="#3a7a3a"/>
        <circle cx="26" cy="20" r="5" fill="#4a8a4a"/>
        <circle cx="34" cy="20" r="5" fill="#3a7a3a"/>
        <circle cx="30" cy="18" r="4" fill="#5a9a5a"/>
      </g>
    `;
  } else if (seed < 38) {
    // Тропинка (светлое пятно)
    return `
      <ellipse cx="40" cy="25" rx="8" ry="4" fill="rgba(180,170,140,0.15)"/>
    `;
  } else if (seed < 45) {
    // Цветочки (мелкие)
    return `
      <g opacity="0.7">
        <circle cx="55" cy="20" r="2" fill="#ffeb3b"/>
        <circle cx="58" cy="22" r="1.5" fill="#ff9800"/>
        <circle cx="52" cy="23" r="1.5" fill="#ffeb3b"/>
      </g>
    `;
  } else if (seed < 52) {
    // Высокая трава
    return `
      <g opacity="0.6">
        <line x1="15" y1="25" x2="12" y2="10" stroke="#3a6a3a" stroke-width="2" stroke-linecap="round"/>
        <line x1="20" y1="24" x2="22" y2="8" stroke="#4a7a4a" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="25" y1="25" x2="28" y2="12" stroke="#3a6a3a" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    `;
  } else if (seed < 60) {
    // Пятно мха
    return `
      <ellipse cx="35" cy="30" rx="6" ry="3" fill="rgba(80,100,60,0.15)"/>
      <ellipse cx="38" cy="32" rx="4" ry="2" fill="rgba(90,110,70,0.1)"/>
    `;
  }
  
  // Для остальных — ничего или редкие травинки
  if (seed < 70) {
    return `
      <line x1="40" y1="18" x2="42" y2="12" stroke="#3a7a3a" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
    `;
  }
  
  return '';
}


function makeTile(r, c, size) {
  const key = `${r},${c}`;
  const b = buildings[key];
  const d = b ? DM[b.id] : null;
  
  const showPlus = !b && buildModeActive;
  
  const bldHTML = b ? getBldSpriteHTML(b.id, b.lv, size) : '';
  
  // Шильдик: выше (bottom:15px) и больше (padding, font-size)
  const labelHTML = b ? `
    <div style="position:absolute;bottom:17px;left:50%;transform:translateX(-50%);background:rgba(30,30,30,0.35);backdrop-filter:blur(6px);border-radius:18px;padding:2px 6px;z-index:15;white-space:nowrap;border:0.5px solid rgba(255,255,255,0.3);box-shadow:0 1px 4px rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;">
      <span style="font-family:'Nunito',sans-serif;font-size:8px;font-weight:600;color:rgba(255,255,255,0.95);letter-spacing:0.2px;text-shadow:0 1px 2px rgba(0,0,0,0.2);line-height:1;display:block;">Lv.${b.lv}</span>
    </div>
  ` : '';
  
  const plusHTML = showPlus ? `
    <div style="position:absolute;top:35%;left:50%;transform:translate(-50%, -50%);width:40px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(100,100,100,0.45);border:2px dashed rgba(220,220,220,0.8);font-size:20px;font-weight:bold;color:rgba(255,255,255,0.95);pointer-events:none;z-index:20;backdrop-filter:blur(3px);">+</div>
  ` : '';
  
  const dot = b ? `<div class="city-dot" id="dot-${key}"></div>` : '';
  
  return tileBg(r, c, size) + dot + labelHTML + bldHTML + plusHTML;
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========
function loadBuildings() {
  // Очищаем текущие здания перед загрузкой
  for (var key in buildings) {
    delete buildings[key];
  }
  
  const user = window.getCurrentUser?.();
  const storageKey = user ? `mtbank_city_buildings_${user.id}` : 'mtbank_city_buildings_v7';
  
  console.log('📂 Загрузка из хранилища:', storageKey);
  
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    try {
      const loaded = JSON.parse(saved);
      // Проверяем, есть ли вообще здания в сохранении
      if (Object.keys(loaded).length === 0) {
        // Если сохранение пустое — создаём Ратушу
        console.log('🆕 Пустое сохранение — создаём Ратушу');
        buildings['2,2'] = {id:'bank', lv:1, acc:0, tick:Date.now()};
      } else {
        Object.assign(buildings, loaded);
        console.log('✅ Загружены сохранённые здания:', Object.keys(buildings).length);
      }
    } catch (e) {
      console.error('❌ Ошибка загрузки, создаём Ратушу:', e);
      buildings['2,2'] = {id:'bank', lv:1, acc:0, tick:Date.now()};
    }
  } else {
    // Нет сохранения — новая игра
    console.log('🆕 Новая игра — создаём Ратушу в центре');
    buildings['2,2'] = {id:'bank', lv:1, acc:0, tick:Date.now()};
  }
  
  // Убеждаемся, что Ратуша существует
  if (!buildings['2,2']) {
    console.log('⚠️ Ратуша отсутствует, создаём заново');
    buildings['2,2'] = {id:'bank', lv:1, acc:0, tick:Date.now()};
  }
  
  if (user) { 
    cityCoins = user.balanceMtBanks || 2000; 
    console.log('💰 Баланс:', cityCoins);
    updateCoins(); 
  }
  
  console.log('🏢 Здания после загрузки:', Object.keys(buildings));
}

function saveBuildings() { 
  const user = window.getCurrentUser?.();
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
      div.innerHTML = makeTile(r, c, 72);
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
    if (d) b.acc += d.inc * b.lv * ((now - b.tick) / 3600000);
    b.tick = now;
  });
  saveBuildings();
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
    // Если есть здание — всегда показываем информацию
    openPopup(key);
  } else if (buildModeActive) {
    // Пустая клетка + режим строительства — строим
    pendingTile = key;
    openBuildMenu();
  }
  // Если нет здания и не режим строительства — ничего не делаем
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
    
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.cat === cat);
    });
    
    const buildingsList = CATEGORIES[cat] || DEFS;
    buildingsList.forEach(d => {
      const div = document.createElement('div');
      div.className = 'build-item';
      div.innerHTML = `
        <div style="width:58px;height:65px;">${getPreviewSpriteHTML(d.id)}</div>
        <div class="build-item-name">${d.name}</div>
        <div class="build-item-cost">🪙${d.bc}</div>
      `;
      
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
        if (cityCoins < d.bc) { 
          notify('Недостаточно MtB!'); 
          return; 
        }
        
        cityCoins -= d.bc;
        buildings[pendingTile] = {id: d.id, lv: 1, acc: 0, tick: Date.now()};
        refreshTile(pendingTile); 
        updateCoins(); 
        saveBuildings(); 
        syncBalance(); 
        burst();
        notify(`${d.name} построена! 🏗`);
        
        // Закрываем меню постройки
        pendingTile = null; 
        closeBuildMenu(); 
        updateCityLevel();
        
        // 🔴 ВЫКЛЮЧАЕМ РЕЖИМ СТРОИТЕЛЬСТВА ПОСЛЕ ПОСТРОЙКИ
        buildModeActive = false;
        const btn = document.getElementById('city-build-btn');
        if (btn) {
          btn.style.background = '#34d399';
          btn.style.boxShadow = '0 3px 0 #047857';
        }
        
        // Перерисовываем поле чтобы скрыть плюсики
        renderGrid();
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

function closeBuildMenu() { 
  buildOverlay.classList.remove('open'); 
  pendingTile = null; 
  // Режим строительства остаётся активным
}
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

function setupCameraControls() {
  const gameArea = document.querySelector('.city-game-area');
  if (!gameArea) return;
  
  cameraZoom = 1.3;
  
  // Зум колёсиком
  gameArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    cameraZoom = Math.min(2.2, Math.max(0.9, cameraZoom + delta));
    updateCameraTransform();
  }, { passive: false });
  
  // Перемещение мышью — ТОЛЬКО на пустом месте (не на плитках)
  gameArea.addEventListener('mousedown', (e) => {
    // Не перетаскиваем если кликнули по плитке или кнопке
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
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMoved = true;
    }
    
    cameraX = dragCameraStartX + dx;
    cameraY = dragCameraStartY + dy;
    updateCameraTransform();
  });
  
  window.addEventListener('mouseup', () => { 
    isDragging = false; 
    if (gameArea) gameArea.style.cursor = 'grab';
    setTimeout(() => { hasMoved = false; }, 50);
  });
  
  // Touch для телефона
  gameArea.addEventListener('touchstart', (e) => {
    // Если кликнули по плитке — не перетаскиваем
    if (e.target.closest('.city-tile')) {
      isDragging = false;
      return;
    }
    
    hasMoved = false;
    
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX; 
      dragStartY = e.touches[0].clientY;
      dragCameraStartX = cameraX; 
      dragCameraStartY = cameraY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
      initialZoom = cameraZoom;
    }
    e.preventDefault();
  }, { passive: false });
  
  gameArea.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      
      const dx = e.touches[0].clientX - dragStartX;
      const dy = e.touches[0].clientY - dragStartY;
      
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        hasMoved = true;
      }
      
      cameraX = dragCameraStartX + dx;
      cameraY = dragCameraStartY + dy;
      updateCameraTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault();
      hasMoved = true;
      
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (initialPinchDistance > 0) {
        const scale = distance / initialPinchDistance;
        cameraZoom = Math.min(2.2, Math.max(0.9, initialZoom * scale));
        updateCameraTransform();
      }
    }
  }, { passive: false });
  
  gameArea.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      setTimeout(() => { 
        isDragging = false; 
        hasMoved = false; 
      }, 50);
      initialPinchDistance = 0;
    }
  });
  
  gameArea.addEventListener('touchcancel', (e) => {
    isDragging = false;
    hasMoved = false;
    initialPinchDistance = 0;
  });
  
  gameArea.style.cursor = 'grab';
}

function bindEvents() {
  document.getElementById('city-reset-camera')?.addEventListener('click', resetCamera);
  
  // Кнопка "Строить" переключает режим
  document.getElementById('city-build-btn')?.addEventListener('click', () => {
    buildModeActive = !buildModeActive;
    const btn = document.getElementById('city-build-btn');
    if (buildModeActive) {
      btn.style.background = '#ff9800';
      btn.style.boxShadow = '0 3px 0 #e65100';
      notify('🏗 Режим строительства включён. Нажмите на пустую клетку');
      pendingTile = null;
    } else {
      btn.style.background = '#34d399';
      btn.style.boxShadow = '0 3px 0 #047857';
      notify('👀 Режим осмотра');
      closeBuildMenu();
    }
    // Перерисовываем поле чтобы показать/скрыть плюсики
    renderGrid();
  });
  
  document.getElementById('city-collect-all-btn')?.addEventListener('click', collectAll);
  document.getElementById('popup-close-btn')?.addEventListener('click', closePopup);
  document.getElementById('popup-collect')?.addEventListener('click', collectFromPopup);
  document.getElementById('popup-upgrade')?.addEventListener('click', upgradeFromPopup);
  popupOverlay?.addEventListener('click', e => { if (e.target === popupOverlay) closePopup(); });
  buildOverlay?.addEventListener('click', e => { if (e.target === buildOverlay) closeBuildMenu(); });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
let cityInitialized = false;

window.initCity = function() {
  const panel = document.getElementById('panel-game');
  if (!panel) {
    console.error('❌ panel-game не найден');
    return;
  }
  
  // Если контейнер пустой или игра была удалена — сбрасываем флаг
  if (!panel.querySelector('.city-game-wrap')) {
    console.log('🔄 Контейнер пуст, сбрасываем флаг');
    cityInitialized = false;
  }
  
  if (cityInitialized) {
    console.log('⚠️ Город уже инициализирован');
    return;
  }
  
  console.log('🏗 initCity запущен');
  
  panel.innerHTML = `
    <div class="city-game-wrap" style="height:100%;display:flex;flex-direction:column;">
      <div class="city-hud">
        <div class="city-coins"><div class="coin-icon">M</div><span id="city-coin-display">2000</span></div>
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
      </div>
    </div>
    <div class="city-popup-overlay" id="city-popup"><div class="city-popup"><div class="popup-header"><div><div class="popup-name" id="popup-name"></div><div class="popup-type" id="popup-type"></div></div><button class="popup-close" id="popup-close-btn">✕</button></div><div class="popup-preview" id="popup-preview"></div><div class="popup-progress-bar"><div class="popup-progress" id="popup-progress"></div></div><div class="popup-progress-text" id="popup-progress-text"></div><div class="popup-stats"><div class="stat-card"><div class="stat-label">Доход/час</div><div class="stat-value gold" id="popup-income"></div></div><div class="stat-card"><div class="stat-label">Накоплено</div><div class="stat-value gold" id="popup-acc"></div></div><div class="stat-card"><div class="stat-label">Уровень</div><div class="stat-value" id="popup-level"></div></div><div class="stat-card"><div class="stat-label">Апгрейд</div><div class="stat-value gold" id="popup-upcost"></div></div></div><div class="popup-buttons"><button class="btn-collect" id="popup-collect">💰 Забрать</button><button class="btn-upgrade" id="popup-upgrade">⬆ Улучшить</button></div></div></div>
    <div class="build-overlay" id="build-overlay"><div class="build-menu"><div style="display:flex;justify-content:space-between;margin-bottom:14px"><div>Выберите здание</div><button id="build-close-btn">✕</button></div><div class="build-grid" id="build-grid"></div></div></div>
    <div class="city-notif" id="city-notif"></div>
  `;
  
  coinDisplay = document.getElementById('city-coin-display');
  levelDisplay = document.getElementById('city-level-display');
  isoContainer = document.getElementById('city-iso');
  popupOverlay = document.getElementById('city-popup');
  buildOverlay = document.getElementById('build-overlay');
  notifEl = document.getElementById('city-notif');
  
  // Проверяем, что все элементы созданы
  if (!isoContainer) {
    console.error('❌ isoContainer не создан');
    return;
  }
  
  loadBuildings();

  const user = window.getCurrentUser?.();
  const storageKey = user ? `mtbank_city_buildings_${user.id}` : 'mtbank_city_buildings_v7';
  if (!localStorage.getItem(storageKey)) {
    saveBuildings();
    console.log('💾 Сохранена новая игра с Ратушей');
  }

  renderGrid();
  bindEvents();
  setupCameraControls();
  updateCoins();
  
  document.getElementById('build-close-btn')?.addEventListener('click', closeBuildMenu);
  
  setInterval(() => { tickBuildings(); updateDots(); }, 3000);
  
  cityInitialized = true;
  console.log('✅ Город отрисован!');
};

// Явный вызов при загрузке скрипта
setTimeout(function() {
  var panel = document.getElementById('panel-game');
  if (panel && panel.classList.contains('is-active')) {
    console.log('🚀 Автозапуск города');
    window.initCity();
  }
}, 300);