// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     2.9
// @description Плагін для перегляду фільмів з Ua джерел
// @author      You
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
const mod_version = '1.0.0';
const mod_id = 'uaflix';

const manifest = {
    version: mod_version,
    id: mod_id,
    name: 'UAFlix',
    description: 'Перегляд з сайту UAFlix (uafix.net)',
    type: 'video',
    component: 'online',
    proxy: true
};

Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
Lampa.Manifest.plugins.push(manifest);

// Додавання кнопки плагіну
function addSourceButton() {
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const button_html = `
                <div class="full-start__button selector view--uaflix" data-subtitle="uaflix ${mod_version}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                        <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                    </svg>
                    <span>UAFlix</span>
                </div>`;

            const btn = $(button_html);
            // Додаємо кнопку на сторінку
            $('.full-start__button.selector').remove();  // Якщо кнопка вже є - видаляємо
            $('.full-start__button.selector').last().after(btn);

            // Обробник натискання кнопки
            btn.on('click', function() {
                console.log("UAFlix: Button clicked, starting video...");

                // Отримання URL відео через проксі (це потрібно зробити через ваш сервер)
                fetch('http://localhost:3000/proxy?url=https://uafix.net/films/profi-stetxem/')
                    .then(response => response.json())
                    .then(data => {
                        if (data.videoUrl) {
                            console.log("UAFlix: Video URL found:", data.videoUrl);

                            // Відтворення відео через Lampa API
                            Lampa.API.open({
                                url: data.videoUrl,
                                title: 'UAFlix Video',
                                subtitle: 'Video from UAFlix',
                                sources: [{ url: data.videoUrl }]
                            });
                        } else {
                            console.log("UAFlix: Video URL not found");
                        }
                    })
                    .catch(error => {
                        console.log("UAFlix: Error fetching video URL:", error);
                    });
            });
        }
    });
}

// Додаємо кнопку, коли сторінка повністю завантажена
addSourceButton();
});
