const token = "05a8e7b9a3f47195a84b368f0e53851b"
const api = "https://api.openweathermap.org/data/2.5/weather?&units=metric&lang=ru"
let searchInput = document.querySelector('.inp')
let searchButton = document.querySelector('.searchBtn');

cardIdList = []
const weatherDictionary = {
    'Clouds': "img/cloud.png",
    'Snow': "img/snow.png",
    'Tornado': "img/wind.png",
    'Mist': "img/fog.png",
    'Fog': "img/fog.png",
    'Drizzle': "img/rain.png",
    'Thunderstorm': "img/rain.png",
    'Rain': "img/rain.png"
}

if (localStorage.getItem('cardIdList')) {
    cardIdList = JSON.parse(localStorage.getItem('cardIdList'))
}
if (localStorage.getItem('forSave')) {
    const forSave = document.querySelector('.forSave')
    forSave.innerHTML = localStorage.getItem('forSave')
    searchInput = document.querySelector('.inp')
    searchButton = document.querySelector('.searchBtn');
}

function dragItem(item) {
    item.onmousedown = function (e) {
        if (e.target.className.includes('btnRemove')) {
            return;
        }
        item.style.position = 'absolute';
        moveAt(e);

        item.style.zIndex = 10;
        function moveAt(e) {
            item.style.left = e.pageX - item.offsetWidth / 2 + 'px';
            item.style.top = e.pageY - item.offsetHeight / 2 + 'px';
        }

        document.onmousemove = function (e) {
            moveAt(e);
        }

        item.onmouseup = function () {
            document.onmousemove = null;
            item.onmouseup = null;
        }
    }
}

searchButton.addEventListener('click', async function getWeather() {
    const response = await fetch(`${api}&appid=${token}&q=${searchInput.value}`)
    const data = await response.json()

    if (data.cod !== 200 || cardIdList.length > 3) {
        searchInput.value = ''
        searchInput.placeholder = "Извините, запрос нельзя выполнить"
    } else {
        searchInput.value = '';
        searchInput.placeholder = "Введите название города"
        const weather = data.weather[0].main;
        const weatherImgSrc = weather in weatherDictionary ? weatherDictionary[weather] : "img/sun.png";
        const id = data.name + new Date().getTime();
        cardIdList.push(id)
        const weatherCards = document.querySelector('.weatherCards');
        weatherCards.innerHTML +=
            `<div class="card card-${id}">\n` +
            `<p class="cityName">${data.name}</p>\n` +
            `<p class="country">${"Страна: " + data.sys.country}</p>\n` +
            `<img class="weather_img" src="${weatherImgSrc}" />\n` +
            `<p class="description">${data.weather[0].description}</p>\n` +
            `<p class="temp">${"Температура: " + Math.round(data.main.temp) + "°C"}</p>\n` +
            `<p class="feelsLike">${"Ощущается как: " + Math.round(data.main.feels_like) + "°C"}</p>\n` +
            `<p class="humidity">${"Влажность: " + data.main.humidity+ "%"}</p>\n` +
            `<p class="windSpeed">${"Ветер: " + data.wind.speed + "м/с"}</p>\n` +
            `<p class="pressure">${"R: " + (data.main.pressure - 250) + " мм рт. ст."}</p>\n` +
            `<button class="btnRemove btnRemove-${id}">remove</button>\n` +
            `</div>`
        const element = document.querySelector(`.card-${id}`);
        dragItem(element)
    }
});

setInterval(async () => {
    const list = cardIdList.map(id => [id.replace(/[0-9]/g, ''), id]);
    for (const [name, id] of list) {
        const element = document.querySelector(`.card-${id}`)
        const response = await fetch(`${api}&appid=${token}&q=${name}`)
        const data = await response.json()
        updateCard(data, element)
    }
}, 10000)

setInterval(() => {
    cardIdList.forEach((id) => {
        const rmvBtnElement = document.querySelector(`.btnRemove-${id}`)
        rmvBtnElement.addEventListener('click', () => removeButton(id))
    })
}, 1000)

setInterval(() => {
    cardIdList.forEach((id) => {
        const element = document.querySelector(`.card-${id}`);
        element.addEventListener('click', () => dragItem(element))
    })
}, 1000)

searchInput.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) { // код клавиши Enter
        searchButton.click()
    }
});

function removeButton(id) {
    cardIdList = cardIdList.filter((cardId) => cardId !== id)
    const element = document.querySelector(`.card-${id}`);
    element?.remove()
}

function updateCard(data, card) {
    const temp = card.querySelector('.temp');
    const pressure = card.querySelector('.pressure');
    const cityName = card.querySelector('.cityName');
    const country = card.querySelector('.country');
    const humidity = card.querySelector('.humidity');
    const description = card.querySelector('.description');
    const feelsLike = card.querySelector('.feelsLike');
    const weatherImg = card.querySelector('.weather_img');
    const windSpeed = card.querySelector('.windSpeed');

    const weather = data.weather[0].main;
    weatherImg.src = weather in weatherDictionary ? weatherDictionary[weather] : "img/sun.png";
    cityName.innerHTML = data.name;
    country.innerHTML = "Страна: " + data.sys.country;
    description.innerHTML = data.weather[0].description;
    feelsLike.innerHTML = "Ощущается как: " + Math.round(data.main.feels_like) + "°C";
    pressure.innerHTML = "R: " + (data.main.pressure - 250) + " мм рт. ст.";
    windSpeed.innerHTML = "Ветер: " + data.wind.speed + "м/с";
    humidity.innerHTML = "Влажность: " + data.main.humidity+ "%";
    temp.innerHTML = "Температура: " + Math.round(data.main.temp) + "°C";
}

setInterval(() => {
    const forSave = document.querySelector('.forSave')
    localStorage.setItem('forSave', forSave.innerHTML)
    localStorage.setItem('cardIdList', JSON.stringify(cardIdList))
}, 1000)
