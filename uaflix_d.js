// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.1
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

// Плагін для Lampa (uafix.net) — точний спосіб додавання кнопки
(function() {
    // Чекаємо готовності Lampa
    const interval = setInterval(() => {
        if (typeof lampa === 'undefined') return;

        clearInterval(interval);
        
        // Реєстрація плагіна (як у uaflix_work.js)
        lampa.plugins.register('uaflix_mod', {
            name: 'UAFix',
            version: '1.0',
            icon: 'https://uafix.net/favicon.ico',
            online: {
                search: async (query) => {
                    /* ...ваша реалізація пошуку... */
                },
                parse: async (url) => {
                    /* ...ваша реалізація парсингу... */
                }
            }
        });

        // Додавання кнопки через DOM (як у nb557/bwa)
        const addButton = () => {
            const container = document.querySelector('.full-start__buttons');
            if (!container || container.querySelector('.view--uaflix')) return;

            const button = document.createElement('div');
            button.className = 'full-start__button selector selector--light view--uaflix';
            button.innerHTML = `
                <div class="selector__ico">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                </div>
                <div class="selector__name">UAFix</div>
            `;
            button.onclick = (e) => {
                e.stopPropagation();
                if (lampa.currentVideo) {
                    lampa.player.load({
                        url: `plugin://uaflix_mod/parse?url=${encodeURIComponent(lampa.currentVideo.url)}`,
                        title: lampa.currentVideo.title
                    });
                }
            };
            container.prepend(button); // prepend для пріоритету
        };

        // Спостереження за змінами DOM
        new MutationObserver(addButton).observe(document.body, {
            childList: true,
            subtree: true
        });
    }, 100);
})();
