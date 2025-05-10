
(function() {
    'use strict';

    // Стили для разных тем (минифицированные, с .activity__loader из исходного CSS Lampa)
    var themes = {
        default: '.activity__loader{position:absolute;top:0;left:0;width:100%;height:100%;display:none;background:url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%}',
        violet_stroke: ':root{--main-color:#8B29B9;--background-color:#1d1f20;--text-color:#fff;--transparent-white:rgba(255,255,255,.2)}body{background-color:#1d1f20;color:#fff}.menu__ico{color:#000;-webkit-filter:invert(1);filter:invert(1)}.activity__loader{position:absolute;top:0;left:0;width:100%;height:100%;display:none;background:url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%}.modal-loading{height:6em;-webkit-background-size:contain;-moz-background-size:contain;-o-background-size:contain;background-size:contain}.console__tab.focus,.menu__item.focus,.menu__item.traverse,.menu__item.hover,.full-person.focus,.full-start__button.focus,.full-descr__tag.focus,.simple-button.focus,.head__action.focus,.head__action.hover,.player-panel .button.focus,.search-source.active{background:#8B29B9;color:#fff}.navigation-tabs__button.focus,.time-line>div,.player-panel__position,.player-panel__position>div:after{background-color:#8B29B9;color:#fff}.iptv-menu__list-item.focus,.iptv-program__timeline>div{background-color:#8B29B9!important;color:#fff!important}.radio-item.focus,.lang__selector-item.focus,.simple-keyboard .hg-button.focus,.modal__button.focus,.search-history-key.focus,.simple-keyboard-mic.focus,.torrent-serial__progress,.full-review-add.focus,.full-review.focus,.tag-count.focus,.settings-folder.focus,.settings-param.focus,.selectbox-item.focus,.selectbox-item.hover{background:#8B29B9;color:#fff}.online.focus{box-shadow:0 0 0 .2em #8B29B9}.online_modss.focus::after,.online-prestige.focus::after,.radio-item.focus .radio-item__imgbox:after,.iptv-channel.focus::before,.iptv-channel.last--focus::before{border-color:#8B29B9!important}.card-more.focus .card-more__box::after{border:.3em solid #8B29B9}.simple-button--filter>div{background-color:rgba(255,255,255,.1)}.iptv-playlist-item.focus::after,.iptv-playlist-item.hover::after{border-color:#8B29B9!important}.ad-bot.focus .ad-bot__content::after,.ad-bot.hover .ad-bot__content::after,.card-episode.focus .full-episode::after,.register.focus::after,.season-episode.focus::after,.full-episode.focus::after,.full-review-add.focus::after,.card.focus .card__view::after,.card.hover .card__view::after,.extensions__item.focus:after,.torrent-item.focus::after,.extensions__block-add.focus:after{border-color:#8B29B9}.items-line__more{background:rgba(255,255,255,.1)}.items-line__more.focus{background:#8B29B9!important;color:#fff!important}.torrent-serial__size{background-color:#fff;color:#000}.broadcast__scan>div,.broadcast__device.focus{background-color:#8B29B9;color:#fff}.card:hover .card__img,.card.focus .card__img{border-color:#8B29B9}.noty{background:#8B29B9;color:#fff}.radio-player.focus{background-color:#8B29B9;color:#fff}.explorer-card__head-img.focus::after{border:.3em solid #8B29B9}',
        neon_mod: ':root{--main-color:#e13fe4;--secondary-color:#9d61d3;--background-color:rgba(15,2,33,.95);--text-color:#fff;--transparent-accent:rgba(225,63,228,.1)}body{background:linear-gradient(135deg,#0d0221 0%,#150734 50%,#1f0c47 100%);color:#fff}.menu__ico{color:#000;-webkit-filter:invert(1);filter:invert(1)}.activity__loader{position:absolute;top:0;left:0;width:100%;height:100%;display:none;background:url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%}.modal-loading{height:6em;-webkit-background-size:contain;-moz-background-size:contain;-o-background-size:contain;background-size:contain}.console__tab.focus,.menu__item.focus,.menu__item.traverse,.menu__item.hover,.full-person.focus,.full-start__button.focus,.full-descr__tag.focus,.simple-button.focus,.head__action.focus,.head__action.hover,.player-panel .button.focus,.search-source.active,.navigation-tabs__button.focus,.radio-item.focus,.lang__selector-item.focus,.simple-keyboard .hg-button.focus,.modal__button.focus,.search-history-key.focus,.simple-keyboard-mic.focus,.torrent-serial__progress,.full-review-add.focus,.full-review.focus,.tag-count.focus,.settings-folder.focus,.settings-param.focus,.selectbox-item.focus,.selectbox-item.hover,.radio-player.focus,.broadcast__device.focus{background:linear-gradient(to right,#e13fe4,#9d61d3);color:#fff;box-shadow:0 0 10px rgba(225,63,228,.2);text-shadow:0 0 10px rgba(255,255,255,.5);border:none}.time-line>div,.player-panel__position,.player-panel__position>div:after,.iptv-menu__list-item.focus,.iptv-program__timeline>div,.broadcast__scan>div{background-color:#e13fe4;color:#fff}.card.focus .card__view::after,.card.hover .card__view::after{border:3px solid #e13fe4!important;box-shadow:0 0 10px rgba(225,63,228,.2)}.online.focus{border:3px solid #e13fe4!important;box-shadow:0 0 10px rgba(225,63,228,.2)}.online_modss.focus::after,.online-prestige.focus::after,.radio-item.focus .radio-item__imgbox:after,.iptv-channel.focus::before,.iptv-channel.last--focus::before,.iptv-playlist-item.focus::after,.iptv-playlist-item.hover::after,.ad-bot.focus .ad-bot__content::after,.ad-bot.hover .ad-bot__content::after,.card-episode.focus .full-episode::after,.register.focus::after,.season-episode.focus::after,.full-episode.focus::after,.full-review-add.focus::after,.extensions__item.focus:after,.torrent-item.focus::after,.extensions__block-add.focus:after,.card-more.focus .card-more__box::after,.explorer-card__head-img.focus::after{border:3px solid #e13fe4!important;box-shadow:0 0 10px rgba(225,63,228,.2)}.items-line__more{background:rgba(225,63,228,.1)}.items-line__more.focus{background:linear-gradient(to right,#e13fe4,#9d61d3)!important;color:#fff!important;box-shadow:0 0 10px rgba(225,63,228,.2)}.simple-button--filter>div{background-color:rgba(225,63,228,.1)}.torrent-serial__size{background-color:#fff;color:#000}.noty{background:linear-gradient(to right,#e13fe4,#9d61d3);color:#fff}.full-start__background{opacity:.7;filter:brightness(1.2) saturate(1.3)}.settings__content,.settings-input__content,.selectbox__content,.modal__content{background:rgba(15,2,33,.95);border:1px solid rgba(225,63,228,.1);box-shadow:0 0 10px rgba(225,63,228,.1)}',
        emerald: ':root{--main-color:#43cea2;--secondary-color:#185a9d;--background-color:rgba(26,42,58,.98);--text-color:#fff;--transparent-accent:rgba(67,206,162,.1)}body{background:linear-gradient(135deg,#1a2a3a 0%,#2C5364 50%,#203A43 100%);color:#fff}.menu__ico{color:#000;-webkit-filter:invert(1);filter:invert(1)}.activity__loader{position:absolute;top:0;left:0;width:100%;height:100%;display:none;background:url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%}.modal-loading{height:6em;-webkit-background-size:contain;-moz-background-size:contain;-o-background-size:contain;background-size:contain}.console__tab.focus,.menu__item.focus,.menu__item.traverse,.menu__item.hover,.full-person.focus,.full-start__button.focus,.full-descr__tag.focus,.simple-button.focus,.head__action.focus,.head__action.hover,.player-panel .button.focus,.search-source.active,.navigation-tabs__button.focus,.radio-item.focus,.lang__selector-item.focus,.simple-keyboard .hg-button.focus,.modal__button.focus,.search-history-key.focus,.simple-keyboard-mic.focus,.torrent-serial__progress,.full-review-add.focus,.full-review.focus,.tag-count.focus,.settings-folder.focus,.settings-param.focus,.selectbox-item.focus,.selectbox-item.hover,.radio-player.focus,.broadcast__device.focus{background:linear-gradient(to right,#43cea2,#185a9d);color:#fff;box-shadow:0 4px 15px rgba(67,206,162,.3)}.time-line>div,.player-panel__position,.player-panel__position>div:after,.iptv-menu__list-item.focus,.iptv-program__timeline>div,.broadcast__scan>div{background-color:#43cea2;color:#fff}.card.focus .card__view::after,.card.hover .card__view::after{border:3px solid #43cea2!important;box-shadow:0 0 20px rgba(67,206,162,.4)}.online.focus{border:3px solid #43cea2!important;box-shadow:0 0 20px rgba(67,206,162,.4)}.online_modss.focus::after,.online-prestige.focus::after,.radio-item.focus .radio-item__imgbox:after,.iptv-channel.focus::before,.iptv-channel.last--focus::before,.iptv-playlist-item.focus::after,.iptv-playlist-item.hover::after,.ad-bot.focus .ad-bot__content::after,.ad-bot.hover .ad-bot__content::after,.card-episode.focus .full-episode::after,.register.focus::after,.season-episode.focus::after,.full-episode.focus::after,.full-review-add.focus::after,.extensions__item.focus:after,.torrent-item.focus::after,.extensions__block-add.focus:after,.card-more.focus .card-more__box::after,.explorer-card__head-img.focus::after{border:3px solid #43cea2!important;box-shadow:0 0 20px rgba(67,206,162,.4)}.items-line__more{background:rgba(67,206,162,.1)}.items-line__more.focus{background:linear-gradient(to right,#43cea2,#185a9d)!important;color:#fff!important;box-shadow:0 4px 15px rgba(67,206,162,.3)}.simple-button--filter>div{background-color:rgba(67,206,162,.1)}.torrent-serial__size{background-color:#fff;color:#000}.noty{background:linear-gradient(to right,#43cea2,#185a9d);color:#fff}.full-start__background{opacity:.85;filter:brightness(1.1) saturate(1.2)}.settings__content,.settings-input__content,.selectbox__content,.modal__content{background:rgba(26,42,58,.98);border:1px solid rgba(67,206,162,.1);box-shadow:0 0 20px rgba(67,206,162,.1)}',
        blue_yellow: ':root{--main-color:#0095FF;--background-color:#1d1f20;--text-color:#fff;--transparent-white:rgba(255,255,255,.2)}body{background-color:#1d1f20;color:#fff}.menu__ico{color:#000;-webkit-filter:invert(1);filter:invert(1)}.activity__loader{position:absolute;top:0;left:0;width:100%;height:100%;display:none;background:url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%}.modal-loading{height:6em;-webkit-background-size:contain;-moz-background-size:contain;-o-background-size:contain;background-size:contain}.console__tab.focus,.menu__item.focus,.menu__item.traverse,.menu__item.hover,.full-person.focus,.full-start__button.focus,.full-descr__tag.focus,.simple-button.focus,.head__action.focus,.head__action.hover,.player-panel .button.focus,.search-source.active{background: linear-gradient(180deg, rgba(0, 149, 255, 1) 0%, rgba(255, 251, 0, 1) 100%);color:#fff}.navigation-tabs__button.focus,.time-line>div,.player-panel__position,.player-panel__position>div:after{background-color:#0095FF;color:#fff}.iptv-menu__list-item.focus,.iptv-program__timeline>div{background-color:#0095FF!important;color:#fff!important}.radio-item.focus,.lang__selector-item.focus,.simple-keyboard .hg-button.focus,.modal__button.focus,.search-history-key.focus,.simple-keyboard-mic.focus,.torrent-serial__progress,.full-review-add.focus,.full-review.focus,.tag-count.focus,.settings-folder.focus,.settings-param.focus,.selectbox-item.focus,.selectbox-item.hover{background:#0095FF;color:#fff}.online.focus{box-shadow:0 0 0 .2em #0095FF}.online_modss.focus::after,.online-prestige.focus::after,.radio-item.focus .radio-item__imgbox:after,.iptv-channel.focus::before,.iptv-channel.last--focus::before{border-color:#0095FF!important}.card-more.focus .card-more__box::after{border:.3em solid #0095FF}.simple-button--filter>div{background-color:rgba(255,255,255,.1)}.iptv-playlist-item.focus::after,.iptv-playlist-item.hover::after{border-color:#0095FF!important}.ad-bot.focus .ad-bot__content::after,.ad-bot.hover .ad-bot__content::after,.card-episode.focus .full-episode::after,.register.focus::after,.season-episode.focus::after,.full-episode.focus::after,.full-review-add.focus::after,.card.focus .card__view::after,.card.hover .card__view::after,.extensions__item.focus:after,.torrent-item.focus::after,.extensions__block-add.focus:after{border-color:#0095FF}.items-line__more{background:rgba(255,255,255,.1)}.items-line__more.focus{background:#0095FF!important;color:#fff!important}.torrent-serial__size{background-color:#fff;color:#000}.broadcast__scan>div,.broadcast__device.focus{background-color:#0095FF;color:#fff}.card:hover .card__img,.card.focus .card__img{border-color:#0095FF}.noty{background:#0095FF;color:#fff}.radio-player.focus{background-color:#0095FF;color:#fff}.explorer-card__head-img.focus::after{border:.3em solid #0095FF}',
        orange: ':root{--main-color:#0095FF;--secondary-color:#185a9d;--background-color:rgba(26,42,58,.98);--text-color:#fff;--transparent-accent:rgba(67,206,162,.1)}body{background:linear-gradient(90deg,rgba(0, 0, 0, 1) 0%, rgba(255, 123, 0, 1) 100%);color:#fff}.menu__ico{color:#000;-webkit-filter:invert(1);filter:invert(1)}.activity__loader{position:absolute;top:0;left:0;width:100%;height:100%;display:none;background:url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%}.modal-loading{height:6em;-webkit-background-size:contain;-moz-background-size:contain;-o-background-size:contain;background-size:contain}.console__tab.focus,.menu__item.focus,.menu__item.traverse,.menu__item.hover,.full-person.focus,.full-start__button.focus,.full-descr__tag.focus,.simple-button.focus,.head__action.focus,.head__action.hover,.player-panel .button.focus,.search-source.active,.navigation-tabs__button.focus,.radio-item.focus,.lang__selector-item.focus,.simple-keyboard .hg-button.focus,.modal__button.focus,.search-history-key.focus,.simple-keyboard-mic.focus,.torrent-serial__progress,.full-review-add.focus,.full-review.focus,.tag-count.focus,.settings-folder.focus,.settings-param.focus,.selectbox-item.focus,.selectbox-item.hover,.radio-player.focus,.broadcast__device.focus{background:linear-gradient(90deg,rgba(0, 0, 0, 1) 0%, rgba(255, 123, 0, 1) 100%);color:#fff;box-shadow:0 4px 15px rgba(67,206,162,.3)}.time-line>div,.player-panel__position,.player-panel__position>div:after,.iptv-menu__list-item.focus,.iptv-program__timeline>div,.broadcast__scan>div{background-color:#43cea2;color:#fff}.card.focus .card__view::after,.card.hover .card__view::after{border:3px solid #43cea2!important;box-shadow:0 0 20px rgba(67,206,162,.4)}.online.focus{border:3px solid #43cea2!important;box-shadow:0 0 20px rgba(67,206,162,.4)}.online_modss.focus::after,.online-prestige.focus::after,.radio-item.focus .radio-item__imgbox:after,.iptv-channel.focus::before,.iptv-channel.last--focus::before,.iptv-playlist-item.focus::after,.iptv-playlist-item.hover::after,.ad-bot.focus .ad-bot__content::after,.ad-bot.hover .ad-bot__content::after,.card-episode.focus .full-episode::after,.register.focus::after,.season-episode.focus::after,.full-episode.focus::after,.full-review-add.focus::after,.extensions__item.focus:after,.torrent-item.focus::after,.extensions__block-add.focus:after,.card-more.focus .card-more__box::after,.explorer-card__head-img.focus::after{border:3px solid #43cea2!important;box-shadow:0 0 20px rgba(67,206,162,.4)}.items-line__more{background:rgba(67,206,162,.1)}.items-line__more.focus{background:linear-gradient(90deg,rgba(0, 0, 0, 1) 0%, rgba(255, 123, 0, 1) 100%)!important;color:#fff!important;box-shadow:0 4px 15px rgba(67,206,162,.3)}.simple-button--filter>div{background-color:rgba(67,206,162,.1)}.torrent-serial__size{background-color:#fff;color:#000}.noty{background:linear-gradient(90deg,rgba(0, 0, 0, 1) 0%, rgba(255, 123, 0, 1) 100%);color:#fff}.full-start__background{opacity:.85;filter:brightness(1.1) saturate(1.2)}.settings__content,.settings-input__content,.selectbox__content,.modal__content{background:rgba(26,42,58,.98);border:1px solid rgba(67,206,162,.1);box-shadow:0 0 20px rgba(67,206,162,.1)}'
    };

    // Цвета loader'а для каждой темы
    var loaderColors = {
        default: '#fff',
        violet_stroke: '#8B29B9',
        neon_mod: '#e13fe4',
        emerald: '#43cea2',
        blue_yellow: '#0095ff',
        orange: #FF7B00
    };

    // Функция для применения темы и обновления loader'а
    function applyTheme(theme) {
        // Удаляем старый стиль темы
        var oldStyle = document.querySelector('#interface_theme_mod_style');
        if (oldStyle) {
            oldStyle.parentNode.removeChild(oldStyle);
        }

        // Применяем тему с подставленным SVG
        var style = document.createElement('style');
        style.id = 'interface_theme_mod_style';
        var color = loaderColors[theme] || loaderColors.default;
        var svgCode = encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="135" height="140" fill="${color}"><rect width="15" height="120" y="10" rx="6"><animate attributeName="height" begin="0.5s" calcMode="linear" dur="1s" repeatCount="indefinite" values="120;110;100;90;80;70;60;50;40;140;120"/><animate attributeName="y" begin="0.5s" calcMode="linear" dur="1s" repeatCount="indefinite" values="10;15;20;25;30;35;40;45;50;0;10"/></rect><rect width="15" height="120" x="30" y="10" rx="6"><animate attributeName="height" begin="0.25s" calcMode="linear" dur="1s" repeatCount="indefinite" values="120;110;100;90;80;70;60;50;40;140;120"/><animate attributeName="y" begin="0.25s" calcMode="linear" dur="1s" repeatCount="indefinite" values="10;15;20;25;30;35;40;45;50;0;10"/></rect><rect width="15" height="140" x="60" rx="6"><animate attributeName="height" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="120;110;100;90;80;70;60;50;40;140;120"/><animate attributeName="y" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="10;15;20;25;30;35;40;45;50;0;10"/></rect><rect width="15" height="120" x="90" y="10" rx="6"><animate attributeName="height" begin="0.25s" calcMode="linear" dur="1s" repeatCount="indefinite" values="120;110;100;90;80;70;60;50;40;140;120"/><animate attributeName="y" begin="0.25s" calcMode="linear" dur="1s" repeatCount="indefinite" values="10;15;20;25;30;35;40;45;50;0;10"/></rect><rect width="15" height="120" x="120" y="10" rx="6"><animate attributeName="height" begin="0.5s" calcMode="linear" dur="1s" repeatCount="indefinite" values="120;110;100;90;80;70;60;50;40;140;120"/><animate attributeName="y" begin="0.5s" calcMode="linear" dur="1s" repeatCount="indefinite" values="10;15;20;25;30;35;40;45;50;0;10"/></rect></svg>`
        );
        style.textContent = themes[theme].replace('${svgCode}', svgCode);
        document.head.appendChild(style);

        // Логирование для отладки
        console.log('Theme applied:', theme, 'Loader color:', color);
        console.log('SVG length:', decodeURIComponent(svgCode).length);
    }

    // Функция инициализации плагина
    function initPlugin() {
        // Устанавливаем стандартную тему по умолчанию для всех устройств
        var defaultTheme = 'default';
        var savedTheme = Lampa.Storage.get('interface_theme', defaultTheme);

        // Проверяем, существует ли сохраненная тема
        if (!themes[savedTheme]) {
            savedTheme = defaultTheme;
            Lampa.Storage.set('interface_theme', defaultTheme);
        }

        // Применяем тему
        applyTheme(savedTheme);

        // Добавляем настройку в интерфейс
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'interface_theme',
                type: 'select',
                values: {
                    default: 'Стандарт',
                    violet_stroke: 'Violet',
                    neon_mod: 'Neon Mod',
                    emerald: 'Emerald',
                    blue_yellow: 'Blue-yellow',
                    orange: 'Orange'
                },
                default: defaultTheme
            },
            field: {
                name: 'Тема інтерфейсу',
                description: 'Змінити зовнішній вигляд інтерфейсу'
            },
            onChange: function(value) {
                Lampa.Storage.set('interface_theme', value);
                Lampa.Settings.update();
                applyTheme(value);
            },
            onRender: function(item) {
                setTimeout(function() {
                    $('div[data-name="interface_theme"]').insertBefore('div[data-name="interface_size"]');
                }, 0);
            }
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                initPlugin();
            }
        });
    }
})();
