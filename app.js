(function () {
  "use strict";

  var BASE_REF_URL = "https://myapp.com/ref";

  var balanceSkillPoints = 0;
  var balanceMtBanks = 0;
  var buildingPriceMultiplier = 1.0;

  function randomAlphanumeric(len) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var out = "";
    for (var i = 0; i < len; i += 1) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  var STORAGE_KEY = "rr_registered_users";
  var USER_KEY = "rr_current_user_id";

  function loadAllUsers() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function saveAllUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    try {
      var userId = localStorage.getItem(USER_KEY);
      if (!userId) return null;
      var users = loadAllUsers();
      return users[userId] || null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(userId) {
    localStorage.setItem(USER_KEY, userId);
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
    showRegisterScreen();
    var loginIdInput = document.getElementById("login-id");
    var loginNicknameInput = document.getElementById("login-nickname");
    if (loginIdInput) loginIdInput.value = "";
    if (loginNicknameInput) loginNicknameInput.value = "";
  }

  function normalizeNickname(n) {
    return String(n).trim().toLowerCase();
  }

  function refreshRegistrationPreview() {
    var preUserId = randomAlphanumeric(16);
    var preReferralCode = randomAlphanumeric(10);
    var preReferralLink = BASE_REF_URL + "?id=" + encodeURIComponent(preReferralCode);

    var elId = document.getElementById("register-preview-id");
    if (elId) elId.textContent = preUserId;
    
    window._tempRegistration = {
      id: preUserId,
      referralCode: preReferralCode,
      referralLink: preReferralLink
    };
  }

  function syncBalancesToDom() {
    var elS = document.getElementById("profile-balance-skill");
    var elM = document.getElementById("profile-balance-mtb");
    if (elS) elS.textContent = String(balanceSkillPoints).padStart(8, '0');
    if (elM) elM.textContent = String(balanceMtBanks).padStart(8, '0');
    
    var gameSkillSpan = document.getElementById("game-skill-balance");
    if (gameSkillSpan) gameSkillSpan.textContent = balanceSkillPoints;
    var gameBalanceSpan = document.getElementById("game-balance");
    if (gameBalanceSpan) gameBalanceSpan.textContent = balanceMtBanks;
  }

  function hideRegisterShowApp() {
    var reg = document.getElementById("screen-register");
    var login = document.getElementById("screen-login");
    var app = document.getElementById("screen-app");
    
    if (reg) {
      reg.setAttribute("hidden", "");
      reg.classList.add("is-hidden");
    }
    if (login) {
      login.setAttribute("hidden", "");
      login.classList.add("is-hidden");
    }
    if (app) {
      app.removeAttribute("hidden");
      app.classList.remove("is-hidden");
    }
  }

  function showRegisterScreen() {
    var reg = document.getElementById("screen-register");
    var login = document.getElementById("screen-login");
    var app = document.getElementById("screen-app");
    
    if (reg) {
      reg.removeAttribute("hidden");
      reg.classList.remove("is-hidden");
      refreshRegistrationPreview();
    }
    if (login) {
      login.setAttribute("hidden", "");
      login.classList.add("is-hidden");
    }
    if (app) {
      app.setAttribute("hidden", "");
      app.classList.add("is-hidden");
    }
  }

  function showLoginScreen() {
    var reg = document.getElementById("screen-register");
    var login = document.getElementById("screen-login");
    var app = document.getElementById("screen-app");
    
    if (reg) {
      reg.setAttribute("hidden", "");
      reg.classList.add("is-hidden");
    }
    if (login) {
      login.removeAttribute("hidden");
      login.classList.remove("is-hidden");
    }
    if (app) {
      app.setAttribute("hidden", "");
      app.classList.add("is-hidden");
    }
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        if (document.execCommand("copy")) resolve();
        else reject(new Error("copy failed"));
      } catch (err) {
        reject(err);
      }
      document.body.removeChild(ta);
    });
  }

  function showCopyToast() {
    var toast = document.getElementById("copy-toast");
    if (!toast) return;
    toast.hidden = false;
    window.setTimeout(function () {
      toast.hidden = true;
    }, 1800);
  }

  function updateProfileUI(user) {
    var pid = document.getElementById("profile-id");
    var pn = document.getElementById("profile-nickname");
    var pc = document.getElementById("profile-referral-code");
    var pl = document.getElementById("profile-referral-link");
    var pi = document.getElementById("profile-inviter-code");
    
    if (pid) pid.textContent = user.id;
    if (pn) pn.textContent = user.nickname;
    if (pc) pc.textContent = user.referralCode;
    if (pl) pl.textContent = user.referralLink;
    if (pi) pi.textContent = user.inviterReferral || "—";
    
    balanceSkillPoints = user.balanceSkillPoints || 0;
    balanceMtBanks = user.balanceMtBanks || 0;
    syncBalancesToDom();
  }

  function showApp(user) {
    hideRegisterShowApp();
    updateProfileUI(user);
    switchTab("profile");
  }

  function switchTab(tab) {
    var panels = document.querySelectorAll(".panel");
    for (var i = 0; i < panels.length; i += 1) {
      var p = panels[i];
      if (p.getAttribute("data-panel") === tab) {
        p.classList.add("is-active");
      } else {
        p.classList.remove("is-active");
      }
    }

    var tabs = document.querySelectorAll(".bottom-nav__tab");
    for (var j = 0; j < tabs.length; j += 1) {
      var btn = tabs[j];
      if (btn.getAttribute("data-tab") === tab) {
        btn.setAttribute("aria-current", "page");
      } else {
        btn.removeAttribute("aria-current");
      }
    }

    if (tab === "profile") syncBalancesToDom();
    if (tab === "game") {
      syncBalancesToDom();
      setTimeout(function() {
        if (typeof window.initCityGame === 'function') {
          window.initCityGame();
        } else {
          initCityGame();
        }
      }, 50);
    }
    if (tab === "tasks") {
      renderCalendarGrid();
      updateStreakDisplay();
      renderTasksList();
    }
  }

  function registerUser(nicknameRaw, inviterCode) {
    var nickname = nicknameRaw.trim();
    var normalizedNickname = normalizeNickname(nickname);
    
    var users = loadAllUsers();
    
    for (var userId in users) {
      if (users[userId].nicknameLower === normalizedNickname) {
        return { success: false, error: "Этот ник уже занят. Выберите другой." };
      }
    }
    
    if (nickname.length < 2) {
      return { success: false, error: "Никнейм слишком короткий." };
    }
    
    var newUser = {
      id: window._tempRegistration.id,
      nickname: nickname,
      nicknameLower: normalizedNickname,
      referralCode: window._tempRegistration.referralCode,
      referralLink: window._tempRegistration.referralLink,
      inviterReferral: inviterCode || "",
      balanceSkillPoints: 0,
      balanceMtBanks: 2000,
      createdAt: Date.now()
    };
    
    if (inviterCode && inviterCode.trim() !== "") {
      var inviterFound = false;
      for (var uid in users) {
        if (users[uid].referralCode === inviterCode) {
          inviterFound = true;
          newUser.balanceSkillPoints = 1000;
          newUser.balanceMtBanks = 3000;
          break;
        }
      }
      if (!inviterFound) {
        return { success: false, error: "Неверный реферальный код." };
      }
    }
    
    users[newUser.id] = newUser;
    saveAllUsers(users);
    setCurrentUser(newUser.id);
    
    return { success: true, user: newUser };
  }
  
  function loginUser(id, nickname) {
    var users = loadAllUsers();
    var normalizedNickname = normalizeNickname(nickname);
    
    for (var userId in users) {
      var user = users[userId];
      if (user.id === id && user.nicknameLower === normalizedNickname) {
        setCurrentUser(userId);
        return { success: true, user: user };
      }
    }
    
    return { success: false, error: "Неверный ID или никнейм." };
  }

  function checkAuthAndRedirect() {
    var currentUser = getCurrentUser();
    if (currentUser) {
      showApp(currentUser);
    } else {
      showRegisterScreen();
    }
  }

  // ========== ПУТЬ К СПРАЙТАМ ==========
  var SPRITE_PATH = "buildings/";

  // ========== КОНФИГУРАЦИЯ ЗДАНИЙ ==========
  const BUILDING_TYPES = {
    mtbank: { name: "МТБанк", icon: "🏦", sprite: "bank.png", baseIncome: 0, upgradeMultiplier: 1, cost: 0, maxLevel: 3, category: 0, bg: '#f5e6a0', isMain: true },
    coffee: { name: "Кофейня", icon: "☕", sprite: "cafe.png", baseIncome: 50, upgradeMultiplier: 1.5, cost: 100, maxLevel: 5, category: 1, bg: '#fff4e0' },
    flowershop: { name: "Цветочный магазин", icon: "🌷", sprite: "flower.png", baseIncome: 55, upgradeMultiplier: 1.53, cost: 110, maxLevel: 5, category: 1, bg: '#ffe0f0' },
    minimarket: { name: "Мини-магазин", icon: "🏪", sprite: "minimarket.png", baseIncome: 45, upgradeMultiplier: 1.52, cost: 90, maxLevel: 5, category: 1, bg: '#e0ffe0' },
    foodtruck: { name: "Фудтрак", icon: "🚚", sprite: "foodtruck.png", baseIncome: 48, upgradeMultiplier: 1.54, cost: 95, maxLevel: 5, category: 1, bg: '#ffe8d0' },
    icecream: { name: "Киоск мороженого", icon: "🍦", sprite: "icecream.png", baseIncome: 42, upgradeMultiplier: 1.51, cost: 85, maxLevel: 5, category: 1, bg: '#e0f0ff' },
    restaurant: { name: "Ресторан", icon: "🍽️", sprite: "restaurant.png", baseIncome: 100, upgradeMultiplier: 1.6, cost: 250, maxLevel: 5, category: 2, bg: '#f0e0e0' },
    shop: { name: "Магазин", icon: "🏪", sprite: "store.png", baseIncome: 110, upgradeMultiplier: 1.62, cost: 280, maxLevel: 5, category: 2, bg: '#e0e0ff' },
    autoservice: { name: "Автосервис", icon: "🔧", sprite: "autoservice.png", baseIncome: 120, upgradeMultiplier: 1.63, cost: 300, maxLevel: 5, category: 2, bg: '#d0d0d0' },
    itcompany: { name: "IT Компания", icon: "💻", sprite: "itoffice.png", baseIncome: 140, upgradeMultiplier: 1.65, cost: 350, maxLevel: 5, category: 2, bg: '#c0e0ff' },
    gasstation: { name: "Заправка", icon: "⛽", sprite: "gasstation.png", baseIncome: 115, upgradeMultiplier: 1.61, cost: 290, maxLevel: 5, category: 2, bg: '#ffe0c0' },
    businesspark: { name: "Бизнес-парк", icon: "🏢", sprite: "business-center.png", baseIncome: 500, upgradeMultiplier: 1.85, cost: 1200, maxLevel: 5, category: 3, bg: '#e0eeff' },
    cinema: { name: "Кинотеатр", icon: "🎬", sprite: "cinema.png", baseIncome: 350, upgradeMultiplier: 1.78, cost: 800, maxLevel: 5, category: 3, bg: '#e0d0ff' },
    construction: { name: "Стройкомпания", icon: "🏗️", sprite: "construction.png", baseIncome: 320, upgradeMultiplier: 1.75, cost: 750, maxLevel: 5, category: 3, bg: '#ffe8a0' },
    warehouse: { name: "Склад", icon: "🏭", sprite: "warehouse.png", baseIncome: 250, upgradeMultiplier: 1.7, cost: 600, maxLevel: 5, category: 3, bg: '#d0c0a0' },
    mall: { name: "Торговый центр", icon: "🏬", sprite: "mall.png", baseIncome: 450, upgradeMultiplier: 1.82, cost: 1100, maxLevel: 5, category: 3, bg: '#ffd0e0' }
  };

  const BUILDING_KEYS = ["coffee", "flowershop", "minimarket", "foodtruck", "icecream", "restaurant", "shop", "autoservice", "itcompany", "gasstation", "businesspark", "cinema", "construction", "warehouse", "mall"];
  const GRID_SIZE = 5;
  
  let buildings = [];
  let currentSelectedBlock = null;
  let currentInfoIndex = null;
  let incomeInterval = null;
  let cameraZoom = 1.3;
  let cameraX = 0, cameraY = 0;
  let isDragging = false, hasMoved = false;
  let dragStartX = 0, dragStartY = 0;
  let dragCameraStartX = 0, dragCameraStartY = 0;
  let isoContainer = null;
  let buildMode = true;

  // ========== ЗАДАНИЯ ==========
  var TASKS_KEY = "rr_tasks_";

  var TASKS_LIST = [
    // ========== РАЗОВЫЕ ЗАДАНИЯ (прокачка бизнесов до 3 уровня) ==========
    { id: "upgrade_coffee", title: "Прокачай кофейню", desc: "Улучшите кофейню до 3 уровня", type: "upgrade_building", buildingType: "coffee", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_flowershop", title: "Прокачай цветочный магазин", desc: "Улучшите цветочный магазин до 3 уровня", type: "upgrade_building", buildingType: "flowershop", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_minimarket", title: "Прокачай мини-маркет", desc: "Улучшите мини-маркет до 3 уровня", type: "upgrade_building", buildingType: "minimarket", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_foodtruck", title: "Прокачай фудтрак", desc: "Улучшите фудтрак до 3 уровня", type: "upgrade_building", buildingType: "foodtruck", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_icecream", title: "Прокачай киоск мороженого", desc: "Улучшите киоск мороженого до 3 уровня", type: "upgrade_building", buildingType: "icecream", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_restaurant", title: "Прокачай ресторан", desc: "Улучшите ресторан до 3 уровня", type: "upgrade_building", buildingType: "restaurant", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_shop", title: "Прокачай магазин", desc: "Улучшите магазин до 3 уровня", type: "upgrade_building", buildingType: "shop", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_autoservice", title: "Прокачай автосервис", desc: "Улучшите автосервис до 3 уровня", type: "upgrade_building", buildingType: "autoservice", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_itcompany", title: "Прокачай IT компанию", desc: "Улучшите IT компанию до 3 уровня", type: "upgrade_building", buildingType: "itcompany", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_gasstation", title: "Прокачай заправку", desc: "Улучшите заправку до 3 уровня", type: "upgrade_building", buildingType: "gasstation", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
    { id: "upgrade_businesspark", title: "Прокачай бизнес-парк", desc: "Улучшите бизнес-парк до 3 уровня", type: "upgrade_building", buildingType: "businesspark", requiredLevel: 3, rewardSkill: 150, rewardToken: 150, category: "once" },
    { id: "upgrade_cinema", title: "Прокачай кинотеатр", desc: "Улучшите кинотеатр до 3 уровня", type: "upgrade_building", buildingType: "cinema", requiredLevel: 3, rewardSkill: 150, rewardToken: 150, category: "once" },
    { id: "upgrade_construction", title: "Прокачай стройкомпанию", desc: "Улучшите стройкомпанию до 3 уровня", type: "upgrade_building", buildingType: "construction", requiredLevel: 3, rewardSkill: 150, rewardToken: 150, category: "once" },
    { id: "upgrade_warehouse", title: "Прокачай склад", desc: "Улучшите склад до 3 уровня", type: "upgrade_building", buildingType: "warehouse", requiredLevel: 3, rewardSkill: 150, rewardToken: 150, category: "once" },
    { id: "upgrade_mall", title: "Прокачай торговый центр", desc: "Улучшите торговый центр до 3 уровня", type: "upgrade_building", buildingType: "mall", requiredLevel: 3, rewardSkill: 150, rewardToken: 150, category: "once" },
    
    // ========== ЕЖЕМЕСЯЧНЫЕ ЗАДАНИЯ (траты по карте МТБанка) ==========
    { id: "card_spending_500_1000", title: "Траты по карте МТБанка", desc: "Потратьте от 500 до 1000 рублей за месяц", type: "card_spending", minAmount: 500, maxAmount: 1000, rewardSkill: 200, rewardToken: 0, category: "monthly" },
    { id: "card_spending_1000_1500", title: "Траты по карте МТБанка", desc: "Потратьте от 1000 до 1500 рублей за месяц", type: "card_spending", minAmount: 1000.01, maxAmount: 1500, rewardSkill: 300, rewardToken: 0, category: "monthly" },
    { id: "card_spending_1500_2000", title: "Траты по карте МТБанка", desc: "Потратьте от 1500 до 2000 рублей за месяц", type: "card_spending", minAmount: 1500.01, maxAmount: 2000, rewardSkill: 400, rewardToken: 0, category: "monthly" },
    { id: "card_spending_2000_plus", title: "Траты по карте МТБанка", desc: "Потратьте от 2000 рублей и более за месяц", type: "card_spending", minAmount: 2000.01, maxAmount: Infinity, rewardSkill: 500, rewardToken: 100, category: "monthly" }
  ];

  function getTasksData() {
    var currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    var key = TASKS_KEY + currentUser.id;
    try {
      var raw = localStorage.getItem(key);
      if (!raw) {
        var defaultTasks = {};
        for (var i = 0; i < TASKS_LIST.length; i++) {
          defaultTasks[TASKS_LIST[i].id] = { completed: false, claimed: false, lastMonth: null };
        }
        return defaultTasks;
      }
      return JSON.parse(raw);
    } catch (e) {
      var defaultTasks = {};
      for (var i = 0; i < TASKS_LIST.length; i++) {
        defaultTasks[TASKS_LIST[i].id] = { completed: false, claimed: false, lastMonth: null };
      }
      return defaultTasks;
    }
  }

  function saveTasksData(data) {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    var key = TASKS_KEY + currentUser.id;
    localStorage.setItem(key, JSON.stringify(data));
  }

  function checkBuildingUpgradeTask(buildingType, requiredLevel) {
    for (var i = 0; i < buildings.length; i++) {
      var building = buildings[i];
      if (building && building.type === buildingType && building.level >= requiredLevel) {
        return true;
      }
    }
    return false;
  }

  function checkAllTasksCompletion() {
    var tasksData = getTasksData();
    if (!tasksData) return;
    
    var needSave = false;
    
    for (var i = 0; i < TASKS_LIST.length; i++) {
      var task = TASKS_LIST[i];
      var taskData = tasksData[task.id];
      
      if (!taskData) {
        tasksData[task.id] = { completed: false, claimed: false, lastMonth: null };
        taskData = tasksData[task.id];
        needSave = true;
      }
      
      if (!taskData.completed && !taskData.claimed) {
        var isCompleted = false;
        
        if (task.type === "upgrade_building") {
          isCompleted = checkBuildingUpgradeTask(task.buildingType, task.requiredLevel);
        }
        
        if (isCompleted) {
          taskData.completed = true;
          needSave = true;
        }
      }
    }
    
    if (needSave) {
      saveTasksData(tasksData);
    }
    
    renderTasksList();
  }

  function claimTaskReward(taskId, rewardSkill, rewardToken) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    var tasksData = getTasksData();
    var taskData = tasksData[taskId];
    
    if (!taskData.completed) {
      showGameToast("❌ Условие задания ещё не выполнено!");
      return false;
    }
    
    if (taskData.claimed) {
      showGameToast("❌ Награда за это задание уже получена!");
      return false;
    }
    
    currentUser.balanceSkillPoints = (currentUser.balanceSkillPoints || 0) + rewardSkill;
    currentUser.balanceMtBanks = (currentUser.balanceMtBanks || 0) + rewardToken;
    
    taskData.claimed = true;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveTasksData(tasksData);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    balanceMtBanks = currentUser.balanceMtBanks;
    syncBalancesToDom();
    updateDisplays();
    renderTasksList();
    
    showGameToast(`🎉 Получена награда: ${rewardSkill} ⭐ и ${rewardToken} 💰!`);
    return true;
  }

  function openTaskModal(task) {
    var modal = document.getElementById("task-modal");
    if (!modal) {
      createTaskModal();
      modal = document.getElementById("task-modal");
    }
    
    document.getElementById("task-modal-title").textContent = task.title;
    document.getElementById("task-modal-desc").textContent = task.desc;
    document.getElementById("task-modal-reward").innerHTML = `⭐ ${task.rewardSkill} очков прокачки ${task.rewardToken > 0 ? `+ 💰 ${task.rewardToken} токенов` : ''}`;
    
    var inputContainer = document.getElementById("task-modal-input-container");
    var inputField = document.getElementById("task-modal-input");
    
    if (task.type === "card_spending") {
      inputContainer.style.display = "block";
      inputField.placeholder = "Введите сумму трат за месяц (₽)";
      inputField.type = "number";
      inputField.step = "0.01";
      inputField.value = "";
      
      var confirmBtn = document.getElementById("task-modal-confirm");
      confirmBtn.onclick = function() {
        var amount = parseFloat(inputField.value);
        if (isNaN(amount) || amount <= 0) {
          showGameToast("❌ Введите корректную сумму!");
          return;
        }
        
        if (amount >= task.minAmount && amount <= task.maxAmount) {
          claimTaskReward(task.id, task.rewardSkill, task.rewardToken);
          closeTaskModal();
        } else {
          showGameToast(`❌ Сумма должна быть от ${task.minAmount} до ${task.maxAmount === Infinity ? '∞' : task.maxAmount} рублей!`);
        }
      };
    } else {
      inputContainer.style.display = "none";
      var confirmBtn = document.getElementById("task-modal-confirm");
      confirmBtn.onclick = function() {
        claimTaskReward(task.id, task.rewardSkill, task.rewardToken);
        closeTaskModal();
      };
    }
    
    modal.removeAttribute("hidden");
  }

  function createTaskModal() {
    var modalHtml = `
      <div class="task-modal" id="task-modal" hidden>
        <div class="task-modal__overlay"></div>
        <div class="task-modal__content">
          <button class="task-modal__close" id="task-modal-close">✕</button>
          <h3 class="task-modal__title" id="task-modal-title">Название задания</h3>
          <p class="task-modal__desc" id="task-modal-desc">Описание задания</p>
          <div class="task-modal__reward" id="task-modal-reward">⭐ 0</div>
          <div id="task-modal-input-container">
            <input type="text" class="task-modal__input" id="task-modal-input" placeholder="Введите данные">
          </div>
          <button class="task-modal__btn" id="task-modal-confirm">Получить награду</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    
    document.getElementById("task-modal-close").addEventListener("click", closeTaskModal);
    var overlay = document.querySelector("#task-modal .task-modal__overlay");
    if (overlay) overlay.addEventListener("click", closeTaskModal);
  }

  function closeTaskModal() {
    var modal = document.getElementById("task-modal");
    if (modal) modal.setAttribute("hidden", "");
  }

  function renderTasksByType(category) {
    var containerId = "tasks-list-" + category;
    var container = document.getElementById(containerId);
    if (!container) return;
    
    var tasksData = getTasksData();
    if (!tasksData) return;
    
    var filteredTasks = [];
    for (var i = 0; i < TASKS_LIST.length; i++) {
      var task = TASKS_LIST[i];
      if (task.category === category) {
        filteredTasks.push(task);
      }
    }
    
    container.innerHTML = "";
    
    if (filteredTasks.length === 0) {
      var placeholderText = "";
      var placeholderIcon = "";
      if (category === "monthly") {
        placeholderIcon = "📅";
        placeholderText = "Ежемесячные задания появятся 1 числа!";
      } else if (category === "seasonal") {
        placeholderIcon = "🌸";
        placeholderText = "Сезонные задания появятся с новым сезоном!";
      } else {
        placeholderIcon = "🎯";
        placeholderText = "Заданий пока нет";
      }
      
      container.innerHTML = `
        <div class="seasonal-placeholder">
          <span class="seasonal-icon">${placeholderIcon}</span>
          <p>${placeholderText}</p>
          <span class="seasonal-hint">Следите за обновлениями</span>
        </div>
      `;
      return;
    }
    
    for (var i = 0; i < filteredTasks.length; i++) {
      var task = filteredTasks[i];
      var taskData = tasksData[task.id];
      
      var taskDiv = document.createElement("div");
      taskDiv.className = "task-item";
      if (taskData && taskData.claimed) {
        taskDiv.classList.add("task-item--completed");
      }
      
      var statusText = "";
      var statusClass = "";
      var showButton = false;
      var buttonDisabled = false;
      
      if (taskData && taskData.claimed) {
        statusText = "✓ Получено";
        statusClass = "task-status--claimed";
        showButton = false;
      } else if (taskData && taskData.completed) {
        statusText = "⭐ Готово к получению";
        statusClass = "task-status--available";
        showButton = true;
        buttonDisabled = false;
      } else {
        statusText = "🔒 Не выполнено";
        statusClass = "";
        showButton = true;
        buttonDisabled = true;
      }
      
      taskDiv.innerHTML = `
        <div class="task-info">
          <div class="task-title">${task.title}</div>
          <div class="task-desc">${task.desc}</div>
          <div class="task-reward">
            <span>⭐ ${task.rewardSkill}</span>
            ${task.rewardToken > 0 ? `<span>💰 ${task.rewardToken}</span>` : ''}
          </div>
        </div>
        <div class="task-status ${statusClass}">${statusText}</div>
        ${showButton ? `<button class="task-btn" data-task-id="${task.id}" ${buttonDisabled ? 'disabled' : ''}>Получить</button>` : ''}
      `;
      
      container.appendChild(taskDiv);
    }
    
    var btns = container.querySelectorAll(".task-btn");
    for (var j = 0; j < btns.length; j++) {
      var btn = btns[j];
      if (!btn.disabled) {
        var taskId = btn.getAttribute("data-task-id");
        var task = TASKS_LIST.find(function(t) { return t.id === taskId; });
        if (task) {
          btn.addEventListener("click", (function(t) {
            return function() { openTaskModal(t); };
          })(task));
        }
      }
    }
  }

  function renderTasksList() {
    var activeTab = document.querySelector('.tasks-tab--active');
    if (activeTab) {
      var activeType = activeTab.getAttribute('data-tasks-tab');
      renderTasksByType(activeType);
    } else {
      renderTasksByType('once');
    }
  }

  function initTasksTabs() {
    var tabs = document.querySelectorAll('.tasks-tab');
    var contents = document.querySelectorAll('.tasks-content');
    
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      tab.addEventListener('click', function(e) {
        var targetTab = e.currentTarget;
        var tabName = targetTab.getAttribute('data-tasks-tab');
        
        for (var j = 0; j < tabs.length; j++) {
          tabs[j].classList.remove('tasks-tab--active');
        }
        targetTab.classList.add('tasks-tab--active');
        
        for (var k = 0; k < contents.length; k++) {
          contents[k].classList.remove('tasks-content--active');
        }
        
        var activeContent = document.getElementById('tasks-' + tabName);
        if (activeContent) {
          activeContent.classList.add('tasks-content--active');
        }
        
        renderTasksByType(tabName);
      });
    }
  }

  // ========== ЕЖЕДНЕВНЫЙ КАЛЕНДАРЬ ==========
  var CALENDAR_KEY = "rr_calendar_";

  function getCalendarData() {
    var currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    var key = CALENDAR_KEY + currentUser.id;
    try {
      var raw = localStorage.getItem(key);
      if (!raw) {
        return { lastClaimDay: 0, currentStreak: 0, claimedDays: [], lastClaimDate: null, brokenStreak: 0 };
      }
      var data = JSON.parse(raw);
      if (data.brokenStreak === undefined) data.brokenStreak = 0;
      return data;
    } catch (e) {
      return { lastClaimDay: 0, currentStreak: 0, claimedDays: [], lastClaimDate: null, brokenStreak: 0 };
    }
  }

  function saveCalendarData(data) {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    var key = CALENDAR_KEY + currentUser.id;
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getRewardForDay(day) {
    var baseSkill = 10;
    var baseToken = 10;
    var maxDay = Math.min(day, 12);
    var multiplier = Math.pow(1.2, maxDay - 1);
    return { skill: Math.floor(baseSkill * multiplier), token: Math.floor(baseToken * multiplier) };
  }

  function claimDayReward(day) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    var calendarData = getCalendarData();
    if (!calendarData) return false;
    
    var today = new Date().toDateString();
    var lastDate = calendarData.lastClaimDate;
    
    if (lastDate === today) {
      showGameToast("❌ Вы уже забирали награду сегодня! Возвращайтесь завтра!");
      return false;
    }
    
    var expectedDay = calendarData.currentStreak + 1;
    if (day !== expectedDay) {
      showGameToast("❌ Вы можете забрать только следующий день по порядку!");
      return false;
    }
    
    if (calendarData.claimedDays.includes(day)) {
      showGameToast("❌ Награда за этот день уже получена!");
      return false;
    }
    
    var reward = getRewardForDay(day);
    
    currentUser.balanceSkillPoints = (currentUser.balanceSkillPoints || 0) + reward.skill;
    currentUser.balanceMtBanks = (currentUser.balanceMtBanks || 0) + reward.token;
    
    calendarData.claimedDays.push(day);
    calendarData.currentStreak = day;
    calendarData.lastClaimDay = day;
    calendarData.lastClaimDate = today;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveCalendarData(calendarData);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    balanceMtBanks = currentUser.balanceMtBanks;
    syncBalancesToDom();
    updateDisplays();
    renderCalendarGrid();
    updateStreakDisplay();
    
    showGameToast(`🎉 Получено: ${reward.skill} ⭐ и ${reward.token} 💰!`);
    return true;
  }

  function renderCalendarGrid() {
    var container = document.getElementById("calendar-grid");
    if (!container) return;
    
    var calendarData = getCalendarData();
    if (!calendarData) return;
    
    container.innerHTML = "";
    
    var currentStreak = calendarData.currentStreak || 0;
    var today = new Date().toDateString();
    var canClaimToday = calendarData.lastClaimDate !== today;
    
    for (var day = 1; day <= 12; day++) {
      var dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      
      var reward = getRewardForDay(day);
      
      var isClaimed = calendarData.claimedDays.includes(day);
      var isAvailable = (day === currentStreak + 1) && !isClaimed && canClaimToday;
      
      if (isClaimed) {
        dayDiv.classList.add("calendar-day--claimed");
      } else if (isAvailable) {
        dayDiv.classList.add("calendar-day--available");
      } else {
        dayDiv.classList.add("calendar-day--locked");
      }
      
      dayDiv.innerHTML = `
        <div class="calendar-day__number">День ${day}</div>
        <div class="calendar-day__reward">
          <span class="reward-skill">⭐ ${reward.skill}</span>
          <span class="reward-token">💰 ${reward.token}</span>
        </div>
        ${isClaimed ? '<div class="claimed-badge">✓</div>' : ''}
      `;
      
      if (isAvailable) {
        dayDiv.addEventListener("click", (function(d) { return function() { claimDayReward(d); }; })(day));
      }
      
      container.appendChild(dayDiv);
    }
  }

  function updateStreakDisplay() {
    var calendarData = getCalendarData();
    if (calendarData) {
      var streakSpan = document.getElementById("streak-count");
      if (streakSpan) streakSpan.textContent = calendarData.currentStreak || 0;
    }
  }

  // ========== ИГРОВЫЕ ФУНКЦИИ ==========

  function getBuildingIncome(building) {
    if (!building) return 0;
    var typeData = BUILDING_TYPES[building.type];
    if (!typeData) return 0;
    return Math.floor(typeData.baseIncome * Math.pow(typeData.upgradeMultiplier, building.level - 1));
  }

  function getUpgradeCost(building) {
    if (!building) return 0;
    if (building.type === "mtbank") return Infinity;
    var typeData = BUILDING_TYPES[building.type];
    if (!typeData) return 0;
    return Math.floor(typeData.cost * Math.pow(1.3, building.level - 1));
  }

  function updateBuildingPriceMultiplier() {
    var buildingCount = 0;
    for (var i = 0; i < buildings.length; i++) {
      if (buildings[i] && buildings[i].type !== "mtbank") buildingCount++;
    }
    buildingPriceMultiplier = Math.pow(1.1, buildingCount);
  }

  function loadGameBuildings() {
    var currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    var gameKey = "rr_game_" + currentUser.id;
    try {
      var raw = localStorage.getItem(gameKey);
      if (!raw) {
        var emptyGrid = [];
        for (var i = 0; i < 25; i++) emptyGrid.push(null);
        emptyGrid[12] = { type: "mtbank", level: 1, pendingIncome: 0, purchasePrice: 0 };
        var defaultData = { buildings: emptyGrid, lastUpdate: Date.now() };
        saveGameBuildings(defaultData);
        return defaultData;
      }
      var data = JSON.parse(raw);
      if (!data.buildings[12] || data.buildings[12].type !== "mtbank") {
        data.buildings[12] = { type: "mtbank", level: 1, pendingIncome: 0, purchasePrice: 0 };
      }
      return data;
    } catch (e) {
      var emptyGrid = [];
      for (var i = 0; i < 25; i++) emptyGrid.push(null);
      emptyGrid[12] = { type: "mtbank", level: 1, pendingIncome: 0, purchasePrice: 0 };
      return { buildings: emptyGrid, lastUpdate: Date.now() };
    }
  }

  function saveGameBuildings(data) {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    var gameKey = "rr_game_" + currentUser.id;
    localStorage.setItem(gameKey, JSON.stringify(data));
  }

  function updatePendingIncome() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    var gameData = loadGameBuildings();
    buildings = gameData.buildings;
    
    var now = Date.now();
    var timeDiff = (now - (gameData.lastUpdate || now)) / (1000 * 60 * 60);
    
    if (timeDiff > 0 && timeDiff < 24) {
      for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        if (building && building.type !== "mtbank") {
          if (!building.pendingIncome) building.pendingIncome = 0;
          var hourlyIncome = getBuildingIncome(building);
          var earned = Math.floor(hourlyIncome * timeDiff);
          building.pendingIncome += earned;
        }
      }
    }
    
    gameData.lastUpdate = now;
    saveGameBuildings(gameData);
    updateDisplays();
  }

  function updateDisplays() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    balanceMtBanks = currentUser.balanceMtBanks || 0;
    balanceSkillPoints = currentUser.balanceSkillPoints || 0;
    
    var gameBalanceSpan = document.getElementById("game-balance");
    if (gameBalanceSpan) gameBalanceSpan.textContent = balanceMtBanks;
    
    var gameSkillSpan = document.getElementById("game-skill-balance");
    if (gameSkillSpan) gameSkillSpan.textContent = balanceSkillPoints;
    
    var totalHourly = 0;
    for (var i = 0; i < buildings.length; i++) {
      var b = buildings[i];
      if (b && b.type !== "mtbank") totalHourly += getBuildingIncome(b);
    }
    var totalIncomeSpan = document.getElementById("total-income");
    if (totalIncomeSpan) totalIncomeSpan.textContent = totalHourly;
    
    syncBalancesToDom();
  }

  function getMtbankLevel() {
    var currentUser = getCurrentUser();
    return currentUser?.mtbankLevel || 1;
  }

  function addMtbankExp(amount) {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    currentUser.mtbankExp = (currentUser.mtbankExp || 0) + amount;
    while (currentUser.mtbankExp >= (currentUser.mtbankExpToNext || 100)) {
      currentUser.mtbankExp -= (currentUser.mtbankExpToNext || 100);
      currentUser.mtbankLevel = (currentUser.mtbankLevel || 1) + 1;
      currentUser.mtbankExpToNext = Math.floor((currentUser.mtbankExpToNext || 100) * 1.5);
      showGameToast(`🏦 МТБанк повышен до ${currentUser.mtbankLevel} уровня!`);
    }
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
  }

  function getBuildingSpriteHTML(type, level) {
    const def = BUILDING_TYPES[type];
    if (!def) return '';
    
    const isMainBank = (type === "mtbank");
    
    return `
      <div style="position:absolute;bottom:${isMainBank ? '28px' : '22px'};left:50%;transform:translateX(-50%);width:${isMainBank ? '60px' : '50px'};height:${isMainBank ? '60px' : '50px'};display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;filter:drop-shadow(0 6px 4px rgba(0,0,0,0.25));z-index:10;">
        <img src="${SPRITE_PATH}${def.sprite}" alt="${def.name}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div style="display:none;width:100%;height:100%;background:${def.bg};border-radius:12px;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#333;">${def.icon}</div>
      </div>
    `;
  }

  function tileBg(r, c) {
    const isCenter = (r === 2 && c === 2);
    const sh = isCenter ? '#FFD700' : ((r + c) % 2 === 0 ? '#5BC0BE' : '#4AB0AE');
    const lsh = isCenter ? '#DAA520' : '#3AA8A0';
    const rsh = isCenter ? '#B8860B' : '#2A8A82';
    const strokeColor = isCenter ? '#FFD700' : 'rgba(255,255,255,0.4)';
    
    const index = r * GRID_SIZE + c;
    const isEmpty = !buildings[index];
    const emptyMarker = (isEmpty && !isCenter && buildMode) ? `<polygon points="36,12 52,20 36,28 20,20" fill="#4CAF50" opacity="0.7" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>` : '';
    
    return `
      <svg viewBox="0 0 72 64" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;">
        <polygon points="36,1 71,19 36,37 1,19" fill="${sh}" stroke="${strokeColor}" stroke-width="${isCenter ? '2.5' : '1.5'}"/>
        <polygon points="1,19 36,37 36,52 1,34" fill="${lsh}"/>
        <polygon points="36,37 71,19 71,34 36,52" fill="${rsh}"/>
        ${emptyMarker}
      </svg>
    `;
  }

  function makeTile(r, c) {
    const index = r * GRID_SIZE + c;
    const building = buildings[index];
    const isCenter = (r === 2 && c === 2);
    
    const buildingHTML = building ? getBuildingSpriteHTML(building.type, building.level) : '';
    
    const levelHTML = building && building.type !== "mtbank" ? `
      <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.5);border-radius:12px;padding:1px 5px;z-index:15;white-space:nowrap;">
        <span style="font-size:7px;font-weight:600;color:#FFD700;">Lv.${building.level}</span>
      </div>
    ` : '';
    
    const bankLevelHTML = building && building.type === "mtbank" ? `
      <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.5);border-radius:12px;padding:2px 6px;z-index:15;white-space:nowrap;">
        <span style="font-size:8px;font-weight:700;color:#FFD700;">🏦 Lv.${building.level}</span>
      </div>
    ` : '';
    
    const pending = building?.pendingIncome || 0;
    const incomeHTML = (pending > 0 && building?.type !== "mtbank") ? `
      <div style="position:absolute;top:3px;right:3px;background:#4CAF50;border-radius:10px;padding:1px 4px;z-index:15;">
        <span style="font-size:6px;font-weight:bold;color:white;">+${Math.floor(pending)}</span>
      </div>
    ` : '';
    
    const emptyHTML = !building && !isCenter && buildMode ? `
      <div style="position:absolute;top:35%;left:50%;transform:translate(-50%, -50%);width:30px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:rgba(100,100,100,0.45);border:1.5px dashed rgba(220,220,220,0.8);font-size:14px;font-weight:bold;color:rgba(255,255,255,0.8);pointer-events:none;z-index:20;">+</div>
    ` : '';
    
    return tileBg(r, c) + levelHTML + bankLevelHTML + incomeHTML + buildingHTML + emptyHTML;
  }

  function renderGrid() {
    if (!isoContainer) return;
    
    const TW = 90, TH = 48;
    const CW = GRID_SIZE * TW, CH = GRID_SIZE * (TH / 2) + TH + 80;
    
    isoContainer.style.width = CW + 'px';
    isoContainer.style.height = CH + 'px';
    isoContainer.style.transformOrigin = 'center center';
    isoContainer.innerHTML = '';
    
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const sx = (c - r) * (TW / 2) + CW / 2 - TW / 2;
        const sy = (c + r) * (TH / 2) + 15;
        const index = r * GRID_SIZE + c;
        
        const div = document.createElement('div');
        div.className = 'city-tile';
        div.style.cssText = `left:${sx}px;top:${sy}px;width:72px;height:64px;cursor:pointer;`;
        div.innerHTML = makeTile(r, c);
        div.onclick = (function(idx) { return function() { onTileClick(idx); }; })(index);
        
        isoContainer.appendChild(div);
      }
    }
    
    updateCameraTransform();
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

  function onTileClick(index) {
    if (hasMoved) {
      hasMoved = false;
      return;
    }
    
    const building = buildings[index];
    
    if (building) {
      openInfoModal(index);
    } else if (buildMode && index !== 12) {
      openBuildModal(index);
    }
  }

  function openBuildModal(blockIndex) {
    currentSelectedBlock = blockIndex;
    var container = document.getElementById("build-options");
    if (!container) return;
    
    container.innerHTML = "";
    
    var categories = {
      1: { name: "1 уровень МТБанка", buildings: BUILDING_KEYS.slice(0, 5) },
      2: { name: "2 уровень МТБанка", buildings: BUILDING_KEYS.slice(5, 10) },
      3: { name: "3 уровень МТБанка", buildings: BUILDING_KEYS.slice(10, 15) }
    };
    
    var currentLevel = getMtbankLevel();
    
    for (var cat in categories) {
      var header = document.createElement("div");
      header.className = "build-category-header";
      header.innerHTML = `<span class="build-category-title">${categories[cat].name}</span>`;
      container.appendChild(header);
      
      for (var i = 0; i < categories[cat].buildings.length; i++) {
        var key = categories[cat].buildings[i];
        var type = BUILDING_TYPES[key];
        var price = Math.floor(type.cost * buildingPriceMultiplier);
        var isUnlocked = parseInt(cat) <= currentLevel;
        
        var option = document.createElement("div");
        option.className = "build-option" + (isUnlocked ? "" : " build-option--locked");
        option.innerHTML = `
          <div class="build-option__icon"><img src="${SPRITE_PATH}${type.sprite}" style="width:35px;height:35px;object-fit:contain;" onerror="this.style.display='none';this.parentElement.textContent='${type.icon}'"></div>
          <div class="build-option__name">${type.name}</div>
          <div class="build-option__cost">⭐ ${price}</div>
          ${!isUnlocked ? '<div class="build-option__locked">🔒 Ур. МТБанка ' + cat + '</div>' : ''}
        `;
        
        if (isUnlocked) {
          option.onclick = (function(k, p) { return function() { buildBuilding(blockIndex, k, p); }; })(key, price);
        }
        container.appendChild(option);
      }
    }
    
    var modal = document.getElementById("build-modal");
    if (modal) modal.removeAttribute("hidden");
  }

  function buildBuilding(index, type, cost) {
    if (!buildMode) {
      showGameToast("👁️ Режим просмотра: строительство отключено");
      return false;
    }
    
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    updateBuildingPriceMultiplier();
    
    if ((currentUser.balanceSkillPoints || 0) < cost) {
      showGameToast("❌ Недостаточно очков прокачки! Нужно " + cost + " ⭐");
      return false;
    }
    
    if (buildings[index]) {
      showGameToast("❌ Здесь уже есть здание!");
      return false;
    }
    
    buildings[index] = {
      type: type,
      level: 1,
      pendingIncome: 0,
      purchasePrice: cost
    };
    
    currentUser.balanceSkillPoints -= cost;
    balanceSkillPoints = currentUser.balanceSkillPoints;
    
    var gameData = { buildings: buildings, lastUpdate: Date.now() };
    saveGameBuildings(gameData);
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    
    updateDisplays();
    renderGrid();
    syncBalancesToDom();
    addMtbankExp(5);
    checkAllTasksCompletion();
    
    showGameToast("✅ Построено: " + BUILDING_TYPES[type].name + " за " + cost + " ⭐!");
    closeBuildModal();
    return true;
  }

  function closeBuildModal() {
    var modal = document.getElementById("build-modal");
    if (modal) modal.setAttribute("hidden", "");
    currentSelectedBlock = null;
  }

  function openInfoModal(index) {
    var building = buildings[index];
    if (!building) return;
    
    currentInfoIndex = index;
    var typeData = BUILDING_TYPES[building.type];
    
    var iconContainer = document.getElementById("info-icon");
    if (iconContainer) {
      iconContainer.innerHTML = `<img src="${SPRITE_PATH}${typeData.sprite}" style="width:50px;height:50px;object-fit:contain;" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\"font-size:48px;\">${typeData.icon}</div>'">`;
    }
    
    var purchasePrice = building.purchasePrice || typeData.cost;
    var sellPrice = Math.floor(purchasePrice / 2);
    
    document.getElementById("info-title").textContent = typeData.name;
    document.getElementById("info-type").textContent = typeData.name;
    document.getElementById("info-level").textContent = building.level;
    document.getElementById("info-income").textContent = building.type === "mtbank" ? "Центральный банк" : getBuildingIncome(building);
    document.getElementById("info-pending").textContent = building.type === "mtbank" ? "—" : Math.floor(building.pendingIncome || 0);
    document.getElementById("info-upgrade-cost").textContent = building.type === "mtbank" ? "Не улучшается" : getUpgradeCost(building);
    
    var sellValueSpan = document.getElementById("info-sell-value");
    if (sellValueSpan) sellValueSpan.textContent = building.type === "mtbank" ? "Не продаётся" : sellPrice;
    
    var modal = document.getElementById("info-modal");
    if (modal) modal.removeAttribute("hidden");
  }

  function closeInfoModal() {
    var modal = document.getElementById("info-modal");
    if (modal) modal.setAttribute("hidden", "");
    currentInfoIndex = null;
  }

  function collectBuildingIncome(index) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    var building = buildings[index];
    if (!building || building.type === "mtbank") return false;
    
    var amount = Math.floor(building.pendingIncome || 0);
    if (amount <= 0) {
      showGameToast("💰 Нет накопленного дохода!");
      return false;
    }
    
    currentUser.balanceMtBanks = (currentUser.balanceMtBanks || 0) + amount;
    balanceMtBanks = currentUser.balanceMtBanks;
    building.pendingIncome = 0;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    
    var gameData = { buildings: buildings, lastUpdate: Date.now() };
    saveGameBuildings(gameData);
    
    updateDisplays();
    renderGrid();
    syncBalancesToDom();
    
    showGameToast("💰 Получено " + amount + " MTBank Tokens!");
    closeInfoModal();
    return true;
  }

  function upgradeBuilding(index) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    var building = buildings[index];
    if (!building || building.type === "mtbank") {
      showGameToast("❌ МТБанк не улучшается за очки прокачки!");
      return false;
    }
    
    var typeData = BUILDING_TYPES[building.type];
    if (building.level >= typeData.maxLevel) {
      showGameToast(`❌ ${typeData.name} достиг максимального уровня!`);
      return false;
    }
    
    var cost = getUpgradeCost(building);
    
    if ((currentUser.balanceSkillPoints || 0) < cost) {
      showGameToast("❌ Недостаточно очков прокачки! Нужно " + cost + " ⭐");
      return false;
    }
    
    building.level++;
    currentUser.balanceSkillPoints -= cost;
    balanceSkillPoints = currentUser.balanceSkillPoints;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    
    var gameData = { buildings: buildings, lastUpdate: Date.now() };
    saveGameBuildings(gameData);
    
    updateDisplays();
    renderGrid();
    syncBalancesToDom();
    addMtbankExp(10 * building.level);
    checkAllTasksCompletion();
    
    showGameToast("⬆️ " + typeData.name + " улучшен до " + building.level + " уровня!");
    closeInfoModal();
    return true;
  }

  function sellBuilding(index) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    var building = buildings[index];
    if (!building || building.type === "mtbank") {
      showGameToast("❌ МТБанк нельзя продать!");
      return false;
    }
    
    var purchasePrice = building.purchasePrice;
    if (!purchasePrice) {
      var typeData = BUILDING_TYPES[building.type];
      purchasePrice = typeData.cost;
    }
    
    var sellPrice = Math.floor(purchasePrice / 2);
    
    currentUser.balanceSkillPoints = (currentUser.balanceSkillPoints || 0) + sellPrice;
    balanceSkillPoints = currentUser.balanceSkillPoints;
    buildings[index] = null;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    
    var gameData = { buildings: buildings, lastUpdate: Date.now() };
    saveGameBuildings(gameData);
    
    updateDisplays();
    renderGrid();
    syncBalancesToDom();
    
    showGameToast("💰 Здание продано! Выручено " + sellPrice + " ⭐");
    closeInfoModal();
    return true;
  }

  function collectAllIncome() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    var totalCollected = 0;
    for (var i = 0; i < buildings.length; i++) {
      var building = buildings[i];
      if (building && building.type !== "mtbank" && building.pendingIncome && building.pendingIncome > 0) {
        totalCollected += Math.floor(building.pendingIncome);
        building.pendingIncome = 0;
      }
    }
    
    if (totalCollected > 0) {
      currentUser.balanceMtBanks = (currentUser.balanceMtBanks || 0) + totalCollected;
      balanceMtBanks = currentUser.balanceMtBanks;
      
      var users = loadAllUsers();
      users[currentUser.id] = currentUser;
      saveAllUsers(users);
      
      var gameData = { buildings: buildings, lastUpdate: Date.now() };
      saveGameBuildings(gameData);
      
      updateDisplays();
      renderGrid();
      syncBalancesToDom();
      
      showGameToast("🧺 Собрано " + totalCollected + " MTBank Tokens!");
    } else {
      showGameToast("😴 Нет дохода для сбора");
    }
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

  function startIncomeTimer() {
    if (incomeInterval) clearInterval(incomeInterval);
    incomeInterval = setInterval(function() {
      updatePendingIncome();
    }, 60000);
  }

  function showGameToast(message) {
    var toast = document.getElementById("buy-toast");
    if (toast) {
      toast.textContent = message;
      toast.classList.add("is-visible");
      setTimeout(function() {
        toast.classList.remove("is-visible");
      }, 2000);
    }
  }

  function openHelpModal() {
    var modal = document.getElementById("help-modal");
    if (modal) {
      modal.removeAttribute("hidden");
    }
  }

  function closeHelpModal() {
    var modal = document.getElementById("help-modal");
    if (modal) {
      modal.setAttribute("hidden", "");
    }
  }

  function toggleBuildMode() {
    buildMode = !buildMode;
    var toggleBtn = document.getElementById("toggle-build-mode-btn");
    var modeStatusDiv = document.getElementById("mode-status");
    
    if (buildMode) {
      toggleBtn.style.background = "#ff9800";
      toggleBtn.style.boxShadow = "0 3px 0 #e65100";
      if (modeStatusDiv) {
        modeStatusDiv.innerHTML = '🔨 РЕЖИМ СТРОИТЕЛЬСТВА <span style="background:#ff9800; padding:2px 8px; border-radius:20px; margin-left:8px;">Активен</span>';
        modeStatusDiv.style.background = "#fff3e0";
      }
      showGameToast("🔨 Режим строительства: можно строить новые здания");
    } else {
      toggleBtn.style.background = "#6c757d";
      toggleBtn.style.boxShadow = "0 3px 0 #495057";
      if (modeStatusDiv) {
        modeStatusDiv.innerHTML = '👁️ РЕЖИМ ПРОСМОТРА <span style="background:#6c757d; padding:2px 8px; border-radius:20px; margin-left:8px;">Строительство отключено</span>';
        modeStatusDiv.style.background = "#e9ecef";
      }
      showGameToast("👁️ Режим просмотра: можно управлять зданиями, но нельзя строить новые");
    }
    
    renderGrid();
  }

  function initCityGame() {
    console.log("🏗 Инициализация изометрической игры...");
    
    var panel = document.getElementById("panel-game");
    if (!panel) return;
    
    panel.innerHTML = `
      <div class="game-container">
        <div class="game-header">
          <div class="game-title-section">
            <h2 class="game-title">🏙️ Город МТ</h2>
            <button class="game-help-btn" id="game-help-btn">❓ Как играть?</button>
          </div>
          
          <div class="game-balance">
            <span class="game-balance__label">MTBank Tokens</span>
            <span class="game-balance__value" id="game-balance">0</span>
          </div>
          <div class="game-skill-balance">
            <span class="game-skill-balance__label">⭐ Очки прокачки</span>
            <span class="game-skill-balance__value" id="game-skill-balance">0</span>
          </div>
          <div class="game-total-income">
            <span>💰 Доход/час: <span id="total-income">0</span></span>
          </div>
        </div>
        
        <div id="mode-status" style="text-align:center; font-size:14px; font-weight:bold; margin:8px 0; padding:8px; border-radius:12px; background:#fff3e0; color:#e65100;">
          🔨 РЕЖИМ СТРОИТЕЛЬСТВА <span style="background:#ff9800; padding:2px 8px; border-radius:20px; margin-left:8px; color:white;">Активен</span>
        </div>
        
        <div style="display:flex; justify-content:center; margin: 8px 0;">
          <button id="toggle-build-mode-btn" style="display:flex; align-items:center; gap:8px; padding:10px 24px; background:#ff9800; border:none; border-radius:30px; color:white; font-weight:bold; cursor:pointer; box-shadow:0 3px 0 #e65100; transition:all 0.1s ease;">
            <span>🛠️</span>
            <span>Переключить режим</span>
          </button>
        </div>
        
        <div class="city-game-area" style="width:100%; min-height:450px; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#87CEEB; border-radius:20px; margin-bottom:16px; box-shadow:inset 0 0 50px rgba(0,0,0,0.1);">
          <div id="city-iso" style="position:relative;"></div>
        </div>
        
        <div class="city-game-controls" style="display:flex; gap:10px; justify-content:center;">
          <button class="city-control-btn" id="city-reset-camera" style="padding:10px 20px; background:#007bff; color:white; border:none; border-radius:30px; cursor:pointer;">🎯 Центр</button>
          <button class="city-control-btn primary" id="city-collect-all-btn" style="padding:10px 20px; background:linear-gradient(145deg,#28a745,#1e7e34); color:white; border:none; border-radius:30px; cursor:pointer;">💰 Собрать всё</button>
        </div>
      </div>
    `;
    
    isoContainer = document.getElementById("city-iso");
    
    var gameData = loadGameBuildings();
    buildings = gameData.buildings;
    
    updateBuildingPriceMultiplier();
    updatePendingIncome();
    renderGrid();
    updateDisplays();
    startIncomeTimer();
    setupCameraControls();
    
    document.getElementById("city-reset-camera")?.addEventListener("click", resetCamera);
    document.getElementById("city-collect-all-btn")?.addEventListener("click", collectAllIncome);
    
    var toggleBtn = document.getElementById("toggle-build-mode-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", toggleBuildMode);
    }
    
    var helpBtn = document.getElementById("game-help-btn");
    if (helpBtn) {
      helpBtn.addEventListener("click", openHelpModal);
    }
    
    var buildModalClose = document.getElementById("build-modal-close");
    var buildModalOverlay = document.querySelector("#build-modal .build-modal__overlay");
    if (buildModalClose) buildModalClose.addEventListener("click", closeBuildModal);
    if (buildModalOverlay) buildModalOverlay.addEventListener("click", closeBuildModal);
    
    var infoModalClose = document.getElementById("info-modal-close");
    var infoModalOverlay = document.querySelector("#info-modal .info-modal__overlay");
    var infoCollectBtn = document.getElementById("info-collect-btn");
    var infoUpgradeBtn = document.getElementById("info-upgrade-btn");
    var infoSellBtn = document.getElementById("info-sell-btn");
    
    if (infoModalClose) infoModalClose.addEventListener("click", closeInfoModal);
    if (infoModalOverlay) infoModalOverlay.addEventListener("click", closeInfoModal);
    if (infoCollectBtn) infoCollectBtn.addEventListener("click", function() {
      if (currentInfoIndex !== null) collectBuildingIncome(currentInfoIndex);
    });
    if (infoUpgradeBtn) infoUpgradeBtn.addEventListener("click", function() {
      if (currentInfoIndex !== null) upgradeBuilding(currentInfoIndex);
    });
    if (infoSellBtn) infoSellBtn.addEventListener("click", function() {
      if (currentInfoIndex !== null) sellBuilding(currentInfoIndex);
    });
    
    checkAllTasksCompletion();
    renderCalendarGrid();
    updateStreakDisplay();
  }

  // ========== ИНИЦИАЛИЗАЦИЯ ==========

  function init() {
    checkAuthAndRedirect();
    
    var form = document.getElementById("form-register");
    var nicknameInput = document.getElementById("nickname");
    var inviterInput = document.getElementById("inviter-referral");
    var nicknameError = document.getElementById("nickname-error");
    
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (nicknameError) {
          nicknameError.hidden = true;
          nicknameError.textContent = "";
        }
        
        var nicknameRaw = nicknameInput ? nicknameInput.value : "";
        var inviterCode = inviterInput ? inviterInput.value.trim() : "";
        
        var result = registerUser(nicknameRaw, inviterCode);
        
        if (!result.success) {
          if (nicknameError) {
            nicknameError.textContent = result.error;
            nicknameError.hidden = false;
          }
          return;
        }
        
        showApp(result.user);
      });
    }
    
    var loginForm = document.getElementById("form-login");
    var loginIdInput = document.getElementById("login-id");
    var loginNicknameInput = document.getElementById("login-nickname");
    var loginError = document.getElementById("login-error");
    
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (loginError) {
          loginError.hidden = true;
          loginError.textContent = "";
        }
        
        var id = loginIdInput ? loginIdInput.value.trim() : "";
        var nickname = loginNicknameInput ? loginNicknameInput.value.trim() : "";
        
        if (!id || !nickname) {
          if (loginError) {
            loginError.textContent = "Заполните оба поля.";
            loginError.hidden = false;
          }
          return;
        }
        
        var result = loginUser(id, nickname);
        
        if (!result.success) {
          if (loginError) {
            loginError.textContent = result.error;
            loginError.hidden = false;
          }
          return;
        }
        
        showApp(result.user);
      });
    }
    
    var logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        logout();
      });
    }
    
    var copyBtn = document.getElementById("btn-copy-referral-link");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var span = document.getElementById("profile-referral-link");
        var url = span ? span.textContent.trim() : "";
        if (!url || url === "—") return;
        copyTextToClipboard(url).then(
          function () {
            showCopyToast();
          },
          function () {
            window.prompt("Скопируйте ссылку:", url);
          }
        );
      });
    }
    
    var nav = document.getElementById("bottom-nav");
    if (nav) {
      nav.addEventListener("click", function (e) {
        var target = e.target;
        if (!target || !target.closest) return;
        var btn = target.closest(".bottom-nav__tab");
        if (!btn || !nav.contains(btn)) return;
        var tab = btn.getAttribute("data-tab");
        if (tab) switchTab(tab);
      });
    }
    
    var showLoginLink = document.getElementById("show-login");
    var showRegisterLink = document.getElementById("show-register");
    
    if (showLoginLink) {
      showLoginLink.addEventListener("click", function (e) {
        e.preventDefault();
        showLoginScreen();
      });
    }
    
    if (showRegisterLink) {
      showRegisterLink.addEventListener("click", function (e) {
        e.preventDefault();
        showRegisterScreen();
      });
    }
    
    initTasksTabs();
    window.initCityGame = initCityGame;
    
    // Инициализация модального окна помощи
    var helpModal = document.getElementById("help-modal");
    var helpModalClose = document.getElementById("help-modal-close");
    var helpModalOverlay = document.querySelector("#help-modal .help-modal__overlay");
    var helpModalOk = document.getElementById("help-modal-ok");
    
    if (helpModalClose) {
      helpModalClose.addEventListener("click", closeHelpModal);
    }
    if (helpModalOverlay) {
      helpModalOverlay.addEventListener("click", closeHelpModal);
    }
    if (helpModalOk) {
      helpModalOk.addEventListener("click", closeHelpModal);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();