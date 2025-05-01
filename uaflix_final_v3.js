// ==UserScript==
// @name         Uaflix Source Button
// @namespace    https://github.com/bennington111/
// @version      6.4
// @description  Adds UAFlix to sources section
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const BUTTON_ID = 'uaflix-source-btn';
    const SOURCE_SELECTOR = '.selectbox__body .scroll__body, .source-selector';
    const WATCH_BUTTON = '.card__watch, .watch-button, [data-action="watch"]';

    // Ваш стиль кнопки
    const button_html = `
    <div class="selectbox-item selectbox-item--icon selector" id="${BUTTON_ID}">
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
        // Видаляємо стару кнопку якщо існує
        const oldBtn = document.getElementById(BUTTON_ID);
        if (oldBtn) oldBtn.remove();

        // Шукаємо контейнер джерел
        const sourceContainer = document.querySelector(SOURCE_SELECTOR);
        if (!sourceContainer) return false;

        // Додаємо кнопку
        sourceContainer.insertAdjacentHTML('beforeend', button_html);
        const button = document.getElementById(BUTTON_ID);
        
        button.onclick = () => {
            const title = document.querySelector('.card__title')?.textContent || '';
            const year = document.querySelector('.card__year')?.textContent || '';
            window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
        };

        return true;
    }

    // Спостерігаємо за змінами при кліку на "Дивитись"
    document.addEventListener('click', (e) => {
        if (e.target.closest(WATCH_BUTTON)) {
            // Чекаємо поки з'явиться секція джерел
            const checkInterval = setInterval(() => {
                if (addUaflixButton()) {
                    clearInterval(checkInterval);
                }
            }, 300);
            
            // Зупиняємо через 5 секунд
            setTimeout(() => clearInterval(checkInterval), 5000);
        }
    });

    // Додатково перевіряємо при завантаженні сторінки
    if (document.querySelector(WATCH_BUTTON)) {
        setTimeout(() => {
            if (document.querySelector(SOURCE_SELECTOR)) {
                addUaflixButton();
            }
        }, 1000);
    }
})();
