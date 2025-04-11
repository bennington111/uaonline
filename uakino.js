search: async function(query, onSearchResult){
    let results = [
        {
            title: `Тестовий результат для "${query}" (uakino)`,
            url: 'https://uakino.me/test-video',
            poster: '',
            description: 'Це фейковий результат для перевірки',
            quality: 'HD',
            type: 'video'
        }
    ]

    console.log('[UA Online] Тестовий результат:', results)
    onSearchResult(results)
}
