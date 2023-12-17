var selectElement = document.querySelector(".plants");
var minTemp = 0;
var maxTemp = 0;
var minHum = 0;
var maxHum = 0;
var plantValue;


const currentRef = database.ref('current_plant');
const planRef = database.ref('plant');
const emailRef = database.ref("email");

planRef.once('value', function(snapshot) {
    var data = snapshot.val();
    var keys = Object.keys(data);

    keys.forEach(function(key) {
        var option = document.createElement("option");
        option.text = data[key].custome_name + " - " + data[key].science_name;
        option.value = data[key].science_name;

        selectElement.appendChild(option);
    });
    
    selectElement.value = plantValue;
    getCurrentPlant();
    getCurrentEmail();
});

function getCurrentPlant() {
    currentRef.once('value', async function(snapshot) {
        if (snapshot.exists()) {
            var dataPlant = snapshot.val();
            plantValue = dataPlant.name;
            
            document.querySelector('.message').textContent = 'The ' + plantValue + ' room monitoring system has been turned on!'
            selectElement.value = plantValue;

            const data = await updateInfo();
            minTemp = data.min_temp;
            maxTemp = data.max_temp;
            minHum = data.min_env_humid;
            maxHum = data.max_env_humid;

            var plantImages = document.querySelectorAll(".plant-img");
            plantImages.forEach(function(img) {
                img.src = data.image_url;
            });

            document.querySelector('.light-mmol').textContent = data.min_light_mmol + " - " + data.max_light_mmol;
            document.querySelector('.light-lux').textContent = data.min_light_lux + " - " + data.max_light_lux;
            document.querySelector('.temp').textContent = minTemp + " - " + maxTemp;
            document.querySelector('.hum').textContent = minHum + " - " + maxHum;
            document.querySelector('.soil').textContent = data.min_soil_moist + " - " + data.max_soil_moist;
            document.querySelector('.soil-ec').textContent = data.min_soil_ec + " - " + data.max_soil_ec;

            console.log("Dữ liệu có sẵn:", plantValue);
        } else {
            console.log("Không có dữ liệu từ snapshot");
        }
    });
}

function getCurrentEmail() {
    emailRef.once('value', async function(snapshot) {
        if (snapshot.exists()) {
            var email = snapshot.val().address;
            
            document.querySelector('.email').value = email;
            console.log("Dữ liệu có sẵn:", email);
        } else {
            console.log("Không có dữ liệu từ snapshot");
        }
    });
}

function sendAlertEmail() {
    const nodemailer = require('nodemailer');

    // let transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'linhlinhlinh16042002@gmail.com',
    //         pass: 'your_password'
    //     }
    // });

    // // Thiết lập các thông tin email
    // let mailOptions = {
    //     from: 'your_email@gmail.com', // Địa chỉ email người gửi
    //     to: 'recipient_email@example.com', // Địa chỉ email người nhận
    //     subject: 'Subject of the Email', // Tiêu đề email
    //     text: 'Content of the Email' // Nội dung email
    // };

    // // Gửi email
    // transporter.sendMail(mailOptions, function(error, info){
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });
}


var button = document.querySelector(".find");
button.addEventListener("click", function() {
    var current = selectElement.value;
    currentRef.set({
        name: current
    })
    .then(() => {
        console.log('Thiết lập hệ thống trồng cây thành công!');
        addLog(new Date().getTime(), 'INFO', 'The system has established the ' + current + ' tree!');

        var box = document.querySelector('.confirm-plant');
        if (box) {
            box.style.display = 'flex';
            setTimeout(function() {
                box.style.display = 'none';
            }, 3000);
        }
    }).catch((error) => {
        console.error('Lỗi khi gửi dữ liệu:', error);
    });

    // sendAlertEmail();
    getCurrentPlant();
});

var button = document.querySelector(".set-email");
button.addEventListener("click", function() {
    var x = document.querySelector('.email').value;
    emailRef.set({
        address: x
    })
    .then(() => {
        console.log('Cập nhật mail thành công!');
        addLog(new Date().getTime(), 'INFO', 'Changed notification email address to ' + x + '!');

        var box = document.querySelector('.confirm-email');
        if (box) {
            box.style.display = 'flex';
            setTimeout(function() {
                box.style.display = 'none';
            }, 3000);
        }
    }).catch((error) => {
        console.error('Lỗi khi gửi dữ liệu:', error);
    });

    getCurrentEmail();
});

const sensorRef = database.ref('sensor');
sensorRef.on('value', async (snapshot) => {
    const dataPlant = await snapshot.val();

    const tempData = dataPlant.temperature;
    const humData = dataPlant.humidity;
    const timestamp = Date.now();

    addData(tempData, humData, timestamp);

    var parent = document.querySelector(".result");
    var icon = document.createElement("i");
    var paragraph = document.createElement("p");
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }

    document.querySelector('.tempValue').textContent = tempData + " °C";
    document.querySelector('.humValue').textContent = humData + " %";

    if(minHum != 0 && maxHum != 0 && minTemp != 0 && maxTemp != 0) {
        if(tempData >= minTemp && tempData <= maxTemp && humData >= minHum && humData <= maxHum) {
            icon.className = "fa-solid fa-check";
            paragraph.textContent = "Good environment";
            parent.style.color = 'green';
        }
        else if(tempData >= maxTemp*1.1 || tempData <= minTemp*0.9 || 
                humData >= maxHum*1.1 || humData <= minHum*0.9) {
            icon.className = "fa-solid fa-circle-exclamation";
            paragraph.textContent = "Bad environment";
            parent.style.color = 'red';

            addLog(new Date().getTime(), 'WARN', 'Environmental conditions are not good!');

            // sendAlertEmail();
        }
        else {
            icon.className = "fa-solid fa-thumbs-up";
            paragraph.textContent = "Medium environment";
            parent.style.color = 'orange';
        }
    }

    parent.appendChild(icon);
    parent.appendChild(paragraph);
});
