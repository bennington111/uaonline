(function(){
    function startPlugin(){
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Онлайн UA Online',
            description: 'Тестовий плагін із одним джерелом',
            component: 'uaonline'
        }

        Lampa.Plugin(manifest, function(plugin){
            plugin.component = function(name){
                if(name === 'uaonline') return component
            }

            return plugin
        })
    }

    var component = {
        item: function(object, resolve, reject) {
            resolve([
                {
                    title: 'Тестовий стрім (720p)',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: '720p',
                    info: 'Test HLS'
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
