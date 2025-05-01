// ==UserScript==
// @name         Uaflix (EXACT WORKING VERSION)
// @namespace    https://github.com/bennington111/
// @version      4.6
// @description  Uaflix plugin for Lampa
// @author       Bennington
// @match        *://*/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    // Ваш оригінальний код з uaflix_final_v4.js
    const button_html = `
    <div class="full-start__button selector view--uaflix" data-subtitle="uaflix 4.6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        <span>UAFlix</span>
    </div>`;

    // Чекаємо на Lampa
    function waitForLampa(callback) {
        if (window.lampa && lampa.plugin && lampa.menu) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 200);
        }
    }

    waitForLampa(function() {
        // Реєстрація плагіна (як у вашому робочому файлі)
        lampa.plugin.add({
            name: "uaflix",
            init: function() {
                this.addButton();
            },
            addButton: function() {
                lampa.menu.add({
                    name: "Uaflix",
                    icon: button_html,
                    color: "#ff5722",
                    action: function() {
                        const card = lampa.player.card();
                        const title = card?.title || '';
                        const year = card?.year || '';
                        window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
                    }
                });
            }
        });
    });

    // Аварійний варіант - якщо Lampa не завантажилася через 10 секунд
    setTimeout(function() {
        if (!document.querySelector('.view--uaflix')) {
            const container = document.querySelector('.full-start__scroll, .full-start__buttons') || document.body;
            const button = document.createElement('div');
            button.innerHTML = button_html;
            button.onclick = function() {
                const title = document.querySelector('.card__title')?.textContent || '';
                const year = document.querySelector('.card__year')?.textContent || '';
                window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
            };
            container.appendChild(button);
        }
    }, 10000);
})();
