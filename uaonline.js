(function(){
    function UAOnlineComponent(){
        return {
            component: 'uaonline',
            type: 'video',
            name: 'UA Online',
            version: '1.0.0',
            description: 'Перегляд з uakino.me та uaserials.pro',
            onContextMenu: function(item){
                return {
                    title: 'Відкрити UA Online',
                    subtitle: 'uakino.me / uaserials.pro',
                    url: ''
                };
            },
            onItem: async function(item, callback){
                let sources = [];

                try {
                    let html = await fetch(`https://uakino.me/index.php?do=search&subaction=search&story=${encodeURIComponent(item.title)}`).then(r => r.text());
                    let dom = new DOMParser().parseFromString(html, 'text/html');
                    let link = dom.querySelector('.short .title a')?.href;
                    if(link){
                        let page = await fetch(link).then(r => r.text());
                        let iframe = page.match(/<iframe[^>]+src=["']([^"']+)["']/);
                        if(iframe && iframe[1]){
                            sources.push({
                                title: 'UAkino',
                                url: iframe[1],
                                file: iframe[1],
                                type: 'video'
                            });
                        }
                    }
                } catch(e) {
                    console.error('[UA Online] uakino.me error:', e);
                }

                try {
                    let html = await fetch(`https://uaserials.pro/search?query=${encodeURIComponent(item.title)}`).then(r => r.text());
                    let dom = new DOMParser().parseFromString(html, 'text/html');
                    let link = dom.querySelector('.ser-thumbnail a')?.href;
                    if(link){
                        let page = await fetch(link).then(r => r.text());
                        let iframe = page.match(/<iframe[^>]+src=["']([^"']+)["']/);
                        if(iframe && iframe[1]){
                            sources.push({
                                title: 'UASerials',
                                url: iframe[1],
                                file: iframe[1],
                                type: 'video'
                            });
                        }
                    }
                } catch(e) {
                    console.error('[UA Online] uaserials.pro error:', e);
                }

                callback(sources);
            }
        };
    }

    if (window.plugin) window.plugin(UAOnlineComponent());
    else window.addEventListener('plugin', () => window.plugin(UAOnlineComponent()));
})();
