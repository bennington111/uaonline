(function () {
    function startPlugin() {
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'UA Test Source',
            description: 'Тестове джерело для Lampa',
            component: 'uatest'
        };

        Lampa.Plugin(manifest, function (plugin) {
            plugin.component = function (name) {
                if (name === 'uatest') return component;
            };
            return plugin;
        });
    }

    var component = {
        item: function (object, resolve, reject) {
            resolve([
                {
                    title: 'Test Video 720p',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: '720p',
                    info: 'Це тестове відео'
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
