// Код плагіна для Lampa з використанням парсингу HTML замість API
(function() {
    const plugin = {
        name: 'Uafix',
        version: '1.0.0',
        author: 'Bennington111',
        description: 'Плагін для завантаження фільмів з Uafix.net',
    };

    // Основна функція для обробки запиту до Uafix
    function getVideoFromUafix(movieUrl) {
        console.log("Пошук відео на:", movieUrl);

        fetch(movieUrl)
            .then(response => response.text())  // Отримуємо HTML контент сторінки
            .then(html => {
                // Пошук у HTML сторінці через регулярні вирази
                const videoUrlMatch = html.match(/"file":"(https:\/\/[^"]+)"/);  // Шукаємо URL відео

                if (videoUrlMatch) {
                    const videoUrl = videoUrlMatch[1];
                    console.log('Знайдено відео:', videoUrl);
                    playVideo(videoUrl);  // Викликаємо функцію для відтворення відео
                } else {
                    console.log('Не вдалося знайти відео на сторінці');
                }
            })
            .catch(error => console.error('Помилка при завантаженні сторінки:', error));
    }

    // Функція для відтворення відео
    function playVideo(videoUrl) {
        const videoPlayer = document.createElement('video');
        videoPlayer.src = videoUrl;
        videoPlayer.controls = true;
        videoPlayer.autoplay = true;
        document.body.appendChild(videoPlayer);  // Додаємо відео плеєр на сторінку
    }

    // Ініціалізація плагіна
    function init() {
        // Наприклад, ви обираєте фільм, і отримуєте URL сторінки з фільмом
        const movieUrl = 'https://uafix.net/some-movie-page';  // Замість цього використовувати реальний URL
        getVideoFromUafix(movieUrl);
    }

    // Запуск плагіна при ініціалізації
    init();
})();
