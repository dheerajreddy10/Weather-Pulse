document.addEventListener("DOMContentLoaded", () => {
  weatherApp();
});

function weatherApp() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        await fetchWeather(latitude, longitude);
      },
      (error) => {
        handleLocationError(error);
      },
    );
  } else {
    let displayArea = document.getElementById("weather-info");
    displayArea.innerHTML = `<p class="status">Geolocation is not supported by your browser.</p>`;
  }
}

async function fetchWeather(latitude, longitude) {
  let displayArea = document.getElementById("weather-info");

  try {
    let APIKEY = "d64a001442b00d13200715ed7459ddb0";
    let weatherApi = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${APIKEY}`;

    let forecastApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${APIKEY}`;

    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherApi),
      fetch(forecastApi),
    ]);

    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error("API request failed");
    }

    const data = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    let getPlace = data.name;
    let getCountry = data.sys.country;
    let iconCode = data.weather[0].icon;
    let iconPlaceUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
    let placeWeatherTemperature = Math.round(data.main.temp);
    let placeWeatherDescription = data.weather[0].description;

    let timestamp = data.dt;

    let date = new Date(timestamp * 1000);

    let formattedPlaceDateDay = date
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/,/g, "");

    let placeFeelsLike = Math.round(data.main.feels_like);
    let placeHumidity = data.main.humidity;
    let placeWindSpeedInKmh = (data.wind.speed * 3.6).toFixed(1);
    let placePressure = data.main.pressure;
    let placeVisibilityINKm = data.visibility / 1000;
    let placeSunrise = new Date(data.sys.sunrise * 1000)
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
    let placeSunset = new Date(data.sys.sunset * 1000)
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();

    let placeMaxTemp = Math.round(data.main.temp_max);
    let placeMinTemp = Math.round(data.main.temp_min);

    let hourlyCards = forecastData.list
      .slice(0, 8)
      .map((item) => {
        let time = new Date(item.dt * 1000).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        let temp = Math.round(item.main.temp);

        let description = item.weather[0].main;

        let iconCode = item.weather[0].icon;
        let iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        return `
  <div
    class="hourlyCards w-[11.875%] bg-slate-800 rounded-2xl ml-5 mt-5
           h-[195px] flex flex-col justify-around items-center"
  >
    <p class="text-white text-xl mt-4">
      ${time}
    </p>

    <img
      src="${iconUrl}"
      alt="${description}"
      class="w-16 h-16"
    />

    <div class="text-center mb-4">
      <h2 class="text-white text-2xl font-bold">
        ${temp}&deg;C
      </h2>

      <p class="text-gray-500">
        ${description}
      </p>
    </div>
  </div>
`;
      })
      .join("");

    let fiveDayForecast = forecastData.list.filter(
      (item, index) => index % 8 === 0,
    );
    let fiveDayCards = fiveDayForecast
      .slice(0, 5)
      .map((item) => {
        let day = new Date(item.dt * 1000).toLocaleDateString("en-US", {
          weekday: "short",
        });

        let temp = Math.round(item.main.temp);

        let description = item.weather[0].main;

        let iconCode = item.weather[0].icon;
        let iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        return `
       <div
      class="dayCards dayCard1 w-[20%] bg-slate-800 rounded-2xl mx-4 mt-5 h-[165px] flex flex-col items-center "
    >
        <p class="text-white text-xl mt-4">${day}</p>

        <img src="${iconUrl}" alt="${description}" class="w-16 h-16" />

        <h2 class="text-white text-2xl font-bold">
          ${temp}&deg;C
        </h2>

        <p class="text-gray-500">${description}</p>
      </div>
    `;
      })
      .join("");

    displayArea.innerHTML = `
    <!-- main tempature cards -->
      <div class="weatherMainDisplay flex gap-5 mx-5 my-7">
        <!-- Main Weather Card -->
        <div
          class="mainWeatherCard w-[32%] h-[330px] bg-slate-800 rounded-3xl p-6"
        >
          <div class="mainWeatherCardLocationDisplay flex justify-between">
            <div class="mainWeatherCardLocation flex flex-col">
              <div
                class="mainWeatherCardLocationName text-white text-4xl font-bold"
              >
                ${getPlace}
              </div>
              <div class="mainWeatherCardLocationCountry text-gray-500">${getCountry}</div>
            </div>
            <img class="mainWeatherCardPhoto text-2xl" src="${iconPlaceUrl}" alt="Weather-photo">
          </div>
          <div
            class="mainWeatherCardTemperatureDisplay flex flex-col gap-3 mt-6"
          >
            <h2 class="text-6xl font-bold text-white">${placeWeatherTemperature}&deg;C</h2>
            <p class="text-gray-300 text-3xl">${placeWeatherDescription}</p>
            <p class="text-gray-500">${formattedPlaceDateDay}</p>
            <p class="text-blue-600">Feels Like ${placeFeelsLike}&deg;C</p>
          </div>
        </div>

        <!-- Right Side Cards -->
        <div class="weatherCards w-[68%] grid grid-cols-4 gap-5">
          <!-- Humidity -->
          <div
            class="weatherCard weatherCardHumidity h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>💧</div>
            <p class="text-gray-400 mb-2">Humidity</p>
            <h2 class="text-white text-2xl font-bold">${placeHumidity}%</h2>
          </div>

          <!-- Wind Speed -->
          <div
            class="weatherCard weatherCardWind h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>🌬️</div>
            <p class="text-gray-400 mb-2">Wind Speed</p>
            <h2 class="text-white text-2xl font-bold">${placeWindSpeedInKmh} km/h</h2>
          </div>

          <!-- Pressure -->
          <div
            class="weatherCard weatherCardPressure h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>📊</div>
            <p class="text-gray-400 mb-2">Pressure</p>
            <h2 class="text-white text-2xl font-bold">${placePressure} hPa</h2>
          </div>

          <!-- Visibility -->
          <div
            class="weatherCard weatherCardVisibility h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>👁️</div>
            <p class="text-gray-400 mb-2">Visibility</p>
            <h2 class="text-white text-2xl font-bold">${placeVisibilityINKm} km</h2>
          </div>

          <!-- Sunrise -->
          <div
            class="weatherCard weatherCardSunrise h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>🌅</div>
            <p class="text-gray-400 mb-2">Sunrise</p>
            <h2 class="text-white text-2xl font-bold">${placeSunrise}</h2>
          </div>

          <!-- Sunset -->
          <div
            class="weatherCard weatherCardSunset h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>🌇</div>
            <p class="text-gray-400 mb-2">Sunset</p>
            <h2 class="text-white text-2xl font-bold">${placeSunset}</h2>
          </div>

          <!-- Maximum Temperature -->
          <div
            class="weatherCard weatherCardMaxTemp h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>🔥</div>
            <p class="text-gray-400 mb-2">Max Temperature</p>
            <h2 class="text-white text-2xl font-bold">${placeMaxTemp}&deg;C</h2>
          </div>

          <!-- Minimum Temperature -->
          <div
            class="weatherCard weatherCardMinTemp h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>❄️</div>
            <p class="text-gray-400 mb-2">Min Temperature</p>
            <h2 class="text-white text-2xl font-bold">${placeMinTemp}&deg;C</h2>
          </div>
        </div>
      </div>

      <div class="weatherHourlyDisplay mb-10">
        <h2
          class="weatherHourlyDisplayHeading text-white text-4xl font-bold ml-5"
        >
          Hourly Forecast
        </h2>

            <div class="weatherHourlyDisplayCards w-[95%] flex flex-row ">

  ${hourlyCards}
     </div>
     </div>

 <div class="weatherDayDisplay mb-10">
  <h2
    class="weatherDayDisplayHeading text-white text-4xl font-bold ml-5"
  >
    5 Day Forecast
  </h2>

  <div class="weatherDayDisplayCards w-[100%] flex flex-row ">
    ${fiveDayCards}
</div>
</div>



        
    `;
  } catch (err) {
    console.error(err);
    displayArea.innerHTML = `<p class="status" style="color: red;">Failed to retrieve weather details.</p>`;
  }
}

