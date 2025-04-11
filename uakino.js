(function(){
    let uaonline = {
        type: 'video',
        name: 'UA Online',
        version: '1.0.0',
        icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Демо-версія з результатами',

        search: async function(query, onSearchResult){
            onSearchResult([
                {
                    title: `Тест результат для "${query}" (uakino)`,
                    url: 'https://uakino.me/1234-test',
                    poster: '',
                    description: 'Це демо-запис',
                    quality: 'HD',
                    type: 'video'
                }
            ])
        },

        item: async function(item, onItemReady){
            onItemReady([
                {
                    file: 'https://example.com/video.mp4',
                    title: 'Тестове відео',
                    url: 'https://example.com/video.mp4',
                    type: 'video'
                }
            ])
        }
    }

    if (window.plugin) window.plugin(uaonline)
    else window.addEventListener('plugin', () => window.plugin(uaonline))
})();
