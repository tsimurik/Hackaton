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
      renderMinecraftGrid();
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
  
  var BUILDING_TYPES = {
    coffee: { 
      name: "Кофейня", 
      icon: "☕",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#F5F0E8" stroke="#A89880" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#4A4A4A" stroke="#2A2A2A" stroke-width="1"/><text x="60" y="32" font-size="8" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">☕ КОФЕЙНЯ</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#B3E5FC" stroke="#78909C" stroke-width="1" opacity="0.8"/><line x1="35" y1="40" x2="35" y2="80" stroke="#78909C" stroke-width="0.8"/><line x1="18" y1="60" x2="53" y2="60" stroke="#78909C" stroke-width="0.8"/><rect x="62" y="42" width="40" height="38" rx="2" fill="#D4C8B8" stroke="#A89880" stroke-width="1"/><rect x="58" y="38" width="48" height="5" rx="1" fill="#607D8B"/><rect x="15" y="85" width="25" height="15" rx="2" fill="#6D4C41"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#6D4C41"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 50, 
      upgradeMultiplier: 1.5, 
      cost: 100 
    },
    bank: { 
      name: "Банк", 
      icon: "🏦",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="25" width="104" height="75" rx="3" fill="#E8ECEF" stroke="#8090A0" stroke-width="1.5"/><rect x="8" y="25" width="104" height="18" rx="3" fill="#455A64" stroke="#263238" stroke-width="1"/><text x="60" y="38" font-size="9" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🏦 БАНК</text><rect x="15" y="48" width="12" height="35" fill="#D7CCC8" stroke="#8D6E63" stroke-width="0.8"/><rect x="93" y="48" width="12" height="35" fill="#D7CCC8" stroke="#8D6E63" stroke-width="0.8"/><rect x="35" y="52" width="15" height="28" fill="#81D4FA" stroke="#607D8B" stroke-width="0.8" opacity="0.7"/><rect x="70" y="52" width="15" height="28" fill="#81D4FA" stroke="#607D8B" stroke-width="0.8" opacity="0.7"/><path d="M60,22 Q60,15 60,22" fill="none" stroke="#FFC107" stroke-width="2"/><circle cx="60" cy="20" r="3" fill="#FFD700"/><rect x="12" y="85" width="96" height="5" fill="#CFD8DC"/><ellipse cx="60" cy="105" rx="50" ry="6" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 80, 
      upgradeMultiplier: 1.6, 
      cost: 150 
    },
    shop: { 
      name: "Магазин", 
      icon: "🏪",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#FFAB91" stroke="#BF360C" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#424242" stroke="#1A1A1A" stroke-width="1"/><text x="60" y="32" font-size="8" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🛒 МАГАЗИН</text><rect x="15" y="40" width="40" height="40" rx="2" fill="#B3E5FC" stroke="#BF360C" stroke-width="1" opacity="0.8"/><line x1="35" y1="40" x2="35" y2="80" stroke="#BF360C" stroke-width="0.8"/><line x1="15" y1="60" x2="55" y2="60" stroke="#BF360C" stroke-width="0.8"/><rect x="65" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#BF360C" stroke-width="1"/><rect x="60" y="38" width="50" height="5" rx="1" fill="#E64A19"/><rect x="18" y="85" width="30" height="15" rx="2" fill="#8D6E63"/><rect x="72" y="85" width="30" height="15" rx="2" fill="#8D6E63"/><rect x="12" y="105" width="96" height="3" fill="#BCAAA4" rx="1"/><ellipse cx="60" cy="112" rx="45" ry="4" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 60, 
      upgradeMultiplier: 1.55, 
      cost: 120 
    },
    itcompany: { 
      name: "IT Компания", 
      icon: "💻",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="90" height="85" rx="3" fill="#B3E5FC" stroke="#0288D1" stroke-width="1.5"/><rect x="15" y="15" width="90" height="12" rx="3" fill="#37474F" stroke="#1A1A1A" stroke-width="1"/><text x="60" y="24" font-size="6" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">💻 IT КОМПАНИЯ</text><rect x="22" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="38" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="54" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="70" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><rect x="86" y="32" width="12" height="55" fill="#E1F5FE" stroke="#0288D1" stroke-width="0.6" rx="1"/><text x="60" y="82" font-size="7" fill="#00FF00" font-family="monospace" text-anchor="middle">&lt;/&gt;</text><rect x="12" y="102" width="96" height="3" fill="#90A4AE" rx="1"/><ellipse cx="60" cy="110" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 90, 
      upgradeMultiplier: 1.65, 
      cost: 200 
    },
    warehouse: { 
      name: "Склад", 
      icon: "🏭",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="25" width="104" height="70" rx="3" fill="#D7CCC8" stroke="#5D4037" stroke-width="1.5"/><rect x="8" y="25" width="104" height="12" rx="3" fill="#546E7A" stroke="#263238" stroke-width="1"/><text x="60" y="34" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">📦 СКЛАД</text><rect x="20" y="42" width="35" height="28" rx="2" fill="#37474F"/><rect x="22" y="44" width="31" height="4" fill="#455A64"/><rect x="22" y="50" width="31" height="4" fill="#455A64"/><rect x="22" y="56" width="31" height="4" fill="#455A64"/><rect x="22" y="62" width="31" height="4" fill="#455A64"/><rect x="65" y="45" width="35" height="25" rx="2" fill="#37474F"/><rect x="67" y="47" width="31" height="3" fill="#455A64"/><rect x="67" y="52" width="31" height="3" fill="#455A64"/><rect x="67" y="57" width="31" height="3" fill="#455A64"/><rect x="67" y="62" width="31" height="3" fill="#455A64"/><rect x="15" y="78" width="25" height="15" rx="2" fill="#A1887F"/><rect x="80" y="78" width="25" height="15" rx="2" fill="#A1887F"/><rect x="12" y="98" width="96" height="4" fill="#78909C" rx="1"/><ellipse cx="60" cy="108" rx="48" ry="6" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 45, 
      upgradeMultiplier: 1.52, 
      cost: 90 
    },
    flowershop: { 
      name: "Цветочный магазин", 
      icon: "🌷",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#FCE4EC" stroke="#E91E63" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#AD1457" stroke="#880E4F" stroke-width="1"/><text x="60" y="32" font-size="6" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🌷 ЦВЕТЫ</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#B3E5FC" stroke="#E91E63" stroke-width="1" opacity="0.8"/><line x1="35" y1="40" x2="35" y2="80" stroke="#E91E63" stroke-width="0.8"/><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#E91E63" stroke-width="1"/><text x="60" y="78" font-size="10" fill="#E91E63" text-anchor="middle">🌻🌹🌺</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#66BB6A"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#66BB6A"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 55, 
      upgradeMultiplier: 1.53, 
      cost: 110 
    },
    autoservice: { 
      name: "Автосервис", 
      icon: "🔧",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#B0BEC5" stroke="#455A64" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#37474F" stroke="#263238" stroke-width="1"/><text x="60" y="32" font-size="6" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🔧 АВТОСЕРВИС</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFF" stroke="#455A64" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#455A64" text-anchor="middle">🚗</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#455A64" stroke-width="1"/><text x="82" y="65" font-size="10" fill="#455A64" text-anchor="middle">🔧</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#78909C"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#78909C"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 75, 
      upgradeMultiplier: 1.62, 
      cost: 160 
    },
    cinema: { 
      name: "Кинотеатр", 
      icon: "🎬",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#E1BEE7" stroke="#6A1B9A" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#4A148C" stroke="#311B92" stroke-width="1"/><text x="60" y="32" font-size="6" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🎬 КИНОТЕАТР</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFD54F" stroke="#6A1B9A" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#6A1B9A" text-anchor="middle">🎬</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#6A1B9A" stroke-width="1"/><text x="60" y="78" font-size="7" fill="#6A1B9A" text-anchor="middle">КИНО</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#CE93D8"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#CE93D8"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 85, 
      upgradeMultiplier: 1.63, 
      cost: 180 
    },
    construction: { 
      name: "Стройкомпания", 
      icon: "🏗️",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#FFF3E0" stroke="#E65100" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#BF360C" stroke="#E65100" stroke-width="1"/><text x="60" y="32" font-size="5" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🏗️ СТРОЙКОМПАНИЯ</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFCC80" stroke="#E65100" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#E65100" text-anchor="middle">🏗️</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#E65100" stroke-width="1"/><text x="60" y="78" font-size="6" fill="#E65100" text-anchor="middle">СТРОЙКА</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#FFA726"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#FFA726"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 95, 
      upgradeMultiplier: 1.68, 
      cost: 220 
    },
    gasstation: { 
      name: "Заправка", 
      icon: "⛽",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#C8E6C9" stroke="#2E7D32" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#1B5E20" stroke="#1B5E20" stroke-width="1"/><text x="60" y="32" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">⛽ ЗАПРАВКА</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFF" stroke="#2E7D32" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#2E7D32" text-anchor="middle">⛽</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#2E7D32" stroke-width="1"/><text x="60" y="78" font-size="6" fill="#2E7D32" text-anchor="middle">БЕНЗИН</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#66BB6A"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#66BB6A"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 70, 
      upgradeMultiplier: 1.6, 
      cost: 140 
    },
    restaurant: { 
      name: "Ресторан", 
      icon: "🍽️",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="100" height="80" rx="4" fill="#FFE0B2" stroke="#E65100" stroke-width="1.5"/><rect x="10" y="20" width="100" height="15" rx="4" fill="#BF360C" stroke="#E65100" stroke-width="1"/><text x="60" y="32" font-size="7" fill="#FFF" font-family="sans-serif" text-anchor="middle" font-weight="bold">🍽️ РЕСТОРАН</text><rect x="18" y="40" width="35" height="40" rx="2" fill="#FFF" stroke="#E65100" stroke-width="1"/><text x="35" y="65" font-size="10" fill="#E65100" text-anchor="middle">🍕</text><rect x="62" y="42" width="40" height="38" rx="2" fill="#FFF" stroke="#E65100" stroke-width="1"/><text x="60" y="78" font-size="6" fill="#E65100" text-anchor="middle">ЕДА</text><rect x="15" y="85" width="25" height="15" rx="2" fill="#FFCC80"/><rect x="80" y="85" width="25" height="15" rx="2" fill="#FFCC80"/><ellipse cx="60" cy="105" rx="45" ry="5" fill="rgba(0,0,0,0.1)"/></svg>`,
      baseIncome: 65, 
      upgradeMultiplier: 1.58, 
      cost: 125 
    }
  };
  
  var BUILDING_KEYS = ["coffee", "bank", "shop", "itcompany", "warehouse", "flowershop", "autoservice", "cinema", "construction", "gasstation", "restaurant"];
  var currentSelectedBlock = null;
  var currentInfoIndex = null;
  
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
    var typeData = BUILDING_TYPES[building.type];
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
    
    for (var i = 0; i < BUILDING_KEYS.length; i++) {
      var key = BUILDING_KEYS[i];
      var type = BUILDING_TYPES[key];
      
      var option = document.createElement("div");
      option.className = "build-option";
      option.innerHTML = `
        <div class="build-option__icon">${type.icon}</div>
        <div class="build-option__name">${type.name}</div>
        <div class="build-option__cost">⭐ ${Math.floor(type.cost * buildingPriceMultiplier)}</div>
      `;
      option.addEventListener("click", (function(k) {
        return function() {
          buildBuilding(currentSelectedBlock, k);
          closeBuildModal();
        };
      })(key));
      
      container.appendChild(option);
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
    container.innerHTML = "";
    
    for (var i = 0; i < 25; i++) {
      var block = document.createElement("div");
      block.className = "minecraft-block";
      
      var building = gameData.buildings[i];
      
      if (building && BUILDING_TYPES[building.type]) {
        var typeData = BUILDING_TYPES[building.type];
        var pending = building.pendingIncome || 0;
        
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
    migrateOldBuildings();
    updateBuildingPriceMultiplier();
    updatePendingIncome();
    renderMinecraftGrid();
    updateGameBalanceDisplay();
    startIncomeTimer();
    
    var collectAllBtn = document.getElementById("collect-all-btn");
    if (collectAllBtn) {
      collectAllBtn.addEventListener("click", function() {
        collectAllIncome();
      });
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
    
    if (infoCollectBtn) {
      infoCollectBtn.addEventListener("click", function() {
        if (currentInfoIndex !== null) {
          collectBuildingIncome(currentInfoIndex);
          closeInfoModal();
        }
      });
    }
    
    if (infoUpgradeBtn) {
      infoUpgradeBtn.addEventListener("click", function() {
        if (currentInfoIndex !== null) {
          upgradeBuilding(currentInfoIndex);
          closeInfoModal();
        }
      });
    }
    
    if (infoSellBtn) {
      infoSellBtn.addEventListener("click", function() {
        if (currentInfoIndex !== null) {
          sellBuilding(currentInfoIndex);
          closeInfoModal();
        }
      });
    }
    
    var addSkillBtn = document.getElementById("btn-add-skill");
    if (addSkillBtn) {
      addSkillBtn.addEventListener("click", function() {
        var amountInput = document.getElementById("skill-add-amount");
        var amount = parseInt(amountInput.value, 10);
        if (isNaN(amount) || amount <= 0) {
          amount = 100;
        }
        addSkillPoints(amount);
      });
    }
    
    var gamePanel = document.getElementById("panel-game");
    if (gamePanel) {
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.attributeName === "class" && gamePanel.classList.contains("is-active")) {
            updateGameBalanceDisplay();
            renderMinecraftGrid();
          }
        });
      });
      observer.observe(gamePanel, { attributes: true });
    }
        // Кнопка "Как играть?"
    var helpBtn = document.getElementById("game-help-btn");
    var helpModal = document.getElementById("help-modal");
    var helpModalClose = document.getElementById("help-modal-close");
    var helpModalOk = document.getElementById("help-modal-ok");
    var helpModalOverlay = document.querySelector("#help-modal .help-modal__overlay");
    
    if (helpBtn && helpModal) {
      helpBtn.addEventListener("click", function() {
        helpModal.removeAttribute("hidden");
      });
    }
    
    if (helpModalClose && helpModal) {
      helpModalClose.addEventListener("click", function() {
        helpModal.setAttribute("hidden", "");
      });
    }
    
    if (helpModalOk && helpModal) {
      helpModalOk.addEventListener("click", function() {
        helpModal.setAttribute("hidden", "");
      });
    }
    
    if (helpModalOverlay && helpModal) {
      helpModalOverlay.addEventListener("click", function() {
        helpModal.setAttribute("hidden", "");
      });
    }
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();