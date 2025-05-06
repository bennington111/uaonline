// ==UserScript==
// @name        UAOnline
// @namespace   uaonline
// @version     1.5
// @description Плагін для перегляду українського контенту
// @author      You
// @match       *://*/*
// @grant       none
// @icon        https://bennington111.github.io/uaonline/icon.png
// ==/UserScript==

(function() {
    'use strict';

    const PLUGIN_ID = 'uaonline';
    const PLUGIN_VERSION = '1.5';
    const CORS_PROXY = 'https://corsproxy.io/?';
    const DEFAULT_ICON = 'https://bennington111.github.io/uaonline/icon.png';

    // Реєстрація плагіна
    const manifest = {
        version: PLUGIN_VERSION,
        id: PLUGIN_ID,
        name: 'UAOnline',
        description: 'Український онлайн контент',
        type: 'video',
        component: 'online',
        icon: DEFAULT_ICON
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    // Додавання стилів
    const style = document.createElement('style');
    style.textContent = `
        .view--uaonline svg {
            color: #0057b7;
        }
        .online--uaonline .online__head {
            background: linear-gradient(90deg, rgba(0,87,183,0.8) 0%, rgba(0,87,183,0.6) 100%);
        }
        .online--uaonline .online__title:before {
            content: "UAOnline";
            background: #0057b7;
        }
    `;
    document.head.appendChild(style);

    // Обробник для сторінки online
    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready' && e.data.component === 'online' && e.data.params.plugin === PLUGIN_ID) {
            initOnlinePage(e.data.params, e.data.object);
        }
    });

    function initOnlinePage(params, component) {
        component.html = `
            <div class="online__head">
                <div class="online__title">${params.title}</div>
            </div>
            <div class="online__content">
                <div class="online__loading">Завантаження...</div>
            </div>
        `;

        component.start = () => {
            loadData(component, params);
        };

        component.start();
    }

    async function loadData(component, params) {
        try {
            // Тут буде логіка пошуку контенту
            // Для прикладу - фіктивні дані
            const results = [{
                title: 'Приклад відео',
                url: 'https://videos.pexels.com/video-files/4019911/4019911-hd_1080_1920_24fps.mp4',
                poster: 'https://image.tmdb.org/t/p/w500/example.jpg'
            }];

            showResults(component, params, results);
        } catch (e) {
            console.error('[UAOnline] Помилка:', e);
            component.html.find('.online__loading').text('Помилка завантаження');
        }
    }

    function showResults(component, params, results) {
        let html = '';
        
        if (results.length) {
            html = results.map(item => `
                <div class="online__item selector" data-url="${item.url}" data-title="${item.title}" data-poster="${item.poster || ''}">
                    <div class="online__item-poster" style="background-image: url(${item.poster || ''})"></div>
                    <div class="online__item-title">${item.title}</div>
                </div>
            `).join('');
        } else {
            html = '<div class="online__empty">Нічого не знайдено</div>';
        }

        component.html.find('.online__content').html(html);
        component.html.find('.online__item').on('hover:enter', (e) => {
            const url = $(e.currentTarget).data('url');
            const title = $(e.currentTarget).data('title');
            const poster = $(e.currentTarget).data('poster');
            
            playVideo(url, title, poster);
        });
    }

    function playVideo(url, title, poster) {
        if (!url) {
            Lampa.Noty.show('Посилання на відео відсутнє');
            return;
        }

        Lampa.Noty.show(`Запуск відео: ${title}`);

        // Безпосередній запуск плеєра Lampa
        Lampa.Player.play({
            url: url,
            title: title,
            type: 'movie',
            poster: poster,
            plugin: PLUGIN_ID,
            params: {
                direct: true
            }
        });
    }

    // Додавання кнопки
    Lampa.Listener.follow('full', (e) => {
        if (e.type === 'complite') {
            const movie = e.data.movie;
            const button = $(`
                <div class="full-start__button selector view--uaonline" data-subtitle="UAOnline ${PLUGIN_VERSION}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <span>UAOnline</span>
                </div>
            `);
            
            $('.full-start__button').last().after(button);
            
            button.on('hover:enter', () => {
                Lampa.Activity.push({
                    url: '',
                    title: movie.title,
                    component: 'online',
                    search: movie.title,
                    search_one: movie.original_title,
                    plugin: PLUGIN_ID,
                    movie: movie
                });
            });
        }
    });

    console.log(`UAOnline v${PLUGIN_VERSION} завантажено`);
})();
