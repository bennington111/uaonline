// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.5
// @description  Uaflix plugin for Lampa
// ==/UserScript==

// 1. Використовуємо анонімну функцію для ізоляції коду
(function() {
  // 2. Чекаємо доки Lampa повністю ініціалізується
  var checkLampa = setInterval(function() {
    if (window.Lampa && Lampa.Storage && Lampa.Template) {
      clearInterval(checkLampa);
      
      // 3. Реєструємо джерело (важливо: без Lampa.Plugin.register!)
      Lampa.Storage.add('online', {
        name: 'uaflix_fixed_' + Date.now(), // Унікальне ім'я
        component: {
          template: `
            <div class="online-source uaflix-fixed">
              <div class="online-source__title uaflix-title">🇺🇦 UAFIX</div>
              <div class="online-source__item uaflix-btn" @click="play">
                Дивитись
              </div>
            </div>
          `,
          methods: {
            play: function() {
              alert('UAFIX: Плагін активовано!');
            }
          }
        }
      });

      // 4. Додаємо обов'язкові стилі
      Lampa.Template.add(`
        <style>
          .uaflix-fixed { padding: 10px; }
          .uaflix-title { 
            color: #ffdd00; 
            margin-bottom: 8px;
            font-size: 1.1em;
          }
          .uaflix-btn {
            background: rgba(0, 80, 160, 0.7);
            padding: 8px 12px;
            border-radius: 6px;
            text-align: center;
            cursor: pointer;
          }
          .uaflix-btn:hover { background: rgba(0, 100, 200, 0.9); }
        </style>
      `);

      console.log('[UAFIX] Плагін повністю ініціалізовано!');
    }
  }, 100);
})();
