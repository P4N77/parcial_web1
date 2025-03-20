document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "9d693f8c-05d6-11f0-a906-0242ac130003-9d694040-05d6-11f0-a906-0242ac130003"; 
    const inputCity = document.getElementById("city");
    const inputCountry = document.getElementById("country");
    const submitBtn = document.getElementById("fetchWeather");
    const locationInfo = document.getElementById("locationInfo");

    async function fetchWeatherData(lat, lng) {
        const url = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=airTemperature,humidity,cloudCover,windSpeed,pressure,precipitation,waterTemperature&source=noaa`;

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': apiKey }
            });
            const data = await response.json();

            if (data.hours.length > 0) {
                updateUI(data, lat, lng);
            } else {
                alert("No se encontraron datos para esta ubicación.");
            }
        } catch (error) {
            console.error("Error obteniendo los datos: ", error);
        }
    }

    async function getCoordinates(city, country) {
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${city},${country}`;

        try {
            const response = await fetch(geoUrl);
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                fetchWeatherData(lat, lon);
                locationInfo.innerHTML = `
                    <p><strong>Ubicación:</strong> ${display_name}</p>
                    <div id="map"></div> <!-- Mapa se genera aquí -->
                `;
                loadCountryMap(country);
            } else {
                alert("Ubicación no encontrada.");
            }
        } catch (error) {
            console.error("Error obteniendo coordenadas: ", error);
        }
    }

    function updateUI(data, lat, lng) {
        const weather = data.hours[0];

        const elements = [
            { selector: ".div1 .content", icon: "🌡️", label: "Temperatura", value: `${weather.airTemperature.noaa}°C` },
            { selector: ".div3 .content", icon: "💧", label: "Humedad", value: `${weather.humidity.noaa}%` },
            { selector: ".div4 .content", icon: "☁️", label: "Cobertura Nubosa", value: `${weather.cloudCover.noaa}%` },
            { selector: ".div5 .content", icon: "💨", label: "Viento", value: `${weather.windSpeed.noaa} m/s` },
            { selector: ".div6 .content", icon: "🌡️", label: "Temp. Agua", value: `${weather.waterTemperature?.noaa || "N/A"}°C` },
            { selector: ".div7 .content", icon: "🌧️", label: "Precipitación", value: `${weather.precipitation?.noaa || "0"} mm` },
            { selector: ".div8 .content", icon: "🌍", label: "Presión", value: `${weather.pressure.noaa} hPa` }
        ];

        elements.forEach(({ selector, icon, label, value }) => {
            document.querySelector(selector).innerHTML = `
                <div class="icon">${icon}</div>
                <div class="label">${label}</div>
                <div class="value">${value}</div>
            `;
        });
    
        locationInfo.innerHTML += `
            <p><strong>Coordenadas:</strong> ${lat}, ${lng}</p>
            <p><strong>Última actualización:</strong> ${new Date(weather.time).toLocaleString()}</p>
        `;
    
        loadMap(lat, lng); // Llamar a la función para cargar el mapa
    }

    async function loadCountryMap(country) {
        const countryUrl = `https://restcountries.com/v3.1/name/${country}?fullText=true`;
    
        try {
            const response = await fetch(countryUrl, { mode: "cors" }); // Agregar mode: "cors"
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Datos del país:", data);
        } catch (error) {
            console.error("Error al obtener datos del país:", error);
        }
    }

    function loadMap(lat, lon) {
        // Vaciar el div del mapa por si ya existe un mapa previo
        document.getElementById("map").innerHTML = "";
    
        // Crear un nuevo mapa
        const map = L.map("map").setView([lat, lon], 4);
    
        // Agregar capa de mapa base desde OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    
        // Agregar un marcador en la ubicación
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>Ubicación</b><br>Lat: ${lat}, Lon: ${lon}`)
            .openPopup();
    }

    submitBtn.addEventListener("click", () => {
        const city = inputCity.value.trim();
        const country = inputCountry.value.trim();

        if (city && country) {
            getCoordinates(city, country);
        } else {
            alert("Por favor, ingrese una ciudad y un país.");
        }
    });
});