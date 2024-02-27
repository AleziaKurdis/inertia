//
//  ACspreader.js
//
//  Created by Alezia Kurdis, February 26th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Spread 3d models all around.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
print("SPREADER: start running.");
var ROOT = Script.resolvePath('').split("ACspreader.js")[0];
var thisEntity;

var updateTimerInterval = 200000; // 200 sec (3 minutes 20 sec)
var processTimer = 0;


var generatorPosition;
var generatorRadius;
var generatorScaleMin = 1;
var generatorScaleMax = 1;

var models = [
    {"modelFile": "BOMB.fbx", "dimensions": {"x": 0.1763, "y": 0.3359, "z": 0.1763}},
    {"modelFile": "CHAKRAM.fbx", "dimensions": {"x": 0.2870, "y": 0.0091, "z": 0.2854}},
    {"modelFile": "DICE.fbx", "dimensions": {"x": 0.2002, "y": 0.2002, "z": 0.2002}},
    {"modelFile": "GEAR.fbx", "dimensions": {"x": 0.3032, "y": 0.1983, "z": 0.3032}},
    {"modelFile": "HOLOCRON.fbx", "dimensions": {"x": 0.2905, "y": 0.2367, "z": 0.2516}},
    {"modelFile": "SPICKY.fbx", "dimensions": {"x": 0.3024, "y": 0.3235, "z": 0.3185}}
];

function initiate() {
    
    // Example of url: https://aleziakurdis.github.io/inertia/spreader/ACspreader.js?px=7&py=4&pz=-24&radius=30&scaleMin=1&scaleMax=1
    
    var px = findGetParameter("px");
    if (px === null) {
        print("SPREADER: no 'px' parameter provided. (position x)");
        return;
    }
    var py = findGetParameter("py");
    if (py === null) {
        print("SPREADER: no 'py' parameter provided. (position y)");
        return;
    }    
    var pz = findGetParameter("pz");
    if (pz === null) {
        print("SPREADER: no 'pz' parameter provided. (position z)");
        return;
    }    
    generatorPosition = {"x": parseFloat(px), "y": parseFloat(py), "z": parseFloat(pz)};
    
    var radius = findGetParameter("radius");
    if (radius === null) {
        generatorRadius = 30; //meters
    } else {
        generatorRadius = parseFloat(radius);
    }
    
    var scaleMin = findGetParameter("scaleMin");
    if (scaleMin === null) {
        generatorScaleMin = 1;
    } else {
        generatorScaleMin = parseFloat(scaleMin);
    }

    var scaleMax = findGetParameter("scaleMax");
    if (scaleMax === null) {
        generatorScaleMax = 1;
    } else {
        generatorScaleMax = parseFloat(scaleMax);
    }    

    var today = new Date();
    processTimer = today.getTime();
    Script.update.connect(myTimer);
}

function myTimer(deltaTime) {
    var today = new Date();
    if ((today.getTime() - processTimer) > updateTimerInterval ) {
        print("SPREADER: Calling SPREAD.");
        spread();

        updateTimerInterval = (180 + Math.floor(Math.random() * 300)) * 1000;
        print("SPREADER: Next spread in " + (updateTimerInterval/1000) + " secondes.");
        today = new Date();
        processTimer = today.getTime();
    }  
}   

function spread() {
    let i, id, nType, scaleFactor;
    let visibilityZoneID = Entities.addEntity({
        "name": "!!!%%%SPREADER%%%!!!",
        "type": "Zone",
        "shapeType": "sphere",
        "dimensions": {"x": generatorRadius * 2, "y": generatorRadius * 2, "z": generatorRadius * 2},
        "position": generatorPosition,
        "lifetime": 180,
        "grab": {
            "grabbable": false
        }
    },"domain");
    
    let nbrType = Math.floor(Math.random() * models.length);
    let nbrItem = Math.floor(Math.random() * (models.length * 10)) + 10;
    let electedModels = shuffleArray(models);
    for (i = 0; i < nbrItem; i++) {
        scaleFactor = Math.random() * (generatorScaleMax - generatorScaleMin) + generatorScaleMin;
        nType = Math.floor(Math.random() * (nbrType + 1));
        id = Entities.addEntity({
            "name": "Spreader Item " + i,
            "lifetime": Math.floor(Math.random() * 70) + 100,
            "type": "Model",
            "renderWithZone": [visibilityZoneID],
            "modelURL": ROOT + "models/" + electedModels[nType].modelFile,
            "dimensions": Vec3.multiply( electedModels[nType].dimensions, scaleFactor ),
            "shapeType": "simple-hull",
            "useOriginalPivot": false,
            "position": Vec3.sum( generatorPosition,{"x": (Math.random() * 0.2) - 0.1, "y": (Math.random() * 0.2) - 0.1, "z": (Math.random() * 0.2) - 0.1}),
            "grab": {
                "grabbable": true
            },
            "density":1000,
            "velocity":{ "x": 0, "y": 0, "z": 0 },
            "angularVelocity":{ "x": 0, "y": 0, "z": 0 },
            "gravity":{ "x": 0, "y": 0, "z": 0 },
            "damping":0,
            "angularDamping":0,
            "restitution":0.5,
            "friction":0.5,
            "collisionless":false,
            "ignoreForCollisions":false,
            "collisionMask":31,
            "collidesWith":"static,dynamic,kinematic,myAvatar,otherAvatar,",
            "dynamic": true
        },"domain");
    }
}

function shuffleArray(arr) {
  let shuffledArr = arr.slice();
  for (let i = shuffledArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
  }
  return shuffledArr;
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var parameters = Script.resolvePath('').split("?")[1];
    if (parameters === undefined) {return null;}
    var items = parameters.split("&"); 
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

Script.scriptEnding.connect(function () {

    Script.update.disconnect(myTimer);
});

initiate();
print("SPREADER: End running.");
