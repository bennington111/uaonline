(function(){
    var network = Lampa.Network;
    var plugin = {
        component: function(name){
            if(name == 'uaonline') return component;
        }
    };

    var component = {
        item: function(object, resolve, reject){
            resolve([
                {
                    title: 'UA Test (1080p)',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: '1080p',
                    info: 'Тестовий стрім'
                }
            ]);
        },
        search: function(){},
        add: function(){},
        contextmenu: function(){}
    };

    Lampa.Plugin({
        type: 'video',
        name: 'Онлайн UA Online',
        component: 'uaonline',
        version: '1.0.0',
        description: 'Тестовий UA Online плагін'
    }, function(_) {
        _.component = plugin.component;
        return _;
    });
})();
