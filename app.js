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
    console.log("Switching to tab:", tab);
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
  renderGameBoard();
    }
    if (tab === "tasks") {
      renderCalendarGrid();
      updateStreakDisplay();
      // renderTasksList();  // НЕ НУЖНО, ТАК КАК checkAllTasksCompletion ВЫЗОВЕТ ЕГО САМ
      checkAllTasksCompletion();
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
      balanceMtBanks: 0,
      createdAt: Date.now()
    };
    
    if (inviterCode && inviterCode.trim() !== "") {
      var inviterFound = false;
      for (var uid in users) {
        if (users[uid].referralCode === inviterCode) {
          inviterFound = true;
          newUser.balanceSkillPoints = 1000;
          newUser.balanceMtBanks = 1000;
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

  // ========== 2D ЗДАНИЯ (БИЗНЕСЫ) ==========
  
   // ========== 2D ЗДАНИЯ (БИЗНЕСЫ) ==========
  
    var BUILDING_TYPES = {
          mtbank: {
      name: "МТБанк",
      icon: "🏦",
      category: 0,
      unlockLevel: 1,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="8" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/><rect x="10" y="20" width="100" height="20" rx="8" fill="#E10098" stroke="#C2185B" stroke-width="1"/><text x="60" y="35" font-size="9" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">МТБанк</text><rect x="45" y="55" width="30" height="25" rx="2" fill="#81D4FA" stroke="#0288D1" stroke-width="1" opacity="0.8"/><text x="60" y="72" font-size="8" fill="#0288D1" text-anchor="middle">🏦</text><ellipse cx="60" cy="105" rx="40" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 0,
      upgradeMultiplier: 1,
      cost: 0,
      maxLevel: 3
    },
    // ========== КАТЕГОРИЯ 1 (доступна с 1 уровня МТБанка) ==========
    coffee: { 
      name: "Кофейня", 
      icon: "☕",
      category: 1,
      unlockLevel: 1,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#F5F0E8" stroke="#A89880" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#4A4A4A" stroke="#2A2A2A" stroke-width="1"/><text x="60" y="32" font-size="8" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">☕ КОФЕЙНЯ</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#B3E5FC" stroke="#78909C" stroke-width="1" opacity="0.8"/><line x1="35" y1="40" x2="35" y2="80" stroke="#78909C" stroke-width="0.8"/><line x1="18" y1="60" x2="53" y2="60" stroke="#78909C" stroke-width="0.8"/><rect x="62" y="42" width="40" height="38" rx="2" fill="#D4C8B8" stroke="#A89880" stroke-width="1"/><rect x="58" y="38" width="48" height="5" rx="1" fill="#607D8B"/><rect x="15" y="85" width="25" height="15" rx="2" fill="#6D4C41"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#6D4C41"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 50, 
      upgradeMultiplier: 1.5, 
      cost: 100 
    },
    flowershop: { 
      name: "Цветочный магазин", 
      icon: "🌷",
      category: 1,
      unlockLevel: 1,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#FCE4EC" stroke="#E91E63" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#AD1457" stroke="#880E4F" stroke-width="1"/><text x="60" y="32" font-size="6" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🌷 ЦВЕТЫ</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#B3E5FC" stroke="#E91E63" stroke-width="1" opacity="0.8"/><line x1="35" y1="40" x2="35" y2="80" stroke="#E91E63" stroke-width="0.8"/><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#E91E63" stroke-width="1"/><text x="60" y="78" font-size="10" fill="#E91E63" text-anchor="middle">🌻🌹🌺</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#66BB6A"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#66BB6A"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 55, 
      upgradeMultiplier: 1.53, 
      cost: 110 
    },
    minimarket: { 
      name: "Мини-магазин", 
      icon: "🏪",
      category: 1,
      unlockLevel: 1,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#C8E6C9" stroke="#388E3C" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#2E7D32" stroke="#1B5E20" stroke-width="1"/><text x="60" y="32" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🛒 МИНИ</text><rect x="15" y="40" width="40" height="40" rx="2" fill="#B3E5FC" stroke="#388E3C" stroke-width="1" opacity="0.8"/><line x1="35" y1="40" x2="35" y2="80" stroke="#388E3C" stroke-width="0.8"/><rect x="65" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#388E3C" stroke-width="1"/><rect x="60" y="38" width="50" height="5" rx="1" fill="#4CAF50"/><rect x="18" y="85" width="30" height="15" rx="2" fill="#A5D6A7"/><rect x="72" y="85" width="30" height="15" rx="2" fill="#A5D6A7"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 45, 
      upgradeMultiplier: 1.52, 
      cost: 90 
    },
    foodtruck: { 
      name: "Фудтрак", 
      icon: "🚚",
      category: 1,
      unlockLevel: 1,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#FFF3E0" stroke="#FF9800" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#E65100" stroke="#BF360C" stroke-width="1"/><text x="60" y="32" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🚚 ФУДТРАК</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFE0B2" stroke="#FF9800" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#E65100" text-anchor="middle">🍔</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#FF9800" stroke-width="1"/><rect x="70" y="50" width="24" height="30" rx="1" fill="#3D3D3D"/><circle cx="88" cy="70" r="2" fill="#FFC107"/><rect x="15" y="85" width="25" height="15" rx="2" fill="#FFCC80"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#FFCC80"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 48, 
      upgradeMultiplier: 1.54, 
      cost: 95 
    },
    icecream: { 
      name: "Киоск мороженого", 
      icon: "🍦",
      category: 1,
      unlockLevel: 1,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#E1F5FE" stroke="#0288D1" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#01579B" stroke="#014361" stroke-width="1"/><text x="60" y="32" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🍦 МОРОЖЕНОЕ</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFF" stroke="#0288D1" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#0288D1" text-anchor="middle">🍦</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#0288D1" stroke-width="1"/><rect x="70" y="50" width="24" height="30" rx="1" fill="#3D3D3D"/><circle cx="88" cy="70" r="2" fill="#FFC107"/><rect x="15" y="85" width="25" height="15" rx="2" fill="#B3E5FC"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#B3E5FC"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 42, 
      upgradeMultiplier: 1.51, 
      cost: 85 
    },
    
    // ========== КАТЕГОРИЯ 2 (доступна с 2 уровня МТБанка) ==========
    restaurant: { 
      name: "Ресторан", 
      icon: "🍽️",
      category: 2,
      unlockLevel: 2,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#FFE0B2" stroke="#E65100" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#BF360C" stroke="#E65100" stroke-width="1"/><text x="60" y="32" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🍽️ РЕСТОРАН</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFF" stroke="#E65100" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#E65100" text-anchor="middle">🍕</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#E65100" stroke-width="1"/><text x="60" y="78" font-size="6" fill="#E65100" text-anchor="middle">ЕДА</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#FFCC80"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#FFCC80"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 100, 
      upgradeMultiplier: 1.6, 
      cost: 250 
    },
    shop: { 
      name: "Магазин", 
      icon: "🏪",
      category: 2,
      unlockLevel: 2,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#FFAB91" stroke="#BF360C" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#424242" stroke="#1A1A1A" stroke-width="1"/><text x="60" y="32" font-size="8" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🛒 МАГАЗИН</text><rect x="15" y="40" width="40" height="40" rx="2" fill="#B3E5FC" stroke="#BF360C" stroke-width="1" opacity="0.8"/><line x1="35" y1="40" x2="35" y2="80" stroke="#BF360C" stroke-width="0.8"/><line x1="15" y1="60" x2="55" y2="60" stroke="#BF360C" stroke-width="0.8"/><rect x="65" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#BF360C" stroke-width="1"/><rect x="60" y="38" width="50" height="5" rx="1" fill="#E64A19"/><rect x="18" y="85" width="30" height="15" rx="2" fill="#8D6E63"/><rect x="72" y="85" width="30" height="15" rx="2" fill="#8D6E63"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 110, 
      upgradeMultiplier: 1.62, 
      cost: 280 
    },
    autoservice: { 
      name: "Автосервис", 
      icon: "🔧",
      category: 2,
      unlockLevel: 2,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#B0BEC5" stroke="#455A64" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#37474F" stroke="#263238" stroke-width="1"/><text x="60" y="32" font-size="6" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🔧 АВТОСЕРВИС</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFF" stroke="#455A64" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#455A64" text-anchor="middle">🚗</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#455A64" stroke-width="1"/><text x="82" y="65" font-size="10" fill="#455A64" text-anchor="middle">🔧</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#78909C"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#78909C"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 120, 
      upgradeMultiplier: 1.63, 
      cost: 300 
    },
    itcompany: { 
      name: "IT Компания", 
      icon: "💻",
      category: 2,
      unlockLevel: 2,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="90" height="85" rx="3" fill="#B3E5FC" stroke="#0288D1" stroke-width="1.5"/><rect x="15" y="15" width="90" height="12" rx="3" fill="#37474F" stroke="#1A1A1A" stroke-width="1"/><text x="60" y="24" font-size="6" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">💻 IT КОМПАНИЯ</text><rect x="22" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="38" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="54" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="70" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="86" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><text x="60" y="82" font-size="7" fill="#00FF00" font-family="monospace" text-anchor="middle">&lt;/&gt;</text><rect x="12" y="102" width="96" height="3" fill="#90A4AE" rx="1"/><ellipse cx="60" cy="110" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 140, 
      upgradeMultiplier: 1.65, 
      cost: 350 
    },
    gasstation: { 
      name: "Заправка", 
      icon: "⛽",
      category: 2,
      unlockLevel: 2,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#C8E6C9" stroke="#2E7D32" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#1B5E20" stroke="#1B5E20" stroke-width="1"/><text x="60" y="32" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">⛽ ЗАПРАВКА</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFF" stroke="#2E7D32" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#2E7D32" text-anchor="middle">⛽</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#2E7D32" stroke-width="1"/><text x="60" y="78" font-size="6" fill="#2E7D32" text-anchor="middle">БЕНЗИН</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#66BB6A"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#66BB6A"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 115, 
      upgradeMultiplier: 1.61, 
      cost: 290 
    },
    
    // ========== КАТЕГОРИЯ 3 (доступна с 3 уровня МТБанка) ==========
    businesspark: { 
      name: "Бизнес-парк", 
      icon: "🏢",
      category: 3,
      unlockLevel: 3,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="12" width="96" height="88" rx="3" fill="#B3E5FC" stroke="#0288D1" stroke-width="1.5"/><rect x="12" y="12" width="96" height="14" rx="3" fill="#37474F" stroke="#1A1A1A" stroke-width="1"/><text x="60" y="23" font-size="6" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🏢 БИЗНЕС-ПАРК</text><rect x="20" y="30" width="10" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="34" y="30" width="10" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="48" y="30" width="10" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="62" y="30" width="10" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="76" y="30" width="10" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="90" y="30" width="10" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="45" y="65" width="30" height="35" rx="2" fill="#2C2C2C"/><rect x="52" y="68" width="16" height="20" rx="1" fill="#3D3D3D"/><text x="60" y="82" font-size="7" fill="#00FF00" font-family="monospace" text-anchor="middle">$ $ $</text><rect x="12" y="102" width="96" height="3" fill="#90A4AE" rx="1"/><ellipse cx="60" cy="110" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 500, 
      upgradeMultiplier: 1.85, 
      cost: 1200 
    },
    cinema: { 
      name: "Кинотеатр", 
      icon: "🎬",
      category: 3,
      unlockLevel: 3,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#E1BEE7" stroke="#6A1B9A" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#4A148C" stroke="#311B92" stroke-width="1"/><text x="60" y="32" font-size="6" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🎬 КИНОТЕАТР</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFD54F" stroke="#6A1B9A" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#6A1B9A" text-anchor="middle">🎬</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#6A1B9A" stroke-width="1"/><text x="60" y="78" font-size="7" fill="#6A1B9A" text-anchor="middle">КИНО</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#CE93D8"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#CE93D8"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 350, 
      upgradeMultiplier: 1.78, 
      cost: 800 
    },
    construction: { 
      name: "Стройкомпания", 
      icon: "🏗️",
      category: 3,
      unlockLevel: 3,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#FFF3E0" stroke="#E65100" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#BF360C" stroke="#E65100" stroke-width="1"/><text x="60" y="32" font-size="5" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🏗️ СТРОЙКОМПАНИЯ</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFCC80" stroke="#E65100" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#E65100" text-anchor="middle">🏗️</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#E65100" stroke-width="1"/><text x="60" y="78" font-size="6" fill="#E65100" text-anchor="middle">СТРОЙКА</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#FFA726"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#FFA726"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 320, 
      upgradeMultiplier: 1.75, 
      cost: 750 
    },
    warehouse: { 
      name: "Склад", 
      icon: "🏭",
      category: 3,
      unlockLevel: 3,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="25" width="104" height="70" rx="3" fill="#D7CCC8" stroke="#5D4037" stroke-width="1.5"/><rect x="8" y="25" width="104" height="12" rx="3" fill="#546E7A" stroke="#263238" stroke-width="1"/><text x="60" y="34" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">📦 СКЛАД</text><rect x="20" y="42" width="35" height="28" rx="2" fill="#37474F"/><rect x="22" y="44" width="31" height="4" fill="#455A64"/><rect x="22" y="50" width="31" height="4" fill="#455A64"/><rect x="22" y="56" width="31" height="4" fill="#455A64"/><rect x="22" y="62" width="31" height="4" fill="#455A64"/><rect x="65" y="45" width="35" height="25" rx="2" fill="#37474F"/><rect x="67" y="47" width="31" height="3" fill="#455A64"/><rect x="67" y="52" width="31" height="3" fill="#455A64"/><rect x="67" y="57" width="31" height="3" fill="#455A64"/><rect x="67" y="62" width="31" height="3" fill="#455A64"/><rect x="15" y="78" width="25" height="15" rx="2" fill="#A1887F"/><rect x="80" y="78" width="25" height="15" rx="2" fill="#A1887F"/><rect x="12" y="98" width="96" height="4" fill="#78909C" rx="1"/><ellipse cx="60" cy="108" rx="48" ry="6" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 250, 
      upgradeMultiplier: 1.7, 
      cost: 600 
    },
    mall: { 
      name: "Торговый центр", 
      icon: "🏬",
      category: 3,
      unlockLevel: 3,
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="15" width="104" height="85" rx="4" fill="#E8EAF6" stroke="#3F51B5" stroke-width="1.5"/><rect x="8" y="15" width="104" height="15" rx="4" fill="#3F51B5" stroke="#1A237E" stroke-width="1"/><text x="60" y="27" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🏬 ТОРГОВЫЙ ЦЕНТР</text><rect x="16" y="35" width="15" height="50" fill="#C5CAE9" stroke="#3F51B5" stroke-width="0.6" rx="1"/><rect x="35" y="35" width="15" height="50" fill="#C5CAE9" stroke="#3F51B5" stroke-width="0.6" rx="1"/><rect x="54" y="35" width="15" height="50" fill="#C5CAE9" stroke="#3F51B5" stroke-width="0.6" rx="1"/><rect x="73" y="35" width="15" height="50" fill="#C5CAE9" stroke="#3F51B5" stroke-width="0.6" rx="1"/><rect x="92" y="35" width="15" height="50" fill="#C5CAE9" stroke="#3F51B5" stroke-width="0.6" rx="1"/><rect x="45" y="68" width="30" height="32" rx="2" fill="#2C2C2C"/><rect x="52" y="72" width="16" height="20" rx="1" fill="#3D3D3D"/><ellipse cx="60" cy="105" rx="48" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 450, 
      upgradeMultiplier: 1.82, 
      cost: 1100 
    }
  };

    var BUILDING_KEYS = ["coffee", "flowershop", "minimarket", "foodtruck", "icecream", "restaurant", "shop", "autoservice", "itcompany", "gasstation", "businesspark", "cinema", "construction", "warehouse", "mall", "mtbank"];

  var currentSelectedBlock = null;
  var currentInfoIndex = null;
  
  // ========== ЕЖЕДНЕВНЫЙ КАЛЕНДАРЬ ==========
  
  var CALENDAR_KEY = "rr_calendar_";
  
   function getCalendarData() {
    var currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    var key = CALENDAR_KEY + currentUser.id;
    try {
      var raw = localStorage.getItem(key);
      if (!raw) {
        return {
          lastClaimDay: 0,
          currentStreak: 0,
          claimedDays: [],
          lastClaimDate: null,
          brokenStreak: 0
        };
      }
      var data = JSON.parse(raw);
      if (data.brokenStreak === undefined) data.brokenStreak = 0;
      return data;
    } catch (e) {
      return {
        lastClaimDay: 0,
        currentStreak: 0,
        claimedDays: [],
        lastClaimDate: null,
        brokenStreak: 0
      };
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
    return {
      skill: Math.floor(baseSkill * multiplier),
      token: Math.floor(baseToken * multiplier)
    };
  }

  function checkAndResetCalendar() {
    var calendarData = getCalendarData();
    if (!calendarData) return false;
    
    var today = new Date().toDateString();
    var lastDate = calendarData.lastClaimDate;
    
    if (!lastDate) return false;
    
    var lastClaim = new Date(lastDate);
    var todayDate = new Date();
    var diffDays = Math.floor((todayDate - lastClaim) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 1) {
      var lastStreak = calendarData.currentStreak;
      calendarData.currentStreak = 0;
      calendarData.lastClaimDay = 0;
      calendarData.claimedDays = [];
      calendarData.lastClaimDate = null;
      calendarData.brokenStreak = lastStreak;
      saveCalendarData(calendarData);
      renderCalendarGrid();
      updateStreakDisplay();
      return true;
    }
    
    return false;
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
    updateGameBalanceDisplay();
    renderCalendarGrid();
    updateStreakDisplay();
    
    showGameToast(`🎉 Получено: ${reward.skill} ⭐ и ${reward.token} 💰!`);
        // Начисляем опыт МТБанку за календарь (5 EXP за день)
    addMtbankExp(5, "calendar");
    return true;
  }
  
    function resetCalendarWithTokens() {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    var calendarData = getCalendarData();
    var today = new Date().toDateString();
    var lastDate = calendarData.lastClaimDate;
    var canReset = false;
    var lastStreak = 0;
    
    if (lastDate) {
      var lastClaim = new Date(lastDate);
      var todayDate = new Date();
      var diffDays = Math.floor((todayDate - lastClaim) / (1000 * 60 * 60 * 24));
      if (diffDays >= 1) {
        canReset = true;
        lastStreak = calendarData.currentStreak || 0;
      }
    }
    
    if (!canReset && calendarData.brokenStreak === 0) {
      showGameToast("❌ Серия не прервана! Восстановление не требуется.");
      return false;
    }
    
    var cost = 500;
    
    if ((currentUser.balanceMtBanks || 0) < cost) {
      showGameToast(`❌ Недостаточно MTBank Tokens! Нужно ${cost} 💰`);
      return false;
    }
    
    currentUser.balanceMtBanks -= cost;
    
    calendarData.currentStreak = 0;
    calendarData.lastClaimDay = 0;
    calendarData.claimedDays = [];
    calendarData.lastClaimDate = null;
    calendarData.brokenStreak = 0;
    saveCalendarData(calendarData);
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    
    balanceMtBanks = currentUser.balanceMtBanks;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    renderCalendarGrid();
    updateStreakDisplay();
    
    showGameToast(`✨ Прогресс календаря восстановлен! Начинайте с 1 дня. Потрачено ${cost} 💰`);
    return true;
  }
  
  function updateStreakDisplay() {
    var calendarData = getCalendarData();
    if (calendarData) {
      var streakSpan = document.getElementById("streak-count");
      if (streakSpan) streakSpan.textContent = calendarData.currentStreak || 0;
    }
  }
  
   function renderCalendarGrid() {
    var container = document.getElementById("calendar-grid");
    if (!container) return;
    
    var calendarData = getCalendarData();
    if (!calendarData) return;
    
    checkAndResetCalendar();
    
    container.innerHTML = "";
    
    var currentStreak = calendarData.currentStreak || 0;
    var startDay = Math.max(1, currentStreak - 6);
    var endDay = currentStreak + 1;
    
    var today = new Date().toDateString();
    var canClaimToday = calendarData.lastClaimDate !== today;
    
    for (var day = startDay; day <= endDay; day++) {
      var dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      
      var reward = getRewardForDay(day);
      var isMaxReward = day >= 12;
      
      var isClaimed = calendarData.claimedDays.includes(day);
      var isAvailable = (day === currentStreak + 1) && !isClaimed && canClaimToday;
      var isLocked = !isClaimed && !isAvailable;
      
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
        ${isMaxReward && day > 12 ? '<div class="max-badge">MAX</div>' : ''}
        ${isClaimed ? '<div class="claimed-badge">✓</div>' : ''}
      `;
      
      if (isAvailable) {
        dayDiv.addEventListener("click", (function(d) {
          return function() { claimDayReward(d); };
        })(day));
      }
      
      container.appendChild(dayDiv);
    }
    
    updateResetButton(calendarData, canClaimToday);
  }

    function updateResetButton(calendarData, canClaimToday) {
    var resetBtn = document.getElementById("reset-streak-btn");
    var resetContainer = document.getElementById("calendar-reset-container");
    if (!resetBtn) return;
    
    var lastDate = calendarData.lastClaimDate;
    var isStreakBroken = false;
    var lastStreak = calendarData.brokenStreak || 0;
    
    if (lastDate) {
      var lastClaim = new Date(lastDate);
      var todayDate = new Date();
      var diffDays = Math.floor((todayDate - lastClaim) / (1000 * 60 * 60 * 24));
      if (diffDays >= 1) {
        isStreakBroken = true;
        lastStreak = calendarData.currentStreak || lastStreak;
      }
    }
    
    // Если серия не началась и не прервана - скрываем кнопку
    if (calendarData.currentStreak === 0 && !isStreakBroken && calendarData.claimedDays.length === 0) {
      if (resetContainer) resetContainer.style.display = "none";
      return;
    }
    
    if (resetContainer) resetContainer.style.display = "block";
    
    if (isStreakBroken) {
      resetBtn.innerHTML = `💎 Восстановить прогресс (было ${lastStreak} дней) - 500 MTBank Tokens`;
      resetBtn.style.opacity = "1";
      resetBtn.disabled = false;
    } else if (!canClaimToday) {
      resetBtn.innerHTML = `💎 Восстановить прогресс (500 MTBank Tokens)`;
      resetBtn.style.opacity = "0.5";
      resetBtn.disabled = true;
    } else {
      resetBtn.innerHTML = `💎 Восстановить прогресс (500 MTBank Tokens)`;
      resetBtn.style.opacity = "1";
      resetBtn.disabled = false;
    }
  }
  
  function initCalendar() {
    checkAndResetCalendar();
    renderCalendarGrid();
    updateStreakDisplay();
  }
    // ========== МТБАНК (ЦЕНТРАЛЬНОЕ ЗДАНИЕ) ==========
  
  var MTBANK_KEY = "rr_mtbank_";
  
  function getMtbankData() {
    var currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    var key = MTBANK_KEY + currentUser.id;
    try {
      var raw = localStorage.getItem(key);
      if (!raw) {
        return {
          level: 1,
          exp: 0,
          expToNext: 100,
          deposits: [],
          creditDebt: 0
        };
      }
      return JSON.parse(raw);
    } catch (e) {
      return {
        level: 1,
        exp: 0,
        expToNext: 100,
        deposits: [],
        creditDebt: 0
      };
    }
  }
  
    function addMtbankExp(amount, source) {
    var mtData = getMtbankData();
    if (!mtData) return false;
    
    mtData.exp += amount;
    var leveledUp = false;
    
    while (mtData.exp >= mtData.expToNext) {
      mtData.exp -= mtData.expToNext;
      mtData.level++;
      mtData.expToNext = Math.floor(mtData.expToNext * 1.5);
      leveledUp = true;
      showGameToast(`🏦 МТБанк повышен до ${mtData.level} уровня! Ставка выросла до ${getInterestRate(mtData.level)}%`);
    }
    
    saveMtbankData(mtData);
    updateMtbankUI();
    
    if (source) {
      console.log(`Добавлено ${amount} EXP от ${source}`);
    }
    
    return leveledUp;
  }

  function saveMtbankData(data) {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    var key = MTBANK_KEY + currentUser.id;
    localStorage.setItem(key, JSON.stringify(data));
  }
  
    function getInterestRate(level) {
    // Базовые проценты: 1% на 1 уровне, +0.5% за каждый уровень
    return 1 + (level - 1) * 0.5;
  }
  
  function getDepositInterest(days, level) {
    var baseRate = getInterestRate(level);
    if (days === 1) return baseRate;
    if (days === 3) return baseRate + 0.5;
    if (days === 7) return baseRate + 1;
    if (days === 30) return baseRate + 2;
    return baseRate;
  }
  
  function addMtbankExp(amount) {
    var mtData = getMtbankData();
    if (!mtData) return;
    
    mtData.exp += amount;
    var leveledUp = false;
    
    while (mtData.exp >= mtData.expToNext) {
      mtData.exp -= mtData.expToNext;
      mtData.level++;
      mtData.expToNext = Math.floor(mtData.expToNext * 1.5);
      leveledUp = true;
      showGameToast(`🏦 МТБанк повышен до ${mtData.level} уровня! Ставка выросла до ${getInterestRate(mtData.level)}%`);
    }
    
    saveMtbankData(mtData);
    updateMtbankUI();
    return leveledUp;
  }
  
    function takeCredit() {
    var currentUser = getCurrentUser();
    var mtData = getMtbankData();
    if (!currentUser || !mtData) return;
    
    var amountInput = document.getElementById("credit-amount");
    var amount = parseInt(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      showGameToast("❌ Введите корректную сумму!");
      return;
    }
    
    // Максимальный кредит зависит от уровня банка (уровень * 500)
    var maxCredit = mtData.level * 500;
    
    if (amount > maxCredit) {
      showGameToast(`❌ Максимальный кредит для ${mtData.level} уровня: ${maxCredit} ⭐`);
      return;
    }
    
    if (mtData.creditDebt > 0) {
      showGameToast("❌ У вас уже есть непогашенный кредит! Сначала погасите его.");
      return;
    }
    
    currentUser.balanceSkillPoints = (currentUser.balanceSkillPoints || 0) + amount;
    mtData.creditDebt = amount * 2;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveMtbankData(mtData);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    updateMtbankUI();
    
    showGameToast(`💰 Вы получили ${amount} ⭐ в кредит! Вернуть нужно ${amount * 2} ⭐`);
  }

    function repayCredit() {
    var currentUser = getCurrentUser();
    var mtData = getMtbankData();
    if (!currentUser || !mtData) return;
    
    if (mtData.creditDebt <= 0) {
      showGameToast("❌ У вас нет активного кредита!");
      return;
    }
    
    if ((currentUser.balanceSkillPoints || 0) < mtData.creditDebt) {
      showGameToast(`❌ Недостаточно очков прокачки для погашения кредита! Нужно ${mtData.creditDebt} ⭐`);
      return;
    }
    
    currentUser.balanceSkillPoints -= mtData.creditDebt;
    mtData.creditDebt = 0;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveMtbankData(mtData);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    updateMtbankUI();
    
    showGameToast(`✅ Кредит погашен!`);
  }
  
  function createDeposit() {
    var currentUser = getCurrentUser();
    var mtData = getMtbankData();
    if (!currentUser || !mtData) return;
    
    var amountInput = document.getElementById("deposit-amount");
    var amount = parseInt(amountInput.value);
    var daysSelect = document.getElementById("deposit-days");
    var days = parseInt(daysSelect.value);
    
    if (isNaN(amount) || amount <= 0) {
      showGameToast("❌ Введите корректную сумму!");
      return;
    }
    
    if ((currentUser.balanceMtBanks || 0) < amount) {
      showGameToast("❌ Недостаточно MTBank Tokens!");
      return;
    }
    
    var interest = getDepositInterest(days, mtData.level);
    var endDate = Date.now() + (days * 24 * 60 * 60 * 1000);
    
    currentUser.balanceMtBanks -= amount;
    
    mtData.deposits.push({
      amount: amount,
      days: days,
      interest: interest,
      endDate: endDate,
      startDate: Date.now()
    });
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveMtbankData(mtData);
    
    balanceMtBanks = currentUser.balanceMtBanks;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    updateMtbankUI();
    
    showGameToast(`📈 Вклад открыт! ${amount} 💰 на ${days} дней под ${interest}%`);
  }
  
  function checkDeposits() {
    var currentUser = getCurrentUser();
    var mtData = getMtbankData();
    if (!currentUser || !mtData) return;
    
    var now = Date.now();
    var needSave = false;
    
    for (var i = mtData.deposits.length - 1; i >= 0; i--) {
      var deposit = mtData.deposits[i];
      if (now >= deposit.endDate) {
        var profit = Math.floor(deposit.amount * deposit.interest / 100);
        currentUser.balanceMtBanks = (currentUser.balanceMtBanks || 0) + deposit.amount + profit;
        mtData.deposits.splice(i, 1);
        needSave = true;
        showGameToast(`📊 Вклад закрыт! Получено ${deposit.amount + profit} 💰 (${profit} 💰 прибыль)`);
      }
    }
    
    if (needSave) {
      var users = loadAllUsers();
      users[currentUser.id] = currentUser;
      saveAllUsers(users);
      saveMtbankData(mtData);
      balanceMtBanks = currentUser.balanceMtBanks;
      syncBalancesToDom();
      updateGameBalanceDisplay();
      updateMtbankUI();
    }
  }
  
   function updateMtbankUI() {
    var mtData = getMtbankData();
    if (!mtData) return;
    
    document.getElementById("mtbank-level").textContent = mtData.level;
    document.getElementById("mtbank-interest").textContent = getInterestRate(mtData.level).toFixed(1) + "%";
    
    var percent = (mtData.exp / mtData.expToNext) * 100;
    var progressBar = document.getElementById("mtbank-progress-bar");
    if (progressBar) progressBar.style.width = percent + "%";
    var levelCount = document.getElementById("mtbank-level-count");
    if (levelCount) levelCount.textContent = mtData.exp + " / " + mtData.expToNext;
    
    // Показываем кредитную задолженность
    var creditDebtSpan = document.getElementById("mtbank-credit-debt");
    if (creditDebtSpan) {
      creditDebtSpan.textContent = mtData.creditDebt;
    }
    
    var depositsList = document.getElementById("deposits-list");
    if (depositsList) {
      if (mtData.deposits.length === 0) {
        depositsList.innerHTML = '<p style="text-align:center; color:#999; font-size:0.75rem;">Нет активных вкладов</p>';
      } else {
        depositsList.innerHTML = "";
        for (var i = 0; i < mtData.deposits.length; i++) {
          var d = mtData.deposits[i];
          var remainingDays = Math.ceil((d.endDate - Date.now()) / (24 * 60 * 60 * 1000));
          var div = document.createElement("div");
          div.className = "deposit-item";
          div.innerHTML = `
            <div class="deposit-item__info">
              <div><span class="deposit-item__amount">${d.amount} 💰</span> на ${d.days} дн. под ${d.interest}%</div>
              <div class="deposit-item__end">Осталось: ${remainingDays} дн.</div>
            </div>
          `;
          depositsList.appendChild(div);
        }
      }
    }
  }
  
    function closeMtbankModal() {
    var modal = document.getElementById("mtbank-modal");
    if (modal) modal.setAttribute("hidden", "");
  }
  
  function openMtbankModal() {
    updateMtbankUI();
    var modal = document.getElementById("mtbank-modal");
    if (modal) modal.removeAttribute("hidden");
  }
  
  function takeCredit() {
    console.log("takeCredit function called");
    var currentUser = getCurrentUser();
    var mtData = getMtbankData();
    if (!currentUser || !mtData) {
      showGameToast("❌ Ошибка: пользователь не найден!");
      return;
    }
    
    var amountInput = document.getElementById("credit-amount");
    if (!amountInput) {
      showGameToast("❌ Ошибка: поле ввода не найдено!");
      return;
    }
    
    var amount = parseInt(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      showGameToast("❌ Введите корректную сумму!");
      return;
    }
    
    var maxCredit = mtData.level * 500;
    
    if (amount > maxCredit) {
      showGameToast(`❌ Максимальный кредит для ${mtData.level} уровня: ${maxCredit} ⭐`);
      return;
    }
    
    if (mtData.creditDebt > 0) {
      showGameToast("❌ У вас уже есть непогашенный кредит! Сначала погасите его.");
      return;
    }
    
    currentUser.balanceSkillPoints = (currentUser.balanceSkillPoints || 0) + amount;
    mtData.creditDebt = amount * 2;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveMtbankData(mtData);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    updateMtbankUI();
    
    showGameToast(`💰 Вы получили ${amount} ⭐ в кредит! Вернуть нужно ${amount * 2} ⭐`);
  }
  
  function createDeposit() {
    console.log("createDeposit function called");
    var currentUser = getCurrentUser();
    var mtData = getMtbankData();
    if (!currentUser || !mtData) return;
    
    var amountInput = document.getElementById("deposit-amount");
    var daysSelect = document.getElementById("deposit-days");
    
    if (!amountInput || !daysSelect) {
      showGameToast("❌ Ошибка: элементы не найдены!");
      return;
    }
    
    var amount = parseInt(amountInput.value);
    var days = parseInt(daysSelect.value);
    
    if (isNaN(amount) || amount <= 0) {
      showGameToast("❌ Введите корректную сумму!");
      return;
    }
    
    if ((currentUser.balanceMtBanks || 0) < amount) {
      showGameToast("❌ Недостаточно MTBank Tokens!");
      return;
    }
    
    var interest = getDepositInterest(days, mtData.level);
    var endDate = Date.now() + (days * 24 * 60 * 60 * 1000);
    
    currentUser.balanceMtBanks -= amount;
    
    mtData.deposits.push({
      amount: amount,
      days: days,
      interest: interest,
      endDate: endDate,
      startDate: Date.now()
    });
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveMtbankData(mtData);
    
    balanceMtBanks = currentUser.balanceMtBanks;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    updateMtbankUI();
    
    showGameToast(`📈 Вклад открыт! ${amount} 💰 на ${days} дней под ${interest}%`);
  }
  
  function repayCredit() {
    console.log("repayCredit function called");
    var currentUser = getCurrentUser();
    var mtData = getMtbankData();
    if (!currentUser || !mtData) return;
    
    if (mtData.creditDebt <= 0) {
      showGameToast("❌ У вас нет активного кредита!");
      return;
    }
    
    if ((currentUser.balanceSkillPoints || 0) < mtData.creditDebt) {
      showGameToast(`❌ Недостаточно очков прокачки для погашения кредита! Нужно ${mtData.creditDebt} ⭐`);
      return;
    }
    
    currentUser.balanceSkillPoints -= mtData.creditDebt;
    mtData.creditDebt = 0;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveMtbankData(mtData);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    updateMtbankUI();
    
    showGameToast(`✅ Кредит погашен!`);
  }
    // ========== ЗАДАНИЯ ==========

var TASKS_KEY = "rr_tasks_";

var TASKS_LIST = [
  { id: "upgrade_coffee", title: "Прокачай кофейню", desc: "Улучшите кофейню до 3 уровня", type: "upgrade_building", buildingType: "coffee", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_bank", title: "Прокачай банк", desc: "Улучшите банк до 3 уровня", type: "upgrade_building", buildingType: "mtbank", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_shop", title: "Прокачай магазин", desc: "Улучшите магазин до 3 уровня", type: "upgrade_building", buildingType: "shop", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_itcompany", title: "Прокачай IT компанию", desc: "Улучшите IT компанию до 3 уровня", type: "upgrade_building", buildingType: "itcompany", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_warehouse", title: "Прокачай склад", desc: "Улучшите склад до 3 уровня", type: "upgrade_building", buildingType: "warehouse", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_flowershop", title: "Прокачай цветочный магазин", desc: "Улучшите цветочный магазин до 3 уровня", type: "upgrade_building", buildingType: "flowershop", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_autoservice", title: "Прокачай автосервис", desc: "Улучшите автосервис до 3 уровня", type: "upgrade_building", buildingType: "autoservice", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_cinema", title: "Прокачай кинотеатр", desc: "Улучшите кинотеатр до 3 уровня", type: "upgrade_building", buildingType: "cinema", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_construction", title: "Прокачай стройкомпанию", desc: "Улучшите стройкомпанию до 3 уровня", type: "upgrade_building", buildingType: "construction", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_gasstation", title: "Прокачай заправку", desc: "Улучшите заправку до 3 уровня", type: "upgrade_building", buildingType: "gasstation", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_restaurant", title: "Прокачай ресторан", desc: "Улучшите ресторан до 3 уровня", type: "upgrade_building", buildingType: "restaurant", requiredLevel: 3, rewardSkill: 100, rewardToken: 100, category: "once" },
  { id: "upgrade_businesspark", title: "Прокачай бизнес-парк", desc: "Улучшите бизнес-парк до 3 уровня", type: "upgrade_building", buildingType: "businesspark", requiredLevel: 3, rewardSkill: 150, rewardToken: 150, category: "once" },
  { id: "upgrade_mall", title: "Прокачай торговый центр", desc: "Улучшите торговый центр до 3 уровня", type: "upgrade_building", buildingType: "mall", requiredLevel: 3, rewardSkill: 150, rewardToken: 150, category: "once" },
  { id: "card_payment_500", title: "Расплата картой МТБанка (до 500₽)", desc: "Совершите покупку на сумму до 500 рублей", type: "card_payment", minAmount: 0, maxAmount: 500, rewardSkill: 200, rewardToken: 0, category: "monthly" },
  { id: "card_payment_1000", title: "Расплата картой МТБанка (500-1000₽)", desc: "Совершите покупку на сумму от 500 до 1000 рублей", type: "card_payment", minAmount: 500.01, maxAmount: 1000, rewardSkill: 300, rewardToken: 0, category: "monthly" },
  { id: "card_payment_1500", title: "Расплата картой МТБанка (1000-1500₽)", desc: "Совершите покупку на сумму от 1000 до 1500 рублей", type: "card_payment", minAmount: 1000.01, maxAmount: 1500, rewardSkill: 400, rewardToken: 0, category: "monthly" },
  { id: "card_payment_unlimited", title: "Расплата картой МТБанка (от 1500₽)", desc: "Совершите покупку на сумму от 1500 рублей", type: "card_payment", minAmount: 1500.01, maxAmount: Infinity, rewardSkill: 500, rewardToken: 0, category: "monthly" },
  { id: "halva_card", title: "Оформи карту Халва", desc: "Оформите карту Халва от МТБанка", type: "halva", rewardSkill: 350, rewardToken: 0, category: "once" },
  { id: "daily_login", title: "Ежедневный вход", desc: "Заходите в игру каждый день", type: "daily", rewardSkill: 50, rewardToken: 50, category: "daily" }
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
        defaultTasks[TASKS_LIST[i].id] = { completed: false, claimed: false, progress: 0, lastDailyClaim: null };
      }
      return defaultTasks;
    }
    return JSON.parse(raw);
  } catch (e) {
    var defaultTasks = {};
    for (var i = 0; i < TASKS_LIST.length; i++) {
      defaultTasks[TASKS_LIST[i].id] = { completed: false, claimed: false, progress: 0, lastDailyClaim: null };
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
  var gameData = loadGameBuildings();
  for (var i = 0; i < gameData.buildings.length; i++) {
    var building = gameData.buildings[i];
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
      tasksData[task.id] = { completed: false, claimed: false, progress: 0, lastDailyClaim: null };
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
  
  if (task.type === "card_payment") {
    inputContainer.style.display = "block";
    inputField.placeholder = "Введите сумму покупки (₽)";
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
  } else if (task.type === "halva") {
    inputContainer.style.display = "block";
    inputField.placeholder = "Введите номер заявки или телефона";
    inputField.type = "text";
    inputField.value = "";
    
    var confirmBtn = document.getElementById("task-modal-confirm");
    confirmBtn.onclick = function() {
      var value = inputField.value.trim();
      if (value.length < 3) {
        showGameToast("❌ Введите корректные данные!");
        return;
      }
      claimTaskReward(task.id, task.rewardSkill, task.rewardToken);
      closeTaskModal();
    };
  } else if (task.type === "daily") {
    inputContainer.style.display = "none";
    var confirmBtn = document.getElementById("task-modal-confirm");
    confirmBtn.onclick = function() {
      claimDailyReward(task.id, task.rewardSkill, task.rewardToken);
      closeTaskModal();
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

function claimDailyReward(taskId, rewardSkill, rewardToken) {
  var currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  var tasksData = getTasksData();
  var taskData = tasksData[taskId];
  
  var today = new Date().toDateString();
  
  if (taskData.lastDailyClaim === today) {
    showGameToast("❌ Вы уже получили ежедневную награду сегодня!");
    return false;
  }
  
  if (!taskData.completed) {
    taskData.completed = true;
  }
  
  if (taskData.claimed) {
    showGameToast("❌ Награда за сегодня уже получена!");
    return false;
  }
  
  currentUser.balanceSkillPoints = (currentUser.balanceSkillPoints || 0) + rewardSkill;
  currentUser.balanceMtBanks = (currentUser.balanceMtBanks || 0) + rewardToken;
  
  taskData.claimed = true;
  taskData.lastDailyClaim = today;
  
  var users = loadAllUsers();
  users[currentUser.id] = currentUser;
  saveAllUsers(users);
  saveTasksData(tasksData);
  
  balanceSkillPoints = currentUser.balanceSkillPoints;
  balanceMtBanks = currentUser.balanceMtBanks;
  syncBalancesToDom();
  updateGameBalanceDisplay();
  renderTasksList();
  
  showGameToast(`🎉 Ежедневная награда: ${rewardSkill} ⭐ и ${rewardToken} 💰!`);
  addMtbankExp(10, "daily_task");
  return true;
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
  updateGameBalanceDisplay();
  renderTasksList();
  
  showGameToast(`🎉 Получена награда: ${rewardSkill} ⭐ и ${rewardToken} 💰!`);
  addMtbankExp(15, "task");
  return true;
}

function renderTasksByType(category) {
  var containerId = "tasks-list-" + category;
  var container = document.getElementById(containerId);
  if (!container) return;
  
  var tasksData = getTasksData();
  if (!tasksData) return;
  
  // Фильтруем задания по категории
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
      placeholderText = "Сезонные задания появятся при новом ивенте!";
    } else if (category === "daily") {
      placeholderIcon = "⭐";
      placeholderText = "Ежедневные задания";
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
  
  // Рендерим задания
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
    
    // Для ежедневных заданий показываем особый статус
    if (task.type === "daily" && taskData && !taskData.claimed) {
      var today = new Date().toDateString();
      if (taskData.lastDailyClaim === today) {
        statusText = "✓ Получено сегодня";
        statusClass = "task-status--claimed";
        showButton = false;
      } else if (!taskData.completed) {
        statusText = "⭐ Доступно";
        statusClass = "task-status--available";
        showButton = true;
        buttonDisabled = false;
      }
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
  
  // Добавляем обработчики для кнопок
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

function initTasks() {
  checkAllTasksCompletion();
  initTasksTabs();
  renderTasksList();
}
// ========== ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ ИГРЫ ==========

var currentGameMode = 1;
var isCityGameLoaded = false;

function renderGameBoard() {
  var mode1Container = document.getElementById("mode1-container");
  var mode2Container = document.getElementById("mode2-container");
  
  if (!mode1Container || !mode2Container) return;
  
  if (currentGameMode === 1) {
    mode1Container.style.display = "block";
    mode2Container.style.display = "none";
    renderMinecraftGrid();
    updateGameBalanceDisplay();
  } else if (currentGameMode === 2) {
    mode1Container.style.display = "none";
    mode2Container.style.display = "block";
    
    if (!isCityGameLoaded) {
      loadCityGame();
    } else {
      updateCityGameBalance();
      refreshCityGame();
    }
  }
}

function loadCityGame() {
  console.log("🏗 Загрузка изометрического города...");
  
  var mode2Container = document.getElementById("mode2-container");
  if (!mode2Container) return;
  
  // Очищаем контейнер
  mode2Container.innerHTML = '';
  
  // Создаём контейнер для города
  var cityContainer = document.createElement('div');
  cityContainer.id = 'city-game-root';
  cityContainer.style.height = '100%';
  cityContainer.style.width = '100%';
  mode2Container.appendChild(cityContainer);
  
  // Проверяем, загружен ли скрипт city-game.js
  if (typeof window.initCity === 'undefined') {
    var script = document.createElement('script');
    script.src = 'city-game.js';
    script.onload = function() {
      console.log("✅ city-game.js загружен");
      initCityWithSync();
    };
    script.onerror = function() {
      console.error("❌ Ошибка загрузки city-game.js");
      showMode2Placeholder();
    };
    document.head.appendChild(script);
  } else {
    initCityWithSync();
  }
}

function initCityWithSync() {
  console.log("🏙 Инициализация города с синхронизацией");
  
  // Передаём текущего пользователя в город
  var currentUser = getCurrentUser();
  if (currentUser) {
    window._currentCityUser = currentUser;
  }
  
  // Вызываем инициализацию города
  if (typeof window.initCity === 'function') {
    window.initCity();
    isCityGameLoaded = true;
    
    // Ждём отрисовки и синхронизируем
    setTimeout(function() {
      syncFullCityGame();
    }, 500);
  } else {
    showMode2Placeholder();
  }
}

function syncFullCityGame() {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  console.log("🔄 Полная синхронизация города с аккаунтом:", currentUser.nickname);
  
  // Синхронизируем баланс
  if (typeof window.syncBalanceFromApp === 'function') {
    window.syncBalanceFromApp(currentUser.balanceMtBanks || 0);
  }
  
  // Синхронизируем здания
  var buildingsKey = 'mtbank_city_buildings_' + currentUser.id;
  var savedBuildings = localStorage.getItem(buildingsKey);
  
  if (!savedBuildings) {
    // Если нет сохранений для города, создаём из основной игры
    syncBuildingsFromMainGame();
  }
  
  // Обновляем отображение
  if (typeof window.refreshCityUI === 'function') {
    window.refreshCityUI();
  }
  
  updateCityGameBalance();
}

function syncBuildingsFromMainGame() {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Загружаем здания из основной игры
  var gameData = loadGameBuildings();
  if (gameData && gameData.buildings) {
    var cityBuildings = {};
    
    for (var i = 0; i < gameData.buildings.length; i++) {
      var building = gameData.buildings[i];
      if (building && building.type !== 'mtbank') {
        // Конвертируем тип здания в ID для изометрической версии
        var cityId = convertBuildingType(building.type);
        if (cityId) {
          var row = Math.floor(i / 5);
          var col = i % 5;
          var key = row + ',' + col;
          cityBuildings[key] = {
            id: cityId,
            lv: building.level,
            acc: building.pendingIncome || 0,
            tick: Date.now()
          };
        }
      }
    }
    
    // Сохраняем в localStorage для города
    var storageKey = 'mtbank_city_buildings_' + currentUser.id;
    localStorage.setItem(storageKey, JSON.stringify(cityBuildings));
    
    console.log("🏢 Синхронизировано зданий для города:", Object.keys(cityBuildings).length);
  }
}

function convertBuildingType(type) {
  // Конвертация типов зданий из основной игры в ID для изометрической
  var mapping = {
    'coffee': 'cafe',
    'flowershop': 'flower',
    'minimarket': 'minimarket',
    'foodtruck': 'foodtruck',
    'icecream': 'icecream',
    'restaurant': 'restaurant',
    'shop': 'store',
    'autoservice': 'autoservice',
    'itcompany': 'itoffice',
    'gasstation': 'gasstation',
    'businesspark': 'business',
    'cinema': 'cinema',
    'construction': 'construction',
    'warehouse': 'warehouse',
    'mall': 'mall'
  };
  return mapping[type] || null;
}

function updateCityGameBalance() {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Обновляем отображение в городе
  var coinDisplay = document.getElementById('city-coin-display');
  if (coinDisplay) {
    coinDisplay.textContent = (currentUser.balanceMtBanks || 0).toLocaleString();
  }
  
  // Синхронизируем через функцию города
  if (typeof window.syncBalanceFromApp === 'function') {
    window.syncBalanceFromApp(currentUser.balanceMtBanks || 0);
  }
}

function refreshCityGame() {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  updateCityGameBalance();
  
  if (typeof window.refreshCityUI === 'function') {
    window.refreshCityUI();
  }
}

function showMode2Placeholder() {
  var mode2Container = document.getElementById("mode2-container");
  if (!mode2Container) return;
  
  mode2Container.innerHTML = `
    <div class="game-board-mode2">
      <div class="game-board-mode2__icon">🏗️</div>
      <div class="game-board-mode2__title">Изометрический город</div>
      <div class="game-board-mode2__text">Не удалось загрузить город</div>
      <div class="game-board-mode2__text">✨ Проверьте наличие файла city-game.js ✨</div>
      <button class="mode2-retry-btn" onclick="location.reload()">🔄 Перезагрузить</button>
    </div>
  `;
}

function toggleGameMode() {
  console.log("🔄 toggleGameMode вызван, текущий режим:", currentGameMode);
  
  if (currentGameMode === 1) {
    currentGameMode = 2;
    showGameToast("🔄 Переключено на Изометрический город");
    console.log("🔄 Переключение на режим 2 (Изометрический город)");
  } else {
    currentGameMode = 1;
    showGameToast("🔄 Переключено на Город МТ");
    console.log("🔄 Переключение на режим 1 (Город МТ)");
    syncFromCityToMainGame();
  }
  localStorage.setItem("rr_game_mode", currentGameMode);
  renderGameBoard();
}

// ========== СИНХРОНИЗАЦИЯ ИЗ ГОРОДА В ОСНОВНУЮ ИГРУ ==========

function syncBalanceToMain(amount) {
  console.log("💰 Синхронизация баланса из города:", amount);
  
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  currentUser.balanceMtBanks = amount;
  currentUser.balanceSkillPoints = currentUser.balanceSkillPoints || 0;
  
  var users = loadAllUsers();
  users[currentUser.id] = currentUser;
  saveAllUsers(users);
  
  balanceMtBanks = amount;
  syncBalancesToDom();
  updateGameBalanceDisplay();
  
  showGameToast(`💰 Баланс обновлён: ${amount} MTBank Tokens`);
}

// Сделаем функции глобальными для доступа из city-game.js
window.syncBalanceToMain = syncBalanceToMain;
window.toggleGameMode = toggleGameMode;
window.renderGameBoard = renderGameBoard;
window.currentGameMode = currentGameMode;

function initGameModeToggle() {
  var toggleBtn = document.getElementById("game-mode-toggle");
  if (toggleBtn) {
    var newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    newToggleBtn.addEventListener("click", function() {
      toggleGameMode();
    });
  }
  
  var savedMode = localStorage.getItem("rr_game_mode");
  if (savedMode !== null) {
    currentGameMode = parseInt(savedMode);
  }
}
  // ========== ИГРОВАЯ МЕХАНИКА ==========
  
  function loadGameBuildings() {
    var currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    var gameKey = "rr_game_" + currentUser.id;
    try {
      var raw = localStorage.getItem(gameKey);
      if (!raw) {
        var emptyGrid = [];
        for (var i = 0; i < 25; i++) emptyGrid.push(null);
        var defaultData = { buildings: emptyGrid, lastUpdate: Date.now() };
        saveGameBuildings(defaultData);
        return defaultData;
      }
      return JSON.parse(raw);
    } catch (e) {
      var emptyGrid = [];
      for (var i = 0; i < 25; i++) emptyGrid.push(null);
      return { buildings: emptyGrid, lastUpdate: Date.now() };
    }
  }
  
  function saveGameBuildings(data) {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    var gameKey = "rr_game_" + currentUser.id;
    localStorage.setItem(gameKey, JSON.stringify(data));
  }
  
  function getBuildingIncome(building) {
    if (!building) return 0;
    var typeData = BUILDING_TYPES[building.type];
    if (!typeData) return 0;
    return Math.floor(typeData.baseIncome * Math.pow(typeData.upgradeMultiplier, building.level - 1));
  }
  
        function getUpgradeCost(building) {
    if (!building) return 0;
    // МТБанк не улучшается за очки прокачки
    if (building.type === "mtbank") return Infinity;
    var typeData = BUILDING_TYPES[building.type];
    if (!typeData) return 0;
    return Math.floor(typeData.cost * Math.pow(1.3, building.level - 1));
  }
  
  function updateBuildingPriceMultiplier() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    var gameData = loadGameBuildings();
    var buildingCount = 0;
    for (var i = 0; i < gameData.buildings.length; i++) {
      if (gameData.buildings[i]) buildingCount++;
    }
    
    buildingPriceMultiplier = Math.pow(1.1, buildingCount);
  }
  
  function migrateOldBuildings() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    var gameData = loadGameBuildings();
    var needSave = false;
    
    for (var i = 0; i < gameData.buildings.length; i++) {
      var building = gameData.buildings[i];
      if (building && !building.purchasePrice) {
        var typeData = BUILDING_TYPES[building.type];
        if (typeData) {
          building.purchasePrice = typeData.cost;
          needSave = true;
        }
      }
    }
    
    if (needSave) {
      saveGameBuildings(gameData);
    }
  }
  
  function updatePendingIncome() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    var gameData = loadGameBuildings();
    var now = Date.now();
    var timeDiff = (now - (gameData.lastUpdate || now)) / (1000 * 60 * 60);
    
    if (timeDiff > 0 && timeDiff < 24) {
      for (var i = 0; i < gameData.buildings.length; i++) {
        var building = gameData.buildings[i];
        if (building) {
          if (!building.pendingIncome) building.pendingIncome = 0;
          var hourlyIncome = getBuildingIncome(building);
          var earned = Math.floor(hourlyIncome * timeDiff);
          building.pendingIncome += earned;
        }
      }
    }
    
    gameData.lastUpdate = now;
    saveGameBuildings(gameData);
    renderMinecraftGrid();
    updateGameBalanceDisplay();
  }
  
  function collectBuildingIncome(index) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    var gameData = loadGameBuildings();
    if (!gameData.buildings[index]) {
      showGameToast("❌ Здание не найдено!");
      return false;
    }
    
    var building = gameData.buildings[index];
    
    if (!building.pendingIncome || building.pendingIncome <= 0) {
      showGameToast("💰 Нет накопленного дохода!");
      return false;
    }
    
    var amount = building.pendingIncome;
    currentUser.balanceMtBanks = (currentUser.balanceMtBanks || 0) + amount;
    building.pendingIncome = 0;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveGameBuildings(gameData);
    
    balanceMtBanks = currentUser.balanceMtBanks;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    renderMinecraftGrid();
    
    showGameToast("💰 Получено " + amount + " MTBank Tokens!");
    return true;
  }
  
  function collectAllIncome() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    var gameData = loadGameBuildings();
    var totalCollected = 0;
    
    for (var i = 0; i < gameData.buildings.length; i++) {
      var building = gameData.buildings[i];
      if (building && building.pendingIncome && building.pendingIncome > 0) {
        totalCollected += building.pendingIncome;
        building.pendingIncome = 0;
      }
    }
    
    if (totalCollected > 0) {
      currentUser.balanceMtBanks = (currentUser.balanceMtBanks || 0) + totalCollected;
      var users = loadAllUsers();
      users[currentUser.id] = currentUser;
      saveAllUsers(users);
      saveGameBuildings(gameData);
      
      balanceMtBanks = currentUser.balanceMtBanks;
      syncBalancesToDom();
      updateGameBalanceDisplay();
      renderMinecraftGrid();
      
      showGameToast("🧺 Собрано " + totalCollected + " MTBank Tokens!");
    } else {
      showGameToast("😴 Нет дохода для сбора");
    }
  }
  
  function buildBuilding(index, type) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    updateBuildingPriceMultiplier();
    var baseCost = BUILDING_TYPES[type].cost;
    var cost = Math.floor(baseCost * buildingPriceMultiplier);
    
    if ((currentUser.balanceSkillPoints || 0) < cost) {
      showGameToast("❌ Недостаточно очков прокачки! Нужно " + cost + " ⭐");
      return false;
    }
    
    var gameData = loadGameBuildings();
    if (gameData.buildings[index]) {
      showGameToast("❌ Здесь уже есть здание!");
      return false;
    }
    
    gameData.buildings[index] = {
      type: type,
      level: 1,
      pendingIncome: 0,
      purchasePrice: cost
    };
    
    currentUser.balanceSkillPoints -= cost;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveGameBuildings(gameData);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    balanceMtBanks = currentUser.balanceMtBanks;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    renderMinecraftGrid();
    
    showGameToast("✅ Построено: " + BUILDING_TYPES[type].name + " за " + cost + " ⭐!");
        // Начисляем опыт МТБанку за постройку бизнеса (5 EXP)
    addMtbankExp(5, "build_building");
    return true;
  }
  
    function upgradeBuilding(index) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    var gameData = loadGameBuildings();
    var building = gameData.buildings[index];
    
    if (!building) {
      showGameToast("❌ Здесь нет здания!");
      return false;
    }
    
    // Проверка максимального уровня для банка (если есть maxLevel)
    var typeData = BUILDING_TYPES[building.type];
    if (typeData && typeData.maxLevel && building.level >= typeData.maxLevel) {
      showGameToast(`❌ ${typeData.name} достиг максимального ${typeData.maxLevel} уровня!`);
      return false;
    }
    
    var cost = getUpgradeCost(building);
    
    if ((currentUser.balanceSkillPoints || 0) < cost) {
      showGameToast("❌ Недостаточно очков прокачки для улучшения! Нужно " + cost + " ⭐");
      return false;
    }
    
    building.level++;
    currentUser.balanceSkillPoints -= cost;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveGameBuildings(gameData);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    balanceMtBanks = currentUser.balanceMtBanks;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    renderMinecraftGrid();
    
    showGameToast("⬆️ " + BUILDING_TYPES[building.type].name + " улучшен до " + building.level + " уровня!");
    
        // Начисляем опыт МТБанку за улучшение бизнеса (10 EXP за уровень)
    var expGain = 10 * building.level;
    addMtbankExp(expGain, "upgrade_building");

    checkAllTasksCompletion();

    if (currentInfoIndex === index) {
      document.getElementById("info-level").textContent = building.level;
      document.getElementById("info-income").textContent = getBuildingIncome(building);
      document.getElementById("info-upgrade-cost").textContent = getUpgradeCost(building);
    }
    
    return true;
  }
  
  function sellBuilding(index) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    var gameData = loadGameBuildings();
    var building = gameData.buildings[index];
    
    if (!building) {
      showGameToast("❌ Здесь нет здания!");
      return false;
    }
    
    var purchasePrice = building.purchasePrice;
    if (!purchasePrice || isNaN(purchasePrice)) {
      var typeData = BUILDING_TYPES[building.type];
      purchasePrice = typeData.cost;
    }
    
    var sellPrice = Math.floor(purchasePrice / 2);
    
    if (isNaN(sellPrice)) {
      showGameToast("❌ Ошибка при продаже!");
      return false;
    }
    
    currentUser.balanceSkillPoints = (currentUser.balanceSkillPoints || 0) + sellPrice;
    
    gameData.buildings[index] = null;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    saveGameBuildings(gameData);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    renderMinecraftGrid();
    
    showGameToast("💰 Здание продано! Выручено " + sellPrice + " ⭐ (50% от цены покупки)");
    return true;
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
  
  function updateGameBalanceDisplay() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    var balanceSpan = document.getElementById("game-balance");
    if (balanceSpan) balanceSpan.textContent = currentUser.balanceMtBanks || 0;
    
    var skillSpan = document.getElementById("game-skill-balance");
    if (skillSpan) skillSpan.textContent = currentUser.balanceSkillPoints || 0;
    
    var gameData = loadGameBuildings();
    var totalHourly = 0;
    for (var i = 0; i < gameData.buildings.length; i++) {
      var b = gameData.buildings[i];
      if (b) totalHourly += getBuildingIncome(b);
    }
    var totalIncomeSpan = document.getElementById("total-income");
    if (totalIncomeSpan) totalIncomeSpan.textContent = totalHourly;
  }
  
  function addSkillPoints(amount) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    currentUser.balanceSkillPoints = (currentUser.balanceSkillPoints || 0) + amount;
    
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    
    balanceSkillPoints = currentUser.balanceSkillPoints;
    syncBalancesToDom();
    updateGameBalanceDisplay();
    
    showGameToast("✨ Добавлено " + amount + " очков прокачки!");
    return true;
  }
  
      function openBuildModal(blockIndex) {
    currentSelectedBlock = blockIndex;
    var container = document.getElementById("build-options");
    container.innerHTML = "";
    
    var mtData = getMtbankData();
    var currentLevel = mtData ? mtData.level : 1;
    
    // Группируем здания по категориям
    var categories = {
      1: { name: "🏪 1 уровень МТБанка", buildings: [], unlocked: currentLevel >= 1 },
      2: { name: "🏢 2 уровень МТБанка", buildings: [], unlocked: currentLevel >= 2 },
      3: { name: "🏬 3 уровень МТБанка", buildings: [], unlocked: currentLevel >= 3 }
    };
    
    for (var i = 0; i < BUILDING_KEYS.length; i++) {
      var key = BUILDING_KEYS[i];
      var type = BUILDING_TYPES[key];
      if (type && type.category) {
        categories[type.category].buildings.push({ key: key, type: type });
      }
    }
    
    // Добавляем заголовки и здания
    for (var cat = 1; cat <= 3; cat++) {
      var category = categories[cat];
      if (category.buildings.length === 0) continue;
      
      // Заголовок категории
      var header = document.createElement("div");
      header.className = "build-category-header";
      header.innerHTML = `<span class="build-category-title">${category.name}</span>`;
      container.appendChild(header);
      
      // Здания в категории
      for (var j = 0; j < category.buildings.length; j++) {
        var item = category.buildings[j];
        var key = item.key;
        var type = item.type;
        var isUnlocked = currentLevel >= type.unlockLevel;
        var price = Math.floor(type.cost * buildingPriceMultiplier);
        
        var option = document.createElement("div");
        option.className = "build-option";
        
        if (isUnlocked) {
          option.innerHTML = `
            <div class="build-option__icon">${type.icon}</div>
            <div class="build-option__name">${type.name}</div>
            <div class="build-option__cost">⭐ ${price}</div>
          `;
          option.addEventListener("click", (function(k) {
            return function() {
              buildBuilding(currentSelectedBlock, k);
              closeBuildModal();
            };
          })(key));
        } else {
          option.classList.add("build-option--locked");
          option.innerHTML = `
            <div class="build-option__icon">${type.icon}</div>
            <div class="build-option__name">${type.name}</div>
            <div class="build-option__cost">🔒 Уровень МТБанка ${type.unlockLevel}</div>
          `;
        }
        
        container.appendChild(option);
      }
    }
    
    var modal = document.getElementById("build-modal");
    modal.removeAttribute("hidden");
  }
  
  function closeBuildModal() {
    var modal = document.getElementById("build-modal");
    modal.setAttribute("hidden", "");
    currentSelectedBlock = null;
  }
  
  function openInfoModal(index) {
    var gameData = loadGameBuildings();
    var building = gameData.buildings[index];
    if (!building) {
      showGameToast("❌ Здесь нет здания!");
      return;
    }
    
        if (building.type === "mtbank") {
      openMtbankModal();
      return;
    }

    var typeData = BUILDING_TYPES[building.type];
    if (!typeData) {
      showGameToast("❌ Ошибка: тип здания не найден!");
      return;
    }
    
    currentInfoIndex = index;
    
    var iconContainer = document.getElementById("info-icon");
    if (iconContainer) {
      iconContainer.innerHTML = typeData.svg;
      iconContainer.style.width = "80px";
      iconContainer.style.height = "80px";
      iconContainer.style.margin = "0 auto";
      iconContainer.style.display = "flex";
      iconContainer.style.alignItems = "center";
      iconContainer.style.justifyContent = "center";
    }
    
    var purchasePrice = building.purchasePrice;
    if (!purchasePrice || isNaN(purchasePrice)) {
      purchasePrice = typeData.cost;
    }
    var sellPrice = Math.floor(purchasePrice / 2);
    
    document.getElementById("info-title").textContent = typeData.name;
    document.getElementById("info-type").textContent = typeData.name;
    document.getElementById("info-level").textContent = building.level;
    document.getElementById("info-income").textContent = getBuildingIncome(building);
    document.getElementById("info-pending").textContent = building.pendingIncome || 0;
    document.getElementById("info-upgrade-cost").textContent = getUpgradeCost(building);
    
    var sellValueSpan = document.getElementById("info-sell-value");
    if (sellValueSpan) sellValueSpan.textContent = sellPrice;
    
    var modal = document.getElementById("info-modal");
    if (modal) {
      modal.removeAttribute("hidden");
    }
  }
  
  function closeInfoModal() {
    var modal = document.getElementById("info-modal");
    modal.setAttribute("hidden", "");
    currentInfoIndex = null;
  }
  
    function renderMinecraftGrid() {
    updateBuildingPriceMultiplier();
    var container = document.getElementById("minecraft-grid");
    if (!container) return;
    
    var gameData = loadGameBuildings();
    
    // Проверяем и создаём МТБанк в центре, если его нет
    if (!gameData.buildings || !gameData.buildings[12]) {
      gameData.buildings[12] = {
        type: "mtbank",
        level: 1,
        isMainBank: true,
        pendingIncome: 0
      };
      saveGameBuildings(gameData);
    }
    
    container.innerHTML = "";
    
    for (var i = 0; i < 25; i++) {
      var block = document.createElement("div");
      block.className = "minecraft-block";
      
      var building = gameData.buildings[i];
      
            if (building && BUILDING_TYPES[building.type]) {
        var typeData = BUILDING_TYPES[building.type];
        var pending = building.pendingIncome || 0;
        
        block.className += " minecraft-block--building";
        
        if (building.type === "mtbank") {
          block.classList.add("minecraft-block--mtbank");
        }
        
        block.className += " minecraft-block--building";
        
        var buildingDiv = document.createElement("div");
        buildingDiv.className = "block-building";
        
        var svgDiv = document.createElement("div");
        svgDiv.className = "block-building__svg";
        svgDiv.innerHTML = typeData.svg;
        
        var levelSpan = document.createElement("div");
        levelSpan.className = "block-building__level";
        levelSpan.textContent = building.level;
        
        var incomeSpan = document.createElement("div");
        incomeSpan.className = "block-building__income";
        if (pending > 0) {
          incomeSpan.classList.add("block-building__income--active");
        }
        incomeSpan.textContent = "+" + pending;
        
        buildingDiv.appendChild(svgDiv);
        buildingDiv.appendChild(levelSpan);
        buildingDiv.appendChild(incomeSpan);
        block.appendChild(buildingDiv);
        
        block.addEventListener("click", (function(idx) {
          return function(e) {
            e.stopPropagation();
            openInfoModal(idx);
          };
        })(i));
        
      } else {
        block.className += " minecraft-block--empty";
        
        var emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-block";
        emptyDiv.innerHTML = `
          <div class="empty-block__plus">+</div>
          <div class="empty-block__text">построить</div>
        `;
        block.appendChild(emptyDiv);
        
        block.addEventListener("click", (function(idx) {
          return function(e) {
            e.stopPropagation();
            openBuildModal(idx);
          };
        })(i));
      }
      
      container.appendChild(block);
    }
  }
  
  var incomeInterval = null;
  
  function startIncomeTimer() {
    if (incomeInterval) clearInterval(incomeInterval);
    incomeInterval = setInterval(function() {
      updatePendingIncome();
    }, 60000);
  }
  
  function initGame() {
  var currentUser = getCurrentUser();
  if (currentUser) {
    var gameData = loadGameBuildings();
    if (!gameData.buildings[12] || gameData.buildings[12].type !== "mtbank") {
      gameData.buildings[12] = {
        type: "mtbank",
        level: 1,
        isMainBank: true,
        pendingIncome: 0
      };
      saveGameBuildings(gameData);
      console.log("МТБанк создан в центре поля");
    }
  }
  
  migrateOldBuildings();
  updateBuildingPriceMultiplier();
  updatePendingIncome();
  updateGameBalanceDisplay();
  startIncomeTimer();
  
  // Кнопка сбора всего дохода
  var collectAllBtn = document.getElementById("collect-all-btn");
  if (collectAllBtn) {
    var newCollectBtn = collectAllBtn.cloneNode(true);
    collectAllBtn.parentNode.replaceChild(newCollectBtn, collectAllBtn);
    newCollectBtn.addEventListener("click", function() {
      collectAllIncome();
    });
  }
  
  // Закрытие модального окна строительства
  var buildModalClose = document.getElementById("build-modal-close");
  var buildModalOverlay = document.querySelector("#build-modal .build-modal__overlay");
  if (buildModalClose) {
    var newBuildClose = buildModalClose.cloneNode(true);
    buildModalClose.parentNode.replaceChild(newBuildClose, buildModalClose);
    newBuildClose.addEventListener("click", closeBuildModal);
  }
  if (buildModalOverlay) {
    var newBuildOverlay = buildModalOverlay.cloneNode(true);
    buildModalOverlay.parentNode.replaceChild(newBuildOverlay, buildModalOverlay);
    newBuildOverlay.addEventListener("click", closeBuildModal);
  }
  
  // Закрытие модального окна информации
  var infoModalClose = document.getElementById("info-modal-close");
  var infoModalOverlay = document.querySelector("#info-modal .info-modal__overlay");
  var infoCollectBtn = document.getElementById("info-collect-btn");
  var infoUpgradeBtn = document.getElementById("info-upgrade-btn");
  var infoSellBtn = document.getElementById("info-sell-btn");
  
  if (infoModalClose) {
    var newInfoClose = infoModalClose.cloneNode(true);
    infoModalClose.parentNode.replaceChild(newInfoClose, infoModalClose);
    newInfoClose.addEventListener("click", closeInfoModal);
  }
  if (infoModalOverlay) {
    var newInfoOverlay = infoModalOverlay.cloneNode(true);
    infoModalOverlay.parentNode.replaceChild(newInfoOverlay, infoModalOverlay);
    newInfoOverlay.addEventListener("click", closeInfoModal);
  }
  
  if (infoCollectBtn) {
    var newCollect = infoCollectBtn.cloneNode(true);
    infoCollectBtn.parentNode.replaceChild(newCollect, infoCollectBtn);
    newCollect.addEventListener("click", function() {
      if (currentInfoIndex !== null) {
        collectBuildingIncome(currentInfoIndex);
        closeInfoModal();
      }
    });
  }
  
  if (infoUpgradeBtn) {
    var newUpgrade = infoUpgradeBtn.cloneNode(true);
    infoUpgradeBtn.parentNode.replaceChild(newUpgrade, infoUpgradeBtn);
    newUpgrade.addEventListener("click", function() {
      if (currentInfoIndex !== null) {
        upgradeBuilding(currentInfoIndex);
        closeInfoModal();
      }
    });
  }
  
  if (infoSellBtn) {
    var newSell = infoSellBtn.cloneNode(true);
    infoSellBtn.parentNode.replaceChild(newSell, infoSellBtn);
    newSell.addEventListener("click", function() {
      if (currentInfoIndex !== null) {
        sellBuilding(currentInfoIndex);
        closeInfoModal();
      }
    });
  }
  
  // Модальное окно помощи
  var helpBtn = document.getElementById("game-help-btn");
  var helpModal = document.getElementById("help-modal");
  var helpModalClose = document.getElementById("help-modal-close");
  var helpModalOk = document.getElementById("help-modal-ok");
  var helpModalOverlay = document.querySelector("#help-modal .help-modal__overlay");
  
  if (helpBtn && helpModal) {
    var newHelpBtn = helpBtn.cloneNode(true);
    helpBtn.parentNode.replaceChild(newHelpBtn, helpBtn);
    newHelpBtn.addEventListener("click", function() {
      helpModal.removeAttribute("hidden");
    });
  }
  
  if (helpModalClose && helpModal) {
    var newHelpClose = helpModalClose.cloneNode(true);
    helpModalClose.parentNode.replaceChild(newHelpClose, helpModalClose);
    newHelpClose.addEventListener("click", function() {
      helpModal.setAttribute("hidden", "");
    });
  }
  
  if (helpModalOk && helpModal) {
    var newHelpOk = helpModalOk.cloneNode(true);
    helpModalOk.parentNode.replaceChild(newHelpOk, helpModalOk);
    newHelpOk.addEventListener("click", function() {
      helpModal.setAttribute("hidden", "");
    });
  }
  
  if (helpModalOverlay && helpModal) {
    var newHelpOverlay = helpModalOverlay.cloneNode(true);
    helpModalOverlay.parentNode.replaceChild(newHelpOverlay, helpModalOverlay);
    newHelpOverlay.addEventListener("click", function() {
      helpModal.setAttribute("hidden", "");
    });
  }
  
  // Кнопка добавления очков прокачки
  var addSkillBtn = document.getElementById("btn-add-skill");
  if (addSkillBtn) {
    var newAddSkillBtn = addSkillBtn.cloneNode(true);
    addSkillBtn.parentNode.replaceChild(newAddSkillBtn, addSkillBtn);
    newAddSkillBtn.addEventListener("click", function() {
      var amountInput = document.getElementById("skill-add-amount");
      var amount = parseInt(amountInput.value, 10);
      if (isNaN(amount) || amount <= 0) {
        amount = 100;
      }
      addSkillPoints(amount);
    });
  }
  
  // Кнопка восстановления календаря
  var resetStreakBtn = document.getElementById("reset-streak-btn");
  if (resetStreakBtn) {
    var newResetBtn = resetStreakBtn.cloneNode(true);
    resetStreakBtn.parentNode.replaceChild(newResetBtn, resetStreakBtn);
    newResetBtn.addEventListener("click", function() {
      resetCalendarWithTokens();
    });
  }
  
  // Наблюдатель за переключением вкладок
  var gamePanel = document.getElementById("panel-game");
  if (gamePanel) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === "class" && gamePanel.classList.contains("is-active")) {
          updateGameBalanceDisplay();
          renderGameBoard();
        }
      });
    });
    observer.observe(gamePanel, { attributes: true });
  }
  
  // ========== МТБанк модальное окно ==========
  var mtbankModal = document.getElementById("mtbank-modal");
  var mtbankModalClose = document.getElementById("mtbank-modal-close");
  var mtbankModalOverlay = document.querySelector("#mtbank-modal .mtbank-modal__overlay");
  var creditBtn = document.getElementById("credit-btn");
  var depositBtn = document.getElementById("deposit-btn");
  var repayCreditBtn = document.getElementById("repay-credit-btn");
  
  // Закрытие по кнопке ✕
  if (mtbankModalClose) {
    var newMtbankClose = mtbankModalClose.cloneNode(true);
    mtbankModalClose.parentNode.replaceChild(newMtbankClose, mtbankModalClose);
    newMtbankClose.addEventListener("click", closeMtbankModal);
  }
  
  // Закрытие по клику на фон
  if (mtbankModalOverlay) {
    var newMtbankOverlay = mtbankModalOverlay.cloneNode(true);
    mtbankModalOverlay.parentNode.replaceChild(newMtbankOverlay, mtbankModalOverlay);
    newMtbankOverlay.addEventListener("click", closeMtbankModal);
  }
  
  // Закрытие по клавише Escape
  if (mtbankModal) {
    var mtbankEscapeHandler = function(e) {
      if (e.key === "Escape" && !mtbankModal.hasAttribute("hidden")) {
        closeMtbankModal();
      }
    };
    document.removeEventListener("keydown", mtbankEscapeHandler);
    document.addEventListener("keydown", mtbankEscapeHandler);
  }
  
  // Кнопка кредита
  if (creditBtn) {
    var newCreditBtn = creditBtn.cloneNode(true);
    creditBtn.parentNode.replaceChild(newCreditBtn, creditBtn);
    newCreditBtn.addEventListener("click", function() {
      takeCredit();
    });
  }
  
  // Кнопка вклада
  if (depositBtn) {
    var newDepositBtn = depositBtn.cloneNode(true);
    depositBtn.parentNode.replaceChild(newDepositBtn, depositBtn);
    newDepositBtn.addEventListener("click", function() {
      createDeposit();
    });
  }
  
  // Кнопка погашения кредита
  if (repayCreditBtn) {
    var newRepayBtn = repayCreditBtn.cloneNode(true);
    repayCreditBtn.parentNode.replaceChild(newRepayBtn, repayCreditBtn);
    newRepayBtn.addEventListener("click", function() {
      repayCredit();
    });
  }
  
  // Периодическая проверка вкладов (каждую минуту)
  setInterval(function() {
    checkDeposits();
  }, 60000);
  
  checkDeposits();
  
  // ========== ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ ИГРЫ ==========
  initGameModeToggle();
  
  // Загружаем сохранённый режим
  var savedMode = localStorage.getItem("rr_game_mode");
  if (savedMode !== null) {
    currentGameMode = parseInt(savedMode);
  }
  
  // Отображаем игровое поле в соответствии с выбранным режимом
  renderGameBoard();
}

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
    
    initGame();
    initCalendar();
    initTasks(); 
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();