(function(){
    let uaonline = {
        type: 'video',
        name: 'UA Online',
        version: '1.0.0',
        icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Онлайн-пошук з uakino.me та uaserials.pro',

        search: async function(query, onSearchResult){
            let results = []
            results.push({
                title: 'Шрек (uakino)',
                url: 'https://uakino.me/123-shrek.html',
                poster: '',
                description: 'Тестовий результат',
                quality: '',
                type: 'video'
            })
            onSearchResult(results)
        },

        item: async function(item, onItemReady){
            onItemReady([{
                file: 'https://some-stream-url.com/video.mp4',
                title: 'Дивитися',
                type: 'video'
            }])
        }
    }

    if (window.plugin) window.plugin(uaonline)
    else window.addEventListener('plugin', () => window.plugin(uaonline))
})();
