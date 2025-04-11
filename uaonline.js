(function(){
    const uaonline = {
        version: '1.0.0',
        type: 'video',
        name: 'UA Online',
        icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Онлайн-джерела з uakino.me та uaserials.pro',

        component: function(component){
            let query = component.item?.title || component.item?.name || '';
            let results = [];

            function append(file, label){
                results.push({
                    title: label || 'UA Online',
                    file: file,
                    url: file,
                    quality: 'HD',
                    stream_type: 'hls',
                    type: 'video'
                });
            }

            // uakino.me
            fetch(`https://corsproxy.io/?https://uakino.me/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`)
                .then(r => r.text()).then(html => {
                    let doc = new DOMParser().parseFromString(html, 'text/html');
                    let link = doc.querySelector('.short .title a');
                    if(link){
                        fetch(`https://corsproxy.io/?${link.href}`).then(r => r.text()).then(page => {
                            let iframe = page.match(/<iframe.+?src="([^"]+)"/);
                            if(iframe && iframe[1]) append(iframe[1], 'uakino');
                            finish();
                        });
                    } else finish();
                }).catch(finish);

            // uaserials.pro
            fetch(`https://corsproxy.io/?https://uaserials.pro/search?query=${encodeURIComponent(query)}`)
                .then(r => r.text()).then(html => {
                    let doc = new DOMParser().parseFromString(html, 'text/html');
                    let link = doc.querySelector('.ser-thumbnail a');
                    if(link){
                        fetch(`https://corsproxy.io/?${link.href}`).then(r => r.text()).then(page => {
                            let iframe = page.match(/<iframe.+?src="([^"]+)"/);
                            if(iframe && iframe[1]) append(iframe[1], 'uaserials');
                            finish();
                        });
                    } else finish();
                }).catch(finish);

            // викликаємо результат
            function finish(){
                if(results.length) component.onComponentReady(results);
                else component.onComponentReady([]);
            }
        }
    };

    if(window.plugin) window.plugin(uaonline);
    else window.addEventListener('plugin', () => window.plugin(uaonline));
})();
