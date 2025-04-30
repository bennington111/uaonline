// ==UserScript==
// @name         Uaflix for Lampa
// @namespace    https://github.com/bennington111/
// @version      4.4
// @description  Uaflix plugin for Lampa
// @author       Bennington
// @match        *://*/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    function waitForLampa() {
        if (window.lampa && lampa.plugin) {
            initPlugin();
        } else {
            setTimeout(waitForLampa, 200);
        }
    }

    function initPlugin() {
        lampa.plugin.add({
            name: "uaflix",
            init: function() {
                this.addButton();
            },
            addButton: function() {
                lampa.menu.add({
                    name: "Uaflix",
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zm-1.5 13.5h-9v-9h9v9z"/></svg>',
                    color: "#ff5722",
                    action: () => {
                        this.loadUAFixContent();
                    }
                });
            },
            loadUAFixContent: function() {
                lampa.loader.show();
                
                let url = 'https://uafix.net/film/';
                
                lampa.request.get(url, (data) => {
                    if (!data) {
                        lampa.notice.show('Помилка завантаження Uaflix');
                        lampa.loader.hide();
                        return;
                    }
                    
                    const films = this.parseUAFix(data);
                    
                    if (films.length === 0) {
                        lampa.notice.show('Фільми не знайдені');
                        lampa.loader.hide();
                        return;
                    }
                    
                    this.showResults(films);
                    lampa.loader.hide();
                });
            },
            parseUAFix: function(data) {
                const films = [];
                
                const items = data.match(/<div class="video-item with-mask new-item">.*?<\/div><\/div>/gs);
                
                if (items) {
                    items.forEach(item => {
                        const titleMatch = item.match(/<div class="vi-title">(.*?)<\/div>/);
                        const title = titleMatch ? titleMatch[1].trim() : 'Невідома назва';
                        
                        const linkMatch = item.match(/<a class="vi-img img-resp-h" href="(.*?)"/);
                        const link = linkMatch ? 'https://uafix.net' + linkMatch[1] : '';
                        
                        const posterMatch = item.match(/<img src="(.*?)"/);
                        const poster = posterMatch ? 'https://uafix.net' + posterMatch[1] : '';
                        
                        if (title && link && poster) {
                            films.push({
                                title: title,
                                link: link,
                                poster: poster,
                                year: this.extractYear(title),
                                description: '',
                                genre: ''
                            });
                        }
                    });
                }
                
                return films;
            },
            extractYear: function(title) {
                const yearMatch = title.match(/(\d{4})/);
                return yearMatch ? yearMatch[0] : '';
            },
            showResults: function(films) {
                const result = {
                    title: "Uaflix",
                    items: films.map(film => ({
                        title: film.title,
                        link: film.link,
                        poster: film.poster,
                        info: [
                            film.year ? `Рік: ${film.year}` : '',
                            film.genre ? `Жанр: ${film.genre}` : ''
                        ].filter(Boolean).join(' • '),
                        description: film.description || '',
                        action: {
                            type: "open",
                            value: film.link
                        }
                    }))
                };
                
                lampa.pages.open('result', {
                    source: 'plugin',
                    title: 'Uaflix',
                    result: result
                });
            }
        });
    }

    // Додаткова перевірка для старих версій Lampa
    if (window.lampa && lampa.plugin) {
        initPlugin();
    } else {
        document.addEventListener('lampa-loaded', initPlugin);
        waitForLampa();
    }
})();
