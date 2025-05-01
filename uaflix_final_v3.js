// ==UserScript==
// @name         Uaflix for Lampa
// @namespace    https://github.com/bennington111/
// @version      4.6
// @description  Uaflix plugin for Lampa
// @author       Bennington
// @match        *://*/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// ==/UserScript==

// Точна копія вашого робочого коду з uaflix_final_v4.js
lampa.plugin.add({
    name: "uaflix",
    init: function() {
        this.addComponent();
    },
    addComponent: function() {
        lampa.menu.add({
            name: "Uaflix",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24"><path fill="currentColor" d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/></svg>',
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
