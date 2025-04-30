// ==UserScript==
// @name         Uaflix for Lampa
// @namespace    uaflix
// @version      1.1
// @description  Uaflix plugin for Lampa
// @author       Bennington
// @match        *://*/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    // Чекаємо готовності Lampa
    function waitForLampa() {
        if (window.lampa && lampa.plugin && lampa.menu) {
            initPlugin();
        } else {
            setTimeout(waitForLampa, 300);
        }
    }

    function initPlugin() {
        lampa.plugin.add({
            name: "uaflix_plugin",
            init: function() {
                // Створюємо кнопку
                lampa.menu.add({
                    name: "Uaflix",
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#ff5722" d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L20 9v6l-8 4-8-4V9l8-4.5z"/></svg>',
                    color: "#ff5722",
                    action: () => {
                        lampa.notice.show("Завантаження фільмів...");
                        loadFilms();
                    }
                });
            }
        });
    }

    function loadFilms() {
        fetch('https://uafix.net/film/')
            .then(r => r.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const films = [];
                
                // Парсимо фільми
                doc.querySelectorAll('.video-item').forEach(item => {
                    const title = item.querySelector('.vi-title')?.textContent.trim() || 'Без назви';
                    const link = 'https://uafix.net' + item.querySelector('a.vi-img')?.getAttribute('href');
                    const poster = 'https://uafix.net' + item.querySelector('img')?.getAttribute('src');
                    
                    if (title && link && poster) {
                        films.push({
                            title: title,
                            link: link,
                            poster: poster,
                            info: '',
                            description: ''
                        });
                    }
                });

                if (films.length > 0) {
                    showFilms(films);
                } else {
                    lampa.notice.show("Фільми не знайдені");
                }
            })
            .catch(e => {
                lampa.notice.show("Помилка завантаження");
                console.error("Uaflix error:", e);
            });
    }

    function showFilms(films) {
        lampa.pages.open('result', {
            source: 'plugin',
            title: 'Uaflix',
            result: {
                title: 'Uaflix',
                items: films
            }
        });
    }

    // Запускаємо
    if (document.readyState === 'complete') {
        waitForLampa();
    } else {
        window.addEventListener('load', waitForLampa);
    }
})();
