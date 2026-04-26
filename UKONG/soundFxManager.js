//
//  soundFxManager.js
//
//  Created by Alezia Kurdis, February 20th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Sound generator for the UKONG scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("soundFxManager.js")[0];
    let thisEntityID;
    let renderWithZones;
    let entityPosition;
    
    let updateTimerInterval = 4000; //4sec.
    let processTimer = 0;
    
    const COORD_REFERENCE = {"x":-3000,"y":3000,"z":-3000}; 
    
    let punctualEventSounds = [
        {
            "name": "WILD_DEER", //swamp
            "soundFile": "sounds/WILD/WILD_DEER.mp3",
            "rawPosition": {"x": -3250.16,"y": 3005.54,"z": -3214.09},
            "radius": 200.0, //in meters
            "frequency": 80 //in second
        },
        {
            "name": "WILD_MASTODONTE", //swamp
            "soundFile": "sounds/WILD/WILD_MASTODONTE.mp3",
            "rawPosition": {"x": -3135.4,"y": 3005.6,"z": -3180.37},
            "radius": 80.0,
            "frequency": 50
        },
        {
            "name": "WILD_HAWK_NOLOOP", //swamp to wall
            "soundFile": "sounds/WILD/WILD_HAWK_NOLOOP.mp3",
            "rawPosition": {"x": -2953.49,"y": 3012.38,"z": -3222.87},
            "radius": 200.0,
            "frequency": 60
        },
        {
            "name": "WILD_MONKEY", //jungle
            "soundFile": "sounds/WILD/WILD_MONKEY.mp3",
            "rawPosition": {"x": -3212.76,"y": 3000.0,"z": -2755.71},
            "radius": 250.0,
            "frequency": 30
        },
        {
            "name": "WILD_NEARBY", //swamp
            "soundFile": "sounds/WILD/WILD_NEARBY.mp3",
            "rawPosition": {"x": -3200.78,"y": 3005.54,"z": -3215.21},
            "radius": 70.0,
            "frequency": 40
        },
        {
            "name": "WILD_ROARS", //swamp
            "soundFile": "sounds/WILD/WILD_ROARS.mp3",
            "rawPosition": {"x": -3230.08,"y": 3004.88,"z": -3275.51},
            "radius": 60.0,
            "frequency": 60
        },
        {
            "name": "WILD_RRRR", //swamp
            "soundFile": "sounds/WILD/WILD_RRRR.mp3",
            "rawPosition": {"x": -3266.9,"y": 3004.92,"z": -3288.05},
            "radius": 80.0,
            "frequency": 50
        },
        {
            "name": "WILD_WALKING_NEAR", //swamp
            "soundFile": "sounds/WILD/WILD_WALKING_NEAR.mp3",
            "rawPosition": {"x": -3318.82,"y": 3005.56,"z": -3199.92},
            "radius": 30.0,
            "frequency": 30
        }
    ];
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        let properties = Entities.getEntityProperties(entityID, ["position", "renderWithZones"]);
        entityPosition = properties.position;
        renderWithZones = properties.renderWithZones;

        Script.update.connect(myTimer);
        processTimer = Date.now();
        manageSounds();
    };

    function myTimer(deltaTime) {
        const now = Date.now();
        if ((now - processTimer) > updateTimerInterval ) {
            manageSounds();
            processTimer = now;
        }
    }
    
    function manageSounds() {
        let id, localPosition;
        for (let i = 0; i < punctualEventSounds.length; i++) {
            /*localPosition = Vec3.subtract(punctualEventSounds[i].rawPosition, COORD_REFERENCE);
            if (Vec3.distance(MyAvatar.position, Vec3.sum(entityPosition, localPosition)) < punctualEventSounds[i].radius) {
                if (Math.random() < ((updateTimerInterval/1000)/punctualEventSounds[i].frequency)) {
                    id = Entities.addEntity({
                        "type": "Sound",
                        "parentID": thisEntityID,
                        "position": Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(Quat.fromVec3Degrees( {"x":0.0 ,"y": Math.random() * 360,"z": 0.0} ),{"x":0.0 ,"y":0.0 ,"z": Math.random() * punctualEventSounds[i].radius})),
                        "name": punctualEventSounds[i].name,
                        "renderWithZones": renderWithZones,
                        "grab": {
                            "grabbable": false
                        },
                        "damping": 0,
                        "angularDamping": 0,
                        "soundURL": ROOT + punctualEventSounds[i].soundFile,
                        "volume": 1.0,
                        "loop": false,
                        "positional": true,
                        "localOnly": true,
                        "lifetime": 30
                    }, "local");
                }
            }*/
            if (Math.random() < ((updateTimerInterval/1000)/punctualEventSounds[i].frequency)) {
                localPosition = Vec3.subtract(punctualEventSounds[i].rawPosition, COORD_REFERENCE);
                localPosition = Vec3.sum(localPosition, Vec3.multiplyQbyV(Quat.fromVec3Degrees( {"x":0.0 ,"y": Math.random() * 360,"z": 0.0} ),{"x":0.0 ,"y":0.0 ,"z": Math.sqrt(Math.random()) * punctualEventSounds[i].radius}));
                id = Entities.addEntity({
                    "type": "Sound",
                    "parentID": thisEntityID,
                    "localPosition": localPosition,
                    "name": punctualEventSounds[i].name,
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "damping": 0,
                    "angularDamping": 0,
                    "soundURL": ROOT + punctualEventSounds[i].soundFile,
                    "volume": 1.0,
                    "loop": false,
                    "positional": true,
                    "localOnly": true,
                    "lifetime": 30
                }, "local");
            }
        }
    }
    
    this.unload = function(entityID) {
        Script.update.disconnect(myTimer);
    };

})
