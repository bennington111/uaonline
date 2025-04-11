(() => {
    const uaonline = {
        title: 'UA Online',
        version: '1.0.0',
        icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Онлайн пошук з uakino.me та uaserials.pro',
        types: ['movie', 'tv'],
        id: 'uaonline',
        component: true,

        search: async function(query, call){
            const results = []

            // uakino.me
            try {
                let html = await fetch(`https://uakino.me/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`).then(r => r.text())
                let dom = new DOMParser().parseFromString(html, 'text/html')
                dom.querySelectorAll('.short .title a').forEach(el => {
                    results.push({
                        name: el.textContent.trim() + ' (uakino)',
                        url: el.href,
                        poster: '',
                        description: '',
                        quality: '',
                        type: 'movie'
                    })
                })
            } catch (e) {
                console.error('[UAOnline] uakino error', e)
            }

            // uaserials.pro
            try {
                let html = await fetch(`https://uaserials.pro/search?query=${encodeURIComponent(query)}`).then(r => r.text())
                let dom = new DOMParser().parseFromString(html, 'text/html')
                dom.querySelectorAll('.ser-thumbnail').forEach(el => {
                    const a = el.querySelector('a')
                    const img = el.querySelector('img')
                    if (a && img) {
                        results.push({
                            name: img.alt + ' (uaserials)',
                            url: a.href,
                            poster: img.src,
                            description: '',
                            quality: '',
                            type: 'tv'
                        })
                    }
                })
            } catch (e) {
                console.error('[UAOnline] uaserials error', e)
            }

            call(results)
        },

        item: async function(item, call){
            try {
                let html = await fetch(item.url).then(r => r.text())
                let iframe = html.match(/<iframe[^>]+src=["']([^"']+)["']/)
                if (iframe && iframe[1]){
                    call([{
                        title: 'UA Online',
                        file: iframe[1],
                        url: iframe[1],
                        type: 'video'
                    }])
                } else {
                    call([])
                }
            } catch (e) {
                console.error('[UAOnline] item error', e)
                call([])
            }
        }
    }

    Lampa.Plugin.register(uaonline)
})()
