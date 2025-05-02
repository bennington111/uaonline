// ==UserScript==
// @name UAFIX Online
// @version 1.0.6
// @author YourName
// @description Плагін для перегляду контенту з uafix.net
// @icon https://uafix.net/favicon.ico
// ==/UserScript==

(function() {
    // Чекаємо, поки Lampa буде готова
    function waitForLampa() {
        if (typeof Lampa !== 'undefined' && Lampa.Plugin) {
            initPlugin();
        } else {
            setTimeout(waitForLampa, 100);
        }
    }

    function initPlugin() {
        // Зберігаємо оригінальний код кнопки з uaflix_work.js
        const originalPlugin = {
            name: 'UAFIX Online',
            icon: 'https://uafix.net/favicon.ico',
            group: 'online',
            version: '1.0.6',
            component: {
                template: `
                    <div class="plugin-uaflix">
                        <button @click="openMenu" class="plugin-uaflix__button">UAFIX</button>
                        <div v-if="showMenu" class="plugin-uaflix__menu">
                            <div @click="searchContent" class="plugin-uaflix__menu-item">Пошук</div>
                            <div v-if="showSearch" class="plugin-uaflix__search">
                                <input v-model="searchQuery" placeholder="Введіть назву">
                                <button @click="doSearch">Шукати</button>
                                <div class="plugin-uaflix__results">
                                    <div v-for="item in searchResults" @click="playItem(item)" class="plugin-uaflix__result-item">
                                        {{ item.title }} ({{ item.year }})
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                data: () => ({
                    showMenu: false,
                    showSearch: false,
                    searchQuery: '',
                    searchResults: []
                }),
                methods: {
                    openMenu() {
                        this.showMenu = !this.showMenu;
                        if (!this.showMenu) {
                            this.showSearch = false;
                            this.searchResults = [];
                        }
                    },
                    searchContent() {
                        this.showSearch = true;
                    },
                    async doSearch() {
                        if (!this.searchQuery.trim()) return;
                        
                        try {
                            const results = await this.searchUAFIX(this.searchQuery);
                            this.searchResults = results;
                        } catch (e) {
                            console.error('Search error:', e);
                            Lampa.Noty.show('Помилка пошуку');
                        }
                    },
                    async searchUAFIX(query) {
                        const searchUrl = `https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`;
                        const response = await fetch(`https://cors-anywhere.herokuapp.com/${searchUrl}`);
                        const html = await response.text();
                        
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
                        const results = [];
                        const items = doc.querySelectorAll('.short');
                        
                        items.forEach(item => {
                            const titleEl = item.querySelector('.short-title a');
                            const yearEl = item.querySelector('.short-year');
                            
                            if (titleEl) {
                                results.push({
                                    title: titleEl.textContent.trim(),
                                    url: titleEl.href,
                                    year: yearEl ? yearEl.textContent.trim() : ''
                                });
                            }
                        });
                        
                        return results;
                    },
                    async playItem(item) {
                        try {
                            const videoData = await this.getVideoFromUAFIX(item.url);
                            if (!videoData) throw new Error('Відео не знайдено');
                            
                            Lampa.Player.play({
                                title: item.title,
                                url: videoData.url,
                                type: videoData.type
                            });
                            
                            this.showMenu = false;
                            this.showSearch = false;
                        } catch (e) {
                            console.error('Play error:', e);
                            Lampa.Noty.show('Помилка відтворення');
                        }
                    },
                    async getVideoFromUAFIX(url) {
                        const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
                        const html = await response.text();
                        
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
                        const videoTag = doc.querySelector('video');
                        if (!videoTag) throw new Error('Тег video не знайдено');
                        
                        const videoUrl = videoTag.getAttribute('src');
                        if (!videoUrl) throw new Error('Посилання на відео відсутнє');
                        
                        return {
                            url: videoUrl,
                            type: videoUrl.includes('.m3u8') ? 'hls' : 'video'
                        };
                    }
                }
            }
        };

        // Додаємо плагін
        Lampa.Plugin.add('uaflix', originalPlugin);

        // Додаємо стилі
        Lampa.Template.add(`
            <style>
                .plugin-uaflix {
                    position: relative;
                    display: inline-block;
                    margin-left: 15px;
                }
                .plugin-uaflix__button {
                    background: #3f51b5;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .plugin-uaflix__menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background: #2a2a2a;
                    padding: 10px;
                    border-radius: 4px;
                    z-index: 1000;
                    min-width: 200px;
                }
                .plugin-uaflix__menu-item {
                    padding: 8px;
                    cursor: pointer;
                }
                .plugin-uaflix__menu-item:hover {
                    background: #3f51b5;
                }
                .plugin-uaflix__search {
                    margin-top: 10px;
                }
                .plugin-uaflix__results {
                    max-height: 400px;
                    overflow-y: auto;
                    margin-top: 10px;
                }
                .plugin-uaflix__result-item {
                    padding: 8px;
                    cursor: pointer;
                    border-bottom: 1px solid #444;
                }
                .plugin-uaflix__result-item:hover {
                    background: #3f51b5;
                }
            </style>
        `);
    }

    // Запускаємо очікування Lampa
    waitForLampa();
})();
