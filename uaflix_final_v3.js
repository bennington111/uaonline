// ==UserScript==
// @name         Uaflix (Full Working Version)
// @namespace    https://github.com/bennington111/
// @version      5.0
// @description  Uaflix plugin for Lampa
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    // Реєстрація плагіна (з вашого робочого коду)
    const mod_version = '1.0.0';
    const mod_id = 'uaflix';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'UAFlix',
        description: 'Перегляд з сайту UAFlix (uafix.net)',
        type: 'video',
        component: 'online',
        proxy: true
    };

    // Очікуємо завантаження Lampa
    function waitForLampa() {
        if (window.Lampa && Lampa.Manifest) {
            Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
            Lampa.Manifest.plugins.push(manifest);
            initPlugin();
        } else {
            setTimeout(waitForLampa, 200);
        }
    }

    // Ініціалізація плагіна (з uaflix_final_v4.js)
    function initPlugin() {
        const button_html = `
        <div class="full-start__button selector view--uaflix" data-subtitle="uaflix ${mod_version}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
            </svg>
            <span>UAFlix</span>
        </div>`;

        // Додаємо кнопку (з button_work.js)
        function addButton() {
            const container = document.querySelector('.full-start__buttons');
            if (container && !container.querySelector('.view--uaflix')) {
                const button = document.createElement('div');
                button.innerHTML = button_html;
                button.onclick = function() {
                    // Ваш код для парсингу uafix.net
                    const title = document.querySelector('.card__title')?.textContent || '';
                    const year = document.querySelector('.card__year')?.textContent || '';
                    window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
                };
                container.appendChild(button);
            }
        }

        // Спостерігач за змінами DOM
        const observer = new MutationObserver(addButton);
        observer.observe(document.body, {childList: true, subtree: true});
        addButton();
    }

    // Запускаємо
    if (document.readyState === 'complete') {
        waitForLampa();
    } else {
        window.addEventListener('load', waitForLampa);
    }
})();
