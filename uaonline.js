(function(){
    function startPlugin(){
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Онлайн UA Online',
            description: 'Тестовий клон online_mod для перевірки',
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
                    title: 'Тестовий потік (720p)',
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: '720p',
                    info: 'Тестове джерело'
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
