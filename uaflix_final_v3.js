// ==UserScript==
// @name         Uaflix Plugin Loader
// @namespace    https://github.com/bennington111/
// @version      5.4
// @description  UAFlix plugin for Lampa (fixed)
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    function initPlugin() {
        // Створюємо кнопку UAFlix
        const button_html = `
        <div class="full-start__button selector view--uaflix" 
             style="display: flex; align-items: center; padding: 0 15px; margin: 0 10px;
                    background: rgba(255, 87, 34, 0.12); border-radius: 20px; height: 36px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="20" height="20" fill="#ff5722">
                <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
            </svg>
            <span style="margin-left: 6px; color: #ff5722;">UAFlix</span>
        </div>`;

        // Функція додавання кнопки
        function addButton() {
            const pluginsContainer = document.querySelector('.full-start__buttons, .plugins-container');
            if (pluginsContainer && !pluginsContainer.querySelector('.view--uaflix')) {
                const button = document.createElement('div');
                button.innerHTML = button_html;
                button.onclick = function() {
                    const title = document.querySelector('.card__title')?.textContent || '';
                    const year = document.querySelector('.card__year')?.textContent || '';
                    window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
                };
                pluginsContainer.appendChild(button);
                return true;
            }
            return false;
        }

        // Спробуємо додати кнопку
        if (!addButton()) {
            const observer = new MutationObserver(function() {
                if (addButton()) observer.disconnect();
            });
            observer.observe(document.body, {childList: true, subtree: true});
            setTimeout(() => observer.disconnect(), 10000);
        }
    }

    // Чекаємо на завантаження Lampa
    if (window.lampa) {
        initPlugin();
    } else {
        document.addEventListener('lampa-loaded', initPlugin);
        let checkInterval = setInterval(() => {
            if (window.lampa) {
                clearInterval(checkInterval);
                initPlugin();
            }
        }, 500);
    }
})();
