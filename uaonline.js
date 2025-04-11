(function(){
    window.lampa_provider = {
        type: 'video',
        name: 'UA Online',
        version: '1.0.0',
        logo: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Пошук і перегляд з uakino.me та uaserials.pro',

        get: async function(imdb_id, type, season, episode, callback){
            callback([
                {
                    title: 'Тестова серія',
                    file: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: 'HD',
                    info: 'Тест (uakino)',
                    player: true
                }
            ])
        },

        play: function(item, callback){
            callback(item.file)
        }
    }
})();
