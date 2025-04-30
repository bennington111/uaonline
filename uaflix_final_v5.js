// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.5
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const network = Lampa.Network;
    const noty = Lampa.Noty;
    const component = 'uaflix';

    // Ініціалізація порожнього online, щоб зʼявилась секція
    if (!Lampa.Storage.get('plugin_uaflix_component_loaded')) {
        Lampa.Storage.set('plugin_uaflix_component_loaded', true);

        Lampa.Module.add({
            component: 'online',
            name: 'UAFlixInit',
            condition: () => false,
            on: () => {}
        });
    }

    function install() {
        Lampa.Source.add(component, {
            name: 'UAFlix',
            types: ['movie'],
            on: function (params, callback) {
                searchOnUAFlix(params, callback);
            },
        });
    }

    async function searchOnUAFlix(item, callback) {
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

            if (!file || !file.includes('.m3u8')) throw 'Не знайдено .m3u8';

            const source = {
                file: file,
                quality: 'HD',
                title: 'UAFlix',
                url: file,
                timeline: '',
                info: '',
            };

            callback([source]);
        } catch (e) {
            console.error('[uaflix] Error:', e);
            noty.show('Помилка при пошуку на UAFlix');
            callback([]);
        }
    }

    if (!window.PluginUAFlixInstalled) {
        window.PluginUAFlixInstalled = true;
        install();
    }
})();


