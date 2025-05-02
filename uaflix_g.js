// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.0
// @description Плагін для перегляду фільмів з Ua джерел
// @author      You
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
    if (typeof Lampa === 'undefined') return;

    console.log('Uaflix plugin loaded');

    let added = false;

    function addButton() {
        const interval = setInterval(() => {
            const btnContainer = document.querySelector('.full-start__buttons');

            if (!btnContainer || added) return;

            let button = document.createElement('div');
            button.className = 'full-start__button selector view--uaflix';
            button.innerHTML = '<span>Онлайн Uaflix</span>';

            button.addEventListener('click', function () {
                console.log('[Uaflix] Button clicked');

                let cardData = Lampa.Activity.active().data;
                console.log('[Uaflix] Current card:', cardData);

                if (!cardData || !cardData.title) {
                    Lampa.Noty.show('Назва не знайдена');
                    return;
                }

                let title = cardData.original_title || cardData.title;
                let type = cardData.name ? 'tv' : 'movie';
                console.log(`[Uaflix] Search: ${title}, Type: ${type}`);

                showSources(title, type);
            });

            btnContainer.appendChild(button);
            added = true;

            console.log('[Uaflix] Кнопка додана');
        }, 1000);
    }

    function showSources(title, type) {
        console.log(`[Uaflix] Отримання джерел для: ${title}, тип: ${type}`);

        // Тимчасово показуємо заглушку
        Lampa.Activity.push({
            url: '',
            title: 'Uaflix: ' + title,
            component: 'view',
            page: 1,
            id: 'uaflix',
            search: title,
            source: 'uaflix',
            filter: {},
            card: {},
            results: [{
                name: 'Uaflix – тестова заглушка',
                title: title,
                url: 'https://uafix.net/',
                quality: 'HD',
                info: '',
                time: '',
                season: 1,
                episode: 1
            }]
        });
    }

    // Запуск додавання кнопки
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'start') {
            console.log('[Uaflix] Full view opened');
            added = false;
            addButton();
        }
    });

})();
