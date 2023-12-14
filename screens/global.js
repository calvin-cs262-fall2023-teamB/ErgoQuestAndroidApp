global.presets = [
    {"id": 1, "name": "Sitting",
    "actuatorValues": [
        {"id": 1, "name": "Back", "percent": 100},
        {"id": 2, "name": "Leg rest", "percent": 0},
        {"id": 3, "name": "Seat", "percent": 0}
    ]},
    {"id": 2, "name": "Flat",
    "actuatorValues": [
        {"id": 1, "name": "Back", "percent": 0},
        {"id": 2, "name": "Leg rest", "percent": 100},
        {"id": 3, "name": "Seat", "percent": 0}
    ]},
    {"id": 3, "name": "FOLD THEM !!!",
    "actuatorValues": [
        {"id": 1, "name": "Back", "percent": 100},
        {"id": 2, "name": "Leg rest", "percent": 100},
        {"id": 3, "name": "Seat", "percent": 100}
    ]},
    {"id": 4, "name": "Favorite",
    "actuatorValues": [
        {"id": 1, "name": "Back", "percent": 50},
        {"id": 2, "name": "Leg rest", "percent": 35},
        {"id": 3, "name": "Seat", "percent": 50}
    ]},
    {"id": 5, "name": "DUMP THEM !!!",
    "actuatorValues": [
        {"id": 1, "name": "Back", "percent": 0},
        {"id": 2, "name": "Leg Rest", "percent": 100},
        {"id": 3, "name": "Seat", "percent": 100}
    ]},
];
global.moves = [{"id": 1, "name": "Back", "percent": 0}, {"id": 2, "name": "Leg rest", "percent": 0}, {"id": 3, "name": "Seat", "percent": 0}];
global.times = [{"presetID": 1, "time": 1},{"presetID": 2, "time": 1},{"presetID": 3, "time": 1},{"presetID": 4, "time": 5}];
global.userData;
global.help = "Home"; // used to determine what to display in the help menu
global.moveReady = true;