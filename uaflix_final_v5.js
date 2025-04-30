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

(function () {
    const network = Lampa.Network;
    const storage = Lampa.Storage;
    const noty = Lampa.Noty;
    const component = 'uaflix';

    function addSourceButton() {
        Lampa.Component.add(component, {
            name: 'Uaflix',
            type: 'video',
            onSearch: function (object, resolve) {
                searchOnUAFlix(object, resolve);
            },
        });

        if (!Lampa.Platform.sourceReady)
            Lampa.Platform.sourceReady = () => {};

        const interval = setInterval(() => {
            const buttons = document.querySelector('.selectbox');
            if (buttons && !buttons.querySelector(`[data-source="${component}"]`)) {
                const btn = document.createElement('div');
                btn.className = 'selectbox-item selectbox-item--icon selector';
                btn.setAttribute('data-source', component);
                btn.innerHTML = `<div><span>Uaflix</span></div>`;
                btn.addEventListener('click', () => {
                    Lampa.Platform.sourceSelected(component);
                });
                buttons.appendChild(btn);
                clearInterval(interval);
            }
        }, 500);
    }

    async function searchOnUAFlix(item, resolve) {
        try {
            const title = item.title || item.original_title || '';
            const searchUrl = 'https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=' + encodeURIComponent(title);
            const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(searchUrl));
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            const resultLink = doc.querySelector('.sres-wrap a');
            if (!resultLink) throw 'Фільм не знайдено';

            const filmUrl = resultLink.href;
            console.log('[uaflix] Знайдено:', filmUrl);

            const filmRes = await fetch('https://corsproxy.io/?' + encodeURIComponent(filmUrl));
            const filmHtml = await filmRes.text();
            const filmDoc = new DOMParser().parseFromString(filmHtml, 'text/html');

            const video = filmDoc.querySelector('video');
            const file = video?.getAttribute('src');

            if (!file || !file.includes('.m3u8')) throw 'Не вдалося знайти посилання на відео';

            const source = {
                file: file,
                quality: 'HD',
                title: 'Uaflix',
                url: file,
                timeline: '',
                info: '',
            };

            resolve([source]);
        } catch (e) {
            console.error('[uaflix] Error:', e);
            noty.show('Помилка при пошуку на UAFlix');
            resolve([]);
        }
    }

    if (!window.PluginUAFlixInitialized) {
        window.PluginUAFlixInitialized = true;
        addSourceButton();
    }
})();
