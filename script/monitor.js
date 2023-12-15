// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAaf9sSo_f3s8WW9Hidi2TuPHA5LaS0-2Q",
    authDomain: "iot-g36.firebaseapp.com",
    databaseURL: "https://iot-g36-default-rtdb.firebaseio.com",
    projectId: "iot-g36",
    storageBucket: "iot-g36.appspot.com",
    messagingSenderId: "878504662034",
    appId: "1:878504662034:web:5bf44d2e9e0f9afc52f4cb",
    measurementId: "G-T80ZNP0N5D"
};
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();


// Get current plan
var plantValue;
let minTemp = 0;
let maxTemp = 0;
let minHum = 0;
let maxHum = 0;

const currentRef = database.ref('current_plant');
currentRef.once('value', async function(snapshot) {
    if (snapshot.exists()) {
        var dataPlant = await snapshot.val();
        plantValue = dataPlant.name;

        const data = await updateInfo();
        minTemp = data.min_temp;
        maxTemp = data.max_temp;
        minHum = data.min_env_humid;
        maxHum = data.max_env_humid;

        console.log("Dữ liệu có sẵn:", plantValue);
    } else {
        console.log("Không có dữ liệu từ snapshot");
    }
});


// Control brightness
const brightRef = database.ref('brightness');
const brightnessRange = document.getElementById('brightness');
const brightnessValue = document.getElementById('brightnessValue');
brightnessRange.addEventListener('input', function() {
    var gt = brightnessRange.value;

    brightRef.set({
        value: gt.toString()
    })
    .then(() => {
        console.log('Kích hoạt hệ thống phun sương thành công!');
    }).catch((error) => {
        console.error('Lỗi khi gửi dữ liệu:', error);
    });

    brightnessValue.textContent = gt;
});


// Control turn on/off steam
let checkBtn = true;
var button = document.querySelector('.phun-btn');
var steam = document.querySelector('.steam');
const steamRef = database.ref('steam');
steamRef.on('value', (snapshot) => {
    const data = snapshot.val();
    var x = parseInt(data.value);
    if(x == 1) {
        checkBtn = false;

        button.classList.remove("stop");
        button.classList.add("phun");
        steam.style.display = "flex";
    }
    else {
        checkBtn = true;

        button.classList.remove("phun");
        button.classList.add("stop");
        steam.style.display = "none";
    }
});


button.addEventListener("click", function(){
    if(checkBtn) {
        button.classList.remove("stop");
        button.classList.add("phun");
        steam.style.display = "flex";

        steamRef.set({
            value: "1"
        })
        .then(() => {
            console.log('Kích hoạt hệ thống phun sương thành công!');
        }).catch((error) => {
            console.error('Lỗi khi gửi dữ liệu:', error);
        });
    }
    else {
        button.classList.remove("phun");
        button.classList.add("stop");
        steam.style.display = "none";

        steamRef.set({
            value: "0"
        })
        .then(() => {
            console.log('Dừng hệ thống phun sương thành công!');
        }).catch((error) => {
            console.error('Lỗi khi gửi dữ liệu:', error);
        });
    }
});


// Show chart
var ctx1 = document.getElementById('temperatureChart').getContext('2d');
var temperatureChart = new Chart(ctx1, {
    type: 'pie',
    data: {
        labels: ['', 'Temperature'],
        datasets: [{
            data: [],
            backgroundColor: ['darkgrey', 'orangered'],
            hoverBackgroundColor: ['darkgrey', 'orangered']
        }]
    },
    options: {
        cutout: 70,
        radius: 100
    }
});

var ctx2 = document.getElementById('humidityChart').getContext('2d');
var humidityChart = new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: ['', 'Humidity'],
        datasets: [{
            data: [],
            backgroundColor: ['darkgrey', 'blue'],
            hoverBackgroundColor: ['darkgrey', 'blue']
        }]
    },
    options: {
        cutout: 70,
        radius: 100
    }
});

var ctx = document.getElementById('myLineChart').getContext('2d');
var myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Temperature',
                data: [],
                yAxisID: 'y-axis-1', // Đặt ID của trục y cho cột y bên trái
                borderColor: 'orangered',
                borderWidth: 2,
                fill: false,
                pointStyle: 'line'
            },
            {
                label: 'Humidity',
                data: [],
                yAxisID: 'y-axis-2', // Đặt ID của trục y cho cột y bên phải
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
                pointStyle: 'line'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: [
                {
                    display: true,
                    position: 'left',
                    id: 'y-axis-1'
                },
                {
                    display: true,
                    position: 'right',
                    id: 'y-axis-2'
                }
            ]
        }
    }
});


