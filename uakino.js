(function(){
    let uaonline = {
        type: 'video',
        name: 'UA Online',
        version: '1.0.0',
        icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Онлайн-пошук з uakino.me та uaserials.pro',

        search: async function(query, onSearchResult){
            console.log('[UA Online] Запит:', query)
            let results = []
            results.push({
                title: query + ' (uakino)',
                url: 'https://example.com/test',
                poster: '',
                description: 'Тестовий результат',
                quality: '',
                type: 'video'
            })
            onSearchResult(results)
        },

        item: async function(item, onItemReady){
            console.log('[UA Online] item:', item)
            onItemReady([{
                file: 'https://test-stream.com/video.mp4',
                title: 'Перегляд',
                type: 'video'
            }])
        }
    }

    if (window.plugin) window.plugin(uaonline)
    else window.addEventListener('plugin', () => window.plugin(uaonline))
})();
