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

const MAX_NBR_ITEMS = 40;
const MAX_ITEM_SIZE = 6; //6m of diameter
const MAX_SPEED = 15; // in m/s

let updateTimerInterval = 1000; // 1 sec
let processTimer = 0;

let visibilityZoneIds = [];

let generatorPosition;
let generatorRadius;

let bolides = [];
let currentBolides = 0;

function initiate() {
    
    // Example of url: https://aleziakurdis.github.io/inertia/KOPRA/kopraSpreader/AC-KopraSpreader.js?px=-4000&py=-2900&pz=-4000&radius=4000
    
    let i;
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
    
    visibilityZoneIds = Entities.findEntitiesByName( "KOPRA_VISIBILITY_ZONE", generatorPosition, 2000);
    
    currentBolides = 0;
    for (i = 0; i < MAX_NBR_ITEMS; i++) {
        bolides[i] = Uuid.NULL;
    } 
    
    let today = new Date();
    processTimer = today.getTime();
    Script.update.connect(myTimer);
}

function myTimer(deltaTime) {
    let today = new Date();
    if ((today.getTime() - processTimer) > updateTimerInterval ) {
        
        spread();
        currentBolides = currentBolides + 1;
        if (currentBolides === MAX_NBR_ITEMS) {
            currentBolides = 0;
        }
        
        today = new Date();
        processTimer = today.getTime();
    }  
}

function spread() {
    if (!AvatarList.isAvatarInRange( generatorPosition, generatorRadius )) {
        return;
    }

    if (bolides[currentBolides] === Uuid.NULL) {
        print("KOPRA-SPREADER: Found Uuid.NULL (" + currentBolides+ ")"); //##################################### DEBUG
        bolides[currentBolides] = createBolide();
    } else {
        let properties = Entities.getEntityProperties(bolides[currentBolides], ["velocity", "position"]);
        if (properties.length !== 0) {
            if (Vec3.distance(properties.position, generatorPosition) > 4000) {
                print("KOPRA-SPREADER: Found OUT OF RANGE (" + currentBolides+ ")"); //##################################### DEBUG
                Entities.deleteEntity(bolides[currentBolides]);
                bolides[currentBolides] = createBolide();
            } else {
                if (Vec3.length(properties.velocity) < 0.0001) {
                    print("KOPRA-SPREADER: Found STOPPED (" + currentBolides+ ") Vel: " + JSON.stringify(Vec3.length(properties.velocity))); //##################################### DEBUG
                    Entities.editEntity(bolides[currentBolides], {"velocity": { "x": (Math.random() * 0.5) - 0.25, "y": 0, "z": (Math.random() * 0.5) - 0.25 }});
                }
            }
        } else {
            print("KOPRA-SPREADER: Found DEAD (" + currentBolides+ ")"); //##################################### DEBUG
            bolides[currentBolides] = createBolide();
        }
    }
}

