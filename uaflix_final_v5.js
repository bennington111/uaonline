// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.7
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const source_id = 'ua_flix';

    function log(...args) {
        console.log('[UAFlix]', ...args);
    }

    function searchOnUAFlix(title, callback) {
        const url = 'https://corsproxy.io/?' + encodeURIComponent('https://uafix.net/index.php?do=search&subaction=search&story=' + title);
        fetch(url).then(r => r.text()).then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const result = doc.querySelector('.sres-wrap');
            if (result && result.href) {
                let href = result.href;
                if (!href.startsWith('http')) href = 'https://uafix.net' + href;
                log('Знайдено:', href);
                callback(href);
            } else {
                log('Нічого не знайдено');
                callback(null);
            }
        }).catch(e => {
            log('Помилка:', e);
            callback(null);
        });
    }

    function add() {
        Lampa.Component.add('online', {
            name: 'Онлайн UAFlix',
            component: 'online',
            type: 'video',
            onSelect: function (object, resolve) {
                const title = object.title || object.name;
                Lampa.Noty.show('Пошук на UAFlix...');
                searchOnUAFlix(title, link => {
                    if (link) {
                        Lampa.Utils.openPage(link);
                    } else {
                        Lampa.Noty.show('Нічого не знайдено на UAFlix');
                    }
                    resolve(); // Завершуємо обробку
                });
            },
            onContextMenu: function () {},
            onBack: function () {},
            render: function (data) {
                const item = $('<div class="selectbox-item selectbox-item--icon selector"><div class="selectbox-item__icon"><img src="https://cdn-icons-png.flaticon.com/512/711/711769.png" style="width:24px;height:24px;"></div><div class="selectbox-item__text">UAFlix</div></div>');
                item.on('hover:enter', () => this.onSelect(data, () => {}));
                return item[0];
            }
        });
    }

    // Додаємо компонент з затримкою, щоб усі джерела ініціалізувались
    setTimeout(add, 1000);
})();
