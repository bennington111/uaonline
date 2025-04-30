// ==UserScript==
// @name         Uaflix Player Button
// @namespace    https://github.com/bennington111/
// @version      4.7
// @description  Adds UAFlix button to Lampa player
// @author       Bennington
// @match        *://*/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    const mod_version = '4.7';
    
    // Ваш оригінальний дизайн кнопки
    const button_html = `
    <div class="selector view--uaflix" data-subtitle="uaflix ${mod_version}" 
         style="margin: 0 10px; padding: 8px 15px; border-radius: 20px; background: rgba(255, 87, 34, 0.2);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="20" height="20" fill="#ff5722">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        <span style="margin-left: 5px; color: #ff5722;">UAFlix</span>
    </div>`;

    // Спостерігач за змінами DOM
    const observer = new MutationObserver(function(mutations) {
        // Шукаємо контейнер кнопок плеєра
        const playerButtons = document.querySelector('.player-options__items');
        
        if (playerButtons && !document.querySelector('.view--uaflix')) {
            // Додаємо нашу кнопку
            const button = document.createElement('div');
            button.innerHTML = button_html;
            button.querySelector('.view--uaflix').addEventListener('click', function() {
                const card = lampa.player.card();
                if (card) {
                    const title = card.title || '';
                    const year = card.year || '';
                    window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
                }
            });
            playerButtons.prepend(button);
        }
    });

    // Починаємо спостереження
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Додаткове спостереження для подій Lampa
    if (window.lampa) {
        lampa.events.subscribe('player_open', function() {
            const playerButtons = document.querySelector('.player-options__items');
            if (playerButtons) {
                const button = playerButtons.querySelector('.view--uaflix');
                if (!button) {
                    const newButton = document.createElement('div');
                    newButton.innerHTML = button_html;
                    playerButtons.prepend(newButton);
                }
            }
        });
    }
})();
