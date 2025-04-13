(function () {
    function startPlugin() {
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Онлайн UA Online',
            description: 'UA джерело тест',
            component: 'uaonline'
        };

        Lampa.Platform.addSource(manifest, component);
    }

    var component = {
        item: function (object, resolve, reject) {
            resolve([
                {
                    title: 'Тест UA 1080p',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: '1080p',
                    info: 'Демо джерело UA'
                }
            ]);
        },
        search: function () {},
        add: function () {},
        contextmenu: function () {}
    };

    if (window.Lampa) startPlugin();
    else window.addEventListener('lampa', startPlugin);
})();
