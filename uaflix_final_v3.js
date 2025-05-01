// ==UserScript==
// @name         Uaflix Button for Lampa
// @namespace    https://github.com/bennington111/
// @version      5.1
// @description  Adds UAFlix button after "Watch" button
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    const button_html = `
    <div class="view--uaflix" style="
        display: flex;
        align-items: center;
        padding: 0 15px;
        margin-left: 10px;
        height: 36px;
        background: rgba(255, 87, 34, 0.12);
        border-radius: 20px;
        cursor: pointer;
    ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="20" height="20" fill="#ff5722">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        <span style="margin-left: 6px; color: #ff5722; font-size: 14px;">UAFlix</span>
    </div>`;

    function addUaflixButton() {
        // Знаходимо контейнер з кнопкою "Дивитись"
        const watchBtn = document.querySelector('.card__watch, .watch-button, .button-watch');
        if (watchBtn && watchBtn.parentNode) {
            const container = watchBtn.parentNode;
            
            // Перевіряємо чи кнопка вже існує
            if (!container.querySelector('.view--uaflix')) {
                const button = document.createElement('div');
                button.innerHTML = button_html;
                button.onclick = function() {
                    const title = document.querySelector('.card__title')?.textContent || '';
                    const year = document.querySelector('.card__year')?.textContent || '';
                    window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
                };
                
                // Додаємо кнопку після кнопки "Дивитись"
                watchBtn.insertAdjacentElement('afterend', button);
                return true;
            }
        }
        return false;
    }

    // Спостерігач за змінами DOM
    const observer = new MutationObserver(function(mutations) {
        addUaflixButton();
    });

    // Починаємо спостереження
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Перша спроба додати кнопку
    setTimeout(addUaflixButton, 1000);
})();
