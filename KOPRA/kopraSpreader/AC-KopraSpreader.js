//
//  AC-KopraSpreader.js
//
//  Created by Alezia Kurdis, March 21st, 2024.
//  Copyright 2024, Overte e.V.
//
//  Spread 3d models all around.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
print("KOPRA-SPREADER: start running.");
let ROOT = Script.resolvePath('').split("AC-KopraSpreader.js")[0];
let thisEntity;

const MAX_NBR_ITEMS = 60;

let updateTimerInterval = 2000; // 2 sec
let processTimer = 0;

let visibilityZoneIds = [];
let itemCounter = 0;

let generatorPosition;
let generatorRadius;
let generatorScaleMin = 1;
let generatorScaleMax = 1;

let models = [
    {"modelFile": "BOMB.fbx", "dimensions": {"x": 0.1763, "y": 0.3359, "z": 0.1763}},
    {"modelFile": "CHAKRAM.fbx", "dimensions": {"x": 0.2870, "y": 0.0091, "z": 0.2854}},
    {"modelFile": "DICE.fbx", "dimensions": {"x": 0.2002, "y": 0.2002, "z": 0.2002}},
    {"modelFile": "GEAR.fbx", "dimensions": {"x": 0.3032, "y": 0.1983, "z": 0.3032}},
    {"modelFile": "HOLOCRON.fbx", "dimensions": {"x": 0.2905, "y": 0.2367, "z": 0.2516}},
    {"modelFile": "SPICKY.fbx", "dimensions": {"x": 0.3024, "y": 0.3235, "z": 0.3185}},
    {"modelFile": "TRIAXE.glb", "dimensions": {"x": 0.3096, "y": 0.3096, "z": 0.3096}},
    {"modelFile": "OPHANIM.glb", "dimensions": {"x": 0.3015, "y": 0.2857, "z": 0.3015}}
];

function initiate() {
    
    // Example of url: https://aleziakurdis.github.io/inertia/KOPRA/kopraSpreader/AC-KopraSpreader.js?px=4000&py=4000&pz=4000&radius=1500&scaleMin=100&scaleMax=300
    
    let px = findGetParameter("px");
    if (px === null) {
        print("KOPRA-SPREADER: no 'px' parameter provided. (position x)");
        return;
    }
    let py = findGetParameter("py");
    if (py === null) {
        print("KOPRA-SPREADER: no 'py' parameter provided. (position y)");
        return;
    }    
    let pz = findGetParameter("pz");
    if (pz === null) {
        print("KOPRA-SPREADER: no 'pz' parameter provided. (position z)");
        return;
    }    
    generatorPosition = {"x": parseFloat(px), "y": parseFloat(py), "z": parseFloat(pz)};
    
    let radius = findGetParameter("radius");
    if (radius === null) {
        generatorRadius = 30; //meters
    } else {
        generatorRadius = parseFloat(radius);
    }
    
    let scaleMin = findGetParameter("scaleMin");
    if (scaleMin === null) {
        generatorScaleMin = 1;
    } else {
        generatorScaleMin = parseFloat(scaleMin);
    }

    let scaleMax = findGetParameter("scaleMax");
    if (scaleMax === null) {
        generatorScaleMax = 1;
    } else {
        generatorScaleMax = parseFloat(scaleMax);
    }    

    visibilityZoneIds = Entities.findEntitiesByName( "KOPRA_VISIBILITY_ZONE", generatorPosition, 10);
    
    let today = new Date();
    processTimer = today.getTime();
    Script.update.connect(myTimer);
}

function myTimer(deltaTime) {
    let today = new Date();
    if ((today.getTime() - processTimer) > updateTimerInterval ) {

        spread();

        today = new Date();
        processTimer = today.getTime();
    }  
}   

function spread() {
    if (!AvatarList.isAvatarInRange( generatorPosition, generatorRadius )) {
        return;
    }
    itemCounter = itemCounter + 1;

    let nType = Math.floor(Math.random() * models.length);
    let scaleFactor = Math.random() * (generatorScaleMax - generatorScaleMin) + generatorScaleMin;
    let duration = updateTimerInterval * MAX_NBR_ITEMS;
    let id = Entities.addEntity({
        "name": "Spreaded Item " + itemCounter,
        "lifetime": duration,
        "type": "Model",
        "renderWithZone": visibilityZoneIds,
        "modelURL": ROOT + "models/" + models[nType].modelFile,
        "dimensions": Vec3.multiply( models[nType].dimensions, scaleFactor ),
        "shapeType": "simple-hull",
        "useOriginalPivot": false,
        "position": generatorPosition,
        "grab": {
            "grabbable": true
        },
        "density":1000,
        "velocity": Vec3.multiply({ "x": (Math.random() * 3) - 1.5, "y": (Math.random() * 3) - 1.5, "z": (Math.random() * 3) - 1.5 }, scaleFactor),
        "angularVelocity":{ "x": (Math.random() * (Math.PI/2)) - (Math.PI/4), "y": (Math.random() * (Math.PI/2)) - (Math.PI/4), "z": (Math.random() * (Math.PI/2)) - (Math.PI/4) },
        "gravity":{ "x": 0, "y": 0, "z": 0 },
        "damping":0,
        "angularDamping":0,
        "restitution":0.99,
        "friction":0.1,
        "collisionless":false,
        "ignoreForCollisions":false,
        "collisionMask":31,
        "collidesWith":"static,dynamic,kinematic,myAvatar,otherAvatar,",
        "dynamic": true
    },"domain");

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
    let result = null,
        tmp = [];
    let parameters = Script.resolvePath('').split("?")[1];
    if (parameters === undefined) {return null;}
    let items = parameters.split("&");
    let index;
    for (index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

Script.scriptEnding.connect(function () {
    Script.update.disconnect(myTimer);
    print("KOPRA-SPREADER: End running.");
});

initiate();

