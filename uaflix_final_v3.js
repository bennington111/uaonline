// ==UserScript==
// @name         Lampa Uaflix Helper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Обхід блокування плагінів для Uaflix
// @match        *://lampa.mx/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Очікуємо завантаження Lampa
    function waitForLampa() {
        if (typeof lampa !== 'undefined') {
            initPlugin();
        } else {
            setTimeout(waitForLampa, 300);
        }
    }

    function initPlugin() {
        // Створюємо кнопку UAFlix
        const button = document.createElement('div');
        button.className = 'full-start__button selector';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="#ff5722">
                <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
            </svg>
            <span>UAFlix</span>
        `;

        button.onclick = function() {
            const title = document.querySelector('.card__title')?.textContent || '';
            const year = document.querySelector('.card__year')?.textContent || '';
            window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
        };

        // Додаємо кнопку до інтерфейсу
        function addButton() {
            const container = document.querySelector('.full-start__buttons');
            if (container && !container.querySelector('.full-start__button.selector[onclick]')) {
                container.appendChild(button);
            }
        }

        // Спостерігаємо за змінами DOM
        const observer = new MutationObserver(addButton);
        observer.observe(document.body, {childList: true, subtree: true});

        // Перша спроба
        addButton();
    }

    // Запускаємо
    if (document.readyState === 'complete') {
        waitForLampa();
    } else {
        window.addEventListener('load', waitForLampa);
    }
})();
