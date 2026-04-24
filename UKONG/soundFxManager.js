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
    
    let updateTimerInterval = 4000; //4sec.
    let processTimer = 0;
    
    const COORD_REFERENCE = {"x":-3000,"y":3000,"z":-3000}; 
    
    let punctualEventSounds = [
        {
            "name": "WILD_DEER", //swamp
            "soundFile": "sounds/WILD/WILD_DEER.mp3",
            "rawPosition": {"x":4083.7763671875,"y":4131.3330078125,"z":-3903.164794921875},
            "radius": 200.0, //in meters
            "frequency": 80 //in second
        },
        {
            "name": "WILD_MASTODONTE", //swamp
            "soundFile": "sounds/WILD/WILD_MASTODONTE.mp3",
            "rawPosition": {"x":4083.7763671875,"y":4131.3330078125,"z":-3903.164794921875},
            "radius": 80.0,
            "frequency": 50
        },
        {
            "name": "WILD_HAWK_NOLOOP", //swamp to wall
            "soundFile": "sounds/WILD/WILD_HAWK_NOLOOP.mp3",
            "rawPosition": {"x":4083.7763671875,"y":4131.3330078125,"z":-3903.164794921875},
            "radius": 200.0,
            "frequency": 60
        },
        {
            "name": "WILD_MONKEY", //jungle
            "soundFile": "sounds/WILD/WILD_MONKEY.mp3",
            "rawPosition": {"x":4083.7763671875,"y":4131.3330078125,"z":-3903.164794921875},
            "radius": 150.0,
            "frequency": 30
        },
        {
            "name": "WILD_NEARBY", //swamp
            "soundFile": "sounds/WILD/WILD_NEARBY.mp3",
            "rawPosition": {"x":4083.7763671875,"y":4131.3330078125,"z":-3903.164794921875},
            "radius": 70.0,
            "frequency": 40
        },
        {
            "name": "WILD_ROARS", //swamp
            "soundFile": "sounds/WILD/WILD_ROARS.mp3",
            "rawPosition": {"x":4083.7763671875,"y":4131.3330078125,"z":-3903.164794921875},
            "radius": 60.0,
            "frequency": 60
        },
        {
            "name": "WILD_RRRR", //swamp
            "soundFile": "sounds/WILD/WILD_RRRR.mp3",
            "rawPosition": {"x":4083.7763671875,"y":4131.3330078125,"z":-3903.164794921875},
            "radius": 80.0,
            "frequency": 50
        },
        {
            "name": "WILD_WALKING_NEAR", //swamp
            "soundFile": "sounds/WILD/WILD_WALKING_NEAR.mp3",
            "rawPosition": {"x":4083.7763671875,"y":4131.3330078125,"z":-3903.164794921875},
            "radius": 30.0,
            "frequency": 30
        }
    ];
    
    let entitiesToDelete = [];
    
    this.preload = function(entityID) {
        thisEntityID = entityID
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;

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
            if (Math.random() < ((updateTimerInterval/1000)/punctualEventSounds[i].frequency)) {
                localPosition = Vec3.subtract(punctualEventSounds[i].rawPosition, COORD_REFERENCE);
                localPosition = Vec3.sum(localPosition, Vec3.multiplyQbyV(Quat.fromVec3Degrees( {"x":0.0 ,"y": Math.randon() * 360,"z": 0.0} ),{"x":0.0 ,"y":0.0 ,"z": punctualEventSounds[i].radius}));
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
                    "volume": 0.9,
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
