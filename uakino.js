(function () {
    function UAOnline() {
        let network = Lampa.Network;
        let searchQuery = '';
        let selectedSource = 'uakino'; // або 'uaserials'

        this.search = function (query, call) {
            searchQuery = query;

            if (selectedSource === 'uakino') {
                network.silent(`https://uakino.me/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`, (html) => {
                    const results = [];
                    let matches = html.matchAll(/<div class="shortstory".*?<a href="(.*?)".*?<img src="(.*?)".*?<div class="title">(.*?)<\/div>/gs);
                    for (const match of matches) {
                        results.push({
                            title: match[3].trim(),
                            url: match[1],
                            poster: match[2],
                        });
                    }
                    call(results);
                });
            }

            else if (selectedSource === 'uaserials') {
                network.silent(`https://uaserials.pro/search/?q=${encodeURIComponent(query)}`, (html) => {
                    const results = [];
                    let matches = html.matchAll(/class="poster poster-xs".*?href="(.*?)".*?src="(.*?)".*?alt="(.*?)"/gs);
                    for (const match of matches) {
                        results.push({
                            title: match[3].trim(),
                            url: 'https://uaserials.pro' + match[1],
                            poster: match[2],
                        });
                    }
                    call(results);
                });
            }
        };

        this.get = function (url, call) {
            network.silent(url, (html) => {
                let iframeMatch = html.match(/<iframe[^>]*src="([^"]+player[^"]+)"[^>]*>/i);
                if (iframeMatch) {
                    call({
                        url: iframeMatch[1],
                        method: 'iframe'
                    });
                } else {
                    call(false);
                }
            });
        };

        this.menu = function (call) {
            call([
                {
                    title: 'Джерело: UAKINO',
                    subtitle: selectedSource === 'uakino' ? '✅ Вибрано' : '',
                    onClick: () => {
                        selectedSource = 'uakino';
                        Lampa.Controller.toggle('content');
                        Lampa.Noty.show('Обрано UAKINO');
                    }
                },
                {
                    title: 'Джерело: UAserials',
                    subtitle: selectedSource === 'uaserials' ? '✅ Вибрано' : '',
                    onClick: () => {
                        selectedSource = 'uaserials';
                        Lampa.Controller.toggle('content');
                        Lampa.Noty.show('Обрано UAserials');
                    }
                }
            ]);
        };

        this.type = 'video';
        this.title = 'UA Online';
    }

    UAOnline.prototype.component = function () {
        return this;
    };

    Lampa.Platform.add({
        name: 'UA Online',
        component: UAOnline
    });
})();