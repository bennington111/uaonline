// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.6
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const buttonTitle = 'UAFlix';
    const searchBaseURL = 'https://corsproxy.io/?' + encodeURIComponent('https://uafix.net/index.php?do=search&subaction=search&story=');

    function log(...args) {
        console.log('[uaflix]', ...args);
    }

    function searchOnUAFlix(title, callback) {
        const url = searchBaseURL + encodeURIComponent(title);
        fetch(url)
            .then(res => res.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const result = doc.querySelector('.sres-wrap');

                if (result && result.href) {
                    const link = result.href.startsWith('http') ? result.href : 'https://uafix.net' + result.getAttribute('href');
                    log('Знайдено:', link);
                    callback(link);
                } else {
                    log('Нічого не знайдено');
                    callback(null);
                }
            })
            .catch(err => {
                log('Помилка:', err);
                callback(null);
            });
    }

    function addUaflixButton() {
        if (!window.Lampa || !Lampa.Platform || !Lampa.Component) return;

        const originalRender = Lampa.Platform.render;

        Lampa.Platform.render = function (params) {
            const rendered = originalRender.apply(this, arguments);

            if (params && params.object && params.object.name) {
                const title = params.object.name;

                const button = $('<div class="selectbox-item selectbox-item--icon selector"><div class="selectbox-item__icon"><img src="https://cdn-icons-png.flaticon.com/512/711/711769.png" style="width:24px;height:24px;"></div><div class="selectbox-item__text">UAFlix</div></div>');

                button.on('click', () => {
                    Lampa.Noty.show('Пошук на UAFlix...');
                    searchOnUAFlix(title, function (link) {
                        if (link) {
                            Lampa.Utils.openPage(link);
                        } else {
                            Lampa.Noty.show('Нічого не знайдено на UAFlix');
                        }
                    });
                });

                // Вставка кнопки у потрібне місце
                setTimeout(() => {
                    const container = $('.selectbox--sources .selectbox-scroll');
                    if (container.length && container.find('.selectbox-item:contains("UAFlix")').length === 0) {
                        container.append(button);
                    }
                }, 1000);
            }

            return rendered;
        };
    }

    setTimeout(addUaflixButton, 1000);
})();
