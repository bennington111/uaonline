// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.3
// @description  Uaflix plugin for Lampa
// ==/UserScript==

// Чекаємо, доки Lampa повністю завантажиться
function initUAFIXPlugin() {
  if (!window.Lampa || !Lampa.Plugin) {
    setTimeout(initUAFIXPlugin, 100);
    return;
  }

  // Реєстрація плагіна
  Lampa.Plugin.register('uaflix_online', function() {
    console.log('[UAFIX] Плагін ініціалізовано!');
    
    Lampa.Storage.add('online', {
      name: 'uaflix_online_source', // Унікальне ім'я
      component: {
        template: `
          <div class="online-source uaflix-container">
            <div class="online-source__title">🇺🇦 UAFIX</div>
            <div 
              class="online-source__item uaflix-btn" 
              v-on:click="play"
            >
              Дивитись
            </div>
          </div>
        `,
        methods: {
          play: function() {
            alert('UAFIX: Плагін працює!');
          }
        }
      }
    });
  });

  // Стилі (обов'язково!)
  Lampa.Template.add(`
    <style>
      .uaflix-container {
        padding: 15px;
      }
      .uaflix-btn {
        background: rgba(0, 80, 160, 0.7);
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
      }
      .uaflix-btn:hover {
        background: rgba(0, 100, 200, 0.9);
      }
    </style>
  `);
}

// Запускаємо
initUAFIXPlugin();
