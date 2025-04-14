(function(){
    function start(){
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Онлайн UA Simple',
            description: 'Тестовий UA плагін',
            component: 'uasimple'
        };

        Lampa.Plugin(manifest, function(plugin){
            plugin.component = function(name){
                if(name === 'uasimple') return component;
            };
        });
    }

    var component = {
        item: function(object, resolve, reject){
            resolve([
                {
                    title: 'UA Simple Stream',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: '1080p',
                    info: 'Demo HLS'
                }
            ]);
        },
        search: function(){},
        add: function(){},
        contextmenu: function(){}
    };

    if (window.Lampa) start();
    else window.addEventListener('lampa', start);
})();
