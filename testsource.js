(function () {
    function startPlugin() {
        Lampa.Plugin({
            type: 'video',
            name: 'UA Test Source',
            component: 'uatest',
            version: '1.0.0',
            description: 'Тестове джерело Lampa'
        }, function (plugin) {
            plugin.component = function (name) {
                return name === 'uatest' ? component : null;
            };
        });
    }

    var component = {
        item: function (object, resolve, reject) {
            resolve([
                {
                    title: 'UA Demo Stream',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: '1080p',
                    info: 'Тестовий потік для перевірки'
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
