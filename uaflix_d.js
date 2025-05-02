// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.3
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function() {
    // Чекаємо готовності Lampa
    var interval = setInterval(function() {
        if (typeof Lampa === 'undefined') return;
        clearInterval(interval);

        // Реєстрація плагіна (як у uaflix_work.js)
        Lampa.Plugin.add("uaflix", {
            name: "UAFix",
            version: "1.0",
            icon: "https://uafix.net/favicon.ico"
        });

        // Точна копія функції додавання кнопки з uaflix_work.js
        function addSourceButton() {
            Lampa.Listener.follow('full', function(e) {
                if (e.type === 'complite') {
                    const button_html = `
                    <div class="full-start__button selector view--uaflix" data-subtitle="UAFix 1.0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                        </svg>
                        <span>UAFix</span>
                    </div>`;

                    const btn = $(button_html);
                    btn.on('click', function() {
                        if (Lampa.Storage.get('current_video')) {
                            Lampa.Player.play({
                                url: 'plugin://uaflix/parse?url=' + encodeURIComponent(Lampa.Storage.get('current_video').url),
                                title: Lampa.Storage.get('current_video').title
                            });
                        }
                    });

                    $('.full-start__buttons').append(btn);
                }
            });
        }

        addSourceButton();
    }, 100);
})();
