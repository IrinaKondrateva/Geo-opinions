'use strict';

import { opinionsTemplate } from './template.js';

let myMap, 
    clusterer, 
    projection,
    geoOpins = [];

new Promise(resolve => ymaps.ready(resolve))
    .then(() => {
        myMap = new ymaps.Map('map', {
            center: [55.76, 37.64],
            zoom: 15
        }, {
            searchControlProvider: 'yandex#search'
        });

        let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            `<div class='ballon'>
                <div class='ballon__header'>{{ properties.balloonContentHeader|raw }}</div>
                <div class='ballon__body'>{{ properties.balloonContentBody|raw }}</div>
                <div class='ballon__footer'>{{ properties.balloonContentFooter|raw }}</div>
            </div>`
        );

        clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedRedClusterIcons',
            clusterDisableClickZoom: true,
            openBalloonOnClick: true,
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonItemContentLayout: customItemContentLayout,
            clusterHideIconOnBalloonOpen: false,
            clusterBalloonContentLayoutWidth: 300,
            clusterBalloonContentLayoutHeight: 150,
            clusterBalloonPagerSize: 7
        });
        projection = myMap.options.get('projection');

        myMap.behaviors.disable('scrollZoom');

        myMap.events.add('click', createGeoOpin);

        myMap.geoObjects.add(clusterer);

        renderMarksFromLS();
    })
    .catch (e => console.error(`Ошибка: ${e.message}`));

document.addEventListener('click', (e) => {
    if (!e.target.closest('.new-opinion__add-btn')) return;

    let addrfromDom = document.querySelector('.opinions__address-text').textContent;
    let geoOpinsItem = geoOpins.find(item => item.address == addrfromDom);
    let inputs = [...document.querySelectorAll('.new-opinion__info-block')];
    let dateOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    let opinion = { date: new Date().toLocaleString('ru', dateOptions) };

    for (let input of inputs) {
        if (!input.value) {
            alert('Введите данные отзыва');

            return;
        } 
        opinion[input.name] = input.value;
        input.value = '';
    }
    geoOpinsItem.opinions.push(opinion);
    localStorage.setItem('geoOpins', JSON.stringify(geoOpins));

    document.querySelector('.opinions').remove();
    renderGeoOpin(geoOpinsItem, convertCoordsToPx(geoOpinsItem.coord));
    
    createPlacemark(geoOpinsItem, opinion);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.close')) return;

    e.preventDefault();
    e.target.closest('.close').closest('.opinions').remove();
});     

document.addEventListener('click', (e) => {
    if (!e.target.closest('.ballon-address__link')) return;

    e.preventDefault();
    if (document.querySelector('.opinions')) return;

    let addrfromDom = e.target.closest('.ballon-address__link').textContent
    let geoOpinsItem = geoOpins.find(item => item.address == addrfromDom);

    myMap.balloon.close();
    renderGeoOpin(geoOpinsItem, convertCoordsToPx(geoOpinsItem.coord));
}); 

function geocode(coord) {
    return ymaps.geocode(coord)
        .then(addresses => {
            const points = addresses.geoObjects.toArray();
            
            if (points.length) {
                return points[0].properties.get('text');
            }
        })
        .catch (e => console.error(`Ошибка: ${e.message}`));
}

function convertCoordsToPx(coords) {
    return myMap.converter.globalToPage(projection.toGlobalPixels(coords, myMap.getZoom()));
}

function createGeoOpin(e) {
    if (document.querySelector('.opinions')) return;

    let coords = e.get('coords');

    // coords = coords.map(item => item.toPrecision(7));
    geocode(coords)
        .then(addressStr => {
            let geoOpinsItem = geoOpins.find(item => item.address == addressStr);

            if (!geoOpinsItem) {
                geoOpinsItem = { 
                    address: addressStr,
                    coord: coords,
                    opinions: [] 
                };
                geoOpins.push(geoOpinsItem);
            }
           
            renderGeoOpin(geoOpinsItem, convertCoordsToPx(geoOpinsItem.coord));
        });
}

function renderGeoOpin(opinItem, { 0: left, 1: top }) {
    document.body.insertAdjacentHTML('afterBegin', opinionsTemplate(opinItem));
    const opinionsElem = document.querySelector('.opinions');

    let opinElemX = document.body.clientWidth - left,
        opinElemY = document.body.clientHeight - top;

    if (opinElemX < opinionsElem.offsetWidth) {
        left -= opinionsElem.offsetWidth - opinElemX;
    }

    if (opinElemY < opinionsElem.offsetHeight) {
        top -= opinionsElem.offsetHeight - opinElemY;
    }

    opinionsElem.style.top = `${top}px`;
    opinionsElem.style.left = `${left}px`;
}       

function createPlacemark(geoOpinsItem, opinion) {
    let placemark = new ymaps.Placemark(geoOpinsItem.coord, {
        balloonContentHeader: opinion.place,
        balloonContentBody: `<div class='ballon-address'>
        <a href='' class='ballon-address__link'>${geoOpinsItem.address}</a></div><div>${opinion.opinionTxt}</div>`,
        balloonContentFooter: opinion.date   
    }, { preset: 'islands#redIcon', openBalloonOnClick: false });
    
    placemark.events.add('click', () => {
        if (document.querySelector('.opinions')) return;
        renderGeoOpin(geoOpinsItem, convertCoordsToPx(geoOpinsItem.coord));
    });

    myMap.geoObjects.add(placemark);
    clusterer.add(placemark); 
}

function renderMarksFromLS() {
    if (localStorage.geoOpins) {
        try {
            geoOpins = JSON.parse(localStorage.geoOpins);
            for (const geoOpinsItem of geoOpins) {
                for (const opinion of geoOpinsItem.opinions) {
                    createPlacemark(geoOpinsItem, opinion);
                }
            }
        } catch (e) {
            console.error('Ошибка: ' + e.message);
        }
    }
}
