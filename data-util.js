var fs = require('fs');

function restoreOriginalData() {
    fs.writeFileSync('data.json', fs.readFileSync('data_original.json'));
}

function loadData() {
    return JSON.parse(fs.readFileSync('data.json'));
}

function saveData(data) {
    var obj = {
        discourse: data
    };

    fs.writeFileSync('data.json', JSON.stringify(obj));
}

module.exports = {
    restoreOriginalData: restoreOriginalData,
    loadData: loadData,
    saveData: saveData
}
