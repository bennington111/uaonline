// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.4
// @description  Uaflix plugin for Lampa
// ==/UserScript==

// 1. Оголошення плагіна у глобальній області (як у робочих прикладах)
window.UAFLIX_PLUGIN = {
  name: "uaflix_online",
  init: function() {
    // 2. Реєстрація через Lampa.Storage.add (без Lampa.Plugin.register!)
    Lampa.Storage.add("online", {
      name: "uaflix",
      component: {
        template: `
          <div class="online-source">
            <div class="online-source__title">🇺🇦 UAFIX</div>
            <div class="online-source__item" @click="play">
              Дивитись
            </div>
          </div>
        `,
        methods: {
          play: function() {
            alert("UAFIX: Плагін працює!");
          }
        }
      }
    });
    console.log("[UAFIX] Плагін успішно завантажено!");
  }
};

// 3. Автоматична ініціалізація (як у online_mod.js)
if (window.Lampa && Lampa.Storage) {
  window.UAFLIX_PLUGIN.init();
} else {
  console.error("Lampa не знайдена! Плагін не завантажено.");
}
