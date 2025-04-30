// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     4.7
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    // Конфігурація (з вашого робочого скрипта)
    const mod_name = "Uaflix";
    const mod_title = "Uaflix";
    const mod_version = "4.7";
    const mod_url = "https://uafix.net";
    const mod_icon = "https://uafix.net/favicon.ico";

    // Основний код з вашого робочого скрипта
    function initPlugin() {
        if(!window.lampa) {
            setTimeout(initPlugin, 100);
            return;
        }

        // Реєстрація плагіна (ваш оригінальний код)
        lampa.plugins.Uaflix = {
            name: mod_name,
            component: UaflixComponent
        };

        // Додавання кнопки (ваш оригінальний код)
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
        } else {
            setTimeout(initPlugin, 300);
        }

        console.log('Uaflix plugin loaded');
    }

    // Компонент з вашим оригінальним кодом, лише оновлений парсинг
    class UaflixComponent {
        constructor(item){
            this.item = item;
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
                if(this.update) this.update();
            }
        }

        // Оновлений парсинг для нової структури uafix.net
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
                    poster: img ? img.src : ''
                };
            }).filter(film => film.url);
        }

        normalizeUrl(url) {
            return url.startsWith('http') ? url : `${mod_url}${url.startsWith('/') ? '' : '/'}${url}`;
        }
    }

    // Запуск
    if(document.readyState === 'complete') {
        initPlugin();
    } else {
        window.addEventListener('load', initPlugin);
    }
})();
