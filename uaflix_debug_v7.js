// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.1
// @description Плагін для перегляду фільмів з Ua джерел
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
    console.log('Uaflix plugin loaded');

    function createButton(data) {
        console.log('Uaflix: createButton for', data.title);

        const button = $(`<div class="selectbox-item selectbox-item--icon selector">
            <div class="selectbox-item__icon"><i class="icon icon--film"></i></div>
            <div class="selectbox-item__name">Онлайн Uaflix</div>
        </div>`);

        button.on('hover:enter', function () {
            console.log('Uaflix: button clicked for', data.title);

            Lampa.Activity.push({
                url: '',
                title: 'Uaflix',
                component: 'online',
                search: data.title,
                search_one: data.original_title,
                movie: data,
                page: 1,
                source: {
                    get: function (json, callback) {
                        console.log('Uaflix: get()', json);

                        const url = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${encodeURIComponent(json.search || json.title || '')}`;
                        console.log('Uaflix: fetching', url);

                        fetch(url).then(r => r.text()).then(html => {
                            console.log('Uaflix: fetched HTML length', html.length);
                            // Парсинг пізніше
                            callback([]);
                        }).catch(err => {
                            console.error('Uaflix fetch error:', err);
                            callback([]);
                        });
                    }
                }
            });
        });

        return button;
    }

    function patchOnlineComponent() {
        const online = Lampa.Component.get('online');

        if (!online || typeof online.render !== 'function') {
            console.warn('Uaflix: online component not ready, retrying...');
            setTimeout(patchOnlineComponent, 500);
            return;
        }

        const originalRender = online.render;

        online.render = function (data) {
            const view = originalRender.call(this, data);
            const button = createButton(data);
            view.find('.selectbox').append(button);
            console.log('Uaflix: button appended');
            return view;
        };

        console.log('Uaflix: online.render patched');
    }

    setTimeout(patchOnlineComponent, 1000);
})();
