// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.0
 // @description Плагін для перегляду фільмів з Ua джерел
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    console.log('Uaflix plugin loaded');

    const Uaflix = {
        get: function (json, callback) {
            console.log('Uaflix: get called with json:', json);

            const url = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${encodeURIComponent(json.title)}`;
            console.log('Uaflix: fetching', url);

            fetch(url).then(r => r.text()).then(html => {
                console.log('Uaflix: fetched HTML length:', html.length);
                // TODO: парсинг HTML → масив results
                const results = []; // тимчасово порожній
                callback(results);
            }).catch(e => {
                console.error('Uaflix fetch error:', e);
                callback([]);
            });
        }
    };

    Lampa.Component.add('online', {
        name: 'Uaflix',
        render: function (data) {
            console.log('Uaflix: render called with data:', data);

            let button = $('<div class="selectbox-item selectbox-item--icon selector"><div class="selectbox-item__icon"><i class="icon icon--film"></i></div><div class="selectbox-item__name">Онлайн Uaflix</div></div>');
            button.on('hover:enter', () => {
                console.log('Uaflix: button clicked');

                Lampa.Activity.push({
                    url: '',
                    title: 'Uaflix',
                    component: 'online',
                    id: data.id,
                    search: data.search,
                    search_one: data.search_one,
                    search_two: data.search_two,
                    movie: data.movie,
                    page: 1,
                    source: Uaflix,
                });
            });

            return button;
        }
    });

    console.log('Uaflix: Component.add registered');
})();
