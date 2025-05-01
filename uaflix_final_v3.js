// ==UserScript==
// @name         Uaflix (Working Version)
// @namespace    https://github.com/bennington111/
// @version      4.6
// @description  Uaflix plugin for Lampa
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    // Ваш робочий HTML з uaflix_final_v4.js
    const button_html = `
    <div class="full-start__button selector view--uaflix" data-subtitle="uaflix 4.6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        <span>UAFlix</span>
    </div>`;

    // Функція додавання кнопки
    function addButton() {
        // Шукаємо контейнер кнопок
        const container = document.querySelector('.full-start__scroll, .full-start__buttons');
        
        if (container && !container.querySelector('.view--uaflix')) {
            const button = document.createElement('div');
            button.innerHTML = button_html;
            button.onclick = function() {
                // Парсинг з uafix.net
                fetch('https://uafix.net/film/')
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const films = [];
                        
                        doc.querySelectorAll('.video-item').forEach(item => {
                            const title = item.querySelector('.vi-title')?.textContent.trim() || '';
                            const link = 'https://uafix.net' + item.querySelector('a.vi-img')?.getAttribute('href');
                            const poster = 'https://uafix.net' + item.querySelector('img')?.getAttribute('src');
                            
                            if (title && link && poster) {
                                films.push({ title, link, poster });
                            }
                        });
                        
                        if (films.length > 0) {
                            // Відображення результатів
                            console.log('Знайдені фільми:', films);
                            window.open(films[0].link); // Відкриваємо перший фільм
                        }
                    })
                    .catch(error => {
                        console.error('Помилка:', error);
                    });
            };
            container.appendChild(button);
        }
    }

    // Спостерігач за змінами DOM
    const observer = new MutationObserver(function(mutations) {
        addButton();
    });

    // Починаємо спостереження
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Перша спроба додати кнопку
    setTimeout(addButton, 1000);
})();
