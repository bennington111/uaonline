(function () {
    function uaonline_component() {
        return {
            type: 'video',
            version: '1.0.0',
            name: 'UA Online',
            description: 'Перегляд з uakino та uaserials',
            component: 'uaonline',
            onItem: function (object, callback) {
                callback([
                    {
                        title: 'Тестовий файл UA Online',
                        file: 'https://example.com/test.mp4',
                        type: 'video'
                    }
                ]);
            }
        };
    }

    if (window.plugin) window.plugin(uaonline_component());
    else window.addEventListener('plugin', () => window.plugin(uaonline_component()));
})();
