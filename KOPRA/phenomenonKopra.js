//
//  phenomenonKopra.js
//
//  Created by Alezia Kurdis, March 26th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Generate a phenomenons for KOPRA.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    let ROOT = Script.resolvePath('').split("phenomenonKopra.js")[0];

    let UPDATE_TIMER_INTERVAL = 4000; // 4 sec 
    let processTimer = 0;

    let thisEntity;
    let generatorPosition;
    let renderWithZones;

    let D29_DAY_DURATION = 104400; //sec
    let DEGREES_TO_RADIANS = Math.PI / 180.0;

    const MAX_NBR_ITEMS = 6;
    let currentMaximumOfItem = MAX_NBR_ITEMS;
    const MAX_ITEM_SIZE = 6; //6m of diameter
    const MAX_SPEED = 15; // in m/s
    const MAX_RANGE_FOR_BOLIDES = 100; //meters
    const BOLIDE_NAME ="%%!!-BOLIDE-AK-!!%%";
    const SCENE_RADIUS = 2600; //meters
    const BOLIDE_INFLUENCE_RADIUS = 2000; //meters
    const ENTITY_HOST_TYPE = "avatar";

    let bolides = [];
    let currentBolides = 0;

    this.preload = function(entityID) {
        Workload.getConfig("controlViews")["regulateViewRanges"] = false;
        let i;
        thisEntity = entityID;
        let prop = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = prop.renderWithZones;
        generatorPosition = prop.position;

        currentBolides = 0;
        for (i = 0; i < MAX_NBR_ITEMS; i++) {
            bolides[i] = Uuid.NONE;
        }

        //cleanup old remains here
        let presentAvatarSessionUuids = [];
        let presentAvatarData, entityOwnerSessionID;
        let presentAvatarIDs = AvatarManager.getAvatarsInRange( generatorPosition, SCENE_RADIUS * 2 );
        for (i = 0; i < presentAvatarIDs.length; i++) {
            presentAvatarData = AvatarManager.getAvatar(presentAvatarIDs[i]);
            if (presentAvatarData.sessionUUID !== MyAvatar.sessionUUID) {
                presentAvatarSessionUuids.push(presentAvatarData.sessionUUID);
            }
        }
        let possibleRemainsIds = Entities.findEntitiesByName( BOLIDE_NAME, generatorPosition, SCENE_RADIUS * 2, true);
        let countOrphan = 0;
        for (i = 0; i < possibleRemainsIds.length; i++) {
            entityOwnerSessionID = Entities.getEntityProperties(possibleRemainsIds[i], ["owningAvatarID"]).owningAvatarID;
            if (presentAvatarSessionUuids.indexOf(entityOwnerSessionID) === -1) {
                Entities.deleteEntity(possibleRemainsIds[i]);
                countOrphan++;
            }
        }
        print("ORPHAN BOLIDES FOUND: " + countOrphan);

        let today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer); 
    }

    function myTimer(deltaTime) {
        let today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {

            processCurrentBolide();
            currentBolides = currentBolides + 1;
            if (currentBolides >= MAX_NBR_ITEMS) {
                currentBolides = 0;
            }

            today = new Date();
            processTimer = today.getTime();
        }
    }

    function processCurrentBolide() {
        currentMaximumOfItem = getNumbrOfItemPerVisitor();
        if (currentBolides >= currentMaximumOfItem && bolides[currentBolides] !== Uuid.NONE) {
            Entities.deleteEntity(bolides[currentBolides]);
            bolides[currentBolides] = Uuid.NONE;
        } else {
            if (bolides[currentBolides] !== Uuid.NONE) {
                Entities.deleteEntity(bolides[currentBolides]);
            }
            bolides[currentBolides] = createBolide(ENTITY_HOST_TYPE);
        }
    }

    function getNumbrOfItemPerVisitor() {
        let nbrAvatar = AvatarManager.getAvatarsInRange( generatorPosition, SCENE_RADIUS).length;
        return Math.floor(MAX_NBR_ITEMS/nbrAvatar);
    }

    function createBolide(entityHostType) {
        if (Vec3.distance(MyAvatar.position, generatorPosition) > BOLIDE_INFLUENCE_RADIUS ) {
            return Uuid.NONE;
        } else {
            let gravity, newBolidePosition;
            let typeOfBolides = ["dropLight", "dropLight", "dropLight", "dropLight", "electro"];
            let thisBolideType = typeOfBolides[Math.floor(Math.random() * typeOfBolides.length)];
            let scaleFactor = (Math.random() * 0.75) + 0.25;
            switch(thisBolideType) {
                case "dropLight":
                    gravity = { "x": 0, "y": -5, "z": 0 };
                    newBolidePosition = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { 
                            "x": (Math.random() * (MAX_RANGE_FOR_BOLIDES)) - (MAX_RANGE_FOR_BOLIDES/2), 
                            "y": (Math.random() * MAX_RANGE_FOR_BOLIDES) + 10, 
                            "z": (Math.random() * (- MAX_RANGE_FOR_BOLIDES)) - 40
                        }));
                    break;
                case "electro":
                    gravity = { "x": 0, "y": 0, "z": 0 };
                    newBolidePosition = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { 
                            "x": (Math.random() * (MAX_RANGE_FOR_BOLIDES)) - (MAX_RANGE_FOR_BOLIDES/2), 
                            "y": (Math.random() * 30) - 15, 
                            "z": (Math.random() * (- MAX_RANGE_FOR_BOLIDES)) - 40
                        }));
                    break;
                default:
                    gravity = { "x": 0, "y": -5, "z": 0 };
                    newBolidePosition = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { 
                            "x": (Math.random() * (MAX_RANGE_FOR_BOLIDES)) - (MAX_RANGE_FOR_BOLIDES/2), 
                            "y": (Math.random() * MAX_RANGE_FOR_BOLIDES) + 10, 
                            "z": (Math.random() * (- MAX_RANGE_FOR_BOLIDES)) - 40
                        }));                    
            }

            let id = Entities.addEntity({
                "name": BOLIDE_NAME,
                "type": "Shape",
                "shape": "Sphere",
                "renderWithZone": renderWithZones,
                "dimensions": Vec3.multiply( { "x": MAX_ITEM_SIZE, "y": MAX_ITEM_SIZE, "z": MAX_ITEM_SIZE }, scaleFactor ),
                "position": newBolidePosition,
                "grab": {
                    "grabbable": true
                },
                "density": 1000,
                "velocity": { 
                    "x": (Math.random() * (MAX_SPEED * 2)) - MAX_SPEED, 
                    "y": (Math.random() * (MAX_SPEED * 2)) - MAX_SPEED, 
                    "z": (Math.random() * (MAX_SPEED * 2)) - MAX_SPEED 
                },
                "angularVelocity": { 
                    "x": (Math.random() * (Math.PI/2)) - (Math.PI/4), 
                    "y": (Math.random() * (Math.PI/2)) - (Math.PI/4), 
                    "z": (Math.random() * (Math.PI/2)) - (Math.PI/4) 
                },
                "gravity": gravity,
                "damping":0,
                "angularDamping":0,
                "restitution":0.99,
                "friction":0.0,
                "collisionless":false,
                "ignoreForCollisions":false,
                "collisionMask":31,
                "collidesWith":"static,dynamic,kinematic,myAvatar,otherAvatar,",
                "dynamic": true,
                "collisionSoundURL": ROOT + "sounds/deepBoom.mp3",
                "lifetime": 40
            }, entityHostType);
            
            let hue = Math.random();
            let fireColor = hslToRgb(hue, 1, 0.5);
            let plasmaColor = hslToRgb(hue, 1, 0.61);
            let colorStart = hslToRgb(hue, 1, 0.9);
            let bloomFactor = 4;
                
            if (thisBolideType === "dropLight") {
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
                    "parentID": id,
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                    "name": "plasma-material",
                    "materialURL": "materialData",
                    "priority": 1,
                    "materialData": JSON.stringify(materialContent)
                }, entityHostType);
                
                //light
                let lightId = Entities.addEntity({
                    "type": "Light",
                    "parentID": id,
                    "renderWithZones": renderWithZones,
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
                }, entityHostType);
                
                //particle
                let fxId = Entities.addEntity({
                    "type": "ParticleEffect",
                    "parentID": id,
                    "renderWithZones": renderWithZones,
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
                }, entityHostType);
                
            } else if (thisBolideType === "electro") {
                //material           
                let materialContentElectro = {
                    "materialVersion": 1,
                    "materials": [
                        {
                            "name": "electro",
                            "albedo": [1, 1, 1],
                            "metallic": 1,
                            "roughness": 0.001,
                            "cullFaceMode": "CULL_NONE",
                            "model": "hifi_pbr"
                        }
                    ]
                };
                        
                let electroMatId = Entities.addEntity({
                    "type": "Material",
                    "parentID": id,
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                    "name": "electro-material",
                    "materialURL": "materialData",
                    "priority": 1,
                    "materialData": JSON.stringify(materialContentElectro)
                }, entityHostType);
                
                //particle
                let electroFxId = Entities.addEntity({
                    "type": "ParticleEffect",
                    "parentID": id,
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                    "name": "electro-fx",
                    "dimensions": {
                        "x": 16,
                        "y": 16,
                        "z": 16
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
                    "alpha": 0,
                    "textures": ROOT + "images/electricArc.png",
                    "maxParticles": 200,
                    "lifespan": 0.1,
                    "emitRate": 20,
                    "emitSpeed": 0,
                    "speedSpread": 0,
                    "emitOrientation": {
                        "x": 0,
                        "y": 0,
                        "z": 0,
                        "w": 1
                    },
                    "emitDimensions": Vec3.multiply( { "x": MAX_ITEM_SIZE/3, "y": MAX_ITEM_SIZE/3, "z": MAX_ITEM_SIZE/3 }, scaleFactor ),
                    "emitRadiusStart": 0,
                    "polarFinish": 3.1415927410125732,
                    "emitAcceleration": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "accelerationSpread": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "particleRadius": 7 * scaleFactor,
                    "radiusSpread": 2 * scaleFactor,
                    "radiusStart": 7 * scaleFactor,
                    "radiusFinish": 7 * scaleFactor,
                    "colorStart": {
                        "red": 255,
                        "green": 255,
                        "blue": 255
                    },
                    "colorFinish": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    },
                    "alphaStart": 1,
                    "alphaFinish": 1,
                    "emitterShouldTrail": false,
                    "spinSpread": 3.140000104904175
                }, entityHostType);
                
            }
            
            return id;
        }
    }

    this.unload = function(entityID) {
        let i;
        for (i = 0; i < bolides.length; i++) {
            if (bolides[i] !== Uuid.NONE) {
                Entities.deleteEntity(bolides[i]);
                bolides[i] = Uuid.NONE;
            }
        }

        Script.update.disconnect(myTimer);
        Workload.getConfig("controlViews")["regulateViewRanges"] = true;
    };

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
        let r, g, b;
        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            let hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function GetCurrentCycleValue(cyclelength, cycleduration){
		let today = new Date();
		let TodaySec = today.getTime()/1000;
		let CurrentSec = TodaySec%cycleduration;
		return (CurrentSec/cycleduration)*cyclelength;
	}

})
