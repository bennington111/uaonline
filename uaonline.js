(function(){
    var manifest = {
        type: 'video',
        version: '1.0.0',
        name: 'UA Online',
        description: 'Тестовий плагін для Lampa',
        component: 'uaonline'
    };

    function component(name){
        if (name === 'uaonline') {
            return {
                item: function(object, resolve, reject) {
                    resolve([{
                        title: 'Тестовий потік',
                        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                        quality: '1080p',
                        info: 'Це тестовий стрім'
                    }]);
                },
                search: function(){},
                add: function(){},
                contextmenu: function(){}
            };
        }
    }

    if (window.Lampa && typeof Lampa.Plugin === 'function') {
        Lampa.Plugin(manifest, function(plugin){
            plugin.component = component;
        });
    } else {
        window.addEventListener('lampa', function(){
            Lampa.Plugin(manifest, function(plugin){
                plugin.component = component;
            });
        });
    }
})();
