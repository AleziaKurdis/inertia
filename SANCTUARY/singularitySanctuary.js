"use strict";
//
//  singularitySanctuary.js
//
//  Created by Alezia Kurdis, August 29th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Generate a singularity for SANCTUARY.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("singularitySanctuary.js")[0];
    var thisEntity;

    var UPDATE_TIMER_INTERVAL = 5000; // 5 sec 
    var processTimer = 0;

    var starId = Uuid.NULL;
    var fireMatId = Uuid.NULL;
    var fireLightId = Uuid.NULL;
    var fireParticles = Uuid.NULL;
    var solarZoneId = Uuid.NULL;
    var asteroidIds = [];
    
    var singularityGeneratorPosition;
    
    var renderWithZones;
    
    var D29_DAY_DURATION = 104400; //sec
    var STAR_DIAMETER = 400; //m
    var STAR_LIGHT_DIAMETER_MULTIPLICATOR = 20; //X time the diameter of the star.
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    
    var currentSunPosition = {"x": 0, "y": 0, "z": 0};
    var nextSunPosition;
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        var prop = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = prop.renderWithZones;
        singularityGeneratorPosition = prop.position;
        var sunCumputedValues = getCurrentSunPosition();
        currentSunPosition = sunCumputedValues.localPosition;
        nextSunPosition = currentSunPosition;
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var sunColor = hslToRgb(hue, 1, 0.6);
        solarZoneId = Entities.addEntity({
            "name": "SUNLIGHT_(!)_Z0N3",
            "dimensions": {"x": 3800, "y": 3800, "z": 3800},
            "type": "Zone",
            "keyLightMode": "enabled",
            "keyLight": {
                "color": {"red": sunColor[0], "green": sunColor[1], "blue": sunColor[2]},
                "intensity": 2.6,
                "direction": Vec3.fromPolar( sunCumputedValues.elevation, sunCumputedValues.azimuth),
                "castShadows": true,
                "shadowBias": 0.02,
                "shadowMaxDistance": 100
            },
            "position": singularityGeneratorPosition,
            "renderWithZones": renderWithZones,
        }, "local");
        
        genTroyanAsteroid();
        
        starId = Entities.addEntity({
                "name": "STAR",
                "parentID": thisEntity,
                "dimensions": {"x": STAR_DIAMETER, "y": STAR_DIAMETER, "z": STAR_DIAMETER},
                "localPosition": currentSunPosition,
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones,
                "damping": 0
        }, "local");
        
        var RATIO_Z = 0.24;
        
        var sizeMultiplicator = 4;
        var betlOneId = Entities.addEntity({
            "name": "BELT-01",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.6,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
        }, "local");

        sizeMultiplicator = 6;
        var betlOneId = Entities.addEntity({
            "name": "BELT-02",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.3,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
        }, "local");

        sizeMultiplicator = 9;
        var betlOneId = Entities.addEntity({
            "name": "BELT-03",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.2,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
        }, "local");

        sizeMultiplicator = 12;
        var betlOneId = Entities.addEntity({
            "name": "BELT-04",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.1,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
        }, "local");

        sizeMultiplicator = 20;
        var betlOneId = Entities.addEntity({
            "name": "BELT-05",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.03,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
        }, "local");

        updateStar();
        
        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer); 
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {

            updateStar();
            moveStar();
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }   

    function moveStar() {
        if (starId !== Uuid.NULL) {
            currentSunPosition = nextSunPosition;
            var sunCumputedValues = getCurrentSunPosition();
            nextSunPosition = sunCumputedValues.localPosition;
            var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
            var sunColor = hslToRgb(hue, 1, 0.6);
            var velocity = Vec3.subtract(nextSunPosition, currentSunPosition);
            Entities.editEntity(starId, {"localPosition": currentSunPosition, "localVelocity": velocity});
            Entities.editEntity(starId, {
                "keyLight": {
                    "color": {"red": sunColor[0], "green": sunColor[1], "blue": sunColor[2]},
                    "direction": Vec3.fromPolar( sunCumputedValues.elevation, sunCumputedValues.azimuth)
                }
            });
        }
    }

    function getCurrentSunPosition() {
        var distanceFactor = Math.abs(Math.sin(GetCurrentCycleValue((2* Math.PI), D29_DAY_DURATION * 36))); //un tour par mois
        var elevation = (Math.PI/4) + ((Math.PI/8) * Math.sin(GetCurrentCycleValue((2* Math.PI), D29_DAY_DURATION)));
        var azimuth = GetCurrentCycleValue((2* Math.PI), D29_DAY_DURATION *  9); //un tour par semaine
        var localPosition = Vec3.multiplyQbyV(Quat.fromVec3Radians({"x": elevation,"y": azimuth, "z": 0}), {"x": 0,"y": 0, "z": -1500 - (1000 * distanceFactor)});
        //print("local Position: " + JSON.stringify(localPosition));
        //print("elevation: " + elevation);
        //ASTEROID_1print("azimuth: " + azimuth);
        return { 
                    "elevation" : elevation,
                    "azimuth" : azimuth,
                    "localPosition": localPosition
                };
    }

    function updateStar() {
        if (starId !== Uuid.NULL) {
            
            var pitch = Math.sin(GetCurrentCycleValue((2 * Math.PI), (3600 * 5))); //5 h cycle
            if (pitch === 0) {pitch = 0.001;}
            
            var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
            var fireColor = hslToRgb(hue, 1, 0.5);
            var plasmaColor = hslToRgb(hue, 1, 0.61);
            var fireColorStart = hslToRgb(hue, 1, 0.9);
            var fireColorFinish = hslToRgb(hue, 1, 0.15);
            var bloomFactor = 4;
            
            var materialContent = {
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
            
            if (fireMatId === Uuid.NULL) {
                //CREATE
                fireMatId = Entities.addEntity({
                    "type": "Material",
                    "parentID": starId,
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 1, "z": 0.0},
                    "name": "plasma-material",
                    "materialURL": "materialData",
                    "priority": 1,
                    "materialData": JSON.stringify(materialContent)                
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(fireMatId, {
                    "materialData": JSON.stringify(materialContent)
                });
            }
            

            if (fireLightId === Uuid.NULL) {
                //CREATE
                fireLightId = Entities.addEntity({
                    "type": "Light",
                    "name": "STAR-LIGHT",
                    "dimensions": {
                        "x": 1500,
                        "y": 1500,
                        "z": 1500
                    },
                    "localPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "renderWithZones": renderWithZones,
                    "parentID": starId,
                    "grab": {
                        "grabbable": false
                    },
                    "color": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    },
                    "isSpotlight": false,
                    "intensity": 15,
                    "exponent": 1,
                    "cutoff": 75,
                    "falloffRadius": STAR_DIAMETER * 2
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(fireLightId, {
                    "color": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    }                    
                });
            } 
            if (fireParticles === Uuid.NULL) {
                //CREATE
                fireParticles = Entities.addEntity({
                    "type": "ParticleEffect",
                    "name": "STAR_PARTICLE",
                    "dimensions": {
                        "x": STAR_DIAMETER * 2,
                        "y": STAR_DIAMETER * 2,
                        "z": STAR_DIAMETER * 2
                    },
                    "rotation": Quat.IDENTITY,
                    "localPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "renderWithZones": renderWithZones,
                    "parentID": starId,
                    "grab": {
                        "grabbable": false
                    },
                    "shapeType": "ellipsoid",
                    "color": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    },
                    "alpha": 0.10000000149011612,
                    "textures": ROOT + "images/pitParticle.png",
                    "maxParticles": 2250,
                    "lifespan": 9,
                    "emitRate": 250,
                    "emitSpeed": 0,
                    "speedSpread": 0.1 * STAR_DIAMETER,
                    "emitOrientation": {
                        "x": -0.0000152587890625,
                        "y": -0.0000152587890625,
                        "z": -0.0000152587890625,
                        "w": 1
                    },
                    "emitDimensions": {
                        "x": 0.9 * STAR_DIAMETER,
                        "y": 0.9 * STAR_DIAMETER,
                        "z": 0.9 * STAR_DIAMETER,
                    },
                    "emitRadiusStart": 1,
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
                    "particleRadius": 0.4 * STAR_DIAMETER,
                    "radiusSpread": 0.1 * STAR_DIAMETER,
                    "radiusStart": 0.1 * STAR_DIAMETER,
                    "radiusFinish": 0.6 * STAR_DIAMETER,
                    "colorStart": {
                        "red": fireColorStart[0],
                        "green": fireColorStart[1],
                        "blue": fireColorStart[2]
                    },
                    "colorFinish": {
                        "red": fireColorFinish[0],
                        "green": fireColorFinish[1],
                        "blue": fireColorFinish[2]
                    },
                    "colorSpread": {
                        "red": Math.floor(pitch * 15.9),
                        "green": Math.floor(pitch * 15.9),
                        "blue": Math.floor(pitch * 15.9)
                    },                
                    "alphaSpread": 0.10000000149011612,
                    "alphaStart": 0.5,
                    "alphaFinish": 0,
                    "emitterShouldTrail": false,
                    "rotateWithEntity": true,
                    "spinSpread": 1.5700000524520874,
                    "spinStart": 0,
                    "particleSpin": 1,
                    "spinFinish": 2,
                    "angularDamping": 0,
                    "angularVelocity": {
                        "x":0,
                        "y":0.5,
                        "z":0
                    }                    
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(fireParticles, {
                    "color": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    },
                    "colorStart": {
                        "red": fireColorStart[0],
                        "green": fireColorStart[1],
                        "blue": fireColorStart[2]
                    },
                    "colorSpread": {
                        "red": Math.floor(pitch * 15.9),
                        "green": Math.floor(pitch * 15.9),
                        "blue": Math.floor(pitch * 15.9)
                    },                 
                    "colorFinish": {
                        "red": fireColorFinish[0],
                        "green": fireColorFinish[1],
                        "blue": fireColorFinish[2]
                    }                
                });
            } 
        }
    }


    this.unload = function(entityID) {
        if (starId !== Uuid.NULL) {
            Entities.deleteEntity(starId);
            starId = Uuid.NULL;
        }
        if (solarZoneId !== Uuid.NULL) {
            Entities.deleteEntity(solarZoneId);
            solarZoneId = Uuid.NULL;
        }
        var i;
        for (i = 0; i < asteroidIds.length; i++) {
            if (asteroidIds[i] !== Uuid.NULL) {
                Entities.deleteEntity(asteroidIds[i]);
                asteroidIds[i] = Uuid.NULL;
            }
        }
        Script.update.disconnect(myTimer);
    };

    function genTroyanAsteroid() {
        //Near and positionned.
        var troyanAsteroids = [
            {
                "file": "ASTEROID_1.fst",
                "localPosition": Vec3.subtract({"x":4021.9892578125,"y":4044.546875,"z":3946.948974609375}, {"x":4000, "y":4000, "z":4000}),
                "rotation": {"x":0,"y":0,"z":0,"w":1},
                "angularVelocity": {"x":4 * DEGREES_TO_RADIANS, "y":7 * DEGREES_TO_RADIANS, "z": 2 * DEGREES_TO_RADIANS},
                "dimensions": {"x":15, "y":17, "z":17}
            },
            {
                "file": "ASTEROID_2.fst",
                "localPosition": Vec3.subtract({"x":4074.339599609375,"y":4003.91552734375,"z":4081.083251953125}, {"x":4000, "y":4000, "z":4000}),
                "rotation": {"x":0,"y":0,"z":0,"w":1},
                "angularVelocity": {"x":5 * DEGREES_TO_RADIANS, "y":6 * DEGREES_TO_RADIANS, "z": 11 * DEGREES_TO_RADIANS},
                "dimensions": {"x":34, "y":38, "z":37}
            },
            {
                "file": "ASTEROID_3.fst",
                "localPosition": Vec3.subtract({"x":3945.13818359375,"y":4025.339599609375,"z":4021.63232421875}, {"x":4000, "y":4000, "z":4000}),
                "rotation": {"x":0,"y":0,"z":0,"w":1},
                "angularVelocity": {"x":9 * DEGREES_TO_RADIANS, "y":15 * DEGREES_TO_RADIANS, "z": 20 * DEGREES_TO_RADIANS},
                "dimensions": {"x":22, "y":21, "z":27}
            },
            {
                "file": "ASTEROID_4.fst",
                "localPosition": Vec3.subtract({"x":3991.478515625,"y":4027.4560546875,"z":3850.606201171875}, {"x":4000, "y":4000, "z":4000}),
                "rotation": {"x":0,"y":0,"z":0,"w":1},
                "angularVelocity": {"x":3 * DEGREES_TO_RADIANS, "y":4 * DEGREES_TO_RADIANS, "z": 9 * DEGREES_TO_RADIANS},
                "dimensions": {"x":81, "y":40, "z":48}
            },
            {
                "file": "ASTEROID_5.fst",
                "localPosition": Vec3.subtract({"x":4024.126220703125,"y":3965.513427734375,"z":3947.52880859375}, {"x":4000, "y":4000, "z":4000}),
                "rotation": {"x":0,"y":0,"z":0,"w":1},
                "angularVelocity": {"x":8 * DEGREES_TO_RADIANS, "y":6 * DEGREES_TO_RADIANS, "z": 33 * DEGREES_TO_RADIANS},
                "dimensions": {"x":44, "y":46, "z":49}
            },
            {
                "file": "ASTEROID_6.fst",
                "localPosition": Vec3.subtract({"x":3967.548095703125,"y":3969.5244140625,"z":3883.59375}, {"x":4000, "y":4000, "z":4000}),
                "rotation": {"x":0,"y":0,"z":0,"w":1},
                "angularVelocity": {"x":20 * DEGREES_TO_RADIANS, "y":10 * DEGREES_TO_RADIANS, "z": 6 * DEGREES_TO_RADIANS},
                "dimensions": {"x":34, "y":50, "z":49}
            }
        ];
        
        var i, id;
        for (i = 0; i < troyanAsteroids.length; i++) {
            id = Entities.addEntity({
                    "type": "Model",
                    "name": "Troyan Asteroid-" + i,
                    "parentID": thisEntity,
                    "localPosition": troyanAsteroids[i].localPosition,
                    "rotation": troyanAsteroids[i].rotation,
                    "renderWithZones": renderWithZones,
                    "dimensions": troyanAsteroids[i].dimensions,
                    "modelURL": ROOT + "models/" + troyanAsteroids[i].file,
                    "useOriginalPivot": true,
                    "angularDamping": 0,
                    "angularVelocity": troyanAsteroids[i].angularVelocity
                }, "local");
            asteroidIds.push(id);
        }
        
        //Asteroid field (far and random)
        var ASTEROID_FIELD_QUANTITY = 40; 
        var MIN_DISTANCE = 100; //meters
        var MAX_DISTANCE = 150; //meters
        var MAX_SIZE = 50;//meters
        var MIN_SIZE = 5; //meters
        var captured = [];
        for (i = 0; i < ASTEROID_FIELD_QUANTITY; i++) {
            var distance = MIN_DISTANCE + (Math.random() * MAX_DISTANCE);
            var azimuth = Math.random() * 2 * Math.PI;
            var elevation = (Math.random() * (Math.PI/3)) - (Math.PI/6);
            var astScale = MIN_SIZE + (Math.random() * (MAX_SIZE - MIN_SIZE));
            var localPosition = Vec3.fromPolar({"x": elevation,"y": azimuth,"z": distance});
            var angVeloc = {
                    "x": (Math.random()*1.5) - 0.75, //Rad/sec
                    "y": (Math.random()*1.5) - 0.75,
                    "z": (Math.random()*1.5) - 0.75
                };  
            var astDimension = {
                "x": (0.7 + (Math.random() * 0.3)) * astScale,
                "y": (0.7 + (Math.random() * 0.3)) * astScale,
                "z": (0.7 + (Math.random() * 0.3)) * astScale
            };
            
            var asteroidModelURL = "ASTEROID_" + (Math.floor(Math.random() * 6) + 1) + ".fst";
            
            id = Entities.addEntity({
                    "type": "Model",
                    "name": "Asteroid Field - " + i,
                    "parentID": thisEntity,
                    "localPosition": localPosition,
                    "renderWithZones": renderWithZones,
                    "dimensions": astDimension,
                    "modelURL": ROOT + "models/" + asteroidModelURL,
                    "useOriginalPivot": true,
                    "angularDamping": 0,
                    "angularVelocity": angVeloc
                }, "local");
            asteroidIds.push(id);
            var entry = {
                "file": asteroidModelURL,
                "localPosition": localPosition,
                "rotation": {"x":0,"y":0,"z":0,"w":1},
                "angularVelocity": angVeloc,
                "dimensions": astDimension
            }
            captured.push(entry);
            
        }
        print("version 100");
        print(JSON.stringify(captured));
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

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}    


})
