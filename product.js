(function () {
  "use strict";

  var CATALOG = {
    apple: {
      title: "Сертификат в золотое яблоко",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80",
      imageAlt: "Ноутбук и техника в магазине",
      price: 5000
    },
    massage: {
      title: "Сертификат в массажку",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&auto=format&fit=crop&q=80",
      imageAlt: "Релакс и массаж в спа",
      price: 3500
    },
    cashback: {
      title: "Кэшбек -5%",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&auto=format&fit=crop&q=80",
      imageAlt: "Финансы и карты",
      price: 10000
    },
    brain: {
      title: "Мозги",
      image: "https://images.unsplash.com/photo-1606324663549-80d987dfaa8b?w=900&auto=format&fit=crop&q=80",
      imageAlt: "Головоломки и развитие мышления",
      price: 1500
    }
  };

  function checkAuth() {
    var userRaw = localStorage.getItem("rr_current_user_id");
    if (!userRaw) {
      window.location.href = "index.html";
      return false;
    }
    return true;
  }

  function formatMtbanks(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  }

  function init() {
    if (!checkAuth()) return;

    var key = new URLSearchParams(window.location.search).get("p");
    var item = CATALOG[key];
    if (!item) {
      window.location.replace("index.html");
      return;
    }

    var img = document.getElementById("product-image");
    var titleEl = document.getElementById("product-title");
    var priceDigits = document.getElementById("product-price-digits");
    var buyBtn = document.getElementById("btn-buy");
    var toast = document.getElementById("buy-toast");

    if (img) {
      img.src = item.image;
      img.alt = item.imageAlt;
    }
    if (titleEl) titleEl.textContent = item.title;
    document.title = item.title + " — Магазин";

    if (priceDigits) priceDigits.textContent = formatMtbanks(item.price);

    if (buyBtn && toast) {
      buyBtn.addEventListener("click", function () {
        toast.textContent = "Покупка скоро будет доступна. Цена: " + formatMtbanks(item.price) + " MTBank Tokens";
        toast.classList.add("is-visible");
        window.setTimeout(function () {
          toast.classList.remove("is-visible");
        }, 2800);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();