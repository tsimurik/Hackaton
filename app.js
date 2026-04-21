(function () {
  "use strict";

  var BASE_REF_URL = "https://myapp.com/ref";

  /** Балансы (восьмизначные строки), дальше можно менять переменные — UI обновится через syncBalancesToDom */
  var balanceSkillPoints = 0;
  var balanceMtBanks = 0;

  /** Латиница + цифры, длина len */
  function randomAlphanumeric(len) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var out = "";
    for (var i = 0; i < len; i += 1) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  var STORAGE_KEY = "rr_registered_users"; // Храним всех пользователей
  var USER_KEY = "rr_current_user_id"; // Храним ID текущего пользователя

  // Загрузка всех пользователей
  function loadAllUsers() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  // Сохранение всех пользователей
  function saveAllUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  // Получение текущего пользователя
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

  // Сохранение текущего пользователя
  function setCurrentUser(userId) {
    localStorage.setItem(USER_KEY, userId);
  }

  // Очистка текущего пользователя (выход)
  function logout() {
    localStorage.removeItem(USER_KEY);
    showRegisterScreen();
    // Очищаем форму входа
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
    
    // Сохраняем временные данные для регистрации
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
  }

  // Принудительное обновление профиля из данных пользователя
  function refreshProfileFromUser() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    balanceSkillPoints = currentUser.balanceSkillPoints || 0;
    balanceMtBanks = currentUser.balanceMtBanks || 0;
    syncBalancesToDom();
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
  }

  // Регистрация нового пользователя
  function registerUser(nicknameRaw, inviterCode) {
    var nickname = nicknameRaw.trim();
    var normalizedNickname = normalizeNickname(nickname);
    
    var users = loadAllUsers();
    
    // Проверка на существующий никнейм
    for (var userId in users) {
      if (users[userId].nicknameLower === normalizedNickname) {
        return { success: false, error: "Этот ник уже занят. Выберите другой." };
      }
    }
    
    // Проверка длины никнейма
    if (nickname.length < 2) {
      return { success: false, error: "Никнейм слишком короткий." };
    }
    
    // Создаём нового пользователя
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
    
    // Начисление бонуса за реферальный код
    if (inviterCode && inviterCode.trim() !== "") {
      var inviterFound = false;
      for (var uid in users) {
        if (users[uid].referralCode === inviterCode) {
          inviterFound = true;
          // Начисляем бонус новому пользователю
          newUser.balanceSkillPoints = 1000;
          newUser.balanceMtBanks = 1000;
          break;
        }
      }
      if (!inviterFound) {
        return { success: false, error: "Неверный реферальный код." };
      }
    }
    
    // Сохраняем пользователя
    users[newUser.id] = newUser;
    saveAllUsers(users);
    setCurrentUser(newUser.id);
    
    return { success: true, user: newUser };
  }
  
  // Вход в аккаунт
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

  // Проверка авторизации при загрузке страницы
  function checkAuthAndRedirect() {
    var currentUser = getCurrentUser();
    if (currentUser) {
      showApp(currentUser);
    } else {
      showRegisterScreen();
    }
  }

  // ========== НАЧАЛО БЛОКА ИГРЫ ==========
  
  function getTodayKey() {
    var today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  function loadGameData() {
    var currentUser = getCurrentUser();
    if (!currentUser) return { clicks: 0, lastDate: getTodayKey() };
    
    var gameDataKey = "rr_game_data_" + currentUser.id;
    try {
      var raw = localStorage.getItem(gameDataKey);
      if (!raw) return { clicks: 0, lastDate: getTodayKey() };
      return JSON.parse(raw);
    } catch (e) {
      return { clicks: 0, lastDate: getTodayKey() };
    }
  }
  
  function saveGameData(data) {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    var gameDataKey = "rr_game_data_" + currentUser.id;
    localStorage.setItem(gameDataKey, JSON.stringify(data));
  }
  
  function updateGameUI() {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Синхронизируем глобальную переменную с актуальным балансом
    balanceMtBanks = currentUser.balanceMtBanks || 0;
    
    var mtbSpan = document.getElementById("game-mtb-balance");
    if (mtbSpan) mtbSpan.textContent = currentUser.balanceMtBanks || 0;
    
    // Также обновляем профиль, если он виден
    var profileMtbSpan = document.getElementById("profile-balance-mtb");
    if (profileMtbSpan) {
      profileMtbSpan.textContent = String(balanceMtBanks).padStart(8, '0');
    }
    
    var gameData = loadGameData();
    var todayKey = getTodayKey();
    
    // Проверяем, не новый ли день
    if (gameData.lastDate !== todayKey) {
      gameData.clicks = 0;
      gameData.lastDate = todayKey;
      saveGameData(gameData);
    }
    
    var clicksSpan = document.getElementById("game-today-clicks");
    if (clicksSpan) clicksSpan.textContent = gameData.clicks || 0;
    
    var nextBonusSpan = document.getElementById("game-next-bonus");
    if (nextBonusSpan) {
      var clicksLeft = 10 - ((gameData.clicks || 0) % 10);
      nextBonusSpan.textContent = clicksLeft;
    }
  }
  
  function showClickAnimation(x, y, value) {
    var container = document.getElementById("game-animation-container");
    if (!container) return;
    
    var animation = document.createElement("div");
    animation.className = "click-animation";
    animation.textContent = "+" + value;
    animation.style.left = x + "px";
    animation.style.top = y + "px";
    container.appendChild(animation);
    
    setTimeout(function() {
      if (animation.parentNode) {
        animation.parentNode.removeChild(animation);
      }
    }, 1000);
  }
  
  function addMtbanks(amount, clickEvent) {
    var currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Обновляем баланс пользователя в объекте
    currentUser.balanceMtBanks = (currentUser.balanceMtBanks || 0) + amount;
    
    // Сохраняем обновлённого пользователя в хранилище
    var users = loadAllUsers();
    users[currentUser.id] = currentUser;
    saveAllUsers(users);
    
    // ВАЖНО: обновляем глобальные переменные балансов
    balanceMtBanks = currentUser.balanceMtBanks;
    
    // Обновляем UI везде, где отображается баланс
    syncBalancesToDom();  // Обновляет цифры в профиле
    updateGameUI();       // Обновляет цифры в игре
    
    // Также обновляем отображение в профиле, если оно открыто
    var profileMtbSpan = document.getElementById("profile-balance-mtb");
    if (profileMtbSpan) {
      profileMtbSpan.textContent = String(balanceMtBanks).padStart(8, '0');
    }
    
    // Показываем анимацию если нужно
    if (clickEvent && clickEvent.clientX) {
      showClickAnimation(clickEvent.clientX, clickEvent.clientY, amount);
    }
    
    return true;
  }
  
  function handleTokenClick(event) {
    var currentUser = getCurrentUser();
    if (!currentUser) return;
    
    var gameData = loadGameData();
    var todayKey = getTodayKey();
    
    // Сброс если новый день
    if (gameData.lastDate !== todayKey) {
      gameData.clicks = 0;
      gameData.lastDate = todayKey;
    }
    
    // Добавляем клик
    gameData.clicks = (gameData.clicks || 0) + 1;
    var currentClicks = gameData.clicks;
    
    // Начисляем 1 МТБанк за клик
    addMtbanks(1, event);
    
    // Проверяем бонус каждые 10 кликов
    var bonusAmount = 0;
    if (currentClicks % 10 === 0) {
      bonusAmount = 50;
      addMtbanks(bonusAmount, null);
      
      // Показываем уведомление о бонусе
      var toast = document.getElementById("buy-toast");
      if (toast) {
        var originalText = toast.textContent;
        toast.textContent = "🎉 Бонус! +50 МТБанков за 10 кликов! 🎉";
        toast.classList.add("is-visible");
        setTimeout(function() {
          toast.classList.remove("is-visible");
          toast.textContent = originalText;
        }, 2000);
      }
    }
    
    // Сохраняем данные игры
    saveGameData(gameData);
    
    // Обновляем UI
    updateGameUI();
    
    // Дополнительная анимация для бонуса
    if (bonusAmount > 0 && event) {
      setTimeout(function() {
        showClickAnimation(event.clientX, event.clientY - 30, bonusAmount);
      }, 100);
    }
    
    // Небольшая вибрация если поддерживается
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
  
  function initGame() {
  updateGameUI();
  
  var tokenBtn = document.getElementById("game-token-btn");
  if (tokenBtn) {
    tokenBtn.addEventListener("click", handleTokenClick);
  }
  
  // ВСЁ! Никаких observer'ов для города здесь не нужно
  // Город инициализируется сам через city-game.js
}
  
  // ========== КОНЕЦ БЛОКА ИГРЫ ==========

  function init() {
    // Проверяем авторизацию при загрузке
    checkAuthAndRedirect();
    
    // Регистрация
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
    
    // Вход в аккаунт
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
    
    // Кнопка выхода
    var logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        logout();
      });
    }
    
    // Копирование реферальной ссылки
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
    
    // Навигация
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
    
    // Переключение между экранами регистрации и входа
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
    
    // Инициализация игры
    initGame();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();