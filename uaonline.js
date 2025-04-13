(function(){
    function startPlugin(){
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Онлайн UA Online',
            description: 'Джерело з сайтів uakino та uaserials',
            component: 'uaonline'
        }

        var component = {
            item: function(object, resolve, reject) {
                resolve([
                    {
                        title: 'UAkino (1080p)',
                        url: 'https://example.com/stream.mp4',
                        quality: '1080p',
                        info: 'UAKino тестовий стрім'
                    }
                ])
            },
            search: function(){},
            add: function(){},
            contextmenu: function(){}
        }

        Lampa.Plugin(manifest, function(plugin){
            plugin.component = component
        })
    }

    if(window.Lampa) startPlugin()
    else window.addEventListener('lampa', startPlugin)
})();
