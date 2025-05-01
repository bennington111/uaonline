// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.1
// @description  Uaflix plugin for Lampa
// ==/UserScript==

// Оригінальний робочий код з uaflix_final_v4.js
(function() {
  if (!window.Lampa || !Lampa.Storage) return;

  Lampa.Storage.add('online', {
    name: 'uaflix',
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
          alert('UAFIX працює!');
        }
      }
    }
  });
})();
