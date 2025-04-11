(function(){
    let uaonline = {
        type: 'video',
        name: 'UA Online',
        version: '1.0.0',
        icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Пошук онлайн-фільмів з uakino.me та uaserials.pro',

        search: async function(query, onSearchResult){
            let results = []

            // uakino.me
            try {
                let html = await fetch(`https://uakino.me/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`).then(r => r.text())
                let dom = new DOMParser().parseFromString(html, 'text/html')
                dom.querySelectorAll('.short .title a').forEach(el => {
                    results.push({
                        title: el.textContent.trim() + ' (uakino)',
                        url: el.href,
                        poster: '',
                        description: '',
                        quality: '',
                        time: '',
                        country: '',
                        original_title: '',
                        year: '',
                        genres: '',
                        episode_count: '',
                        season_count: '',
                        voice: ''
                    })
                })
            } catch(e) {
                console.error('uakino.me error:', e)
            }

            // uaserials.pro
            try {
                let html = await fetch(`https://uaserials.pro/search?query=${encodeURIComponent(query)}`).then(r => r.text())
                let dom = new DOMParser().parseFromString(html, 'text/html')
                dom.querySelectorAll('.ser-thumbnail').forEach(card => {
                    let link = card.querySelector('a')
                    let img = card.querySelector('img')
                    let title = img?.alt || link?.title || 'Без назви'
                    results.push({
                        title: title.trim() + ' (uaserials)',
                        url: link?.href,
                        poster: img?.src || '',
                        description: '',
                        quality: '',
                        time: '',
                        country: '',
                        original_title: '',
                        year: '',
                        genres: '',
                        episode_count: '',
                        season_count: '',
                        voice: ''
                    })
                })
            } catch(e) {
                console.error('uaserials.pro error:', e)
            }

            onSearchResult(results)
        },

        item: async function(item, onItemReady){
            try {
                let html = await fetch(item.url).then(r => r.text())
                let iframe = html.match(/<iframe[^>]+src=["']([^"']+)["']/)
                if(iframe && iframe[1]){
                    onItemReady([{
                        file: iframe[1],
                        title: 'UA Online',
                        type: 'video',
                        url: iframe[1]
                    }])
                } else {
                    throw 'iframe not found'
                }
            } catch(e){
                console.error('item load error:', e)
                onItemReady([])
            }
        }
    }

    if (window.plugin) window.plugin(uaonline)
    else window.addEventListener('plugin', () => window.plugin(uaonline))

})();
