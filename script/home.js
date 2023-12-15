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


const activityRef = database.ref('activity');
const dataRef = database.ref('data');
function convertToUnixTimestamp(dateString, timeString) {
    const dateTimeString = dateString + ' ' + timeString;
    const unixTimestamp = new Date(dateTimeString).getTime();
    return unixTimestamp;
}


function convertToVNTime(milliseconds) {
    const date = new Date(milliseconds);
    const options = {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    return date.toLocaleString('en-US', options);
}


let isCreated = false;
function filterData() {
    const table1 = document.getElementById('table1');
    const table2 = document.getElementById('table2');

    table1.innerHTML = '';
    table2.innerHTML = '';

    const date = $('#date').val();
    const start = $('#start').val();
    const end = $('#end').val();
    const history = $('#type').val();

    const startAt = convertToUnixTimestamp(date, start);
    const endAt = convertToUnixTimestamp(date, end);

    if(startAt > 0 && endAt > 0 && startAt < endAt) {
        if(history == 'sensor') {
            document.querySelector('.sensor-history').style.display = '';
            document.querySelector('.activity-history').style.display = 'none';

            dataRef.orderByChild('timestamp').startAt(startAt).endAt(endAt).once('value', function(snapshot) {
                var data = snapshot.val();
                var keys = Object.keys(data);
                let stt = 1;
    
                if(keys.length > 0) {
                    keys.forEach(item => {
                        var tempValue = data[item].temperature;
                        var humValue = data[item].humidity;
    
                        const row = table1.insertRow(); // Tạo một hàng mới
    
                        // Thêm các cột vào hàng
                        const cell1 = row.insertCell(0);
                        const cell2 = row.insertCell(1);
                        const cell3 = row.insertCell(2);
                        const cell4 = row.insertCell(3);
                        const cell5 = row.insertCell(4);
    
                        // Điền dữ liệu vào các cột
                        cell1.textContent = stt++;
                        cell2.textContent = convertToVNTime(data[item].timestamp);
                        cell3.textContent = tempValue;
                        cell4.textContent = humValue;
    
                        const icon = document.createElement('i');
                        icon.classList.add('fa-solid', 'fa-trash');
                        cell5.appendChild(icon);
    
                        icon.addEventListener('click', () => {
                            database.ref('data/' + item).remove()
                                .then(() => {
                                    console.log("Dữ liệu đã được xóa thành công.");
                                })
                                .catch((error) => {
                                    console.error("Lỗi khi xóa dữ liệu:", error);
                                });
                            row.remove();
                            filterData();
                        });
    
                        if(tempValue > maxTemp || humValue > maxHum || tempValue < minTemp || humValue < minHum) {
                            row.style.color = 'red';
                        }
                        else {
                            row.style.color = 'blue';
                        }
                    });
                }
            });
        }
        else {
            document.querySelector('.activity-history').style.display = '';
            document.querySelector('.sensor-history').style.display = 'none';

            activityRef.orderByChild('timestamp').startAt(startAt).endAt(endAt).once('value', function(snapshot) {
                var data = snapshot.val();
                var keys = Object.keys(data);
                let stt = 1;
                console.log(data)
                if(keys.length > 0) {
                    keys.forEach(item => {
                        var info = data[item].severity;
                        var message = data[item].message;
    
                        const row = table2.insertRow();
    
                        // Thêm các cột vào hàng
                        const cell1 = row.insertCell(0);
                        const cell2 = row.insertCell(1);
                        const cell3 = row.insertCell(2);
                        const cell4 = row.insertCell(3);
                        const cell5 = row.insertCell(4);
    
                        // Điền dữ liệu vào các cột
                        cell1.textContent = stt++;
                        cell2.textContent = convertToVNTime(data[item].timestamp);
                        cell3.textContent = info;
                        cell4.textContent = message;
    
                        const icon = document.createElement('i');
                        icon.classList.add('fa-solid', 'fa-trash');
                        cell5.appendChild(icon);
    
                        icon.addEventListener('click', () => {
                            database.ref('activity/' + item).remove()
                                .then(() => {
                                    console.log("Dữ liệu đã được xóa thành công.");
                                })
                                .catch((error) => {
                                    console.error("Lỗi khi xóa dữ liệu:", error);
                                });
                            row.remove();
                            filterData();
                        });
                        console.log(info, message);
                        if(info == 'INFO') {
                            row.style.color = 'green';
                        }
                        else {
                            row.style.color = 'red';
                        }
                    });
                }
            });
        }
    }
    else {
        if(!isCreated) {
            const alert = document.createElement('p');
            alert.textContent = '*** No data ***';
            alert.classList.add('nodata');

            const divElement = document.querySelector('.container');
            divElement.appendChild(alert);

            isCreated = true;
        }
    }
}

