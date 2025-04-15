alert('Плагін UA Online підключено успішно!');

function addSource() {
    if (typeof Module === 'undefined') {
        alert('Module ще не готовий навіть після натискання "Дивитись"');
        return;
    }

    Module.add({
        component: 'online',
        name: 'UA Online',
        onCreate: function() {
            alert('Онлайн UA Online створено!');
        }
    });
}

// Слухаємо глобальні кліки
document.addEventListener('click', function(e) {
    const target = e.target.closest('.selectbox-item--icon');
    if (target && target.textContent.includes('Онлайн')) {
        setTimeout(addSource, 500); // невелика затримка після натиснення
    }
});
