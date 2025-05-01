// ==UserScript==
// @name         Uaflix Button (Working Version)
// @namespace    https://github.com/bennington111/
// @version      5.2
// @description  Adds UAFlix button using proven working code
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    // Ваш робочий HTML з uaflix_final_v4.js
    const button_html = `
    <div class="full-start__button selector view--uaflix" data-subtitle="uaflix 5.2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        <span>UAFlix</span>
    </div>`;

    // Функція додавання кнопки (аналогічно робочому online_mod.js)
    function addButton() {
        // Шукаємо контейнер кнопок (як в online_mod.js)
        const container = document.querySelector('.full-start__scroll, .full-start__buttons, .player-options__items');
        
        if (container && !container.querySelector('.view--uaflix')) {
            const button = document.createElement('div');
            button.innerHTML = button_html;
            button.onclick = function() {
                const card = lampa.player.card();
                const title = card?.title || document.querySelector('.card__title')?.textContent || '';
                const year = card?.year || document.querySelector('.card__year')?.textContent || '';
                window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
            };
            container.appendChild(button);
            return true;
        }
        return false;
    }

    // Агресивний підхід з online_mod.js
    function init() {
        // Спроба додати одразу
        if (!addButton()) {
            // Спостерігач за змінами DOM
            const observer = new MutationObserver(function() {
                if (addButton()) {
                    observer.disconnect();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Додаткова перевірка через події Lampa
            if (window.lampa) {
                lampa.events.subscribe('source_open', addButton);
                lampa.events.subscribe('player_open', addButton);
            }
            
            // Спроба кожні 500мс протягом 10 секунд
            const interval = setInterval(addButton, 500);
            setTimeout(() => clearInterval(interval), 10000);
        }
    }

    // Запуск
    if (document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }
})();
