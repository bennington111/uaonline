// ==UserScript==
// @name         UAFlix Source
// @namespace    UAFlix
// @version      7.2
// @description  UAFlix button in sources
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const BUTTON_ID = 'uaflix-source-btn-v2';
    const SOURCES_SELECTOR = '.selectbox__body, .sources-list, .player-options';
    const WATCH_BUTTON = '[data-action="watch"], .watch-btn, .card__watch';

    function createButton() {
        if (document.getElementById(BUTTON_ID)) return;

        const button = document.createElement('div');
        button.id = BUTTON_ID;
        button.className = 'source-item';
        button.style.cssText = `
            display: flex;
            align-items: center;
            padding: 10px 15px;
            margin: 5px 0;
            background: rgba(255, 87, 34, 0.1);
            border-radius: 8px;
            cursor: pointer;
        `;

        button.innerHTML = `
            <div style="margin-right:10px">
                <svg width="24" height="24" viewBox="0 0 244 260" fill="#ff5722">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
            </div>
            <div>
                <div style="font-weight:500;color:#ff5722">UAFlix</div>
                <div style="font-size:12px;color:#aaa">uafix.net</div>
            </div>
        `;

        button.onclick = () => {
            const title = document.querySelector('.card__title')?.textContent || '';
            const year = document.querySelector('.card__year')?.textContent || '';
            window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
        };

        return button;
    }

    function addButtonToSources() {
        const sources = document.querySelector(SOURCES_SELECTOR);
        if (!sources) return false;

        const button = createButton();
        if (!button) return true;

        sources.appendChild(button);
        return true;
    }

    // Основний спостерігач
    const observer = new MutationObserver(() => {
        if (addButtonToSources()) {
            observer.disconnect();
        }
    });

    // Запуск
    if (document.querySelector(WATCH_BUTTON)) {
        // Слухач кліків на "Дивитись"
        document.addEventListener('click', (e) => {
            if (e.target.closest(WATCH_BUTTON)) {
                setTimeout(() => {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true
                    });
                    setTimeout(() => observer.disconnect(), 5000);
                }, 300);
            }
        });

        // Перша спроба
        setTimeout(() => {
            if (!addButtonToSources()) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                setTimeout(() => observer.disconnect(), 5000);
            }
        }, 1000);
    }
})();
