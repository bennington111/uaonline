(function(){
    function startPlugin(){
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Онлайн UA Online',
            description: 'Джерело з сайтів uakino та uaserials',
            component: 'uaonline'
        }

        function component(){
            this.item = function(object, resolve, reject){
                resolve([{
                    title: 'UAKino (тест)',
                    url: 'https://example.com/stream.mp4',
                    quality: 'HD',
                    info: 'UAKino тестове посилання'
                }])
            }

            this.search = function(){}
            this.add = function(){}
            this.contextmenu = function(){}
        }

        Lampa.Component.add(manifest.component, component)
        Lampa.Plugin.register(manifest)
    }

    if(window.Lampa && Lampa.Component && Lampa.Plugin) startPlugin()
    else window.addEventListener('lampa', startPlugin)
})();
