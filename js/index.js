Vue.component('cityedit', { 
    props: ["city", "changing"],
    template: '<div><input v-model="textInput" @keyup.enter="save" /><button @click="save">OK</button></div>',
    data: function () {
        return {
          textInput: ''
        }
    },
    methods:{
        save(){
            changing = false;
            let text = this.textInput.charAt(0).toUpperCase() + this.textInput.slice(1);
            this.$emit('save', text);
        }
    }
});

var app = new Vue({
    el: '#app',
    data: {
      city: 'Омск',
      temperatures: '',
      temperature: '',
      icon: '',
      description: '',
      wind: {speed: '', direction: ''},
      pressure: '',
      humidity: '',
      rain_probability: 0,
      changing: false,
      degrees: false
    },
	methods:{
        myLocation: function() {
            navigator.geolocation.getCurrentPosition(function(location) {
                parseWeather(location);
            });
        },
		changeCity: function(){
            this.changing = true;
        },
        hideInput: function(textInput) {
            this.changing = false;
            if (textInput !== '') {
                this.city = textInput;
            }
        }
    },
    mounted() {
        document.onreadystatechange = () => { 
            if (document.readyState == "complete") { 
                parseWeather();
            } 
        }
    },
    watch: {
        degrees: function() {
            if (this.degrees) {
                this.temperature = Math.round(this.temperatures.fah);
            }
            else {
            this.temperature = Math.round(this.temperatures.cel);
            }
        },
        city: function(){
            parseWeather();
        }
    }
})

function parseWeather(location) {
    try {
        let api_key = "1ba27aad1c17616bf18ab356c9781184";
        var xmlHttp = new XMLHttpRequest();
        if (location) {
            var url = "http://api.openweathermap.org/data/2.5/weather?lat="+location.coords.latitude+
            "&lon="+location.coords.longitude+"&lang=ru&appid="+api_key;            
        }
        else {
            var url = "http://api.openweathermap.org/data/2.5/weather?q=" + app.city + "&lang=ru&appid=" + api_key;
        }
        
        xmlHttp.open("GET", url, true);
        xmlHttp.onload = function (e) {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 404) {
                    alert("Введите другой город");
                    return;
                }
                if (xmlHttp.status === 429) {
                    alert("Превышен лимит запросов к API");
                    return;
                }
                var response = JSON.parse(xmlHttp.responseText);
                if (location) {
                    app.city = response.name;
                    return;
                }
                app.temperatures = {"cel": response.main.temp - 273.15, "fah": (response.main.temp - 273.15) * 9/5 + 32};
                if (app.degrees) {
                    app.temperature = Math.round(app.temperatures.fah);
                }
                else {
                    app.temperature = Math.round(app.temperatures.cel);
                }
                app.icon = "images/" + response.weather[0].icon + ".png";
                app.description = response.weather[0].description.charAt(0).toUpperCase() + response.weather[0].description.slice(1);;
                app.pressure = response.main.pressure;
                app.humidity = response.main.humidity;

                app.wind.speed = response.wind.speed;
                if (response.wind.deg >= 337.5 || response.wind.deg <= 22.5) {
                    app.wind.direction = "северный";
                }
                else if (response.wind.deg > 22.5 && response.wind.deg < 67.5) {
                    app.wind.direction = "северо-восточный";
                }
                else if (response.wind.deg >= 67.5 && response.wind.deg <= 112.5) {
                    app.wind.direction = "восточный";
                }
                else if (response.wind.deg > 112.5 && response.wind.deg < 157.5) {
                    app.wind.direction = "юго-восточный";
                }
                else if (response.wind.deg >= 157.5 && response.wind.deg <= 202.5) {
                    app.wind.direction = "южный";
                }
                else if (response.wind.deg > 202.5 && response.wind.deg < 247.5) {
                    app.wind.direction = "юго-западный";
                }
                else if (response.wind.deg >= 247.5 && response.wind.deg <= 292.5) {
                    app.wind.direction = "западный";
                }
                else if (response.wind.deg > 292.5 && response.wind.deg <337.5 ) {
                    app.wind.direction = "северо-западный";
                }
            }
          };
        xmlHttp.send();
    } catch (error) {
        alert(error);
    }
}