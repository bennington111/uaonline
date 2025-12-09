(function() {
    'use strict';
	
	console.log('[Style Interface DEBUG] Lampa version:', Lampa.version || 'unknown');
	console.log('[Style Interface DEBUG] Lampa.InteractionMain type:', typeof Lampa.InteractionMain);
	console.log('[Style Interface DEBUG] Is function?', typeof Lampa.InteractionMain === 'function');
	console.log('[Style Interface DEBUG] Lampa keys:', Object.keys(Lampa).filter(k => k.includes('Interaction')));

    // Плагін для стильного інтерфейсу Lampa
    // Версія 1.1 (фікс активації)

    // ==================== КОНФІГУРАЦІЯ ====================
    const PLUGIN_NAME = 'style_interface';
    const PLUGIN_DISPLAY_NAME = 'Стильный интерфейс';

    // ==================== КЛАС ІНФОРМАЦІЙНОГО БЛОКА ====================
    class NewInterfaceInfo {
        constructor(data) {
            this.data = data;
            this.cache = {};
            this.request = new Lampa.Reguest();
            this.timeout = null;
            this.create();
        }

        create() {
            this.element = $(`
                <div class="new-interface-info">
                    <div class="new-interface-info__body">
                        <div class="new-interface-info__head"></div>
                        <div class="new-interface-info__title"></div>
                        <div class="new-interface-info__details"></div>
                        <div class="new-interface-info__description"></div>
                    </div>
                </div>
            `);
        }

        update(item) {
            // Очищаємо заголовок та деталі
            this.element.find('.new-interface-info__head, .new-interface-info__details').text('---');
            
            // Встановлюємо заголовок
            const titleElement = this.element.find('.new-interface-info__title');
            const itemTitle = item.title || item.name;
            
            // Завантажуємо логотип якщо увімкнено в налаштуваннях
            if (Lampa.Storage.get('logo_card_style') !== false) {
                const type = item.name ? 'tv' : 'movie';
                const url = Lampa.TMDB.api(`${type}/${item.id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}`);
                
                $.get(url, (response) => {
                    if (response.logos && response.logos[0]) {
                        const logoPath = response.logos[0].file_path;
                        if (logoPath !== '') {
                            titleElement.html(`
                                <img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" 
                                     src="https://image.tmdb.org/t/p/w500${logoPath.replace('.svg', '.png')}" />
                            `);
                        } else {
                            titleElement.text(itemTitle);
                        }
                    } else {
                        titleElement.text(itemTitle);
                    }
                }).fail(() => {
                    titleElement.text(itemTitle);
                });
            } else {
                titleElement.text(itemTitle);
            }

            // Встановлюємо опис якщо увімкнено
            if (Lampa.Storage.get('info') !== false) {
                this.element.find('.new-interface-info__description').text(
                    item.overview || Lampa.Lang.translate('full_notext')
                );
            }

            // Оновлюємо фон
            if (item.backdrop_path) {
                Lampa.Background.change(Lampa.Api.img(item.backdrop_path, 'w200'));
            }

            // Малюємо деталі
            this.draw(item);
        }

        draw(item) {
            const year = ((item.release_date || item.first_air_date || '0000') + '').slice(0, 4);
            const rating = parseFloat((item.vote_average || 0) + '').toFixed(1);
            const countries = Lampa.Api.sources && Lampa.Api.sources.tmdb ? 
                Lampa.Api.sources.tmdb.parseCountries(item) : [];
            const ageRating = Lampa.Api.sources && Lampa.Api.sources.tmdb ? 
                Lampa.Api.sources.tmdb.parsePG(item) : '';
            
            const yearLine = [];
            const detailsLine = [];

            // Рік
            if (year !== '0000') {
                yearLine.push(`<span>${year}</span>`);
            }

            // Країни
            if (countries && countries.length > 0) {
                yearLine.push(countries.join(', '));
            }

            // Рейтинг
            if (Lampa.Storage.get('rat') !== false && rating > 0) {
                detailsLine.push(`<div class="full-start__rate"><div>${rating}</div></div>`);
            }

            // Жанри
            if (Lampa.Storage.get('ganr') !== false && item.genres && item.genres.length > 0) {
                const genres = item.genres.map(genre => 
                    Lampa.Utils.capitalizeFirstLetter(genre.name || genre)
                ).join(' | ');
                detailsLine.push(genres);
            }

            // Час (для фільмів)
            if (Lampa.Storage.get('vremya') !== false && item.runtime) {
                detailsLine.push(Lampa.Utils.secondsToTime(item.runtime * 60, true));
            }

            // Кількість сезонів (для серіалів)
            if (Lampa.Storage.get('seas') !== false && item.number_of_seasons) {
                detailsLine.push(`<span class="full-start__pg" style="font-size: 0.9em;">Сезонов ${item.number_of_seasons}</span>`);
            }

            // Кількість епізодів (для серіалів)
            if (Lampa.Storage.get('eps') !== false && item.number_of_episodes) {
                detailsLine.push(`<span class="full-start__pg" style="font-size: 0.9em;">Эпизодов ${item.number_of_episodes}</span>`);
            }

            // Вікові обмеження
            if (Lampa.Storage.get('year_ogr') !== false && ageRating) {
                detailsLine.push(`<span class="full-start__pg" style="font-size: 0.9em;">${ageRating}</span>`);
            }

            // Статус
            if (Lampa.Storage.get('status') !== false && item.status) {
                let statusText = '';
                const status = item.status.toLowerCase();
                if (status.includes('released')) statusText = 'Выпущенный';
                else if (status.includes('ended')) statusText = 'Закончен';
                else if (status.includes('returning')) statusText = 'Онгоинг';
                else if (status.includes('canceled')) statusText = 'Отменено';
                else if (status.includes('planned')) statusText = 'Скоро';
                else if (status.includes('post')) statusText = 'Постпродакшен';
                else if (status.includes('production')) statusText = 'В производстве';
                else statusText = item.status;
                
                if (statusText) {
                    detailsLine.push(`<span class="full-start__status" style="font-size: 0.9em;">${statusText}</span>`);
                }
            }

            // Відображаємо інформацію
            this.element.find('.new-interface-info__head').empty().append(yearLine.join(', '));
            this.element.find('.new-interface-info__details').html(detailsLine.join('<span class="new-interface-info__split">•</span>'));
        }

        load(item) {
            const self = this;
            clearTimeout(this.timeout);

            const type = item.name ? 'tv' : 'movie';
            const url = Lampa.TMDB.api(`${type}/${item.id}?api_key=${Lampa.TMDB.key()}&append_to_response=content_ratings,release_dates&language=${Lampa.Storage.get('language')}`);

            if (this.cache[url]) {
                this.draw(this.cache[url]);
                return;
            }

            this.timeout = setTimeout(() => {
                this.request.clear();
                this.request.timeout(5000);
                this.request.silent(url, (response) => {
                    self.cache[url] = response;
                    self.draw(response);
                });
            }, 300);
        }

        render() {
            return this.element;
        }

        clear() {
            this.element.find('.new-interface-info__head').empty();
        }

        destroy() {
            this.element.remove();
            this.cache = {};
            this.element = null;
        }
    }

    // ==================== ОСНОВНИЙ КЛАС ІНТЕРФЕЙСУ ====================
    class NewInterface {
        constructor(data) {
            this.data = data;
            this.request = new Lampa.Reguest();
            this.scroll = new Lampa.Scroll({mask: true, over: true, scroll_by_item: true});
            this.cards = [];
            this.currentIndex = 0;
            this.infoBlock = null;
            this.items = null;
            this.backgroundElement = null;
            this.currentBackground = '';
            this.backgroundTimeout = null;
            
            this.create();
        }

        create() {
            this.element = $(`
                <div class="new-interface">
                    <img class="full-start__background">
                </div>
            `);
            this.backgroundElement = this.element.find('.full-start__background');
            console.log('[Style Interface] NewInterface created');
        }

        clear() {
            this.element.find('.new-interface-info__head').empty();
        }

        loadNext() {
            if (this.next && !this.next_wait && this.cards.length) {
                this.next_wait = true;
                this.next(() => {
                    this.next_wait = false;
                    this.items.slice(0, this.currentIndex + 2).forEach(this.append.bind(this));
                    Lampa.Layer.visible(this.cards[this.currentIndex + 1].render(true));
                }, () => {
                    this.next_wait = false;
                });
            }
        }

        push() {}

        render(items) {
            console.log('[Style Interface] Rendering items:', items.length);
            const self = this;
            this.items = items;
            this.infoBlock = new NewInterfaceInfo(this.data);
            this.infoBlock.create();
            
            this.scroll.minus(this.infoBlock.render());
            
            // Додаємо перші елементи
            const viewType = Lampa.Storage.field('card_views_type') === 'view' || 
                           Lampa.Storage.field('navigation_type') === 'static';
            const itemsToShow = viewType ? items.length : Math.min(2, items.length);
            items.slice(0, itemsToShow).forEach(this.append.bind(this));
            
            this.element.append(this.infoBlock.render());
            this.element.append(this.scroll.render());
            
            // Завжди активуємо новий інтерфейс на TV/десктоп
            Lampa.Layer.update(this.element);
            Lampa.Layer.visible(this.scroll.render(true));
            this.scroll.onEnd = this.loadNext.bind(this);
            this.scroll.onChange = function(position) {
                if (!Lampa.Controller.own(self)) {
                    self.start();
                }
                if (position > 0) {
                    self.down();
                } else {
                    if (self.currentIndex > 0) {
                        self.up();
                    }
                }
            };
            
            this.activity.loader(false);
            this.activity.toggle();
            console.log('[Style Interface] Render completed');
        }

        background(item) {
            if (!item.backdrop_path) return;
            
            const backgroundUrl = Lampa.Api.img(item.backdrop_path, 'w1280');
            clearTimeout(this.backgroundTimeout);
            
            if (backgroundUrl === this.currentBackground) return;
            
            this.backgroundTimeout = setTimeout(() => {
                this.backgroundElement.removeClass('loaded');
                this.backgroundElement[0].onload = () => {
                    this.backgroundElement.addClass('loaded');
                };
                this.backgroundElement[0].onerror = () => {
                    this.backgroundElement.removeClass('loaded');
                };
                this.currentBackground = backgroundUrl;
                setTimeout(() => {
                    this.backgroundElement[0].src = this.currentBackground;
                }, 50);
            }, 100);
        }

        append(cardData) {
            if (cardData.rendered) return;
            cardData.rendered = true;
            
            const self = this;
            const card = new Lampa.InteractionLine(cardData, {
                url: cardData.url,
                card_small: true,
                cardClass: cardData.cardClass,
                genres: this.data.genres,
                object: this.data,
                card_wide: Lampa.Storage.field('wide_post') !== false,
                nomore: cardData.nomore
            });
            
            card.create();
            card.onDown = this.down.bind(this);
            card.onUp = this.up.bind(this);
            card.onBack = this.back.bind(this);
            card.onChange = function() {
                self.currentIndex = self.cards.indexOf(card);
            };
            
            if (this.onMore) {
                card.onMore = this.onMore.bind(this);
            }
            
            card.onFocus = function(item) {
                console.log('[Style Interface] Card focused:', item.title || item.name);
                self.infoBlock.update(item);
                self.background(item);
            };
            
            card.onHover = function(item) {
                self.infoBlock.update(item);
                self.background(item);
            };
            
            card.onToggle = self.infoBlock.clear.bind(self.infoBlock);
            
            this.scroll.append(card.render());
            this.cards.push(card);
        }

        back() {
            Lampa.Activity.backward();
        }

        down() {
            this.currentIndex++;
            this.currentIndex = Math.min(this.currentIndex, this.cards.length - 1);
            
            const viewType = Lampa.Storage.field('card_views_type') === 'view' || 
                           Lampa.Storage.field('navigation_type') === 'static';
            if (!viewType) {
                this.items.slice(0, this.currentIndex + 2).forEach(this.append.bind(this));
            }
            
            this.cards[this.currentIndex].toggle();
            this.scroll.update(this.cards[this.currentIndex].render());
        }

        up() {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = 0;
                Lampa.Controller.toggle('head');
            } else {
                this.cards[this.currentIndex].toggle();
                this.scroll.update(this.cards[this.currentIndex].render());
            }
        }

        start() {
            const self = this;
            Lampa.Controller.add('content', {
                link: this,
                toggle: function() {
                    if (self.activity.canRefresh()) return false;
                    self.cards.length && self.cards[self.currentIndex].toggle();
                },
                update: function() {},
                left: function() {
                    if (Navigator.canmove('left')) {
                        Navigator.move('left');
                    } else {
                        Lampa.Controller.toggle('menu');
                    }
                },
                right: function() {
                    Navigator.move('right');
                },
                up: function() {
                    if (Navigator.canmove('up')) {
                        Navigator.move('up');
                    } else {
                        Lampa.Controller.toggle('head');
                    }
                },
                down: function() {
                    if (Navigator.canmove('down')) {
                        Navigator.move('down');
                    }
                },
                back: this.back.bind(this)
            });
            Lampa.Controller.toggle('content');
            console.log('[Style Interface] Controller started');
        }

        refresh() {
            this.activity.loader(true);
            this.activity.need_refresh = true;
        }

        pause() {}
        stop() {}

        renderElement() {
            return this.element;
        }

        destroy() {
            this.request.clear();
            if (this.cards && Lampa.Arrays) {
                Lampa.Arrays.destroy(this.cards);
            }
            this.scroll.destroy();
            if (this.infoBlock) {
                this.infoBlock.destroy();
            }
            this.element.remove();
            this.cards = null;
            this.request = null;
            this.items = null;
        }
    }

    // ==================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА ====================
    function initPlugin() {
        console.log('[Style Interface] Initializing plugin...');
        
        if (typeof Lampa === 'undefined' || typeof $ === 'undefined') {
            console.error('[Style Interface] Lampa or jQuery not found');
            return;
        }

        window.plugin_interface_ready = true;

        // Перевизначаємо InteractionMain для всіх випадків
        const originalInteractionMain = Lampa.InteractionMain;
        
        Lampa.InteractionMain = function(data) {
            console.log('[Style Interface] InteractionMain called with source:', data.source);
            
            // АКТИВУЄМО НОВИЙ ІНТЕРФЕЙС ЗАВЖДИ для TMDB/CUB на будь-якому екрані
            if (data.source === 'tmdb' || data.source === 'cub') {
                console.log('[Style Interface] Using NewInterface for', data.source);
                return new NewInterface(data);
            }
            
            // Для інших джерел використовуємо оригінальний
            console.log('[Style Interface] Using original InteractionMain for', data.source);
            return new originalInteractionMain(data);
        };

        // Додаємо стилі
        const css = `
            .new-interface {
                position: relative;
                z-index: 10;
            }
            
            .new-interface .card--small.card--wide {
                width: 18.3em !important;
                margin-right: 1em;
            }
            
            .new-interface-info {
                position: relative;
                padding: 1.5em;
                height: 20.4em;
                background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
                z-index: 5;
            }
            
            .new-interface-info__body {
                width: 80%;
                padding-top: 0.2em;
                position: relative;
                z-index: 6;
            }
            
            .new-interface-info__head {
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 0.3em;
                font-size: 1.3em;
                min-height: 1em;
                font-weight: 300;
            }
            
            .new-interface-info__head span {
                color: #fff;
                font-weight: 500;
            }
            
            .new-interface-info__title {
                font-size: 4em;
                font-weight: 600;
                margin-bottom: 0.2em;
                overflow: hidden;
                -o-text-overflow: ".";
                text-overflow: ".";
                display: -webkit-box;
                -webkit-line-clamp: 1;
                line-clamp: 1;
                -webkit-box-orient: vertical;
                margin-left: -0.03em;
                line-height: 1.3;
                color: #fff;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .new-interface-info__details {
                margin-bottom: 1.6em;
                display: -webkit-box;
                display: -webkit-flex;
                display: -moz-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: center;
                -webkit-align-items: center;
                -moz-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                -webkit-flex-wrap: wrap;
                -ms-flex-wrap: wrap;
                flex-wrap: wrap;
                min-height: 1.9em;
                font-size: 1.3em;
                color: rgba(255,255,255,0.8);
            }
            
            .new-interface-info__split {
                margin: 0 1em;
                font-size: 0.7em;
                color: rgba(255,255,255,0.5);
            }
            
            .new-interface-info__description {
                font-size: 1.4em;
                font-weight: 310;
                line-height: 1.3;
                overflow: hidden;
                -o-text-overflow: ".";
                text-overflow: ".";
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                width: 70%;
                color: rgba(255,255,255,0.9);
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            }
            
            .new-interface .card-more__box {
                padding-bottom: 150%;
            }
            
            .new-interface .full-start__background {
                height: 108%;
                top: -5em;
                position: absolute;
                width: 100%;
                object-fit: cover;
                filter: brightness(0.6);
                z-index: 1;
            }
            
            .new-interface .full-start__background.loaded {
                opacity: 1;
                transition: opacity 0.3s;
            }
            
            .new-interface .full-start__rate {
                font-size: 1.3em;
                margin-right: 0;
                background: rgba(0,0,0,0.7);
                padding: 0.2em 0.5em;
                border-radius: 0.3em;
                color: #ffd700;
            }
            
            .new-interface .card__promo {
                display: none;
            }
            
            .new-interface .card.card--wide+.card-more .card-more__box {
                padding-bottom: 95%;
            }
            
            .new-interface .card.card--wide .card-watched {
                display: none !important;
            }
            
            .new-interface .full-start__pg,
            .new-interface .full-start__status {
                background: rgba(0,0,0,0.7);
                padding: 0.2em 0.5em;
                border-radius: 0.3em;
                margin-right: 0.5em;
            }
            
            body.light--version .new-interface-info__body {
                width: 69%;
                padding-top: 1.5em;
            }
            
            body.light--version .new-interface-info {
                height: 25.3em;
            }
            
            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view {
                animation: animation-card-focus 0.2s;
                transform: scale(1.05);
            }
            
            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view {
                animation: animation-trigger-enter 0.2s forwards;
            }
        `;

        // Додаємо стилі
        if (Lampa.Template) {
            Lampa.Template.add('new_interface_style', `<style>${css}</style>`);
            $('body').append(Lampa.Template.get('new_interface_style', {}, true));
        } else {
            $('head').append(`<style id="new-interface-styles">${css}</style>`);
        }

        // Чекаємо завантаження Settings
        const waitForSettings = setInterval(() => {
            if (Lampa.Settings && Lampa.SettingsApi) {
                clearInterval(waitForSettings);
                registerSettings();
            }
        }, 100);

        function registerSettings() {
            console.log('[Style Interface] Registering settings...');
            
            const settingsIcon = `
                <div class="settings-folder" style="padding:0!important">
                    <div style="width:1.8em;height:1.3em;padding-right:.5em">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M18 8a2 2 0 1 1-4 0a2 2 0 0 1 4 0"/>
                            <path fill="currentColor" fill-rule="evenodd" d="M11.943 1.25h.114c2.309 0 4.118 0 5.53.19c1.444.194 2.584.6 3.479 1.494c.895.895 1.3 2.035 1.494 3.48c.19 1.411.19 3.22.19 5.529v.088c0 1.909 0 3.471-.104 4.743c-.104 1.28-.317 2.347-.795 3.235q-.314.586-.785 1.057c-.895.895-2.035 1.3-3.48 1.494c-1.411.19-3.22.19-5.529.19h-.114c-2.309 0-4.118 0-5.53-.19c-1.444-.194-2.584-.6-3.479-1.494c-.793-.793-1.203-1.78-1.42-3.006c-.215-1.203-.254-2.7-.262-4.558Q1.25 12.792 1.25 12v-.058c0-2.309 0-4.118.19-5.53c.194-1.444.6-2.584 1.494-3.479c.895-.895 2.035-1.3 3.48-1.494c1.411-.19 3.22-.19 5.529-.19m-5.33 1.676c-1.278.172-2.049.5-2.618 1.069c-.57.57-.897 1.34-1.069 2.619c-.174 1.3-.176 3.008-.176 5.386v.844l1.001-.876a2.3 2.3 0 0 1 3.141.104l4.29 4.29a2 2 0 0 0 2.564.222l.298-.21a3 3 0 0 1 3.732.225l2.83 2.547c.286-.598.455-1.384.545-2.493c.098-1.205.099-2.707.099-4.653c0-2.378-.002-4.086-.176-5.386c-.172-1.279-.5-2.05-1.069-2.62c-.57-.569-1.34-.896-2.619-1.068c-1.3-.174-3.008-.176-5.386-.176s-4.086.002-5.386.176" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div style="font-size:1em">${PLUGIN_DISPLAY_NAME}</div>
                </div>
            `;

            // Додаємо слухач для відкриття налаштувань
            Lampa.Settings.listener.follow('open', function(item) {
                if (item.name === 'interface') {
                    // Перевіряємо, чи вже доданий компонент
                    const existing = Lampa.Settings.main().render().find('[data-component="style_interface"]');
                    if (existing.length === 0) {
                        Lampa.SettingsApi.addComponent({
                            component: PLUGIN_NAME,
                            name: PLUGIN_DISPLAY_NAME,
                            icon: settingsIcon
                        });
                        console.log('[Style Interface] Added settings component');
                    }
                    Lampa.Settings.main().update();
                    
                    // Додаємо клас для відкриття
                    setTimeout(() => {
                        Lampa.Settings.main().render().find('[data-component="style_interface"]').addClass('settings-param--open');
                    }, 100);
                }
            });

            // Додаємо параметри
            const settings = [
                {name: PLUGIN_NAME, type: 'trigger', default: true, field: PLUGIN_DISPLAY_NAME, desc: 'Настройки элементов'},
                {name: 'wide_post', type: 'trigger', default: true, field: 'Широкие постеры'},
                {name: 'logo_card_style', type: 'trigger', default: true, field: 'Логотип вместо названия'},
                {name: 'info', type: 'trigger', default: true, field: 'Показывать описание'},
                {name: 'status', type: 'trigger', default: false, field: 'Показывать статус фильма/сериала'},
                {name: 'seas', type: 'trigger', default: false, field: 'Показывать количество сезонов'},
                {name: 'eps', type: 'trigger', default: false, field: 'Показывать количество эпизодов'},
                {name: 'year_ogr', type: 'trigger', default: true, field: 'Показывать возрастное ограничение'},
                {name: 'ganr', type: 'trigger', default: true, field: 'Показывать жанр фильма'},
                {name: 'vremya', type: 'trigger', default: true, field: 'Показывать время фильма'},
                {name: 'rat', type: 'trigger', default: true, field: 'Показывать рейтинг фильма'}
            ];

            // Додаємо головний параметр
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {name: PLUGIN_NAME, type: 'trigger', default: true},
                field: {name: PLUGIN_DISPLAY_NAME, description: 'Настройки элементов'},
                onRender: function(item) {
                    setTimeout(() => {
                        const el = $('.settings-param > div:contains("Стильный интерфейс")');
                        if (el.length) {
                            el.parent().insertAfter($('div[data-name="interface_size"]'));
                        }
                    }, 100);
                    
                    item.on('hover:enter', function() {
                        Lampa.Settings.create(PLUGIN_NAME);
                        if (Lampa.Controller.enabled() && Lampa.Controller.enabled().controller) {
                            const originalBack = Lampa.Controller.enabled().controller.back;
                            Lampa.Controller.enabled().controller.back = function() {
                                Lampa.Settings.create('interface');
                                if (originalBack) originalBack();
                            };
                        }
                    });
                }
            });

            // Додаємо інші параметри
            settings.slice(1).forEach(setting => {
                try {
                    Lampa.SettingsApi.addParam({
                        component: PLUGIN_NAME,
                        param: {name: setting.name, type: setting.type, default: setting.default},
                        field: {name: setting.field}
                    });
                    console.log(`[Style Interface] Added setting: ${setting.field}`);
                } catch (e) {
                    console.error(`[Style Interface] Error adding ${setting.field}:`, e);
                }
            });

            // Активуємо налаштування
            if (!Lampa.Storage.get('int_plug', false)) {
                setTimeout(() => {
                    try {
                        Lampa.Storage.set('int_plug', true);
                        Lampa.Storage.set('wide_post', true);
                        Lampa.Storage.set('logo_card_style', true);
                        Lampa.Storage.set('info', true);
                        Lampa.Storage.set('status', true);
                        Lampa.Storage.set('seas', false);
                        Lampa.Storage.set('eps', false);
                        Lampa.Storage.set('year_ogr', true);
                        Lampa.Storage.set('vremya', true);
                        Lampa.Storage.set('rat', true);
                        Lampa.Storage.set('ganr', true);
                        console.log('[Style Interface] Default settings activated');
                    } catch (e) {
                        console.error('[Style Interface] Error activating defaults:', e);
                    }
                }, 1500);
            }
            
            console.log('[Style Interface] Plugin fully initialized');
        }
    }

    // Запускаємо
    if (!window.plugin_interface_ready) {
        const waitForLampa = setInterval(() => {
            if (typeof Lampa !== 'undefined' && typeof $ !== 'undefined') {
                clearInterval(waitForLampa);
                // Чекаємо трохи більше для стабільності
                setTimeout(() => {
                    try {
                        initPlugin();
                    } catch (e) {
                        console.error('[Style Interface] Init error:', e);
                    }
                }, 1000);
            }
        }, 100);
    }

	console.log('[Style Interface DEBUG] Plugin wrapper executed');
	console.log('[Style Interface DEBUG] window.plugin_interface_ready:', window.plugin_interface_ready);

})();