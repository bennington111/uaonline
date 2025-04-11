(function(){
    let uaonline = {
        type: 'video',
        name: 'UA Online',
        version: '1.0.0',
        icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Тестовий UA плагін',

        search: async function(query, onSearchResult){
            console.log('[UA Online] Test search:', query)
            onSearchResult([
                {
                    title: query + ' (UA Test)',
                    url: 'https://example.com/test',
                    type: 'video',
                    poster: '',
                    description: 'Тестовий результат',
                    quality: ''
                }
            ])
        },

        item: async function(item, onItemReady){
            console.log('[UA Online] Test item:', item)
            onItemReady([{
                title: 'UA Stream',
                file: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                type: 'video'
            }])
        }
    }

    if (window.plugin) window.plugin(uaonline)
    else window.addEventListener('plugin', () => window.plugin(uaonline))
})();