const sensorRef = database.ref('sensor');
sensorRef.on('value', async (snapshot) => {
    const data = snapshot.val();

    var temperature = document.querySelector('.temp');
    var tempValue = document.querySelector(".temperatureValue");

    var humidity = document.querySelector('.hum');
    var humValue = document.querySelector(".humidityValue");

    var error = document.querySelector('.message');

    const temp = data.temperature;
    const hum = data.humidity;
    const timestamp = Date.now();

    addData(temp, hum, timestamp);

    tempValue.innerHTML = temp + " °C";
    humValue.innerHTML = hum + " %";

    var check = true;
    console.log(maxTemp)
    if (temp > maxTemp || temp < minTemp) {
        temperature.style.border = "2px solid red";
        error.style.display = "flex";
        check = false;
    }
    if(hum > maxHum || hum < minHum) {
        humidity.style.border = "2px solid red";
        error.style.display = "flex";
        check = false;
    }

    if(check) {
        temperature.style.border = "2px solid white";
        humidity.style.border = "2px solid white";
        error.style.display = "none";
    }

    updatePieChart(temp, hum);
    updateLineChart();
});


// Update 2 pie charts
function updatePieChart (temp, hum) {
    temperatureChart.data.datasets[0].data = [100-temp, temp];
    temperatureChart.update();

    humidityChart.data.datasets[0].data = [100-hum, hum];
    humidityChart.update();
}


function convertToVNTime(milliseconds) {
    const date = new Date(milliseconds); // Tạo đối tượng Date từ milliseconds
    const options = {
      timeZone: 'Asia/Ho_Chi_Minh', // Chọn múi giờ Việt Nam
      hour12: false, // Sử dụng định dạng 24 giờ
      hour: 'numeric',
      minute: 'numeric'
    };
    return date.toLocaleString('en-US', options); // Chuyển đổi thành định dạng giờ:phút của VN
}


function updateLineChart() {
    var currentTime = new Date().getTime();

    let averageTemperature = 0;
    let averageHumidity = 0;

    database.ref('data').orderByChild('timestamp').startAt(currentTime-3600000).endAt(currentTime).once('value', function(snapshot) {
        var data = snapshot.val();
        var keys = Object.keys(data);

        var index = keys.length-1;
        var hum = data[keys[index]].humidity;
        var temp = data[keys[index]].temperature;
        var timestamp = data[keys[index]].timestamp;

        var len = myLineChart.data.labels.length;
        if(len == 0) {
            for(let i = (keys.length > 20)?(keys.length - 20):0; i<keys.length-1; i++) {
                myLineChart.data.labels.push(convertToVNTime(data[keys[i]].timestamp));
                myLineChart.data.datasets[1].data.push(data[keys[i]].humidity);
                myLineChart.data.datasets[0].data.push(data[keys[i]].temperature);
            }
        }

        if(temp != myLineChart.data.datasets[0].data[len-1] || hum != myLineChart.data.datasets[1].data[len-1]) {
            myLineChart.data.labels.push(convertToVNTime(currentTime));
            myLineChart.data.datasets[1].data.push(hum);
            myLineChart.data.datasets[0].data.push(temp);
        }   

        if(len > 20) {
            myLineChart.data.labels.shift();
            myLineChart.data.datasets[0].data.shift();
            myLineChart.data.datasets[1].data.shift();
        }

        // Cập nhật biểu đồ
        myLineChart.update();

        for(let i = 0; i<keys.length-1; i++) {
            let previous = data[keys[i]].timestamp;
            let after = data[keys[i+1]].timestamp;
            averageTemperature += data[keys[i]].temperature * (after-previous);
            averageHumidity += data[keys[i]].humidity * (after-previous);
        }

        document.querySelector(".tempValue").innerHTML = (averageTemperature/(currentTime-data[keys[0]].timestamp)).toFixed(2) + " °C / 1h";
        document.querySelector(".humValue").innerHTML = (averageHumidity/(currentTime-data[keys[0]].timestamp)).toFixed(2) + " % / 1h";
    });
}

setInterval(updateLineChart, 500);
