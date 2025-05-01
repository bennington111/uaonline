// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.9
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const SOURCE_NAME = 'UAFlix';

    function log(...args) {
        console.log('[UAFlix]', ...args);
    }

    function search(title, callback) {
        const url = 'https://corsproxy.io/?' + encodeURIComponent('https://uafix.net/index.php?do=search&subaction=search&story=' + title);
        fetch(url).then(r => r.text()).then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const a = doc.querySelector('a.sres-wrap');
            if (!a) return callback();

            const href = a.getAttribute('href');
            const fullUrl = href.startsWith('http') ? href : 'https://uafix.net' + href;

            fetch('https://corsproxy.io/?' + encodeURIComponent(fullUrl)).then(r => r.text()).then(filmHtml => {
                const filmDoc = new DOMParser().parseFromString(filmHtml, 'text/html');
                const video = filmDoc.querySelector('video');
                const src = video ? video.getAttribute('src') : null;
                if (src && src.includes('.m3u8')) {
                    callback(src);
                } else {
                    callback();
                }
            }).catch(e => {
                log('Error loading film page:', e);
                callback();
            });
        }).catch(e => {
            log('Error searching:', e);
            callback();
        });
    }

    function addUAFlixButton(e, movie) {
        const button = $('<div class="selectbox-item selector"><div class="selectbox-item__icon"><i class="fab fa-uaf"></i></div><div class="selectbox-item__name">UAFlix</div></div>');
        button.on('click', function () {
            Lampa.Noty.show('Пошук на UAFlix...');
            search(movie.title, (videoUrl) => {
                if (videoUrl) {
                    Lampa.Player.play(videoUrl, SOURCE_NAME);
                    Lampa.Player.playlist([{ title: movie.title, file: videoUrl }]);
                } else {
                    Lampa.Noty.show('Не знайдено відео');
                }
            });
        });

        e.render().find('.selectbox').append(button);
    }

    function init() {
        if (!window.Lampa || !Lampa.Component || !Lampa.Activity) {
            setTimeout(init, 500);
            return;
        }

        Lampa.Component.add('online', {
            name: 'uaflix',
            onCreate: function (e, movie) {
                addUAFlixButton(e, movie);
            }
        });

        log('Плагін UAFlix завантажено');
    }

    init();
})();
