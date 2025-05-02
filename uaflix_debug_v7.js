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

    function waitForButtonContainer() {
        const container = document.querySelector('.full-start__buttons');

        if (container && !container.querySelector('.view--uaflix')) {
            const button = document.createElement('div');
            button.className = 'full-start__button selector view--uaflix';
            button.innerHTML = `
                <svg height="24" viewBox="0 0 24 24" width="24">
                    <path d="M10 16.5l6-4.5-6-4.5z" fill="currentColor"/>
                </svg>
                <span>Онлайн UAflix</span>
            `;
            button.addEventListener('click', onClick);
            container.appendChild(button);

            console.log('Uaflix: кнопка додана');
        } else {
            setTimeout(waitForButtonContainer, 500);
        }
    }

    function onClick() {
        try {
            const activity = Lampa.Activity.active();
            const card = activity.data || {};
            const title = card.name || card.original_title || card.original_name || '';
            const type = card.original_title ? 'movie' : 'tv';

            console.log(`Uaflix: натискання кнопки — title: "${title}", type: ${type}`);

            if (!title) {
                Lampa.Noty.show('Не вдалося отримати назву');
                return;
            }

            // Тут відкриється модальне вікно для демонстрації
            Lampa.Modal.open({
                title: 'Uaflix',
                html: `<div class="about"><div class="selector">Пошук для: <b>${title}</b></div></div>`,
                size: 'small',
            });
        } catch (e) {
            console.error('Uaflix: помилка при обробці кліку', e);
        }
    }

    waitForButtonContainer();
})();
