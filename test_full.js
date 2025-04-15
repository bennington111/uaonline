(function () {
    function addUAOnlineModule() {
        if (typeof Lampa === 'undefined' || typeof Lampa.Module === 'undefined') {
            console.log('UAOnline: Lampa.Module не готовий');
            setTimeout(addUAOnlineModule, 1000);
            return;
        }

        console.log('UAOnline: Додаємо джерело...');

        Lampa.Module.add({
            component: 'online',
            name: 'Онлайн UA Online',
            condition: () => true,
            onSearch: function (query, callback) {
                console.log('UAOnline: onSearch', query);
                callback([]);
            },
            onCancel: function () {
                console.log('UAOnline: onCancel');
            },
            onItem: function (element, data, callback) {
                console.log('UAOnline: onItem', data);
                callback([]);
            }
        });

        // Примусово активуємо розділ online, щоб кнопка зʼявилась
        setTimeout(() => {
            console.log('UAOnline: Пробуємо активувати online вручну');
            Lampa.Activity.push({
                url: '',
                title: 'Онлайн',
                component: 'online',
                search: '',
                search_one: '',
                search_two: '',
                movie: {},
                page: 1
            });
        }, 2000);
    }

    setTimeout(addUAOnlineModule, 1000);
})();
