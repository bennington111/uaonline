// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.2
// @description Плагін для перегляду фільмів з Ua джерел (DOM-кнопка)
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
    console.log('Uaflix plugin loaded');

    function waitForActivity() {
        if (Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active().component === 'full') {
            const data = Lampa.Activity.active().data;

            if (!$('.view--uaflix').length) {
                const button = $('<div class="full-start__button selector view--uaflix"><span>Онлайн Uaflix</span></div>');
                
                button.on('hover:enter', function () {
                    console.log('Uaflix: кнопка натиснута для', data.title);

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
                                const url = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${encodeURIComponent(json.search || json.title || '')}`;
                                console.log('Uaflix: запит →', url);
                                fetch(url).then(r => r.text()).then(html => {
                                    console.log('Uaflix: HTML отримано', html.length);
                                    // Парсинг пізніше
                                    callback([]);
                                }).catch(err => {
                                    console.error('Uaflix помилка запиту:', err);
                                    callback([]);
                                });
                            }
                        }
                    });
                });

                $('.full-start__buttons').append(button);
                console.log('Uaflix: кнопка додана');
            }
        }

        setTimeout(waitForActivity, 500);
    }

    waitForActivity();
})();
