// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     2.0
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const SOURCE_TITLE = 'UAFlix';

    function search(title, callback) {
        const proxy = 'https://corsproxy.io/?';
        const searchUrl = proxy + encodeURIComponent('https://uafix.net/index.php?do=search&subaction=search&story=' + title);

        fetch(searchUrl).then(r => r.text()).then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const a = doc.querySelector('a.sres-wrap');
            if (!a) return callback();

            const href = a.getAttribute('href');
            const filmUrl = href.startsWith('http') ? href : 'https://uafix.net' + href;

            fetch(proxy + encodeURIComponent(filmUrl)).then(r => r.text()).then(filmHtml => {
                const filmDoc = new DOMParser().parseFromString(filmHtml, 'text/html');
                const video = filmDoc.querySelector('video');
                const src = video ? video.getAttribute('src') : null;
                callback(src || null);
            }).catch(() => callback());
        }).catch(() => callback());
    }

    function addButton(movie, render) {
        const button = $('<div class="selectbox-item selector"><div class="selectbox-item__icon"><i class="fab fa-uaf"></i></div><div class="selectbox-item__name">UAFlix</div></div>');
        button.on('click', function () {
            Lampa.Noty.show('Шукаємо на UAFlix...');
            search(movie.title, function (url) {
                if (url) {
                    Lampa.Player.play(url, SOURCE_TITLE);
                    Lampa.Player.playlist([{ title: movie.title, file: url }]);
                } else {
                    Lampa.Noty.show('Нічого не знайдено');
                }
            });
        });
        render().find('.selectbox').append(button);
    }

    function waitForRender() {
        const original = Lampa.Activity.listener.follow;
        Lampa.Activity.listener.follow = function (e) {
            if (e.component === 'activity' && e.type === 'active') {
                const data = Lampa.Activity.active().data;
                const render = Lampa.Activity.active().render;
                setTimeout(() => addButton(data, render), 500);
            }
            original.call(this, e);
        };
    }

    waitForRender();
    console.log('[UAFlix] Плагін ініціалізовано');
})();
