// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.2
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function() {
    var interval = setInterval(function() {
        if (typeof lampa == 'undefined') return;
        clearInterval(interval);

        // Реєстрація плагіна
        lampa.plugins.add({
            name: 'UAFix',
            group: 'online',
            version: '1.0',
            icon: 'https://uafix.net/favicon.ico',
            search: function(query) { return []; },
            parse: function(url) { return []; }
        });

        // Створення кнопки без MutationObserver
        var container = document.querySelector('.full-start__buttons');
        if (container && !container.querySelector('.view--uaflix')) {
            var button = document.createElement('div');
            button.className = 'full-start__button selector selector--light view--uaflix';
            button.innerHTML = `
                <div class="selector__ico">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                </div>
                <div class="selector__name">UAFix</div>
            `;
            button.onclick = function(e) {
                e.stopPropagation();
                if (lampa.currentVideo) {
                    lampa.player.load({
                        url: 'plugin://UAFix/parse?url=' + encodeURIComponent(lampa.currentVideo.url),
                        title: lampa.currentVideo.title
                    });
                }
            };
            container.prepend(button);
        }
    }, 100);
})();
