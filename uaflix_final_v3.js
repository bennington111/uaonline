// ==UserScript==
// @name         Uaflix for Lampa
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
    
    const mod_version = '4.6';
    
    // Чекаємо завантаження DOM
    function init() {
        // Ваш робочий варіант кнопки
        const button_html = `
        <div class="full-start__button selector view--uaflix" data-subtitle="uaflix ${mod_version}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
            </svg>
            <span>UAFlix</span>
        </div>`;
        
        // Додаємо кнопку до інтерфейсу Lampa
        function addButton() {
            const menu = document.querySelector('.full-start__scroll');
            if (menu) {
                const button = document.createElement('div');
                button.innerHTML = button_html;
                button.querySelector('.view--uaflix').addEventListener('click', loadFilms);
                menu.appendChild(button);
            }
        }
        
        // Завантаження фільмів
        function loadFilms() {
            fetch('https://uafix.net/film/')
                .then(r => r.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const films = [];
                    
                    doc.querySelectorAll('.video-item').forEach(item => {
                        const title = item.querySelector('.vi-title')?.textContent.trim() || 'Без назви';
                        const link = 'https://uafix.net' + item.querySelector('a.vi-img')?.getAttribute('href');
                        const poster = 'https://uafix.net' + item.querySelector('img')?.getAttribute('src');
                        
                        if (title && link && poster) {
                            films.push({
                                title: title,
                                link: link,
                                poster: poster,
                                year: (title.match(/(\d{4})/) || [])[0] || '',
                                description: ''
                            });
                        }
                    });
                    
                    if (films.length > 0) {
                        showFilms(films);
                    } else {
                        alert('Фільми не знайдені');
                    }
                })
                .catch(e => {
                    alert('Помилка завантаження');
                    console.error("Uaflix error:", e);
                });
        }
        
        // Відображення результатів
        function showFilms(films) {
            if (window.lampa && lampa.pages) {
                lampa.pages.open('result', {
                    source: 'plugin',
                    title: 'Uaflix',
                    result: {
                        title: 'Uaflix',
                        items: films
                    }
                });
            } else {
                // Простий вивід, якщо Lampa не завантажена
                let result = "Знайдені фільми:\n";
                films.forEach(film => result += `\n${film.title} (${film.year})\n${film.link}\n`);
                alert(result);
            }
        }
        
        // Спробуємо додати кнопку одразу
        addButton();
        
        // Якщо меню ще не завантажилося, чекаємо
        if (!document.querySelector('.full-start__scroll')) {
            const observer = new MutationObserver(() => addButton());
            observer.observe(document.body, {childList: true, subtree: true});
        }
    }
    
    // Запускаємо після повного завантаження сторінки
    if (document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }
})();
