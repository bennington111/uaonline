// ==UserScript==
// @name         Uaflix Source Button
// @namespace    https://github.com/bennington111/
// @version      5.1
// @description  Adds UAFlix button to Lampa sources
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    const button_html = `
    <div class="selectbox-item selectbox-item--icon selector view--uaflix">
        <div class="selectbox-item__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="#ff5722">
                <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
            </svg>
        </div>
        <div>
            <div class="selectbox-item__title">UAFlix</div>
            <div class="selectbox-item__subtitle">uafix.net</div>
        </div>
    </div>`;

    function addUaflixButton() {
        const sourceList = document.querySelector('.selectbox__body .scroll__body');
        if (sourceList && !document.querySelector('.view--uaflix')) {
            const button = document.createElement('div');
            button.innerHTML = button_html;
            button.onclick = function() {
                const title = document.querySelector('.card__title')?.textContent || '';
                const year = document.querySelector('.card__year')?.textContent || '';
                window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
            };
            sourceList.appendChild(button);
            return true;
        }
        return false;
    }

    // Спостерігач за змінами
    const observer = new MutationObserver(function(mutations) {
        if (addUaflixButton()) {
            observer.disconnect();
        }
    });

    // Перша спроба
    if (!addUaflixButton()) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Зупинити через 10 секунд
        setTimeout(() => observer.disconnect(), 10000);
    }

    // Підписка на події Lampa (якщо доступно)
    if (window.lampa) {
        lampa.events.subscribe('source_open', addUaflixButton);
    }
})();
