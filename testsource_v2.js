// UAOnline testsource_v2.js

Lampa.Listener.follow('full', function (e) {
  if (e.type === 'complite') {
    var container = document.querySelector('.selectbox__content');
    if (!container) {
      console.log('UAOnline: контейнер не знайдено');
      return;
    }

    var button = document.createElement('div');
    button.className = 'selectbox-item selectbox-item--icon selector';
    button.innerHTML = `
      <div class="selectbox-item__icon">🎬</div>
      <div>
        <div class="selectbox-item__title">UA Online</div>
        <div class="selectbox-item__subtitle">testsource_v2</div>
      </div>
    `;

    button.addEventListener('hover:enter', function () {
      alert('UA Online кнопка натиснута!');
    });

    container.appendChild(button);
    console.log('UAOnline: кнопка додана');
  }
});
