// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.1
// @description  Uaflix plugin for Lampa
// ==/UserScript==

// Просто копіюємо робочий шаблон з bwa.to/rc
(() => {
  if (!window.Lampa?.Storage) return;
  
  Lampa.Storage.add('online', {
    name: `uaflix_${Date.now()}`,
    component: {
      template: `
        <div class="online-source">
          <div class="online-source__title">🇺🇦 UAFIX TEST</div>
          <div class="online-source__item" @click="play">
            Дивитись
          </div>
        </div>
      `,
      methods: {
        play() {
          alert('UAFIX TEST працює!');
        }
      }
    }
  });
})();
