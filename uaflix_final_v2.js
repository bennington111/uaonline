// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     3.0
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        name: 'Uaflix',
        title: 'Uaflix',
        version: '3.0',
        host: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico',
        searchUrl: '/search?do=search&subaction=search&q=',
        itemSelector: '.short',
        selectors: {
            title: '.short-title',
            link: '.short-link a',
            poster: '.short-img img',
            quality: '.short-quality'
        }
    };

    function init() {
        if (!window.Lampa || !Lampa.Plugin) {
            setTimeout(init, 100);
            return;
        }

        Lampa.Plugin.follow('online', {
            Uaflix: {
                icon: CONFIG.icon,
                name: CONFIG.name,
                component: class {
                    constructor(item) {
                        this.item = item;
                        this.loading = true;
                        this.items = [];
                    }
                    
                    create() {
                        this.search();
                        return this;
                    }
                    
                    render() {
                        if (this.loading) return `
                            <div class="online-plugin__loading">
                                <div class="online-plugin__loading-progress"></div>
                                <div class="online-plugin__loading-text">Пошук на ${CONFIG.title}...</div>
                            </div>
                        `;
                        
                        if (!this.items.length) return `
                            <div class="online-plugin__empty">
                                <div class="online-plugin__empty-icon">
                                    <svg width="60" height="60" viewBox="0 0 24 24">
                                        <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>
                                    </svg>
                                </div>
                                <div class="online-plugin__empty-title">Нічого не знайдено</div>
                            </div>
                        `;
                        
                        return `
                            <div class="online-plugin__items">
                                ${this.items.map(item => `
                                    <div class="online-plugin__item" data-url="${item.url}">
                                        <div class="online-plugin__item-poster">
                                            <img src="${item.poster || 'https://via.placeholder.com/150x225'}" 
                                                 alt="${item.title}" 
                                                 onerror="this.src='https://via.placeholder.com/150x225'">
                                        </div>
                                        <div class="online-plugin__item-info">
                                            <div class="online-plugin__item-title">${item.title}</div>
                                            ${item.quality ? `<div class="online-plugin__item-quality">${item.quality}</div>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }
                    
                    async search() {
                        try {
                            const searchUrl = CONFIG.host + CONFIG.searchUrl + encodeURIComponent(this.item.title);
                            const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(searchUrl)}`);
                            
                            if (!response.ok) throw new Error('Network error');
                            
                            const html = await response.text();
                            this.items = this.parse(html);
                        } catch (e) {
                            console.error('Uaflix error:', e);
                            this.items = [];
                        } finally {
                            this.loading = false;
                            this.update();
                        }
                    }
                    
                    parse(html) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const items = doc.querySelectorAll(CONFIG.itemSelector);
                        
                        return Array.from(items).map(item => {
                            const link = item.querySelector(CONFIG.selectors.link);
                            const poster = item.querySelector(CONFIG.selectors.poster);
                            
                            return {
                                title: item.querySelector(CONFIG.selectors.title)?.textContent.trim() || 'Без назви',
                                url: link?.href ? this.normalizeUrl(link.href) : '',
                                poster: poster?.src || '',
                                quality: item.querySelector(CONFIG.selectors.quality)?.textContent.trim() || ''
                            };
                        }).filter(item => item.url);
                    }
                    
                    normalizeUrl(url) {
                        return url.startsWith('http') ? url : `${CONFIG.host}${url.startsWith('/') ? '' : '/'}${url}`;
                    }
                    
                    update() {
                        if (this.element) this.element.innerHTML = this.render();
                        this.addEvents();
                    }
                    
                    addEvents() {
                        if (!this.element) return;
                        
                        this.element.querySelectorAll('.online-plugin__item').forEach(item => {
                            item.addEventListener('click', () => {
                                const url = item.dataset.url;
                                if (url) Lampa.Player.play({
                                    title: this.item.title,
                                    url: url,
                                    external: true
                                });
                            });
                        });
                    }
                }
            }
        });

        console.log(`${CONFIG.name} v${CONFIG.version} initialized`);
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
