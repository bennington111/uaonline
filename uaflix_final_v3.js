(function() {
    // Використовуємо corsproxy.io для обхід CORS
    const corsProxyUrl = 'https://corsproxy.io/?';

    // Функція для пошуку фільму
    function searchMovieOnUafix(query) {
        // Формуємо URL для пошуку фільму на uafix.net
        const searchUrl = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${encodeURIComponent(query)}`;

        const fullUrl = corsProxyUrl + encodeURIComponent(searchUrl); // Додаємо до URL проксі-сервер

        fetch(fullUrl)
            .then(response => response.text()) // Отримуємо HTML контент
            .then(html => {
                console.log('Отримано HTML сторінки з результатами пошуку:', html);

                // Парсинг HTML сторінки
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Шукаємо всі посилання на результати пошуку
                const movieLinks = doc.querySelectorAll('.news-title a');
                if (movieLinks.length > 0) {
                    movieLinks.forEach(link => {
                        console.log('Знайдено фільм:', link.textContent);
                        console.log('Посилання на фільм:', link.href);
                    });
                } else {
                    console.log('Не вдалося знайти фільм на сторінці');
                }
            })
            .catch(error => {
                console.error('Помилка при завантаженні сторінки:', error);
            });
    }

    // Ініціалізація плагіна або виклик функції
    document.addEventListener('DOMContentLoaded', function() {
        // Створення кнопки для запуску пошуку
        const button = document.createElement('button');
        button.innerHTML = 'Пошук фільму на Uaflix';
        button.addEventListener('click', function() {
            const searchQuery = prompt('Введіть назву фільму:');
            if (searchQuery) {
                searchMovieOnUafix(searchQuery); // Викликаємо функцію для пошуку фільму
            }
        });

        // Додаємо кнопку на сторінку
        document.body.appendChild(button);
    });
})();
