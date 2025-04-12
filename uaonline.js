(function() {
    function UAOnlineComponent() {
        return {
            component: 'uaonline', // Це важливо!
            type: 'video',
            name: 'UA Online',
            version: '1.0.0',
            description: 'Перегляд з uakino та uaserials',
            onComponent: async function(object, show) {
                let results = [];

                try {
                    let tmdb_title = object.movie.title || object.movie.name || '';
                    let query = encodeURIComponent(tmdb_title);

                    // uakino
                    let html1 = await fetch(`https://uakino.me/index.php?do=search&subaction=search&story=${query}`).then(r => r.text());
                    let dom1 = new DOMParser().parseFromString(html1, 'text/html');
                    let link1 = dom1.querySelector('.short .title a');
                    if (link1) {
                        let res1 = await fetch(link1.href).then(r => r.text());
                        let iframe1 = res1.match(/<iframe[^>]+src=["']([^"']+)["']/);
                        if (iframe1) {
                            results.push({
                                title: 'UAkino',
                                url: iframe1[1],
                                file: iframe1[1]
                            });
                        }
                    }
                } catch (e) {
                    console.log('UAOnline uakino error:', e);
                }

                try {
                    let html2 = await fetch(`https://uaserials.pro/search?query=${query}`).then(r => r.text());
                    let dom2 = new DOMParser().parseFromString(html2, 'text/html');
                    let link2 = dom2.querySelector('.ser-thumbnail a');
                    if (link2) {
                        let res2 = await fetch(link2.href).then(r => r.text());
                        let iframe2 = res2.match(/<iframe[^>]+src=["']([^"']+)["']/);
                        if (iframe2) {
                            results.push({
                                title: 'UASerials',
                                url: iframe2[1],
                                file: iframe2[1]
                            });
                        }
                    }
                } catch (e) {
                    console.log('UAOnline uaserials error:', e);
                }

                show(results);
            }
        };
    }

    if (window.plugin) window.plugin(UAOnlineComponent());
    else window.addEventListener('plugin', () => window.plugin(UAOnlineComponent()));
})();
