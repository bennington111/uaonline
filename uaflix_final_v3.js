// ==UserScript==
// @name         Uaflix Direct Button
// @namespace    https://github.com/bennington111/
// @version      6.2
// @description  Direct button injection for Uaflix
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Унікальний ідентифікатор для нашої кнопки
    const BUTTON_ID = 'uaflix-custom-button';

    // Перевіряємо, чи вже існує наша кнопка
    if (document.getElementById(BUTTON_ID)) return;

    // Створюємо кнопку (ваш дизайн)
    const button = document.createElement('div');
    button.id = BUTTON_ID;
    button.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 9999;
        display: flex;
        align-items: center;
        padding: 0 15px;
        height: 40px;
        background: rgba(255, 87, 34, 0.2);
        border-radius: 20px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="#ff5722">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        <span style="margin-left: 8px; color: #ff5722; font-size: 14px; font-weight: bold;">UAFlix</span>
    `;

    // Обробник кліку
    button.onclick = function() {
        const title = document.querySelector('.card__title, .title')?.textContent || '';
        const year = document.querySelector('.card__year, .year')?.textContent || '';
        window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
    };

    // Додаємо кнопку на сторінку
    document.body.appendChild(button);

    // Робимо кнопку пересувною
    let isDragging = false;
    let offsetX, offsetY;

    button.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - button.getBoundingClientRect().left;
        offsetY = e.clientY - button.getBoundingClientRect().top;
        button.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        button.style.left = `${e.clientX - offsetX}px`;
        button.style.top = `${e.clientY - offsetY}px`;
        button.style.right = 'unset';
        button.style.bottom = 'unset';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        button.style.cursor = 'pointer';
    });
})();