function createBolide() {
    let scaleFactor = (Math.random() * 0.75) + 0.25;
    let duration = 300;//(updateTimerInterval/1000) * MAX_NBR_ITEMS * 2;
    let id = Entities.addEntity({
        "name": "Spreaded Item " + currentBolides,
        "lifetime": duration,
        "type": "Shape",
        "shape": "Sphere",
        "renderWithZone": visibilityZoneIds,
        "dimensions": Vec3.multiply( { "x": MAX_ITEM_SIZE, "y": MAX_ITEM_SIZE, "z": MAX_ITEM_SIZE }, scaleFactor ),
        "position": generatorPosition,
        "grab": {
            "grabbable": true
        },
        "density": 1000,
        "velocity": { "x": (Math.random() * (MAX_SPEED * 2)) - MAX_SPEED, "y": 0, "z": (Math.random() * (MAX_SPEED * 2)) - MAX_SPEED },
        "angularVelocity": { "x": (Math.random() * (Math.PI/2)) - (Math.PI/4), "y": (Math.random() * (Math.PI/2)) - (Math.PI/4), "z": (Math.random() * (Math.PI/2)) - (Math.PI/4) },
        "gravity":{ "x": 0, "y": -5, "z": 0 },
        "damping":0,
        "angularDamping":0,
        "restitution":0.99,
        "friction":0.0,
        "collisionless":false,
        "ignoreForCollisions":false,
        "collisionMask":31,
        "collidesWith":"static,dynamic,kinematic,myAvatar,otherAvatar,",
        "dynamic": true
    },"domain");

    let hue = Math.random();
    let fireColor = hslToRgb(hue, 1, 0.5);
    let plasmaColor = hslToRgb(hue, 1, 0.61);
    let colorStart = hslToRgb(hue, 1, 0.9);
    let bloomFactor = 4;
    
    //material           
    let materialContent = {
        "materialVersion": 1,
        "materials": [
            {
                "name": "plasma",
                "albedo": [1, 1, 1],
                "metallic": 1,
                "roughness": 1,
                "emissive": [(plasmaColor[0]/255) * bloomFactor, (plasmaColor[1]/255) * bloomFactor, (plasmaColor[2]/255) * bloomFactor],
                "cullFaceMode": "CULL_NONE",
                "model": "hifi_pbr"
            }
        ]
    };
            
    let fireMatId = Entities.addEntity({
        "type": "Material",
        "lifetime": duration,
        "parentID": id,
        "renderWithZones": visibilityZoneIds,
        "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
        "name": "plasma-material",
        "materialURL": "materialData",
        "priority": 1,
        "materialData": JSON.stringify(materialContent)
    }, "domain");
    
    //light
    let lightId = Entities.addEntity({
        "type": "Light",
        "lifetime": duration,
        "parentID": id,
        "renderWithZones": visibilityZoneIds,
        "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
        "name": "plasma-light",
        "dimensions": {
            "x": 100,
            "y": 100,
            "z": 100
        },
        "grab": {
            "grabbable": false
        },
        "color": {
            "red": plasmaColor[0],
            "green": plasmaColor[1],
            "blue": plasmaColor[2]
        },
        "intensity": 30.0,
        "falloffRadius": 5.0
    }, "domain");
    
    //particle
    let fxId = Entities.addEntity({
        "type": "ParticleEffect",
        "lifetime": duration,
        "parentID": id,
        "renderWithZones": visibilityZoneIds,
        "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
        "name": "plasma-fx",
        "dimensions": {
            "x": 381.0999755859375,
            "y": 381.0999755859375,
            "z": 381.0999755859375
        },
        "grab": {
            "grabbable": false
        },
        "shapeType": "ellipsoid",
        "color": {
            "red": plasmaColor[0],
            "green": plasmaColor[1],
            "blue": plasmaColor[2]
        },
        "alpha": 0.05,
        "textures": ROOT + "images/fog.png",
        "maxParticles": 4000,
        "lifespan": 10,
        "emitRate": 400,
        "emitSpeed": 1.6,
        "speedSpread": 0.7,
        "emitOrientation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        },
        "emitDimensions": Vec3.multiply( { "x": MAX_ITEM_SIZE, "y": MAX_ITEM_SIZE, "z": MAX_ITEM_SIZE }, scaleFactor ),
        "polarFinish": 3.1415927410125732,
        "emitAcceleration": {
            "x": 0,
            "y": 1.5,
            "z": 0
        },
        "accelerationSpread": {
            "x": 0,
            "y": 0.6,
            "z": 0
        },
        "particleRadius": 4,
        "radiusSpread": 0.5,
        "radiusStart": 1.5,
        "radiusFinish": 60,
        "colorStart": {
            "red": colorStart[0],
            "green": colorStart[1],
            "blue": colorStart[2]
        },
        "colorFinish": {
            "red": fireColor[0],
            "green": fireColor[1],
            "blue": fireColor[2]
        },
        "alphaStart": 0.2,
        "alphaFinish": 0,
        "emitterShouldTrail": true,
        "spinSpread": 1.0499999523162842,
        "spinStart": -1.5700000524520874,
        "spinFinish": 1.5700000524520874
    }, "domain");
    
    return id;
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

/*
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

Script.scriptEnding.connect(function () {
    Script.update.disconnect(myTimer);
    print("KOPRA-SPREADER: End running.");
});

initiate();

