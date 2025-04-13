(function(){
    function startPlugin(){
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Онлайн UA Online',
            description: 'Джерело з сайтів uakino та uaserials',
            component: 'uaonline'
        };

        Lampa.Plugin(manifest, function(plugin){
            plugin.component = function(name){
                if(name === 'uaonline') return component;
            };

            return plugin;
        });
    }

    var component = {
        item: function(object, resolve, reject){
            var sources = [
                {
                    title: 'UAKino (1080p)',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: '1080p',
                    info: 'Тестовий потік UAKino'
                }
            ];

            resolve(sources);
        },
        search: function(){},
        add: function(){},
        contextmenu: function(){}
    };

    if(window.Lampa) startPlugin();
    else window.addEventListener('lampa', startPlugin);
})();
