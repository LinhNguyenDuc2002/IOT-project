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