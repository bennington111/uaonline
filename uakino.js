(function(){
    let uaonline = {
        type: 'video',
        name: 'UA Online',
        version: '1.0.0',
        icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Тестовий плагін UA',

        search: async function(query, onSearchResult){
            onSearchResult([
                {
                    title: query + ' (UA Online)',
                    url: 'https://example.com/video',
                    type: 'video',
                    poster: '',
                    description: 'Тестовий результат',
                    quality: 'HD'
                }
            ])
        },

        item: async function(item, onItemReady){
            onItemReady([
                {
                    title: 'UA Online Stream',
                    file: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    type: 'video'
                }
            ])
        }
    }

    if (window.plugin) window.plugin(uaonline)
    else window.addEventListener('plugin', () => window.plugin(uaonline))
})();
