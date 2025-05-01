// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.5
// @description  Uaflix plugin for Lampa
// ==/UserScript==

// 1. Створюємо глобальну функцію ініціалізації (як у робочих плагінах)
window.initUaflixPlugin = function() {
  // 2. Безпечна перевірка наявності Lampa
  if (!window.Lampa || !Lampa.Storage) {
    console.error("Lampa не завантажена!");
    return;
  }

  // 3. Додаємо джерело напряму (без Lampa.Plugin.register!)
  Lampa.Storage.add("online", {
    name: "uaflix_source",
    component: {
      template: `
        <div class="online-source uaflix-container">
          <div class="online-source__title">🇺🇦 UAFIX</div>
          <div class="online-source__item uaflix-btn" @click="play">
            Дивитись
          </div>
        </div>
      `,
      methods: {
        play: function() {
          alert("UAFIX працює!");
        }
      }
    }
  });
  console.log("[UAFIX] Плагін успішно завантажено!");
};

// 4. Викликаємо функцію при завантаженні
if (document.readyState === "complete") {
  window.initUaflixPlugin();
} else {
  window.addEventListener("load", window.initUaflixPlugin);
}
