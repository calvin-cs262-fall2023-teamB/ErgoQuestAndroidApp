global.presets = [
    {"id": 1, "name": "Preset 1", 
    "actuatorValues": [
        {"id": 1, "name": "back", "percent": 0}, 
        {"id": 2, "name": "legrest", "percent": 100},
        {"id": 3, "name": "seat", "percent": 100}
    ]}, 
    {"id": 2, "name": "Preset 2", 
    "actuatorValues": [
        {"id": 1, "name": "back", "percent": 50}, 
        {"id": 2, "name": "legrest", "percent": 50},
        {"id": 3, "name": "seat", "percent": 50}
    ]}
];
global.moves = [{"id": 1, "name": "back", "percent": 0}, {"id": 2, "name": "legrest", "percent": 0}, {"id": 3, "name": "seat", "percent": 0}];
global.times = [];
global.userData;
global.help = "Home"; // used to determine what to display in the help menu
global.moveReady = true;