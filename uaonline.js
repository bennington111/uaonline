(function(){
    var uaonline_component = {
        item: function(object, resolve, reject){
            resolve([
                {
                    title: 'UAkino (1080p)',
                    url: 'https://example.com/stream.mp4',
                    quality: '1080p',
                    info: 'Тестовий потік UAKino'
                }
            ]);
        },
        search: function(){},
        add: function(){},
        contextmenu: function(){}
    };

    function start(){
        Lampa.Platform.addSource({
            name: 'Онлайн UA Online',
            component: 'uaonline',
            type: 'video',
            version: '1.0.0',
            description: 'Джерело з сайтів uakino та uaserials'
        });

        Lampa.Component.add("uaonline", uaonline_component);
    }

    if (window.Lampa) start();
    else window.addEventListener("lampa", start);
})();
