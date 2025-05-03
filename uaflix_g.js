// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.8
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

// Реєстрація плагіна в Lampa
Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
Lampa.Manifest.plugins.push(manifest);

// Проксі-сервер для обходу CORS
const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Проксі-сервер
const targetUrlBase = 'https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=';

// Функція для парсингу пошукових результатів
function search(query, callback) {
    let url = proxyUrl + targetUrlBase + encodeURIComponent(query); // Запит до проксі

    console.log('UAFlix: Запит на пошук:', url); // Логування запиту на пошук

    network.silent(url, function(result) {
        let items = [];
        let doc = Lampa.Utils.parseDOM(result);
        let elements = doc.querySelectorAll('a.sres-wrap.clearfix'); // Пошук елементів фільмів за новим селектором

        console.log('UAFlix: Кількість знайдених елементів фільмів:', elements.length); // Логування кількості знайдених елементів

        elements.forEach((el, index) => {
            let title = el.querySelector('h2')?.textContent;
            let url = el.getAttribute('href'); // Отримуємо посилання на сторінку фільму
            let poster = el.querySelector('img')?.src;

            console.log(`UAFlix: Елемент ${index + 1}: Заголовок: ${title}, URL: ${url}, Постер: ${poster}`);

            items.push({
                title: title,
                url: url, // Підключаємо правильний URL
                poster: poster,
                original_title: title,
                type: 'movie',
                url_online: true
            });
        });

        console.log('UAFlix: Знайдені фільми:', items); // Логування всіх знайдених фільмів
        callback(items); // Повертаємо знайдені фільми
    });
}

// Функція для отримання деталей фільму, включаючи відео
function details(item, callback) {
    let url = proxyUrl + item.url; // Додаємо проксі до URL

    console.log('UAFlix: Завантаження деталей для фільму:', url); // Логування перед запитом на сторінку фільму

    network.silent(url, function(result) {
        let videos = [];
        let doc = Lampa.Utils.parseDOM(result);

        console.log('UAFlix: HTML сторінки фільму отримано:', result); // Логування отриманого HTML

        // Шукаємо тег <video> та отримуємо посилання на відео
        let videoElement = doc.querySelector('video');
        if (videoElement) {
            let videoUrl = videoElement.getAttribute('src'); // Отримуємо src з відео
            console.log('UAFlix: Відео URL:', videoUrl); // Логування відео URL
            videos.push({
                file: videoUrl,
                quality: 'HD',
                title: item.title
            });
        } else {
            console.log('UAFlix: Відео не знайдено на сторінці фільму');
        }

        console.log('UAFlix: Отримані відео:', videos); // Логування отриманих відео
        callback(videos); // Повертаємо відео для відтворення
    });
}

// Функція для відтворення відео в плеєрі
function playVideo(videos) {
    if (videos.length > 0) {
        let videoUrl = videos[0].file;
        console.log('UAFlix: Відтворення відео за URL:', videoUrl); // Логування відео, яке буде відтворене

        let videoPlayer = document.createElement('video');
        videoPlayer.src = videoUrl;
        videoPlayer.controls = true;
        videoPlayer.style.width = '100%';
        document.body.appendChild(videoPlayer); // Додаємо плеєр на сторінку
        videoPlayer.play(); // Запускаємо відтворення
    } else {
        console.log('UAFlix: Відео не знайдено для відтворення');
        alert('UAFlix: Відео не знайдено');
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

            // Обробка натискання на кнопку
            btn.on('click', function() {
                console.log('UAFlix: Кнопка натиснута');
                let item = {url: 'https://uafix.net/films/spustoshennja/'}; // Вибір фільму для тесту

                // Перевіряємо, чи є інформація про фільм
                console.log('UAFlix: item:', item); // Логування перед передачею в details()

                // Викликаємо функцію для отримання відео
                details(item, function(videos) {
                    console.log('UAFlix: Відео знайдено:', videos);
                    if (videos.length > 0) {
                        playVideo(videos); // Відтворюємо відео
                    } else {
                        console.log('UAFlix: Відео не знайдено');
                        alert('UAFlix: Відео не знайдено');
                    }
                });
            });
        }
    });
}

// Викликаємо функцію для додавання кнопки
addSourceButton();
