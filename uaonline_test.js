(function () {
    // Перевіримо, що Lampa завантажилася
    if (typeof window.Module === 'undefined') {
        alert('❌ Module не знайдено');
        return;
    }

    alert('✅ Плагін UA Online завантажено');

    // Додаємо нове джерело
    Module.add({
        type: 'video',
        name: 'Онлайн UA Online',
        version: 'test-1',
        icon: '🧪',
        onCheck: function (type, data, call) {
            // Показати кнопку тільки для типів movie/serial
            if (['movie', 'tv'].includes(data.movie.original_language)) {
                call(true);
            } else {
                call(false);
            }
        },
        onGet: function (type, data, call) {
            // Просто для тесту — додаємо одне відео
            call([{
                title: 'Тестове відео',
                file: 'https://example.com/video.mp4',
                quality: 'HD',
                subtitle: '',
                info: 'UA Online Demo'
            }]);
        }
    });
})();
