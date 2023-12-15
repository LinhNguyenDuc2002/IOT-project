async function updateInfo() {
    var key = plantValue.toLowerCase().replace(/\s+/g, '%20');

    const url = 'https://open.plantbook.io/api/v1/plant/detail/' + key;
    const token = '924e7bb02dadb8b57741f7c2eb5a5aea915cad13';

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`
        }
    });

    return response.json();
}