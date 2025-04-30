// ==UserScript==
// @name         Uaflix Player Button
// @namespace    https://github.com/bennington111/
// @version      4.8
// @description  Adds UAFlix button to Lampa player
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    const mod_version = '4.8';
    let buttonAdded = false;

    // Стилізована кнопка UAFlix
    const button_html = `
    <div class="selector view--uaflix" 
         style="display: flex; align-items: center; padding: 0 12px; margin-right: 10px; cursor: pointer;
                background: rgba(255, 87, 34, 0.12); border-radius: 20px; height: 36px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="20" height="20" fill="#ff5722">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        <span style="margin-left: 6px; color: #ff5722; font-size: 14px;">UAFlix</span>
    </div>`;

    // Функція додавання кнопки
    function addUaflixButton() {
        if (buttonAdded) return;
        
        // Знаходимо контейнер кнопок плеєра (новий селектор для Lampa.mx)
        const playerControls = document.querySelector('.player-controls__right');
        const existingButton = document.querySelector('.view--uaflix');
        
        if (playerControls && !existingButton) {
            const button = document.createElement('div');
            button.innerHTML = button_html;
            button.onclick = function() {
                const cardData = lampa.player.card();
                if (cardData) {
                    const title = encodeURIComponent(cardData.title || '');
                    const year = cardData.year || '';
                    window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${title}+${year}`);
                }
            };
            playerControls.prepend(button);
            buttonAdded = true;
        }
    }

    // Спостерігач за змінами DOM
    const observer = new MutationObserver(function() {
        addUaflixButton();
    });

    // Починаємо спостереження
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Додатковий спосіб через події Lampa
    if (window.lampa) {
        lampa.events.subscribe('player_open', function() {
            setTimeout(addUaflixButton, 500);
        });
    }

    // Перша спроба додати кнопку
    setTimeout(addUaflixButton, 3000);
})();
