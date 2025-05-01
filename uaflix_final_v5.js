// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.8
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const UAFLIX_SOURCE_NAME = 'UAFlix';
    const UAFLIX_SEARCH_URL = 'https://corsproxy.io/?' + encodeURIComponent('https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=');

    function log(...args) {
        console.log('[uaflix]', ...args);
    }

    function addButton() {
        if (!window.Lampa || !Lampa.Lang || !Lampa.Source) {
            setTimeout(addButton, 500);
            return;
        }

        Lampa.Source.add(UAFLIX_SOURCE_NAME, {
            name: UAFLIX_SOURCE_NAME,
            type: 'video',
            on: function (item, circle) {
                log('Запуск пошуку для:', item.title);
                searchOnUAFlix(item, circle);
            }
        });

        // Додаємо кнопку вручну через DOM, бо Source.add не завжди виводить
        let interval = setInterval(() => {
            let buttons = document.querySelectorAll('.selectbox-item--icon.selector');
            let exists = Array.from(buttons).some(btn => btn.textContent.includes(UAFLIX_SOURCE_NAME));
            if (!exists) {
                let uaButton = document.createElement('div');
                uaButton.className = 'selectbox-item selectbox-item--icon selector';
                uaButton.innerHTML = `<div class="selectbox-item__icon"><i class="fab fa-uaf"></i></div><div class="selectbox-item__name">${UAFLIX_SOURCE_NAME}</div>`;
                uaButton.addEventListener('click', () => {
                    let active = Lampa.Activity.active();
                    if (active && active.source) {
                        Lampa.Source.show(UAFLIX_SOURCE_NAME);
                    }
                });

                let target = document.querySelector('.selectbox');
                if (target) {
                    target.appendChild(uaButton);
                    clearInterval(interval);
                }
            }
        }, 1000);
    }

    async function searchOnUAFlix(item, circle) {
        try {
            const query = encodeURIComponent(item.title);
            const url = UAFLIX_SEARCH_URL + query;

            log('Пошук за URL:', url);

            const response = await fetch(url);
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            const result = doc.querySelector('a.sres-wrap');
            if (!result) {
                Lampa.Noty.show('Нічого не знайдено на UAFlix');
                circle && circle.finish();
                return;
            }

            const href = result.getAttribute('href');
            const fullLink = href.startsWith('http') ? href : 'https://uafix.net' + href;
            log('Знайдено фільм:', fullLink);

            const filmRes = await fetch('https://corsproxy.io/?' + encodeURIComponent(fullLink));
            const filmHtml = await filmRes.text();
            const filmDoc = new DOMParser().parseFromString(filmHtml, 'text/html');

            const video = filmDoc.querySelector('video');
            const videoUrl = video ? video.getAttribute('src') : null;

            if (!videoUrl || !videoUrl.includes('.m3u8')) {
                Lampa.Noty.show('Не знайдено відео UAFlix');
                circle && circle.finish();
                return;
            }

            log('Знайдено відео:', videoUrl);

            Lampa.Player.play(videoUrl, UAFLIX_SOURCE_NAME);
            Lampa.Player.playlist([{
                title: item.title,
                file: videoUrl
            }]);

            circle && circle.finish();
        } catch (e) {
            log('Помилка:', e);
            Lampa.Noty.show('Помилка при пошуку на UAFlix');
            circle && circle.finish();
        }
    }

    addButton();
})();
