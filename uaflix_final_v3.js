// ==UserScript==
// @name         Uaflix External Button
// @namespace    https://github.com/bennington111/
// @version      7.0
// @description  External button for Uaflix
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Створюємо кнопку в іншому місці
    const button = document.createElement('a');
    button.href = 'javascript:void(0)';
    button.id = 'uaflix-external-btn';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        align-items: center;
        padding: 10px 15px;
        background: rgba(255, 87, 34, 0.2);
        border-radius: 20px;
        color: #ff5722;
        font-weight: bold;
        text-decoration: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="20" height="20" fill="#ff5722" style="margin-right:8px">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        UAFlix
    `;

    // Додаємо кнопку на сторінку
    document.body.appendChild(button);

    // Обробник кліку
    button.onclick = function() {
        const title = document.querySelector('.card__title, .title')?.textContent || '';
        const year = document.querySelector('.card__year, .year')?.textContent || '';
        window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
    };
})();
