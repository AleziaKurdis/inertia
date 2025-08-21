//
//  crom_cruach_ritual.js
//
//  Created by Alezia Kurdis, February 27th, 2021.
//  Copyright 2021-2025, Overte e.V.
//
//  CROM CRUACK RITUAL.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var ROOT = Script.resolvePath('').split("crom_cruach_ritual.js")[0];
    var epiCenter;
    var renderWithZones;
    var landscapeEntityID;
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var updateTimerInterval = 3000; // 3 sec 
    var processTimer = 0;
    var thisEntity;
    
    var runningSpiritId = Uuid.NONE;
    var zardozId = Uuid.NONE;
    
    var galaxyArmId = Uuid.NONE;
    
    var thorFxId = Uuid.NONE;
    
    var portalProcessStartTime = 0;
    var MINIMUM_WAIT_BEFORE_VORTEX_EVENT = 240000; //4 minutes
    var vortexCalled = false;
    var vortexId = Uuid.NONE;
    var portalId = Uuid.NONE;
    var jumpFxId = Uuid.NONE;
    var vortexStart = 0;
    var VORTEX_DURATION = 30000; //30 sec.
    var vortexConvectionPointFactor = 1;
    
    var VORTEX_SOUND_URL = ROOT + "energy.mp3";
    var vortexSound;
    var vortexInjector;
    
    var LIGHT_RANGE = 28;
    var LIGHT_COLOR_CYCLE_DURATION = 600; //600 sec (10 minutes)
    var lightId = Uuid.NONE;
    var pitMaterialId = Uuid.NONE;

    this.preload = function(entityID) {
        thisEntity = entityID;

        var properties = Entities.getEntityProperties(entityID, ["position", "renderWithZones", "parentID"]);
        epiCenter = properties.position;
        renderWithZones = properties.renderWithZones;
        landscapeEntityID = properties.parentID;
        
        vortexSound = SoundCache.getSound(VORTEX_SOUND_URL);
        
        var today = new Date();
        processTimer = today.getTime();
    
        Script.update.connect(myTimer);
        
    };

    this.unload = function(entityID) {
        shutdown();
    };    

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > updateTimerInterval ) {
            
            var distance = Vec3.distance(MyAvatar.position, epiCenter);
            
            //LIGHT & PIT MATERIAL
            if ( distance < LIGHT_RANGE ) {
                updateTimerInterval = 500;
                updateLight(distance);
                updateRunningSpirit(distance);
                updateGalaxy(distance);
                updatethorFx(distance);
                if (portalProcessStartTime == 0) {
                    portalProcessStartTime = today.getTime();
                }
                updatePortalVortex();
            } else {
                updateTimerInterval = 3000;
                if (lightId !== Uuid.NONE){
                    Entities.deleteEntity(lightId);
                    Entities.deleteEntity(pitMaterialId);
                    lightId = Uuid.NONE;
                    pitMaterialId = Uuid.NONE;                    
                }
                if (runningSpiritId !== Uuid.NONE) {
                    Entities.deleteEntity(zardozId);
                    zardozId = Uuid.NONE;
                    Entities.deleteEntity(runningSpiritId);
                    runningSpiritId = Uuid.NONE;
                }
                if (galaxyArmId !== Uuid.NONE) {
                    Entities.deleteEntity(galaxyArmId);
                    galaxyArmId = Uuid.NONE;
                }
                if (thorFxId !== Uuid.NONE) {
                    Entities.deleteEntity(thorFxId);
                    thorFxId = Uuid.NONE;
                }
                if (vortexId !== Uuid.NONE) {
                    Entities.deleteEntity(vortexId);
                    vortexId = Uuid.NONE;
                    /*Entities.deleteEntity(portalId);
                    portalId = Uuid.NONE;
                    Entities.deleteEntity(jumpFxId);
                    jumpFxId = Uuid.NONE;*/
                }                
                
                portalProcessStartTime = 0;
                vortexCalled = false;
            }
            
            
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function shutdown() {
        if (lightId !== Uuid.NONE){
            //print("KILL!");
            Entities.deleteEntity(lightId);
            Entities.deleteEntity(pitMaterialId);
            lightId = Uuid.NONE;
            pitMaterialId = Uuid.NONE;
        }
        if (runningSpiritId !== Uuid.NONE) {
            Entities.deleteEntity(zardozId);
            zardozId = Uuid.NONE;
            Entities.deleteEntity(runningSpiritId);
            runningSpiritId = Uuid.NONE;
        }
        if (galaxyArmId !== Uuid.NONE) {
            Entities.deleteEntity(galaxyArmId);
            galaxyArmId = Uuid.NONE;
        }
        if (thorFxId !== Uuid.NONE) {
            Entities.deleteEntity(thorFxId);
            thorFxId = Uuid.NONE;
        }
        if (vortexId !== Uuid.NONE) {
            Entities.deleteEntity(vortexId);
            vortexId = Uuid.NONE;
            /*Entities.deleteEntity(portalId);
            portalId = Uuid.NONE;
            Entities.deleteEntity(jumpFxId);
            jumpFxId = Uuid.NONE; */
        }        
        Script.update.disconnect(myTimer);
    }

    // ##### RED RUNNING SPIRIT ##################################
    function updateRunningSpirit(dist) {
        var anticycle = GetCurrentCycleValue(1, LIGHT_COLOR_CYCLE_DURATION) + 0.5;
        if (anticycle > 1) {
            anticycle = anticycle - 1;
        }
        
        var color = hslToRgb(anticycle, 1, 0.5);
        
        var alphafactor = (LIGHT_RANGE - dist)/LIGHT_RANGE;
        var ROTOR_1_HEIGHT = 1.20; //1.20 m
        
        if (runningSpiritId === Uuid.NONE){
            //create
            runningSpiritId = Entities.addEntity({
                "type": "Shape",
                "visible": false,
                "name": "ROTHOR",
                "position": {
                    "x":epiCenter.x,
                    "y": epiCenter.y + ROTOR_1_HEIGHT,
                    "z": epiCenter.z
                },
                "renderWithZones": renderWithZones,
                "dimensions": {
                    "x": 0.20000000298023224,
                    "y": 0.20000000298023224,
                    "z": 0.20000000298023224
                },
                "grab": {
                    "grabbable": false
                },
                "angularVelocity": {
                    "x": 0,
                    "y": 0.5811949968338013,
                    "z": 0
                },
                "damping": 0,
                "angularDamping": 0,
                "restitution": 0,
                "friction": 0,
                "shape": "Cube"
                }, "local");
            
                zardozId = Entities.addEntity({
                    "type": "ParticleEffect",
                    "parentID": runningSpiritId,
                    "name": "ZARDOZ",
                    "renderWithZones": renderWithZones,
                    "localPosition": {
                        "x": 0.6698474884033203,
                        "y": 0.009765625,
                        "z": 5.825725555419922
                    },
                    "dimensions": {
                        "x": 29.80000114440918,
                        "y": 29.80000114440918,
                        "z": 29.80000114440918
                    },
                    "localRotation": {
                        "x": 0.001080600544810295,
                        "y": -0.248988077044487,
                        "z": -0.009234104305505753,
                        "w": -0.9684619307518005
                    },
                    "grab": {
                        "grabbable": false
                    },
                    "angularVelocity": {
                        "x": -0.004555957391858101,
                        "y": 54.09300231933594,
                        "z": 0.0022734003141522408
                    },
                    "damping": 0,
                    "angularDamping": 0,
                    "restitution": 0,
                    "friction": 0,
                    "shapeType": "ellipsoid",
                    "color": {
                        "red": color[0],
                        "green": color[1],
                        "blue": color[2]
                    },
                    "alpha": 0.06 * alphafactor,
                    "textures": ROOT + "fog.png",
                    "maxParticles": 1500,
                    "lifespan": 15,
                    "emitRate": 100,
                    "emitSpeed": 0,
                    "speedSpread": 0.6000000238418579,
                    "emitOrientation": {
                        "x": -0.0000152587890625,
                        "y": -0.0000152587890625,
                        "z": -0.0000152587890625,
                        "w": 1
                    },
                    "polarFinish": 3.1415927410125732,
                    "emitAcceleration": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "particleRadius": 2.5,
                    "radiusSpread": 0.5,
                    "radiusStart": 1.7999999523162842,
                    "radiusFinish": 4.5,
                    "colorSpread": {
                        "red": 64,
                        "green": 64,
                        "blue": 64
                    },
                    "colorStart": {
                        "red": 255,
                        "green": 0,
                        "blue": 0
                    },
                    "colorFinish": {
                        "red": 9,
                        "green": 167,
                        "blue": 235
                    },
                    "alphaSpread": 0.01  * alphafactor,
                    "alphaStart": 0.1  * alphafactor,
                    "alphaFinish": 0,
                    "emitterShouldTrail": true,
                    "spinStart": null,
                    "spinFinish": null 
                }, "local");    
        } else {
            //update
            Entities.editEntity(zardozId, {
                "alpha": 0.06 * alphafactor,
                "alphaSpread": 0.01  * alphafactor,
                "alphaStart": 0.1  * alphafactor,
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                }
            });
            
        }
    }
    // ##### END RED RUNNING SPIRIT ##################################

    // ##### VORTEX-PORTAL ##################################
    function updatePortalVortex() {
        var today = new Date();
        if ((today.getTime() - portalProcessStartTime) > MINIMUM_WAIT_BEFORE_VORTEX_EVENT ) {
            var currentHue = Math.floor(GetCurrentCycleValue(360, LIGHT_COLOR_CYCLE_DURATION));
            
            
            vortexConvectionPointFactor = 1;
            var currentFloatHue = GetCurrentCycleValue(360, LIGHT_COLOR_CYCLE_DURATION);
            if ((currentFloatHue - 30) > -4 && (currentFloatHue - 30) < 12){
                if ((currentFloatHue - 30) < 0) {
                    vortexConvectionPointFactor = 5 - Math.abs(currentFloatHue - 30); 
                } else {
                    vortexConvectionPointFactor = 13 - Math.abs(currentFloatHue - 30);
                    if (vortexConvectionPointFactor > 4) {vortexConvectionPointFactor = 4;}
                }
            }
            if ((currentFloatHue - 210) > -4 && (currentFloatHue - 210) < 12){
                if ((currentFloatHue - 210) < 0) {
                    vortexConvectionPointFactor = 5 - Math.abs(currentFloatHue - 210); 
                } else {
                    vortexConvectionPointFactor = 13 - Math.abs(currentFloatHue - 210);
                    if (vortexConvectionPointFactor > 4) {vortexConvectionPointFactor = 4;}
                }
            }
            
            
            if (currentHue === 30 || currentHue === 210) {
                if (vortexCalled === false) {
                    vortexCalled = true;
                    //print("CURRENT HUE: " + currentHue);
                    //Rez a Vortex for 20 sec
                    
                    vortexInjector = Audio.playSound(vortexSound, {
                            "loop": false,
                            "localOnly": true,
                            "volume": 1
                            });
                            
                    vortexId = Entities.addEntity({
                            "type": "Model",
                            "visible": true,
                            "name": "VORTEX",
                            "dimensions": {
                                "x": 787.3363037109375,
                                "y": 100.0030517578125,
                                "z": 787.3362426757812
                            },
                            "canCastShadow": false,
                            "renderWithZones": renderWithZones,
                            "position": {
                                "x": epiCenter.x,
                                "y": epiCenter.y,
                                "z": epiCenter.z
                            },
                            "grab": {
                                "grabbable": false
                            },
                            "angularVelocity": {
                                "x": 0,
                                "y": 55.85,
                                "z": 0
                            },
                            "angularDamping": 0,
                            "friction": 0,
                            "collisionless": true,
                            "ignoreForCollisions": true,
                            "modelURL": "http://metaverse.bashora.com/objects/CROM_CRUACH/VORTEX_" + currentHue + ".fst",
                            "useOriginalPivot": true
                        }, "local");
                    /*    
                    //Rez a Portal for 20 sec
                    portalId = Entities.addEntity({
                        
                        }, "local"); 
                        
                    //Rez a effect for 20 sec (We coud consider to add light too and sound)
                    jumpFxId = Entities.addEntity({
                        
                        }, "local");*/
                        
                    vortexStart = today.getTime();
                    
                }
            }else{
                vortexCalled = false;
            }
        } else {
            vortexConvectionPointFactor = 1;
            vortexCalled = false;
        }

        if (((today.getTime() - vortexStart) > VORTEX_DURATION) && vortexId !== Uuid.NONE) {
            vortexConvectionPointFactor = 1;
            Entities.deleteEntity(vortexId);
            vortexId = Uuid.NONE;
           /* Entities.deleteEntity(portalId);
            portalId = Uuid.NONE;
            Entities.deleteEntity(jumpFxId);
            jumpFxId = Uuid.NONE;*/
        }

    }


    // ##### GALAXY ##################################
    function updateGalaxy(dist) {
        var GALAXY_EFFECT_RANGE = 10; //10 meters
        var GALAXY_MAX_ROTATION = 15;
        var cycle = GetCurrentCycleValue(1, LIGHT_COLOR_CYCLE_DURATION);
        
        var color = hslToRgb(cycle, 1, 0.8);
        var colorFinish = hslToRgb(cycle, 1, 0.5);
        var alphafactor = (GALAXY_EFFECT_RANGE - dist)/GALAXY_EFFECT_RANGE;
        if (alphafactor < 0) {
            alphafactor = 0;
        }
        var GALAXY_ROTOR_HEIGHT = -0.2; //0 m
        //print("alphafactor: " + alphafactor);
        //print("vortexConvectionPointFactor = " +vortexConvectionPointFactor);
        if (galaxyArmId === Uuid.NONE){
            //create

                galaxyArmId = Entities.addEntity({
                    "type": "ParticleEffect",
                    "parentID": thisEntity,
                    "name": "GALAXY_ARM",
                    "renderWithZones": renderWithZones,
                    "position": {
                                    "x":epiCenter.x,
                                    "y": epiCenter.y + GALAXY_ROTOR_HEIGHT,
                                    "z": epiCenter.z
                    },
                    "dimensions": {
                        "x": 10,
                        "y": 10,
                        "z": 10
                    },
                    "grab": {
                        "grabbable": false
                    },
                    "damping": 0,
                    "angularDamping": 0,
                    "restitution": 0,
                    "friction": 0,
                    "shapeType": "ellipsoid",
                    "color": {
                        "red": color[0],
                        "green": color[1],
                        "blue": color[2]
                    },
                    "alpha": 0.8 * alphafactor,
                    "textures": "http://metaverse.bashora.com/scripts/crom_cruach/star_particle_a.png",
                    "maxParticles": 3200,
                    "lifespan": 4,
                    "emitRate": 800 * alphafactor,
                    "emitSpeed": -0.7 * alphafactor,
                    "speedSpread": 0,
                    "emitOrientation": {
                        "x": -0.0000152587890625,
                        "y": -0.0000152587890625,
                        "z": -0.0000152587890625,
                        "w": 1
                    },
                    "polarFinish": 3.1415927410125732,
                    "emitDimensions": {
                        "x": 1.8,// - (1.6 * alphafactor),
                        "y": 0.2,// - ( 0.1 * alphafactor),
                        "z": 1.8// - (1.6 * alphafactor)
                    },
                    "emitAcceleration": {
                        "x": 0,
                        "y": 0.9 * alphafactor * vortexConvectionPointFactor,
                        "z": 0
                    },                    
                    "particleRadius": 0.3 * vortexConvectionPointFactor,
                    "radiusSpread": 0.25 * vortexConvectionPointFactor,
                    "radiusStart":0.6 * alphafactor * vortexConvectionPointFactor,
                    "radiusFinish": 0.1 * vortexConvectionPointFactor,
                    "colorSpread": {
                        "red": 16,
                        "green": 16,
                        "blue": 16
                    },
                    "colorStart": {
                        "red": 255,
                        "green": 255,
                        "blue": 255
                    },
                    "colorFinish": {
                        "red": colorFinish[0],
                        "green": colorFinish[1],
                        "blue": colorFinish[2]
                    },
                    "alphaSpread": 0.1  * alphafactor,
                    "alphaStart": 0.5  * alphafactor,
                    "alphaFinish": 0,
                    "emitterShouldTrail": true,
                    "spinStart": -3.1415927410125732,
                    "spinFinish": 3.1415927410125732,
                    "visible": true              
                }, "local");    
        } else {

            Entities.editEntity(galaxyArmId, {
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },
                "colorFinish": {
                    "red": colorFinish[0],
                    "green": colorFinish[1],
                    "blue": colorFinish[2]
                },                
                "emitAcceleration": {
                    "x": 0,
                    "y": 0.9 * alphafactor * vortexConvectionPointFactor * vortexConvectionPointFactor,
                    "z": 0
                },
                "alphaSpread": 0.1  * alphafactor,
                "alphaStart": 0.5  * alphafactor,
                "alphaFinish": 0,
                "alpha": 0.8 * alphafactor,
                "emitDimensions": {
                    "x": 1.8,// - (1.6 * alphafactor),
                    "y": 0.2,// - ( 0.1 * alphafactor),
                    "z": 1.8// - (1.6 * alphafactor)
                },
                "emitSpeed": -0.7 * alphafactor,
                "speedSpread": 0,
                "emitRate": 800 * alphafactor,
                "particleRadius": 0.3 * vortexConvectionPointFactor,
                "radiusSpread": 0.25 * vortexConvectionPointFactor,
                "radiusStart":0.6 * alphafactor * vortexConvectionPointFactor,
                "radiusFinish": 0.1 * vortexConvectionPointFactor             
            });
            
        }
        // ##### END GALAXY ##################################
        
    }


    // ##### THORFX ##################################
    function updatethorFx(dist) {
        var THOR_EFFECT_RANGE = 6; //6 meters
        var LIGHTNINGS_MAX_SIZE = 2; 
        var cycle = GetCurrentCycleValue(1, LIGHT_COLOR_CYCLE_DURATION);
        
        var color = hslToRgb(cycle, 1, 0.8);
        var colorFinish = hslToRgb(cycle, 1, 0.5);
        var alphafactor = (THOR_EFFECT_RANGE - dist)/THOR_EFFECT_RANGE;
        if (alphafactor < 0) {
            alphafactor = 0;
        }

        
        if (thorFxId === Uuid.NONE){
            //create
            //print("CREATE!!!!!!");

            thorFxId = Entities.addEntity({
                "type": "ParticleEffect",
                "parentID": thisEntity,
                "name": "THOR_FX",
                "renderWithZones": renderWithZones,
                "position": {
                    "x":epiCenter.x,
                    "y": epiCenter.y + ((LIGHTNINGS_MAX_SIZE/1.5) * alphafactor),
                    "z": epiCenter.z                    
                },
                "dimensions": {
                    "x": 10,
                    "y": 10,
                    "z": 10
                },
                "grab": {
                    "grabbable": false
                },
                "shapeType": "ellipsoid",
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },
                "alpha": 0,
                "textures": "http://metaverse.bashora.com/scripts/crom_cruach/thorFX.png",
                "maxParticles": 200,
                "lifespan": 0.15,
                "emitRate": Math.floor(100 * alphafactor),
                "emitSpeed": 0,
                "speedSpread": 0,
                "emitOrientation": {
                    "x": -0.0000152587890625,
                    "y": -0.0000152587890625,
                    "z": -0.0000152587890625,
                    "w": 1
                },
                "polarFinish": 3.1415927410125732,
                "emitDimensions": {
                    "x": 1.6 - ( 1.4 * alphafactor),
                    "y": 0.1 - ( 0.05 * alphafactor),
                    "z": 1.6 - ( 1.4 * alphafactor),
                },
                "emitAcceleration": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },                    
                "particleRadius": LIGHTNINGS_MAX_SIZE * alphafactor,
                "radiusSpread": LIGHTNINGS_MAX_SIZE/4,
                "radiusStart":LIGHTNINGS_MAX_SIZE * alphafactor,
                "radiusFinish": LIGHTNINGS_MAX_SIZE * alphafactor,
                "colorSpread": {
                    "red": 32,
                    "green": 32,
                    "blue": 32
                },
                "colorStart": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "colorFinish": {
                    "red": colorFinish[0],
                    "green": colorFinish[1],
                    "blue": colorFinish[2]
                },
                "alphaSpread": 0,
                "alphaStart": 1,
                "alphaFinish": 1,
                "emitterShouldTrail": true,
                "visible": true,
                "spinSpread": 0.2                
            }, "local");    
        } else {
            //update
            //print("UPDATE!!!!!!");

            Entities.editEntity(thorFxId, {
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },
                "colorFinish": {
                    "red": colorFinish[0],
                    "green": colorFinish[1],
                    "blue": colorFinish[2]
                },
                "particleRadius": LIGHTNINGS_MAX_SIZE * alphafactor,
                "radiusSpread": LIGHTNINGS_MAX_SIZE/4,
                "radiusStart":LIGHTNINGS_MAX_SIZE * alphafactor,
                "radiusFinish": LIGHTNINGS_MAX_SIZE * alphafactor,
                "emitRate": Math.floor(100 * alphafactor),
                "emitDimensions": {
                    "x": 1.6 - ( 1.4 * alphafactor),
                    "y": 0.1 - ( 0.05 * alphafactor),
                    "z": 1.6 - ( 1.4 * alphafactor),
                },
                "position": {
                    "x":epiCenter.x,
                    "y": epiCenter.y + ((LIGHTNINGS_MAX_SIZE/1.5) * alphafactor),
                    "z": epiCenter.z                    
                },
                "spinSpread": 0.2
            });
            
        }
        // ##### END THORFX ##################################
        
    }


    function updateLight(dist) {
        //color
        var lightColor = hslToRgb(GetCurrentCycleValue(1, LIGHT_COLOR_CYCLE_DURATION), 1, 0.5);
        var lightIntensity = LIGHT_RANGE - dist;
        var bloom = 2.28;
        var colorForMaterial = "[" + (bloom * (lightColor[0]/255)) + "," + (bloom * (lightColor[1]/255)) + "," + (bloom * (lightColor[2]/255)) + "]";
        
        
        //DEBUG ##################################
        //print("COLOR: " + JSON.stringify(lightColor));
        //print("INTENSITY: " + lightIntensity);
        //print("IDS: " + lightId + " AND " + pitMaterialId);
        
        //DEBUG ##################################
        
        //material
        if (pitMaterialId === Uuid.NONE){
            //create
            pitMaterialId = Entities.addEntity({
                "type": "Material",
                "name": "PitMaterial",
                "rotation": {
                    "x": -0.000030517578125,
                    "y": -0.000030517578125,
                    "z": -0.000030517578125,
                    "w": 1
                },
                "position": epiCenter,
                "renderWithZones": renderWithZones,
                "parentID": landscapeEntityID,
                "grab": {
                    "grabbable": false
                },
                "materialURL": "materialData",
                "priority": 1,
                "parentMaterialName": "[mat::ORACLE]",
                "materialData": "{\"materialVersion\":1,\"materials\":[{\"name\":\"ENERGY\",\"albedo\":[1,1,1],\"metallic\":0.001,\"roughness\":1,\"opacity\":1,\"emissive\":" + colorForMaterial + ",\"scattering\":0,\"unlit\":false,\"model\":\"hifi_pbr\"}]}"
            }, "local");
            
        } else {
            //update
            Entities.editEntity(pitMaterialId, {
                "materialData": "{\"materialVersion\":1,\"materials\":[{\"name\":\"ENERGY\",\"albedo\":[1,1,1],\"metallic\":0.001,\"roughness\":1,\"opacity\":1,\"emissive\":" + colorForMaterial + ",\"scattering\":0,\"unlit\":false,\"model\":\"hifi_pbr\"}]}"
            });
        }
        
        //light

        
        if (lightId === Uuid.NONE){
            //print("CREATE!");
            //create
            lightId = Entities.addEntity({
                "type": "Light",
                "name": "CROM_PIT_LIGHT",
                "dimensions": {
                    "x": LIGHT_RANGE * 2,
                    "y": LIGHT_RANGE * 2,
                    "z": LIGHT_RANGE * 2
                },
                "renderWithZones": renderWithZones,
                "position": epiCenter,
                "rotation": {
                    "x": 0.7071068286895752,
                    "y": 0,
                    "z": 0,
                    "w": 0.7071068286895752
                },
                "grab": {
                    "grabbable": false
                },
                "color": {
                    "red": lightColor[0],
                    "green": lightColor[1],
                    "blue": lightColor[2]
                },
                "intensity": lightIntensity,
                "isSpotlight": true,
                "exponent": 1,
                "cutoff": 90,
                "falloffRadius": 1.618,
                "visible": true,
                "locked": false
            }, "local");
        } else {
            //update
            //print("UPDATE!");
            Entities.editEntity(lightId, {
                "color": {
                    "red": lightColor[0],
                    "green": lightColor[1],
                    "blue": lightColor[2]
                },
                "intensity": lightIntensity
            });
        }        
    }

    // ################## COLOR FUNCTIONS ####################################
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
    
    
    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}    

})
