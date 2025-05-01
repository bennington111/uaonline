// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.1
// @description  Uaflix plugin for Lampa
// ==/UserScript==

(() => {
  if (!window.Lampa?.Storage) return;

  // 1. Отримуємо джерела коректно (об'єкт, а не масив!)
  const onlineSources = Lampa.Storage.get('online') || {};

  // 2. Додаємо нове джерело з унікальним ключем
  const uniqueKey = 'uaflix_' + Date.now();
  onlineSources[uniqueKey] = {
    component: {
      template: `
        <div class="online-source" style="
          padding: 12px;
          margin: 5px;
          background: linear-gradient(90deg, #0066cc 0%, #004499 100%);
          border-radius: 8px;
          color: white;
          text-align: center;
        ">
          <div style="font-weight: bold">🇺🇦 UAFIX WORKING</div>
          <div @click="play" style="cursor: pointer; margin-top: 5px;">
            Дивитись (${uniqueKey})
          </div>
        </div>
      `,
      methods: {
        play() {
          alert('UAFIX FINALLY WORKS! Key: ' + uniqueKey);
        }
      }
    }
  };

  // 3. Зберігаємо оновлені джерела
  Lampa.Storage.set('online', onlineSources);
  console.log('[UAFIX] Успішно додано!', uniqueKey);
})();
