const opinionsTemplateHbs = `
    <div class="opinions">
        <div class="opinions__wrapper">
            <div class="opinions__header">
                <div class="opinions__address">
                    <span class="fas fa-map-marker-alt"></span>
                    <div class="opinions__address-text">{{address}}</div>
                </div>
                <div class="opinions__header-close">
                    <a class="close" href="">
                        <svg class="close__svg">
                            <use xlink:href="/img/cross.svg#cross"></use>
                        </svg>
                    </a>
                </div>
            </div>
            <div class="opinions__container">
                <ul class="opinions__list">
                    {{#if opinions}}
                        {{#each opinions}}
                            <li class="opinions__item">
                                <span>{{name}}</span>
                                <span>{{place}}</span>
                                <span>{{date}}</span>
                                <div class="opinions__item-opintext">{{opinionTxt}}</div>
                            </li>
                        {{/each}}
                    {{else}}
                        <li class="opinions__item">Отзывов пока нет...</li>
                    {{/if}}
                </ul>
                <div class="opinions__new-opinion">
                    <div class="new-opinion__title">
                        ВАШ ОТЗЫВ
                    </div>
                    <div class="new-opinion__info">
                        <input type="text" name="name" class="new-opinion__info-block" placeholder="Ваше имя">
                    </div>
                    <div class="new-opinion__info">
                        <input type="text" name="place" class="new-opinion__info-block" placeholder="Укажите место">
                    </div>
                    <div class="new-opinion__info">
                        <textarea name="opinionTxt" class="new-opinion__info-block new-opinion__info-block_textarea"
                         placeholder="Поделитесь впечатлениями"></textarea>
                    </div>
                    <div class="new-opinion__add">
                        <button class="new-opinion__add-btn">
                            Добавить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

const opinionsTemplate = Handlebars.compile(opinionsTemplateHbs);

export { opinionsTemplate };