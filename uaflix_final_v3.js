// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     4.1
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    const mod_name = "Uaflix";
    const mod_title = "Uaflix";
    const mod_version = "4.1";
    const mod_url = "https://uafix.net";
    const mod_icon = "https://uafix.net/favicon.ico";

    // Очікування завантаження Lampa
    function waitForLampa() {
        return new Promise(resolve => {
            if (window.lampa && window.lampa.plugins) {
                return resolve();
            }

            const timer = setInterval(() => {
                if (window.lampa && window.lampa.plugins) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    }

    // Основний компонент
    class UaflixComponent {
        constructor(item){
            this.item = item;
            this.html = '';
            this.loading = true;
            this.films = [];
        }

        create(){
            this.searchFilms(this.item.title);
            return this;
        }

        render(){
            if(this.loading) return `
                <div class="online-plugin__loading">
                    <div class="online-plugin__loading-progress"></div>
                    <div class="online-plugin__loading-text">Пошук на Uaflix...</div>
                </div>
            `;

            if(!this.films.length) return `
                <div class="online-plugin__empty">
                    <div class="online-plugin__empty-icon">!</div>
                    <div class="online-plugin__empty-title">Нічого не знайдено</div>
                </div>
            `;

            return `
                <div class="online-plugin__items">
                    ${this.films.map(film => `
                        <div class="online-plugin__item" data-url="${film.url}">
                            <img src="${film.poster || 'https://via.placeholder.com/150x225'}" 
                                 alt="${film.title}" 
                                 onerror="this.src='https://via.placeholder.com/150x225'">
                            <div class="online-plugin__item-title">${film.title}</div>
                            ${film.year ? `<div class="online-plugin__item-quality">${film.year}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        async searchFilms(query){
            try {
                const searchUrl = `${mod_url}/index.php?do=search&subaction=search&q=${encodeURIComponent(query)}`;
                const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(searchUrl)}`);
                
                if(!response.ok) throw new Error('Не вдалося завантажити сторінку');
                
                const html = await response.text();
                this.films = this.parseFilms(html);
            } catch(e) {
                console.error('Uaflix search error:', e);
                this.films = [];
            } finally {
                this.loading = false;
                this.update();
            }
        }

        parseFilms(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const items = doc.querySelectorAll('.sres-wrap');
            
            return Array.from(items).map(item => {
                const link = item.getAttribute('href');
                const img = item.querySelector('.sres-img img');
                const titleElement = item.querySelector('.sres-text h2');
                
                return {
                    title: titleElement ? titleElement.textContent.trim() : 'Без назви',
                    url: link ? this.normalizeUrl(link) : '',
                    poster: img ? img.src : '',
                    year: this.extractYear(item.querySelector('.sres-desc')?.textContent)
                };
            }).filter(film => film.url);
        }

        extractYear(description) {
            if (!description) return '';
            const yearMatch = description.match(/(19|20)\d{2}/);
            return yearMatch ? yearMatch[0] : '';
        }

        normalizeUrl(url) {
            if (!url) return '';
            return url.startsWith('http') ? url : `${mod_url}${url.startsWith('/') ? '' : '/'}${url}`;
        }

        update(){
            if(this.element) this.element.innerHTML = this.render();
            this.addEvents();
        }

        addEvents(){
            if(!this.element) return;
            
            this.element.querySelectorAll('.online-plugin__item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.dataset.url;
                    if(url) {
                        lampa.player.play({
                            title: item.querySelector('.online-plugin__item-title')?.textContent || mod_title,
                            url: url,
                            external: true
                        });
                    }
                });
            });
        }
    }

    // Додавання кнопки
    async function addButton() {
        await waitForLampa();
        
        const button = `
        <div class="full-start__button selector view--ua_flix" data-subtitle="UAFlix ${mod_version}">
            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/></svg>
            <span>${mod_title}</span>
        </div>`;

        const container = document.querySelector('.full-start__buttons');
        if(container && !container.querySelector('.view--ua_flix')) {
            container.insertAdjacentHTML('beforeend', button);
            
            const btn = container.querySelector('.view--ua_flix');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = lampa.getCurrentCard();
                if(card) {
                    lampa.plugins.fullStartHide();
                    lampa.plugins.exec('Uaflix', card);
                }
            });
        }
    }

    // Ініціалізація плагіна
    async function initPlugin() {
        await waitForLampa();
        
        lampa.plugins.Uaflix = {
            name: mod_name,
            component: UaflixComponent
        };

        console.log('Uaflix plugin loaded');
    }

    // Головна ініціалізація
    async function init() {
        try {
            await initPlugin();
            await addButton();
            console.log(`${mod_title} v${mod_version} successfully initialized`);
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    // Запуск
    if(document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
