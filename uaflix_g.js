// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.1
// @description Плагін для перегляду фільмів з Ua джерел
// @author      You
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
    if (typeof Lampa === 'undefined') return;

    console.log('Uaflix plugin loaded');

    Lampa.Component.add('uaflix', {
        name: 'Uaflix',
        render: function () {
            return $('<div></div>');
        },
        start: function () {
            let activity = Lampa.Activity.active();
            if (!activity || !activity.data) return;

            let data = activity.data;
            let title = data.original_title || data.title;
            let type = data.name ? 'tv' : 'movie';

            console.log(`[Uaflix] Натиснута кнопка, title: ${title}, type: ${type}`);

            Lampa.Activity.push({
                url: '',
                title: 'Uaflix: ' + title,
                component: 'view',
                id: 'uaflix_view',
                search: title,
                results: [{
                    name: 'Uaflix (заглушка)',
                    url: 'https://uafix.net',
                    quality: 'HD',
                    info: '',
                    time: '',
                    season: 1,
                    episode: 1
                }]
            });
        }
    });

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'start') {
            let render = e.render();
            let buttons = render.find('.full-start__buttons');

            if (!buttons.find('.view--uaflix').length) {
                let button = $('<div class="full-start__button selector view--uaflix"><span>Онлайн Uaflix</span></div>');
                button.on('click', function () {
                    Lampa.Component.activate('uaflix');
                });

                buttons.append(button);
                console.log('[Uaflix] Кнопка додана');
            }
        }
    });
})();
