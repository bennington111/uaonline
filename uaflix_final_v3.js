// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      1.1
// @description  Uaflix plugin for Lampa
// ==/UserScript==

// Плагін для UAFIX (оптимізована версія)
Lampa.Plugin.register('uaflix_online', function () {
    // Реєстрація онлайн-джерела
    Lampa.Storage.add('online', {
        name: 'uaflix',
        component: {
            template: `
                <div class="online-source online-source--uaflix">
                    <div class="online-source__title">🇺🇦 UAFIX</div>
                    <div 
                        class="online-source__item online-source__item--uaflix" 
                        @click="play"
                    >
                        <div class="online-source__item__title">Дивитись</div>
                        <div class="online-source__item__loader" v-if="loading"></div>
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
                        const card = Lampa.Storage.get('card');
                        const title = card.title;
                        
                        // Тут ваш код парсингу uafix.net
                        console.log('Запуск фільму:', title);
                        
                        // Приклад HLS-посилання (замініть на реальний парсинг)
                        const hlsUrl = 'https://example.com/film.m3u8';
                        
                        Lampa.Player.play({
                            url: hlsUrl,
                            title: title,
                            type: 'hls'
                        });
                    } catch (e) {
                        this.error = 'Помилка: ' + e.message;
                        console.error(e);
                    } finally {
                        this.loading = false;
                    }
                }
            }
        }
    });
});

// Стилі (обов'язково для коректного відображення)
Lampa.Template.add(`
    <style>
        .online-source--uaflix {
            padding: 15px;
        }
        .online-source__title {
            color: #ffdd00;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        .online-source__item--uaflix {
            background: rgba(0, 75, 150, 0.5);
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .online-source__item--uaflix:hover {
            background: rgba(0, 100, 200, 0.7);
        }
        .online-source__item__loader {
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid #fff;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
            margin: 5px auto 0;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .online-source__error {
            color: #ff5555;
            margin-top: 10px;
            font-size: 0.9em;
        }
    </style>
`);