function handleLocationError(error) {
  const displayArea = document.getElementById("weather-info");
  switch (error.code) {
    case error.PERMISSION_DENIED:
      displayArea.innerHTML = `<p class="status">Permission denied. Please allow location permissions to see local weather.</p>`;
      break;
    case error.POSITION_UNAVAILABLE:
      displayArea.innerHTML = `<p class="status">Location data unavailable.</p>`;
      break;
    case error.TIMEOUT:
      displayArea.innerHTML = `<p class="status">Location request timed out.</p>`;
      break;
    default:
      displayArea.innerHTML = `<p class="status">An unknown error occurred.</p>`;
  }
}



// main weather apllication

let searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", () => {
  mainWeatherApp();
});

function mainWeatherApp() {
  let city = document.getElementById("placeInput").value.trim();
  if (!city) {
    handleEmptyInputError();
    return;
  } else {
    fetchMainWeather(city);
  }
}

async function fetchMainWeather(city) {
  let displayArea = document.getElementById("weather-info");

  try {
    let APIKEY = "d64a001442b00d13200715ed7459ddb0";
    let weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKEY}`;

    let forecastApi = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKEY}`;

    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherApi),
      fetch(forecastApi),
    ]);
    if (weatherResponse.status === 404) {
      throw new Error("City not found");
    }

    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error("API request failed");
    }

    const data = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    let getPlace = data.name;
    let getCountry = data.sys.country;
    let iconCode = data.weather[0].icon;
    let iconPlaceUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
    let placeWeatherTemperature = Math.round(data.main.temp);
    let placeWeatherDescription = data.weather[0].description;

    let timestamp = data.dt;

    let date = new Date(timestamp * 1000);

    let formattedPlaceDateDay = date
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/,/g, "");

    let placeFeelsLike = Math.round(data.main.feels_like);
    let placeHumidity = data.main.humidity;
    let placeWindSpeedInKmh = (data.wind.speed * 3.6).toFixed(1);
    let placePressure = data.main.pressure;
    let placeVisibilityINKm = data.visibility / 1000;
    let placeSunrise = new Date(data.sys.sunrise * 1000)
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
    let placeSunset = new Date(data.sys.sunset * 1000)
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();

    let placeMaxTemp = Math.round(data.main.temp_max);
    let placeMinTemp = Math.round(data.main.temp_min);

    let hourlyCards = forecastData.list
      .slice(0, 8)
      .map((item) => {
        let time = new Date(item.dt * 1000).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        let temp = Math.round(item.main.temp);

        let description = item.weather[0].main;

        let iconCode = item.weather[0].icon;
        let iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        return `
  <div
    class="hourlyCards w-[11.875%] bg-slate-800 rounded-2xl ml-5 mt-5
           h-[195px] flex flex-col justify-around items-center"
  >
    <p class="text-white text-xl mt-4">
      ${time}
    </p>

    <img
      src="${iconUrl}"
      alt="${description}"
      class="w-16 h-16"
    />

    <div class="text-center mb-4">
      <h2 class="text-white text-2xl font-bold">
        ${temp}&deg;C
      </h2>

      <p class="text-gray-500">
        ${description}
      </p>
    </div>
  </div>
`;
      })
      .join("");

    let fiveDayForecast = forecastData.list.filter(
      (item, index) => index % 8 === 0,
    );
    let fiveDayCards = fiveDayForecast
      .slice(0, 5)
      .map((item) => {
        let day = new Date(item.dt * 1000).toLocaleDateString("en-US", {
          weekday: "short",
        });

        let temp = Math.round(item.main.temp);

        let description = item.weather[0].main;

        let iconCode = item.weather[0].icon;
        let iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        return `
       <div
      class="dayCards dayCard1 w-[20%] bg-slate-800 rounded-2xl mx-4 mt-5 h-[165px] flex flex-col items-center "
    >
        <p class="text-white text-xl mt-4">${day}</p>

        <img src="${iconUrl}" alt="${description}" class="w-16 h-16" />

        <h2 class="text-white text-2xl font-bold">
          ${temp}&deg;C
        </h2>

        <p class="text-gray-500">${description}</p>
      </div>
    `;
      })
      .join("");

    displayArea.innerHTML = `
    <!-- main tempature cards -->
      <div class="weatherMainDisplay flex gap-5 mx-5 my-7">
        <!-- Main Weather Card -->
        <div
          class="mainWeatherCard w-[32%] h-[330px] bg-slate-800 rounded-3xl p-6"
        >
          <div class="mainWeatherCardLocationDisplay flex justify-between">
            <div class="mainWeatherCardLocation flex flex-col">
              <div
                class="mainWeatherCardLocationName text-white text-4xl font-bold"
              >
                ${getPlace}
              </div>
              <div class="mainWeatherCardLocationCountry text-gray-500">${getCountry}</div>
            </div>
            <img class="mainWeatherCardPhoto text-2xl" src="${iconPlaceUrl}" alt="Weather-photo">
          </div>
          <div
            class="mainWeatherCardTemperatureDisplay flex flex-col gap-3 mt-6"
          >
            <h2 class="text-6xl font-bold text-white">${placeWeatherTemperature}&deg;C</h2>
            <p class="text-gray-300 text-3xl">${placeWeatherDescription}</p>
            <p class="text-gray-500">${formattedPlaceDateDay}</p>
            <p class="text-blue-600">Feels Like ${placeFeelsLike}&deg;C</p>
          </div>
        </div>

        <!-- Right Side Cards -->
        <div class="weatherCards w-[68%] grid grid-cols-4 gap-5">
          <!-- Humidity -->
          <div
            class="weatherCard weatherCardHumidity h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>💧</div>
            <p class="text-gray-400 mb-2">Humidity</p>
            <h2 class="text-white text-2xl font-bold">${placeHumidity}%</h2>
          </div>

          <!-- Wind Speed -->
          <div
            class="weatherCard weatherCardWind h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>🌬️</div>
            <p class="text-gray-400 mb-2">Wind Speed</p>
            <h2 class="text-white text-2xl font-bold">${placeWindSpeedInKmh} km/h</h2>
          </div>

          <!-- Pressure -->
          <div
            class="weatherCard weatherCardPressure h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>📊</div>
            <p class="text-gray-400 mb-2">Pressure</p>
            <h2 class="text-white text-2xl font-bold">${placePressure} hPa</h2>
          </div>

          <!-- Visibility -->
          <div
            class="weatherCard weatherCardVisibility h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>👁️</div>
            <p class="text-gray-400 mb-2">Visibility</p>
            <h2 class="text-white text-2xl font-bold">${placeVisibilityINKm} km</h2>
          </div>

          <!-- Sunrise -->
          <div
            class="weatherCard weatherCardSunrise h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>🌅</div>
            <p class="text-gray-400 mb-2">Sunrise</p>
            <h2 class="text-white text-2xl font-bold">${placeSunrise}</h2>
          </div>

          <!-- Sunset -->
          <div
            class="weatherCard weatherCardSunset h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>🌇</div>
            <p class="text-gray-400 mb-2">Sunset</p>
            <h2 class="text-white text-2xl font-bold">${placeSunset}</h2>
          </div>

          <!-- Maximum Temperature -->
          <div
            class="weatherCard weatherCardMaxTemp h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>🔥</div>
            <p class="text-gray-400 mb-2">Max Temperature</p>
            <h2 class="text-white text-2xl font-bold">${placeMaxTemp}&deg;C</h2>
          </div>

          <!-- Minimum Temperature -->
          <div
            class="weatherCard weatherCardMinTemp h-[155px] bg-slate-800 rounded-2xl pl-5 pt-5"
          >
            <div>❄️</div>
            <p class="text-gray-400 mb-2">Min Temperature</p>
            <h2 class="text-white text-2xl font-bold">${placeMinTemp}&deg;C</h2>
          </div>
        </div>
      </div>

      <div class="weatherHourlyDisplay mb-10">
        <h2
          class="weatherHourlyDisplayHeading text-white text-4xl font-bold ml-5"
        >
          Hourly Forecast
        </h2>

            <div class="weatherHourlyDisplayCards w-[95%] flex flex-row ">

  ${hourlyCards}
     </div>
     </div>

 <div class="weatherDayDisplay mb-10">
  <h2
    class="weatherDayDisplayHeading text-white text-4xl font-bold ml-5"
  >
    5 Day Forecast
  </h2>

  <div class="weatherDayDisplayCards w-[100%] flex flex-row ">
    ${fiveDayCards}
</div>
</div>



        
    `;
  } catch (err) {
    displayArea.innerHTML = `<p class="status flex justify-center text-red-600" style="color:red" >Failed to retrieve weather details.</p>`;
  }
}

function handleEmptyInputError() {
  const displayArea = document.getElementById("weather-info");
  displayArea.innerHTML = `<p class="text-red-600">Input Cant Be Empty.</p>`;
}
