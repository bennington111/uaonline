(function () {
    function startPlugin() {
        window.lampa_plugin = true;

        const uaonline = {
            type: 'video',
            name: 'UA Online',
            version: '1.0.0',
            component: 'uaonline',
            onContextMenu: function (object) {
                return {
                    name: 'UA Online',
                    description: 'Тестовий плагін',
                    component: 'uaonline'
                };
            },
            onSearch: function (query, onready) {
                // Повертаємо пустий результат для тесту
                onready([]);
            },
            onItem: function (object, onready) {
                // Повертаємо тестовий файл
                onready([
                    {
                        title: 'Тестовий файл UA Online',
                        file: 'https://example.com/test.mp4',
                        type: 'video'
                    }
                ]);
            }
        };

        window.lampa_plugin_api && window.lampa_plugin_api.register(uaonline);
    }

    if (window.lampa_plugin_api) startPlugin();
    else document.addEventListener("lampa_plugin_api", startPlugin);
})();
