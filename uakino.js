(function () {
    function UAOnline() {
        let network = Lampa.Api.network;

        return {
            type: 'provider',
            name: 'UA Online',
            version: '1.0.0',
            icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
            description: 'Онлайн-джерела: uakino.me та uaserials.pro',

            component: true,

            search: function (query, year, type, callback) {
                callback([]);
            },

            get: function (params, callback) {
                let results = [];

                // uakino.me
                let query = params.title;
                network.silent(`https://uakino.me/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`, (html) => {
                    let matches = html.match(/<div class="short">([\s\S]*?)<\/div>/g) || [];
                    matches.forEach(block => {
                        let link = block.match(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/);
                        if (link) {
                            results.push({
                                title: link[2] + ' (uakino)',
                                url: link[1],
                                poster: '',
                                voice: 'uakino.me',
                                quality: '',
                                info: '',
                                json: {
                                    source: 'uakino',
                                    url: link[1]
                                }
                            });
                        }
                    });
                    checkDone();
                });

                // uaserials.pro
                network.silent(`https://uaserials.pro/search?query=${encodeURIComponent(query)}`, (html) => {
                    let matches = html.match(/<div class="ser-thumbnail">([\s\S]*?)<\/div>/g) || [];
                    matches.forEach(block => {
                        let link = block.match(/<a href="([^"]+)"/);
                        let img = block.match(/<img src="([^"]+)" alt="([^"]*)"/);
                        if (link) {
                            results.push({
                                title: (img ? img[2] : 'Без назви') + ' (uaserials)',
                                url: link[1],
                                poster: img ? img[1] : '',
                                voice: 'uaserials.pro',
                                quality: '',
                                info: '',
                                json: {
                                    source: 'uaserials',
                                    url: link[1]
                                }
                            });
                        }
                    });
                    checkDone();
                });

                let calls = 0;
                function checkDone() {
                    calls++;
                    if (calls === 2) callback(results);
                }
            },

            play: function (object, callback) {
                network.silent(object.url, (html) => {
                    let iframe = html.match(/<iframe[^>]+src=['"]([^'"]+)['"]/);
                    if (iframe && iframe[1]) {
                        callback({
                            file: iframe[1],
                            title: 'UA Online',
                            url: iframe[1]
                        });
                    } else {
                        callback([]);
                    }
                }, () => callback([]));
            }
        };
    }

    if (window.lampa_provider) window.lampa_provider(UAOnline());
    else window.addEventListener('l
