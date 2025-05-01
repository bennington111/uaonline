// ==UserScript==
// @name         Uaflix Source Button
// @namespace    https://github.com/bennington111/
// @version      7.1
// @description  Dynamic UAFlix button in sources section
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Конфігурація
    const CONFIG = {
        buttonId: 'uaflix-dynamic-btn',
        watchButton: '.card__watch, .watch-button, [data-action="watch"]',
        sourcesContainer: '.selectbox__body .scroll__body, .source-container, .player-options__items'
    };

    // Перевіряємо чи це сторінка фільму
    function isMoviePage() {
        return !!document.querySelector('.card__title, .film-page');
    }

    // Створюємо кнопку
    function createButton() {
        const existingBtn = document.getElementById(CONFIG.buttonId);
        if (existingBtn) return existingBtn;

        const button = document.createElement('div');
        button.id = CONFIG.buttonId;
        button.className = 'selector action-button';
        button.style.cssText = `
            display: flex;
            align-items: center;
            padding: 0 15px;
            margin: 0 10px;
            height: 36px;
            background: rgba(255, 87, 34, 0.12);
            border-radius: 20px;
            cursor: pointer;
        `;
        
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="20" height="20" fill="#ff5722">
                <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
            </svg>
            <span style="margin-left: 6px; color: #ff5722; font-size: 14px;">UAFlix</span>
        `;

        button.onclick = function() {
            const title = document.querySelector('.card__title')?.textContent || '';
            const year = document.querySelector('.card__year')?.textContent || '';
            window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
        };

        return button;
    }

    // Додаємо кнопку в контейнер джерел
    function addButtonToSources() {
        if (!isMoviePage()) return;

        const sourcesContainer = document.querySelector(CONFIG.sourcesContainer);
        if (!sourcesContainer) return;

        const button = createButton();
        if (!sourcesContainer.contains(button)) {
            sourcesContainer.appendChild(button);
        }
    }

    // Спостерігаємо за змінами DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!mutation.addedNodes) return;
            addButtonToSources();
        });
    });

    // Починаємо спостереження
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Обробник кліку на "Дивитись"
    document.addEventListener('click', function(e) {
        if (e.target.closest(CONFIG.watchButton)) {
            setTimeout(addButtonToSources, 500);
        }
    });

    // Перша перевірка
    setTimeout(addButtonToSources, 1000);
})();
