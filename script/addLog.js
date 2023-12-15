function addLog(timestamp, severity, message) {
    activityRef.push({
        timestamp: timestamp,
        severity: severity,
        message: message
    })
    .then(() => {
        console.log('Cập nhật mail thành công!');
    }).catch((error) => {
        console.error('Lỗi khi gửi dữ liệu:', error);
    });
}