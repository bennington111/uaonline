(function() {
    function startPlugin() {
        const manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Онлайн UA Online',
            description: 'Перегляд з UAKino',
            component: 'uaonline'
        };

        Lampa.Plugin(manifest, function(plugin) {
            plugin.component = {
                item: function(object, resolve, reject) {
                    resolve([
                        {
                            title: 'UAKino 1080p',
                            url: 'https://example.com/stream.mp4',
                            quality: '1080p',
                            info: 'Тестовий стрім UAKino'
                        }
                    ]);
                },
                search: function() {},
                add: function() {},
                contextmenu: function() {}
            };
        });
    }

    if (window.Lampa) startPlugin();
    else window.addEventListener('lampa', startPlugin);
})();
