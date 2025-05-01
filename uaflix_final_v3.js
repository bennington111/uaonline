// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.3
// @description  Uaflix plugin for Lampa
// ==/UserScript==

// 1. Чекаємо, доки Lampa повністю завантажиться
function waitForLampa(callback) {
  if (window.Lampa && Lampa.Plugin && Lampa.Storage) {
    console.log("Lampa готова!");
    callback();
  } else {
    console.log("Очікування Lampa...");
    setTimeout(() => waitForLampa(callback), 100);
  }
}

// 2. Головна ініціалізація
waitForLampa(function() {
  console.log("Старт ініціалізації плагіна...");
  
  // Реєстрація плагіна
  Lampa.Plugin.register('uaflix_v3', function() {
    console.log("[UAFIX] Плагін зареєстровано!");
    
    Lampa.Storage.add('online', {
      name: 'uaflix_source', // Унікальне ім'я
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
            alert("UAFIX: Плагін активовано!");
          }
        }
      }
    });
  });

  // Стилі
  Lampa.Template.add(`
    <style>
      .uaflix-container { padding: 10px; }
      .uaflix-btn {
        background: rgba(0, 80, 160, 0.7);
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        text-align: center;
      }
      .uaflix-btn:hover { background: rgba(0, 100, 200, 0.9); }
    </style>
  `);
});
