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

    function waitForStartButton() {
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
            button.addEventListener('click', handleClick);
            container.appendChild(button);

            console.log('Uaflix: кнопка додана');
        } else {
            setTimeout(waitForStartButton, 500);
        }
    }

    function handleClick() {
        console.log('Uaflix: кнопка натиснута');

        const card = Lampa.Activity.active().data;
        const title = card.name || card.original_title || card.original_name || '';
        const type = card.original_title ? 'movie' : 'tv';

        console.log(`Uaflix: обрано ${type} - "${title}"`);

        if (!title) {
            Lampa.Noty.show('Назва не знайдена');
            return;
        }

        Lampa.Modal.open({
            title: 'Uaflix',
            html: `<div class="about"><div class="selector">Пошук для: <b>${title}</b></div></div>`,
            size: 'small',
        });

        // Тут пізніше буде парсинг uafix.net
    }

    waitForStartButton();
})();
