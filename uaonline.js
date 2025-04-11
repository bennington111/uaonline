(function(){
    window.lampa_provider = {
        name: 'UA Online',
        version: '1.0.0',
        type: 'video',
        logo: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Пошук і перегляд з uakino.me та uaserials.pro',

        get: async function(imdb_id, type, season, episode, onGet){
            onGet([{ 
                title: 'Джерело з UAKINO', 
                url: 'https://uakino.me', 
                file: 'https://some-video-host.com/sample.mp4', 
                quality: 'HD',
                info: 'UAKINO (тест)', 
                player: true 
            }])
        },

        play: function(item, onPlay){
            onPlay(item.file)
        }
    }
})();
