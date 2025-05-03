// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.0
// @description Плагін для перегляду фільмів з Ua джерел
// @author      You
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

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

// Функція для парсингу пошукових результатів
function search(query, callback) {
    let url = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${encodeURIComponent(query)}`;

    network.silent(url, function(result) {
        let items = [];
        let doc = Lampa.Utils.parseDOM(result);
        let elements = doc.querySelectorAll('.th-item'); // Пошук елементів фільмів

        elements.forEach(el => {
            let title = el.querySelector('.th-title')?.textContent;
            let url = el.querySelector('a')?.href;
            let poster = el.querySelector('img')?.src;

            items.push({
                title: title,
                url: url,
                poster: poster,
                original_title: title,
                type: 'movie',
                url_online: true
            });
        });

        callback(items); // Повертаємо знайдені фільми
    });
}

// Функція для отримання деталей фільму, включаючи відео
function details(item, callback) {
    let url = item.url; // Посилання на сторінку фільму

    network.silent(url, function(result) {
        let videos = [];
        let doc = Lampa.Utils.parseDOM(result);

        // Шукаємо тег <video> та отримуємо посилання на відео
        let videoElement = doc.querySelector('video');
        if (videoElement) {
            let videoUrl = videoElement.getAttribute('src'); // Отримуємо src з відео
            videos.push({
                file: videoUrl,
                quality: 'HD',
                title: item.title
            });
        }

        callback(videos); // Повертаємо відео для відтворення
    });
}

// Функція для відтворення відео в плеєрі
function playVideo(videos) {
    if (videos.length > 0) {
        let videoUrl = videos[0].file;
        let videoPlayer = document.createElement('video');
        videoPlayer.src = videoUrl;
        videoPlayer.controls = true;
        videoPlayer.style.width = '100%';
        document.body.appendChild(videoPlayer); // Додаємо плеєр на сторінку
        videoPlayer.play(); // Запускаємо відтворення
    } else {
        alert('Відео не знайдено');
    }
}

// Функція для виведення кнопки плагіну
function addSourceButton() {
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const button_html = `
            <div class="full-start__button selector view--uaflix" data-subtitle="uaflix ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>UAFlix</span>
            </div>`;

            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            btn.on('click', function() {
                let item = {}; // Логіка для отримання вибраного фільму
                details(item, function(videos) {
                    playVideo(videos); // Відтворюємо відео
                });
            });
        }
    });
}

// Викликаємо функцію для додавання кнопки
addSourceButton();
