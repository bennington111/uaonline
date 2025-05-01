// ==UserScript==
// @name         Uaflix Official Plugin
// @namespace    https://github.com/bennington111/
// @version      1.0
// @description  Official Uaflix plugin for Lampa
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

// Плагін для uafix.net (оптимізований під пряме HLS-посилання у <video>)
Lampa.Plugin.register('uaflix_online', function () {
    Lampa.Storage.add('online', {
        name: 'uaflix',
        component: {
            template: `
                <div class="online-source">
                    <div class="online-source__title">🇺🇦 UAFIX</div>
                    <div 
                        class="online-source__item" 
                        @click="play"
                        :class="{ 'online-source__item--loading': loading }"
                    >
                        <div class="online-source__item__title">Дивитись на UAFIX</div>
                        <div class="online-source__item__loader" v-if="loading">
                            <div class="loader"></div>
                        </div>
                    </div>
                    <div class="online-source__error" v-if="error">{{ error }}</div>
                </div>
            `,
            data: () => ({
                loading: false,
                error: ''
            }),
            methods: {
                async play() {
                    this.loading = true;
                    this.error = '';
                    
                    try {
                        // 1. Отримуємо дані фільму
                        const card = Lampa.Storage.get('card');
                        const title = card.title;
                        const year = card.year;
                        
                        // 2. Шукаємо фільм на uafix.net через пошук
                        const searchQuery = encodeURIComponent(`${title} ${year}`);
                        const searchUrl = `https://corsproxy.io/?${encodeURIComponent(`https://uafix.net/search?q=${searchQuery}`)}`;
                        
                        const searchHtml = await fetch(searchUrl).then(r => r.text());
                        const filmPath = this.extractFilmPath(searchHtml);
                        
                        if (!filmPath) throw new Error('Фільм не знайдено');
                        
                        // 3. Парсимо сторінку фільму для HLS
                        const filmUrl = `https://corsproxy.io/?${encodeURIComponent(`https://uafix.net${filmPath}`)}`;
                        const filmHtml = await fetch(filmUrl).then(r => r.text());
                        const videoUrl = this.extractHlsUrl(filmHtml);
                        
                        if (!videoUrl) throw new Error('Посилання на відео відсутнє');
                        
                        // 4. Запускаємо плеєр
                        Lampa.Player.play({
                            url: videoUrl,
                            title: `UAFIX: ${title}`,
                            type: 'hls' // Формат HLS
                        });
                        
                    } catch (e) {
                        this.error = e.message;
                        console.error('UAFIX Помилка:', e);
                    } finally {
                        this.loading = false;
                    }
                },
                
                // Шукаємо посилання на фільм у результатах пошуку
                extractFilmPath(html) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const firstResult = doc.querySelector('.film-list .film-item a');
                    return firstResult ? firstResult.getAttribute('href') : null;
                },
                
                // Витягуємо HLS-посилання з <video>
                extractHlsUrl(html) {
                    const videoMatch = html.match(/<video[^>]+src="([^"]+\.m3u8)"/i);
                    return videoMatch ? videoMatch[1] : null;
                }
            }
        }
    });
});

// Стилі для кращого відображення
Lampa.Template.add(`
    <style>
        .online-source {
            padding: 15px;
            color: #fff;
        }
        .online-source__title {
            font-size: 1.2em;
            margin-bottom: 10px;
            color: #ffdd00; /* Жовтий для акценту */
        }
        .online-source__item {
            padding: 12px;
            background: rgba(0, 75, 150, 0.5); /* Блакитний фон */
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s;
            position: relative;
        }
        .online-source__item:hover {
            background: rgba(0, 100, 200, 0.7);
        }
        .online-source__item--loading {
            opacity: 0.7;
        }
        .online-source__item__title {
            font-weight: bold;
        }
        .online-source__item__loader {
            margin-top: 8px;
        }
        .loader {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .online-source__error {
            color: #ff5555;
            margin-top: 10px;
            font-size: 0.9em;
        }
    </style>
`);
