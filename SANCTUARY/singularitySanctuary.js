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
    
    var matId = Uuid.NULL;
    var lightTableID = Uuid.NULL;
    
    var D29_DAY_DURATION = 104400; //sec
    var STAR_DIAMETER = 400; //m
    var STAR_LIGHT_DIAMETER_MULTIPLICATOR = 20; //X time the diameter of the star.
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    
    var currentSunPosition = {"x": 0, "y": 0, "z": 0};
    //var nextSunPosition;
    
    this.preload = function(entityID) { 
        Workload.getConfig("controlViews")["regulateViewRanges"] = false;
        thisEntity = entityID;
        var prop = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = prop.renderWithZones;
        singularityGeneratorPosition = prop.position;
        
        var visibilityZoneId = Entities.findEntitiesByName( "SANCTUARY_VISIBILITY_ZONE", singularityGeneratorPosition, 10);
        var superZoneDimensions = Entities.getEntityProperties(visibilityZoneId[0], ["dimensions"]).dimensions;
        
        var sunCumputedValues = getCurrentSunPosition();
        currentSunPosition = sunCumputedValues.localPosition;
        //nextSunPosition = currentSunPosition;
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var sunColor = hslToRgb(hue, 1, 0.6);
        solarZoneId = Entities.addEntity({
            "name": "SUNLIGHT_(!)_Z0N3",
            "dimensions": {"x": superZoneDimensions.x - 200, "y": superZoneDimensions.y - 200, "z": superZoneDimensions.z - 200},
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
        
        genMainAsteroidLightMaterial(thisEntity, renderWithZones);
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
            //currentSunPosition = nextSunPosition;
            var sunCumputedValues = getCurrentSunPosition();
            currentSunPosition = sunCumputedValues.localPosition;
            var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
            var sunColor = hslToRgb(hue, 1, 0.6);
            //var velocity = Vec3.subtract(nextSunPosition, currentSunPosition);
            Entities.editEntity(starId, {"localPosition": currentSunPosition});
            Entities.editEntity(solarZoneId, {
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

    function genMainAsteroidLightMaterial(id, rwz) {
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var antiHue = 0.5 + GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        if (antiHue > 1) {
            antiHue = antiHue - 1;
        }
        var color = hslToRgb(antiHue, 1, 0.5);
        var lightMatColor = hslToRgb(antiHue, 1, 0.61);
        var bloomFactor = 4;
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "LIGHT",
                    "albedo": [1, 1, 1],
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(lightMatColor[0]/255) * bloomFactor, (lightMatColor[1]/255) * bloomFactor, (lightMatColor[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };

        matId = Entities.addEntity({
            "type": "Material",
            "parentID": id,
            "renderWithZones": rwz,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "plasma-material",
            "materialURL": "materialData",
            "priority": 3,
            "parentMaterialName": "mat::LIGHT",
            "materialData": JSON.stringify(materialContent)
        }, "local");
        
        lightTableID = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": -53.3345,
                "y": 4.5818,
                "z": -38.0559
            },
            "parentID": id,
            "name": "TABLE_LIGHT",
            "dimensions": {
                "x": 9,
                "y": 9,
                "z": 9
            },
            "rotation": {"x":0.7071068286895752,"y":0,"z":0,"w":0.7071068286895752},
            "renderWithZones": rwz,
            "grab": {
                "grabbable": false
            },
            "color": {
                "red": color[0],
                "green": color[1],
                "blue": color[2]
            },
            "isSpotlight": true,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 90,
            "falloffRadius": 2
        }, "local");
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
        
        if (matId !== Uuid.NULL) {
            Entities.deleteEntity(matId);
            matId = Uuid.NULL;
        }

        if (lightTableID !== Uuid.NULL) {
            Entities.deleteEntity(lightTableID);
            lightTableID = Uuid.NULL;
        }

        var i;
        for (i = 0; i < asteroidIds.length; i++) {
            if (asteroidIds[i] !== Uuid.NULL) {
                Entities.deleteEntity(asteroidIds[i]);
                asteroidIds[i] = Uuid.NULL;
            }
        }
        Script.update.disconnect(myTimer);
        Workload.getConfig("controlViews")["regulateViewRanges"] = true;
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
            },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":-158.0943145751953,
                 "y":2.844292163848877,
                 "z":-146.5406036376953
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.18675362092562175,
                 "y":0.08742946371655624,
                 "z":0.37087392539396546
              },
              "dimensions":{
                 "x":6.489143350727259,
                 "y":6.263337549101514,
                 "z":6.430986543760459
              }
           },
           {
              "file":"ASTEROID_4.fst",
              "localPosition":{
                 "x":129.88418579101562,
                 "y":-26.809219360351562,
                 "z":-90.66531372070312
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.27568217764799563,
                 "y":0.07964361348952842,
                 "z":0.6723151468801927
              },
              "dimensions":{
                 "x":25.930415471110553,
                 "y":21.973340398807537,
                 "z":24.094140898703156
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":17.605403900146484,
                 "y":14.23954963684082,
                 "z":99.98897552490234
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.5169166379372929,
                 "y":0.3290935057647357,
                 "z":-0.023813565255865643
              },
              "dimensions":{
                 "x":16.888454662718225,
                 "y":15.08885521955401,
                 "z":14.305203598040904
              }
           },
           {
              "file":"ASTEROID_5.fst",
              "localPosition":{
                 "x":203.78282165527344,
                 "y":-30.55486297607422,
                 "z":-37.707698822021484
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.5306514745292183,
                 "y":0.1535287688875363,
                 "z":0.3490959372484703
              },
              "dimensions":{
                 "x":18.149824719668146,
                 "y":18.633205514712902,
                 "z":16.83761430645324
              }
           },
           {
              "file":"ASTEROID_4.fst",
              "localPosition":{
                 "x":63.65746307373047,
                 "y":-57.822105407714844,
                 "z":-197.22755432128906
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.3844779858201186,
                 "y":-0.5943060627470772,
                 "z":-0.5778092935928386
              },
              "dimensions":{
                 "x":31.84528858220738,
                 "y":32.7715997498507,
                 "z":29.84240666423631
              }
           },
           {
              "file":"ASTEROID_2.fst",
              "localPosition":{
                 "x":86.32255554199219,
                 "y":48.338478088378906,
                 "z":91.05467224121094
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.5794131982030333,
                 "y":0.012270602135193487,
                 "z":0.1072154137902317
              },
              "dimensions":{
                 "x":29.450967698239076,
                 "y":27.545684980433695,
                 "z":32.263964519411424
              }
           },
           {
              "file":"ASTEROID_2.fst",
              "localPosition":{
                 "x":31.542749404907227,
                 "y":-3.044607400894165,
                 "z":223.66265869140625
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.6766057653059288,
                 "y":-0.3674536141916078,
                 "z":-0.633454865432166
              },
              "dimensions":{
                 "x":35.92240918362075,
                 "y":29.586002373221525,
                 "z":37.77364232924566
              }
           },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":-135.27940368652344,
                 "y":11.96972370147705,
                 "z":95.89750671386719
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.1210982751938664,
                 "y":-0.40019167165039493,
                 "z":-0.5035791063502928
              },
              "dimensions":{
                 "x":15.430651079746516,
                 "y":19.73435314439863,
                 "z":15.920064896308428
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":124.93150329589844,
                 "y":82.46591186523438,
                 "z":73.782470703125
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.02538509016850443,
                 "y":-0.505000838003364,
                 "z":0.15612159049593122
              },
              "dimensions":{
                 "x":11.244857297350052,
                 "y":13.504796479759811,
                 "z":11.452859700422575
              }
           },
           {
              "file":"ASTEROID_3.fst",
              "localPosition":{
                 "x":-116.72526550292969,
                 "y":5.558384418487549,
                 "z":-32.87836837768555
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.6518949604391888,
                 "y":0.3547205197821941,
                 "z":-0.052201177603002025
              },
              "dimensions":{
                 "x":13.092276201705014,
                 "y":11.892920437093501,
                 "z":13.569655659560237
              }
           },
           {
              "file":"ASTEROID_2.fst",
              "localPosition":{
                 "x":131.56103515625,
                 "y":57.797176361083984,
                 "z":128.29779052734375
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.14811216486888723,
                 "y":-0.006231314745081651,
                 "z":-0.3038062459477612
              },
              "dimensions":{
                 "x":44.03004520400461,
                 "y":34.55957256495545,
                 "z":32.86723882269033
              }
           },
           {
              "file":"ASTEROID_4.fst",
              "localPosition":{
                 "x":-117.637451171875,
                 "y":-69.30860900878906,
                 "z":-47.814029693603516
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.41112999904382375,
                 "y":-0.16960251348918776,
                 "z":0.051728693337230514
              },
              "dimensions":{
                 "x":26.382770990511435,
                 "y":32.903675740148145,
                 "z":30.47865674518629
              }
           },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":-47.033145904541016,
                 "y":91.34938049316406,
                 "z":-224.32891845703125
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.6409856033473647,
                 "y":-0.26565407175035827,
                 "z":-0.2839103827343663
              },
              "dimensions":{
                 "x":26.602490458305606,
                 "y":24.312524376303486,
                 "z":21.344779512668723
              }
           },
           {
              "file":"ASTEROID_4.fst",
              "localPosition":{
                 "x":98.22199249267578,
                 "y":45.851680755615234,
                 "z":-49.24237060546875
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.008764721547171339,
                 "y":-0.42532088426187464,
                 "z":-0.5380034872050341
              },
              "dimensions":{
                 "x":19.185382731781356,
                 "y":23.384412693681043,
                 "z":19.331491954904138
              }
           },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":225.82550048828125,
                 "y":46.18857192993164,
                 "z":8.6248779296875
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.03293051082799414,
                 "y":-0.598110899067885,
                 "z":0.44747072818626976
              },
              "dimensions":{
                 "x":4.8247500350527055,
                 "y":5.3459605704755155,
                 "z":4.831184437477712
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":-104.9697036743164,
                 "y":19.741535186767578,
                 "z":-165.30311584472656
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.026687665242669856,
                 "y":0.02231255460248116,
                 "z":0.7267084088703695
              },
              "dimensions":{
                 "x":31.00982758273509,
                 "y":30.891935113796993,
                 "z":37.04984790049242
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":-84.76789093017578,
                 "y":-18.327543258666992,
                 "z":164.87673950195312
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.18009971240812483,
                 "y":-0.06910845936150234,
                 "z":-0.5656660865117963
              },
              "dimensions":{
                 "x":28.181722111503333,
                 "y":23.78530913395352,
                 "z":26.105031280872296
              }
           },
           {
              "file":"ASTEROID_2.fst",
              "localPosition":{
                 "x":119.569091796875,
                 "y":-23.18265724182129,
                 "z":-156.68492126464844
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.40730641197096507,
                 "y":0.15904389657192786,
                 "z":-0.075369714331873
              },
              "dimensions":{
                 "x":42.53402250949221,
                 "y":41.24459974011345,
                 "z":34.87411580372404
              }
           },
           {
              "file":"ASTEROID_4.fst",
              "localPosition":{
                 "x":-175.10061645507812,
                 "y":38.40830612182617,
                 "z":-38.88093185424805
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.5944215542283939,
                 "y":-0.026065072116653876,
                 "z":-0.23643418309526332
              },
              "dimensions":{
                 "x":35.715821364146024,
                 "y":42.67545592571387,
                 "z":39.182704674070834
              }
           },
           {
              "file":"ASTEROID_5.fst",
              "localPosition":{
                 "x":-125.5210189819336,
                 "y":51.23112106323242,
                 "z":-142.73825073242188
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.2250025037530614,
                 "y":0.3757312064708178,
                 "z":-0.5706296811566602
              },
              "dimensions":{
                 "x":32.50794514245945,
                 "y":30.76183484985942,
                 "z":24.5495302046312
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":113.85729217529297,
                 "y":-17.32541847229004,
                 "z":-42.691158294677734
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.24042522327387006,
                 "y":0.22903334200165004,
                 "z":0.36111808457561834
              },
              "dimensions":{
                 "x":15.681729875580015,
                 "y":15.280754795530449,
                 "z":14.599359787748893
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":-151.39596557617188,
                 "y":74.66529846191406,
                 "z":17.52863121032715
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.14610293975750066,
                 "y":0.6064390233933921,
                 "z":-0.2834104636164291
              },
              "dimensions":{
                 "x":18.486429314145703,
                 "y":18.22002070686832,
                 "z":16.603389481870135
              }
           },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":96.46646881103516,
                 "y":1.7128931283950806,
                 "z":-124.27156066894531
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.6786502809485063,
                 "y":-0.5465051247917337,
                 "z":0.13556630470001918
              },
              "dimensions":{
                 "x":36.44374613895265,
                 "y":48.415044055496445,
                 "z":43.313732516618565
              }
           },
           {
              "file":"ASTEROID_2.fst",
              "localPosition":{
                 "x":98.95521545410156,
                 "y":-28.545358657836914,
                 "z":37.64087677001953
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.2960433413992649,
                 "y":-0.2645626997971404,
                 "z":0.42182960894171195
              },
              "dimensions":{
                 "x":19.18908261420765,
                 "y":13.8266866833307,
                 "z":15.276174031784265
              }
           },
           {
              "file":"ASTEROID_2.fst",
              "localPosition":{
                 "x":-36.971073150634766,
                 "y":1.5043091773986816,
                 "z":207.38638305664062
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.27807117264162196,
                 "y":-0.2252441477275159,
                 "z":-0.6259002488822225
              },
              "dimensions":{
                 "x":18.56660693122155,
                 "y":19.102264998821806,
                 "z":16.09553036752412
              }
           },
           {
              "file":"ASTEROID_3.fst",
              "localPosition":{
                 "x":133.528564453125,
                 "y":8.326408386230469,
                 "z":-28.487022399902344
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.46124127650360824,
                 "y":-0.6993054749534275,
                 "z":0.3746910946609643
              },
              "dimensions":{
                 "x":30.460595099433355,
                 "y":23.535289926617516,
                 "z":24.546154970479442
              }
           },
           {
              "file":"ASTEROID_5.fst",
              "localPosition":{
                 "x":-102.3790512084961,
                 "y":-74.37055206298828,
                 "z":-150.81509399414062
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.2389892560875646,
                 "y":-0.7482247208262216,
                 "z":0.4151688393013422
              },
              "dimensions":{
                 "x":31.701140388513373,
                 "y":27.579884000092136,
                 "z":35.187571255435444
              }
           },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":-55.10927963256836,
                 "y":-16.57293128967285,
                 "z":-118.13156127929688
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.2873732759018679,
                 "y":-0.1355237729994121,
                 "z":-0.5504831700744265
              },
              "dimensions":{
                 "x":47.84899648151617,
                 "y":42.149444169849744,
                 "z":44.09689171883794
              }
           },
           {
              "file":"ASTEROID_4.fst",
              "localPosition":{
                 "x":113.85887145996094,
                 "y":-27.796493530273438,
                 "z":-150.58021545410156
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.37355165152538694,
                 "y":-0.49656974376233365,
                 "z":-0.5013088442328795
              },
              "dimensions":{
                 "x":10.459900069909006,
                 "y":10.003337899688878,
                 "z":10.86207098356446
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":-225.17413330078125,
                 "y":72.74264526367188,
                 "z":-14.684041023254395
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.7305623830929199,
                 "y":0.5468394580799238,
                 "z":-0.5186271116883415
              },
              "dimensions":{
                 "x":11.195598973590961,
                 "y":10.806630876179314,
                 "z":14.957777462413478
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":-93.93230438232422,
                 "y":-35.88909149169922,
                 "z":96.35460662841797
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.442276620552829,
                 "y":-0.7225880734335169,
                 "z":0.7431330427208951
              },
              "dimensions":{
                 "x":19.21823397448507,
                 "y":19.70379682772978,
                 "z":14.568978397683049
              }
           },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":82.31050872802734,
                 "y":104.97435760498047,
                 "z":169.07423400878906
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.020008653704476798,
                 "y":-0.40281320594908454,
                 "z":-0.34761410708850105
              },
              "dimensions":{
                 "x":4.967427086480361,
                 "y":4.069482746972902,
                 "z":4.464683113162877
              }
           },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":-61.2170524597168,
                 "y":-13.1437406539917,
                 "z":222.4801025390625
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.5031386904721123,
                 "y":0.021479051055893206,
                 "z":0.4323197679583921
              },
              "dimensions":{
                 "x":10.33169034707247,
                 "y":10.842969124353694,
                 "z":8.373789577265773
              }
           },
           {
              "file":"ASTEROID_5.fst",
              "localPosition":{
                 "x":178.59942626953125,
                 "y":-33.30909729003906,
                 "z":50.805789947509766
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.2422995706156179,
                 "y":0.13586682084572632,
                 "z":0.03415699005862749
              },
              "dimensions":{
                 "x":21.85856081190652,
                 "y":20.836339809124254,
                 "z":18.33700167152573
              }
           },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":44.88026809692383,
                 "y":113.63676452636719,
                 "z":-199.52816772460938
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.2212206514533247,
                 "y":0.7338202811041716,
                 "z":0.6411703901140431
              },
              "dimensions":{
                 "x":12.196301184479156,
                 "y":11.545734191807172,
                 "z":9.678107482886439
              }
           },
           {
              "file":"ASTEROID_6.fst",
              "localPosition":{
                 "x":-107.65596008300781,
                 "y":-1.5661840438842773,
                 "z":77.49653625488281
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.13018705420869936,
                 "y":0.27421776944414855,
                 "z":-0.24267546569597287
              },
              "dimensions":{
                 "x":31.844278328142817,
                 "y":40.731215036358826,
                 "z":30.498756824931444
              }
           },
           {
              "file":"ASTEROID_4.fst",
              "localPosition":{
                 "x":-17.039369583129883,
                 "y":-44.60348892211914,
                 "z":112.57948303222656
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.4687175078904604,
                 "y":-0.42324692268541286,
                 "z":-0.3358342508423673
              },
              "dimensions":{
                 "x":21.228487517880453,
                 "y":16.974893541825118,
                 "z":15.766985429641194
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":-123.68285369873047,
                 "y":14.781737327575684,
                 "z":101.19732666015625
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":-0.32083839688756377,
                 "y":0.27579964317234396,
                 "z":0.698423278365367
              },
              "dimensions":{
                 "x":16.054173956298907,
                 "y":16.62136835149648,
                 "z":17.180239547300236
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":218.92564392089844,
                 "y":0.17960898578166962,
                 "z":-34.00898361206055
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.27178290623585655,
                 "y":0.19918566004187344,
                 "z":0.4956103305122701
              },
              "dimensions":{
                 "x":48.7910748209796,
                 "y":48.495167847214326,
                 "z":34.97439346531555
              }
           },
           {
              "file":"ASTEROID_1.fst",
              "localPosition":{
                 "x":36.7520751953125,
                 "y":27.10360336303711,
                 "z":113.44691467285156
              },
              "rotation":{
                 "x":0,
                 "y":0,
                 "z":0,
                 "w":1
              },
              "angularVelocity":{
                 "x":0.09113693373506826,
                 "y":0.3992151854661419,
                 "z":0.40459505745380975
              },
              "dimensions":{
                 "x":20.373726772337,
                 "y":23.22356978802399,
                 "z":19.73141619639423
              }
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
/*        
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
*/
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
