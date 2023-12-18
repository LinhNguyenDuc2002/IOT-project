function addData(temp, hum, timestamp) {
    const dataRef = database.ref('data');
    dataRef.push({
        timestamp: timestamp,
        temperature: temp,
        humidity: hum
    }).then(() => {
        console.log('Dữ liệu đã được gửi thành công!');
    }).catch((error) => {
        console.error('Lỗi khi gửi dữ liệu:', error);
    });
}

function sendLed(gt) {
    alertRef.set({
        value: gt
    })
    .then(() => {
        console.log('Cảnh báo đèn thành công!');
    }).catch((error) => {
        console.error('Lỗi khi gửi dữ liệu:', error);
    });
}