(function () {
    console.log('Uaflix plugin script loaded'); // Лог при завантаженні плагіна

    function getUaflixUrl(title) {
        console.log('Uaflix: Generating URL for title:', title);
        return `https://uafix.net/?s=${encodeURIComponent(title)}`;
    }

    function parseUaflixData(json) {
        console.log('Uaflix: Parsing data:', json);
        // Тут має бути твоя логіка парсингу HTML → результатів
        return [];
    }

    Lampa.Module.add({
        component: 'online',
        name: 'Uaflix',
        type: 'video',
        onSearch: function (query, callback) {
            console.log('Uaflix: onSearch called with query:', query);
            const url = getUaflixUrl(query);
            console.log('Uaflix: Fetching URL:', url);

            fetch(url)
                .then(response => {
                    console.log('Uaflix: Response status:', response.status);
                    return response.text();
                })
                .then(html => {
                    const results = parseUaflixData(html);
                    console.log('Uaflix: Parsed results:', results);
                    callback(results);
                })
                .catch(error => {
                    console.error('Uaflix: Fetch error:', error);
                    callback([]);
                });
        },
        onContext: function (context) {
            console.log('Uaflix: onContext called with context:', context);
        }
    });

    console.log('Uaflix plugin registered via Module.add');
})();
