(function () {
    'use strict';

    var plugin = {
        id: 'ua_plug', // Унікальний ідентифікатор
        name: 'UA online', // Назва плагіна
        version: '1.0.0', // Версія
        description: 'Приклад плагіна для Lampa', // Опис
        type: 'catalog', // Тип (catalog, component тощо)

        // Налаштування джерела
        source: {
            type: 'url', // Тип джерела (url, torrent тощо)
            url: 'https://eneyida.tv', // URL для отримання даних
            search: function (query, callback) {
                // Функція пошуку
                var url = this.url + '?query=' + encodeURIComponent(query);
                Lampa.Network.get(url, function (data) {
                    var results = [];
                    // Обробка даних (парсинг JSON, HTML тощо)
                    callback(results);
                }, function () {
                    callback([]); // У разі помилки
                });
            },
            detail: function (item, callback) {
                // Деталі про елемент (фільм, серіал)
                callback({});
            }
        }
    };

    // Реєстрація плагіна
    Lampa.Plugin.register(plugin);
})();
