// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.2
// @description  Uaflix plugin for Lampa
// ==/UserScript==

// Чекаємо, поки Lampa повністю завантажиться
function waitForLampa() {
    if (window.Lampa && Lampa.Plugin && Lampa.Storage) {
        initPlugin();
    } else {
        setTimeout(waitForLampa, 100);
    }
}

function initPlugin() {
    // Реєстрація плагіна
    Lampa.Plugin.register('uaflix_online', function () {
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
                    play() {
                        alert('Плагін працює!');
                    }
                }
            }
        });
    });
    
    console.log('Плагін UAFIX успішно ініціалізовано');
}

// Запускаємо очікування
waitForLampa();
