(function(plugin) {
    // Плагін реєструється в системі Lampa
    plugin.id = 'uafix';
    plugin.name = 'UAFix';
    plugin.version = '1.1.0';

    // Ініціалізація плагіна
    plugin.init = function() {
        // Додати кнопку в головне меню
        Lampa.Settings.main.add('uafix', {
            title: 'UAFix Пошук',
            icon: 'search',
            onClick: function() {
                // Виклик функції пошуку
                openSearchDialog();
            }
        });

        Lampa.Noty.show('UAFix плагін активовано!');
    };

    // Відкрити діалог для пошуку
    function openSearchDialog() {
        Lampa.Input.show({
            title: 'Пошук фільмів UAFix',
            placeholder: 'Введіть назву фільму',
            onBack: function() {
                Lampa.Controller.toggle('settings_component');
            },
            onEnter: function(value) {
                if (value) {
                    searchContent(value, displayResults);
                } else {
                    Lampa.Noty.show('Введіть пошуковий запит!');
                }
            }
        });
    }

    // Функція для пошуку контенту
    function searchContent(query, callback) {
        const searchUrl = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${encodeURIComponent(query)}`;
        
        // Виконати HTTP-запит для пошуку
        Lampa.Utils.request(searchUrl, function(data) {
            const results = parseSearchResults(data);
            callback(results);
        }, function() {
            Lampa.Noty.show('Помилка завантаження пошуку з UAFix');
        });
    }

    // Парсер сторінки пошуку
    function parseSearchResults(html) {
        let results = [];
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');

        // Знайти елементи фільмів у результатах пошуку
        doc.querySelectorAll('.search-item').forEach(function(item) {
            const title = item.querySelector('.title').textContent;
            const link = item.querySelector('a').href;
            const img = item.querySelector('img').src;

            // Додати результат у список
            results.push({
                title: title,
                url: link,
                poster: img
            });
        });

        return results;
    }

    // Показати результати пошуку
    function displayResults(results) {
        if (results.length === 0) {
            Lampa.Noty.show('Нічого не знайдено!');
            return;
        }

        let items = results.map(function(item) {
            return {
                title: item.title,
                poster: item.poster,
                url: item.url,
                onClick: function() {
                    Lampa.Platform.openUrl(item.url);
                }
            };
        });

        Lampa.Activity.push({
            title: 'Результати пошуку',
            component: 'card',
            items: items,
            onBack: function() {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    // Реєстрація плагіна
    Lampa.Plugins.register(plugin);
})(window.plugin = {});
