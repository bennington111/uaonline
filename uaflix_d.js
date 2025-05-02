// ==UserScript==
// @name UAFIX Online
// @version 1.0.5
// @author YourName
// @description Плагін для перегляду контенту з uafix.net
// @icon https://uafix.net/favicon.ico
// ==/UserScript==

Lampa.Plugin.add('uaflix', {
    name: 'UAFIX Online',
    icon: 'https://uafix.net/favicon.ico',
    group: 'online',
    version: '1.0.5',
    component: {
        template: `
            <div class="plugin-uaflix">
                <button @click="openSearch" class="plugin-uaflix__button">UAFIX</button>
                <div v-if="showSearch" class="plugin-uaflix__search">
                    <input v-model="searchQuery" placeholder="Пошук на UAFIX">
                    <button @click="doSearch">Шукати</button>
                    <div class="plugin-uaflix__results">
                        <div v-for="item in searchResults" @click="playItem(item)" class="plugin-uaflix__item">
                            {{ item.title }} ({{ item.year }})
                        </div>
                    </div>
                </div>
            </div>
        `,
        data: () => ({
            showSearch: false,
            searchQuery: '',
            searchResults: []
        }),
        methods: {
            openSearch() {
                this.showSearch = !this.showSearch;
                if (!this.showSearch) this.searchResults = [];
            },
            async doSearch() {
                if (!this.searchQuery.trim()) return;
                
                try {
                    const results = await this.searchOnUAFIX(this.searchQuery);
                    this.searchResults = results;
                } catch (e) {
                    console.error('Search error:', e);
                    Lampa.Noty.show('Помилка пошуку');
                }
            },
            async searchOnUAFIX(query) {
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
});

// Стилі для плагіна
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
        .plugin-uaflix__search {
            position: absolute;
            top: 100%;
            left: 0;
            background: #2a2a2a;
            padding: 10px;
            border-radius: 4px;
            z-index: 1000;
            width: 300px;
        }
        .plugin-uaflix__results {
            max-height: 400px;
            overflow-y: auto;
            margin-top: 10px;
        }
        .plugin-uaflix__item {
            padding: 8px;
            cursor: pointer;
            border-bottom: 1px solid #444;
        }
        .plugin-uaflix__item:hover {
            background: #3f51b5;
        }
    </style>
`);
