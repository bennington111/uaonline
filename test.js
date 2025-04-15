(function () {
    function waitForModuleInit(callback) {
        if (window.Lampa && Lampa.Module && typeof Lampa.Module.add === 'function') {
            callback();
        } else {
            setTimeout(() => waitForModuleInit(callback), 500);
        }
    }

    function addSourceButton() {
        Lampa.Module.add({
            component: 'online',
            name: 'Онлайн UA Online',
            condition: () => true,
            onItem: function (item, callback) {
                // Просто повертаємо тестовий стрім
                callback([{
                    title: 'UA Stream',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    timeline: '',
                    quality: 'HD',
                    subtitles: [],
                    info: 'Тестовий UA Online'
                }]);
            },
            onSearch: function (query, callback) {
                callback([]);
            },
            onCancel: function () {}
        });
    }

    waitForModuleInit(addSourceButton);
})();
