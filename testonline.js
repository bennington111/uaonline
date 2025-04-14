(function(){
    function startPlugin(){
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Онлайн UA Test',
            description: 'Тестове джерело',
            component: 'uatest'
        }

        Lampa.Plugin(manifest, function(plugin){
            plugin.component = function(name){
                if(name === 'uatest') return component
            }

            return plugin
        })
    }

    var component = {
        id: 'uatest',
        type: 'video',
        name: 'UA Test',

        item: function(object, resolve, reject) {
            resolve([
                {
                    title: 'Тестовий потік',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: '1080p',
                    info: 'Це тестовий потік'
                }
            ])
        },
        search: function(){},
        add: function(){},
        contextmenu: function(){}
    }

    if(window.Lampa) startPlugin()
    else window.addEventListener('lampa', startPlugin)
})();
