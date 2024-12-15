//#####################
//
//  navigationAmbiencePentacle.js
//
//  Created by Alezia Kurdis, November 7th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Dark ambience for witchcraft.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("navigationAmbiencePentacle.js")[0];
    var isInitiated = false;
    var universeDimension;
    var universeCenter;
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var HALF = 0.5;
    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;
    var SKY_LAPS_BEFORE_PROCESS = 3;
    var skyLap = SKY_LAPS_BEFORE_PROCESS;

    var tideUpdateLap = 0;
    var waterDirection = 1;
    var WATER_SPEED = 0.3; // m/sec
    var SEA_DELTA_Y_BELOW = 299.2; //m
    var seaId = Uuid.NONE;
    var NBR_LAP_TIDE = 30; //N lap of UPDATE_TIMER_INTERVAL sec
    var TIDE_AMPLITUDE = 0.5; //in meter

    var astrolithID = Uuid.NONE;
    var ASTROLITH_URL = ROOT + "images/ASTROLITHE.png";
    
    var AIR_SOUND = ROOT + "sounds/air.mp3";
    var airSound, injector;    
    var playing = 0;
    var FLYING_AIR_MAX_VOLUME = 0.5;

    var UFO_TIDE_CYCLE_DURATION = 18720; //5.2 hours
    
    var DAY_DURATION = 104400; //D29
    var storming = false;
    var lightningsID = Uuid.NONE;
    var LIGNTNINGS_PARTICLE_URL = ROOT + "images/PARTICLE_LIGHTNING_HYTRION_B.png";
    var THUNDER_SOUND_1 = ROOT + "sounds/thunder0.mp3";
    var THUNDER_SOUND_2 = ROOT + "sounds/thunder1.mp3";
    var THUNDER_SOUND_3 = ROOT + "sounds/thunder2.mp3";
    var THUNDER_SOUND_4 = ROOT + "sounds/thunder3.mp3";   
    var thunderSound = []; 
    var thunderInjector;

    var zoneID = Uuid.NONE;
    var starID = Uuid.NONE;
    var fireMatId = Uuid.NONE;
    var starLightID = Uuid.NONE;
    var monthaID = Uuid.NONE;
    var yeraID = Uuid.NONE;
    var STAR_DIAMETER = 90;
    var STAR_DIST = 6000;
    
    var thisEntityID;
    var UNIVERSE_SOUND = ROOT + "sounds/limboAmbience.mp3";
    var UNIVERSE_SOUND_VOLUME_MAXIMUM = 0.18;
    var universeSound, universeSoundInjector;
    var univerSoundPlaying = 0;
    var blindspots = [
        {
            "name": "AK003-1 METASPACEPORT",
            "position": {
                "x": 17,
                "y": 0,
                "z": 30,
             },
            "occultationRadius": 25.5,
            "influenceRadius": 60,
            "astroids": true
        }        
    ];
    
   
    this.preload = function(entityID) {
        thisEntityID = entityID;
        airSound = SoundCache.getSound(AIR_SOUND);
        universeSound = SoundCache.getSound(UNIVERSE_SOUND);
 
        thunderSound[0] = SoundCache.getSound(THUNDER_SOUND_1);
        thunderSound[1] = SoundCache.getSound(THUNDER_SOUND_2);
        thunderSound[2] = SoundCache.getSound(THUNDER_SOUND_3);
        thunderSound[3] = SoundCache.getSound(THUNDER_SOUND_4);
        
        if (!isInitiated){
            if (positionIsInsideEntityBounds(entityID, MyAvatar.position)) {
                initiate(entityID);
            }
        }  
        
    };

    this.enterEntity = function(entityID) {
        if (!isInitiated){
            initiate(entityID);
        }
    };

    this.leaveEntity = function(entityID) {
        shutdown();
    };
    
    this.unload = function(entityID) {
        shutdown();
    };    

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            updateNavigation();
            skyLap = skyLap - 1;
            if (skyLap <= 0) {
                skyLap = SKY_LAPS_BEFORE_PROCESS;
                generateSky(thisEntityID);
            }
            tideUpdateLap++;
            if (tideUpdateLap === NBR_LAP_TIDE) {
                genWater();
                tideUpdateLap = 0;
            }
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function shutdown() {
        if (isInitiated){
            Script.update.disconnect(myTimer);
            if (astrolithID != Uuid.NONE){
                Entities.deleteEntity(astrolithID);
                astrolithID = Uuid.NONE;
            }
            if (univerSoundPlaying == 1) {
                universeSoundInjector.stop();
                univerSoundPlaying = 0;
            }
            if (zoneID !== Uuid.NONE) {
                Entities.deleteEntity(zoneID);
                zoneID = Uuid.NONE;
            }
            if (seaId != Uuid.NONE){
                Entities.deleteEntity(seaId);
                seaId = Uuid.NONE;
            }
            
            if (starID !== Uuid.NONE) {
                Entities.deleteEntity(starID);
                starID = Uuid.NONE;
            }
            fireMatId = Uuid.NONE;
            starLightID = Uuid.NONE;
            monthaID = Uuid.NONE;
            yeraID = Uuid.NONE;
            
            if (lightningsID !== Uuid.NONE) {
                Entities.deleteEntity(lightningsID);
                lightningsID = Uuid.NONE;
            }
        }
        isInitiated = false;
    }

    function genWater() {
        var tide = (TIDE_AMPLITUDE/2) + Math.sin(GetCurrentCycleValue(Math.PI * 2, Math.floor(DAY_DURATION * 12.41/24))) * TIDE_AMPLITUDE;
        currentOffset = waterDirection * NBR_LAP_TIDE * (UPDATE_TIMER_INTERVAL/1000) * WATER_SPEED;
        waterDirection = -waterDirection;
        var velocity = {"x": 0.0 , "y": 0.0, "z": WATER_SPEED * waterDirection};
        var waterPosition = {"x":universeCenter.x,"y":universeCenter.y + tide - SEA_DELTA_Y_BELOW,"z":universeCenter.z + currentOffset};
        
        if (seaId === Uuid.NONE) {
            seaId = Entities.addEntity({
                "type": "Model",
                "name": "SEA",
                "renderWithZone": renderWithZones,
                "dimensions": {"x":18000,"y":0.01,"z":18000},
                "position": waterPosition,
                "modelURL": ROOT + "models/AQUASPHERE.fst",
                "useOriginalPivot": true,
                "shapeType": "none",
                "grab": {
                    "grabbable": false
                },
                "velocity": velocity,
                "damping": 0
            }, "local");
            
        } else {
            Entities.editEntity(seaId,{
                "position": waterPosition,
                "velocity": velocity
            });
        }
    }

    function initiate(EntID) {
        var properties = Entities.getEntityProperties(EntID, ["position", "dimensions"]);
        universeCenter = properties.position;
        universeDimension = properties.dimensions;

        isInitiated = true; 
 
        univerSoundPlaying = 0;
        generateSky(EntID);
        genWater();

        var today = new Date();
        processTimer = today.getTime();
        skyLap = 20;
        
        Script.update.connect(myTimer);
    }

    function generateSky(entityID) {
        print("GENSKY");//################################################## DEBUG
        var azimuth = GetCurrentCycleValue(360, DAY_DURATION);
        var zoneRotation = Quat.fromVec3Degrees( {"x": 40.0, "y": azimuth, "z": 0.0} );
        var skyTextureUrl = ROOT + "images/darkness.jpg";
        var hue = GetCurrentCycleValue(1, DAY_DURATION * 9);
        var skycolor = hslToRgb(hue, 1, 0.65);
        var fullColor = hslToRgb(hue, 1, 0.5);

        if (zoneID === Uuid.NONE) {
            zoneID = Entities.addEntity({
                "type": "Zone",
                "name": "PENTACLE_(!)_Z0N3",
                "dimensions": {
                    "x": universeDimension.x - 20,
                    "y": universeDimension.y - 20,
                    "z": universeDimension.z - 20
                },
                "parentID": entityID,
                //"localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "position": MyAvatar.position,
                //"localRotation": zoneRotation,
                "rotation": zoneRotation,
                "grab": {
                    "grabbable": false
                },
                "shapeType": "sphere",
                "keyLight": {
                    "color": {
                        "red": skycolor[0],
                        "green": skycolor[1],
                        "blue": skycolor[2]
                    },
                    "intensity": 2,
                    "direction": {
                        "x": 0,
                        "y": 0,
                        "z": 1
                    },
                    "castShadows": true,
                    "shadowBias": 0.02,
                    "shadowMaxDistance": 100
                },
                "ambientLight": {
                    "ambientIntensity": 0.5,
                    "ambientURL": skyTextureUrl,
                    "ambientColor": {
                        "red": fullColor[0],
                        "green": fullColor[1],
                        "blue": fullColor[2]
                    }
                },
                "skybox": {
                    "color": {
                        "red": fullColor[0],
                        "green": fullColor[1],
                        "blue": fullColor[2]
                    },
                    "url": skyTextureUrl
                },
                "bloom": {
                    "bloomIntensity": 0.5
                },
                "keyLightMode": "enabled",
                "ambientLightMode": "enabled",
                "skyboxMode": "enabled",
                "hazeMode": "disabled",
                "bloomMode": "enabled"
            },"local");
        } else {
            Entities.editEntity(zoneID, {
                "position": MyAvatar.position, //there was no position change before
                //"localRotation": zoneRotation,
                "rotation": zoneRotation,
                "keyLight": {
                    "color": {
                        "red": skycolor[0],
                        "green": skycolor[1],
                        "blue": skycolor[2]
                    }
                },
                "ambientLight": {
                    "ambientColor": {
                        "red": fullColor[0],
                        "green": fullColor[1],
                        "blue": fullColor[2]
                    }
                },
                "skybox": {
                    "color": {
                        "red": fullColor[0],
                        "green": fullColor[1],
                        "blue": fullColor[2]
                    }
                }
            });
        }
        manageAstre(hue);
    }
    
    function manageAstre(hue) {
        var azimuth = GetCurrentCycleValue(360, DAY_DURATION);
        var offsetAzimuth = azimuth + 12;
        if (offsetAzimuth >= 360.00) { 
            offsetAzimuth = offsetAzimuth - 360.00;
        }
        var rotation = Quat.fromVec3Degrees( {"x": 40.0, "y": azimuth, "z": 0.0} );
        if (starID === Uuid.NONE) {
            //create
            starID = Entities.addEntity({
                "name": "STAR",
                //"parentID": zoneID,
                "dimensions": {"x": STAR_DIAMETER, "y": STAR_DIAMETER, "z": STAR_DIAMETER},
                "localPosition": Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV( rotation, {"x": 0.0, "y": 0.0, "z": -STAR_DIST})),
                "localRotation": Quat.fromVec3Degrees( {"x": 20.0, "y": 0.0, "z": 0.0} ),
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": [zoneID],
                "damping": 0
            }, "local");
        } else {
            //edit
            Entities.editEntity(starID, {
                "localPosition": Vec3.multiplyQbyV( rotation, {"x": 0.0, "y": 0.0, "z": -STAR_DIST}),
            });
        }
        manageStarLight(hue);
        managePlanets(); //Montha and Yera
        manageStarMaterial(hue);
    }
    
    function manageStarLight(hue) {
        if (starID !== Uuid.NONE) {
            var lightColor = hslToRgb(hue, 1, 0.57);
            if (starLightID === Uuid.NONE) {
                starLightID = Entities.addEntity({
                    "name": "Star Light",
                    "parentID": starID,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                    "type": "Light",
                    "dimensions": {"x": 2000.0, "y": 2000.0, "z": 2000.0},
                    "color": {
                        "red": lightColor[0],
                        "green": lightColor[1],
                        "blue": lightColor[2]
                    },
                    "intensity": 18,
                    "falloffRadius": 500
                }, "local");
            } else {
                Entities.editEntity(starLightID, {
                    "color": {
                        "red": lightColor[0],
                        "green": lightColor[1],
                        "blue": lightColor[2]
                    }
                });
            }
        }
    }
    
    function managePlanets() {
        if (starID !== Uuid.NONE) {
            //Montha
            var MONTHA_DISTANCE = 400;
            var azimuth = GetCurrentCycleValue(360, DAY_DURATION * 36);
            var rotation = Quat.fromVec3Degrees( {"x": 0.0, "y": azimuth, "z": 0.0} );
            if (monthaID === Uuid.NONE) {
                monthaID = Entities.addEntity({
                    "name": "Planet  Montha",
                    "parentID": starID,
                    "localPosition": Vec3.multiplyQbyV( rotation, {"x": 0.0, "y": 0.0, "z": -300}),
                    "type": "Shape",
                    "shape": "Sphere",
                    "dimensions": {"x": 30, "y": 30, "z": 30},
                    "color": {
                        "red": 210,
                        "green": 210,
                        "blue": 210
                    }
                }, "local");
            } else {
                Entities.editEntity(monthaID, {
                    "localPosition": Vec3.multiplyQbyV( rotation, {"x": 0.0, "y": 0.0, "z": -MONTHA_DISTANCE}),
                });
            }
            //Yera
            var YERA_DISTANCE = 900;
            azimuth = GetCurrentCycleValue(360, DAY_DURATION * 360);
            rotation = Quat.fromVec3Degrees( {"x": 0.0, "y": azimuth, "z": 0.0} );
            if (yeraID === Uuid.NONE) {
                yeraID = Entities.addEntity({
                    "name": "Planet Yera",
                    "parentID": starID,
                    "localPosition": Vec3.multiplyQbyV( rotation, {"x": 0.0, "y": 0.0, "z": -YERA_DISTANCE}),
                    "type": "Shape",
                    "shape": "Sphere",
                    "dimensions": {"x": 20.0, "y": 20.0, "z": 20.0},
                    "color": {
                        "red": 190,
                        "green": 190,
                        "blue": 190
                    }
                }, "local");
            } else {
                Entities.editEntity(yeraID, {
                    "localPosition": Vec3.multiplyQbyV( rotation, {"x": 0.0, "y": 0.0, "z": -YERA_DISTANCE}),
                });
            }
        }
    }
    
    function manageStarMaterial(hue) {
        if (starID !== Uuid.NONE) {
            
            var plasmaColor = hslToRgb(hue, 1, 0.6);
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
            
            if (fireMatId === Uuid.NONE) {
                //CREATE
                fireMatId = Entities.addEntity({
                    "type": "Material",
                    "parentID": starID,
                    "renderWithZones": [zoneID],
                    "position": universeCenter,
                    "name": "plasma-material",
                    "materialURL": "materialData",
                    "priority": 2,
                    "materialData": JSON.stringify(materialContent)
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(fireMatId, {
                    "materialData": JSON.stringify(materialContent)
                });
            }
        }
    }

    function updateNavigation() {
        if (isInitiated){
            var myAvPos = MyAvatar.position;

            edgeOfUniverse();        

            var myVelocity = Vec3.length(MyAvatar.velocity);

            if (myVelocity > 10) {
                if (playing == 0){
                    injector = Audio.playSound(airSound, {
                        "loop": true,
                        "localOnly": true,
                        "volume": ((myVelocity - 10)/50) * FLYING_AIR_MAX_VOLUME
                        });
                    playing = 1;
                } else {
                    injector.setOptions({"volume": (myVelocity - 10)/50});
                }
            } else {
                if (playing != 0) {
                    injector.stop();
                    playing = 0;
                }
            }

            var myAvRot = MyAvatar.orientation;
            var distanceAstrolith = 65;
            var radiusEffect = 50;//70; 
            if (myVelocity > 25){
                if (astrolithID == Uuid.NONE){
                    astrolithID = Entities.addEntity({
                        "type": "ParticleEffect",
                        "name": "ASTROLITHES",
                        "dimensions": {
                            "x": radiusEffect,
                            "y": radiusEffect,
                            "z": radiusEffect
                        },
                        "position": Vec3.sum(myAvPos, Vec3.multiply( Vec3.normalize(MyAvatar.velocity), distanceAstrolith )),
                        "rotation": myAvRot,
                        "grab": {
                            "grabbable": false
                        },
                        "shapeType": "ellipsoid",
                        "textures": ASTROLITH_URL,
                        "maxParticles": 1000,
                        "lifespan": 3,
                        "emitRate": 330,
                        "emitSpeed": 1,
                        "speedSpread": 1,
                        "emitOrientation": {
                            "x": 0,
                            "y": 0,
                            "z": 0,
                            "w": 1
                        },
                        "emitDimensions": {
                            "x": radiusEffect,
                            "y": radiusEffect,
                            "z": radiusEffect
                        },
                        "polarStart": 0,
                        "polarFinish": Math.PI,
                        "azimuthStart": -Math.PI,
                        "azimuthFinish": Math.PI,
                        "emitAcceleration": {
                            "x": 0,
                            "y": 0,
                            "z": 0
                        },
                        "particleRadius": 0.2,
                        "radiusStart": 0.4,
                        "radiusFinish": 0.1,
                        "colorStart": {
                            "red": 255,
                            "green": 255,
                            "blue": 255
                        },
                        "colorFinish": {
                            "red": 255,
                            "green": 255,
                            "blue": 255
                        },
                        "alphaStart": 1,
                        "alpha": 1,
                        "alphaFinish": 0,
                        "emitterShouldTrail": true                        
                    }, "local");
                }else{
                    Entities.editEntity(astrolithID, {"rotation": myAvRot, 
                        "position": Vec3.sum(myAvPos, Vec3.multiply( Vec3.normalize(MyAvatar.velocity), distanceAstrolith )) 
                        });
                }
            }else{
                if (astrolithID != Uuid.NONE){
                    Entities.deleteEntity(astrolithID);
                    astrolithID = Uuid.NONE;
                }
            }
            
            //######### UNIVERSE SOUD VOLUME MANAGEMENT ##############
            var universeVolume = UNIVERSE_SOUND_VOLUME_MAXIMUM;
            var astroidFXstatus = true;
            if (blindspots.length !== 0) {
                var volumeEval, distEval;
                for (var b = 0; b < blindspots.length; b++) {
                    distEval = Vec3.distance(blindspots[b].position, myAvPos);
                    if (distEval < blindspots[b].influenceRadius) {
                        if (blindspots[b].astroids === false) {
                            astroidFXstatus = false;
                        }
                    }
                    volumeEval = universeVolume * ((distEval - blindspots[b].occultationRadius)/(blindspots[b].influenceRadius - blindspots[b].occultationRadius));
                    if (volumeEval < 0) { 
                        volumeEval = 0;
                    }
                    if (universeVolume > volumeEval) { 
                        universeVolume = volumeEval; 
                    }
                }
            }
            if (univerSoundPlaying === 1) {
                if (universeVolume > 0) {
                    universeSoundInjector.setOptions({"volume": universeVolume});
                } else {
                    universeSoundInjector.stop();
                    univerSoundPlaying = 0;
                }
            } else {
                if (universeVolume > 0 && universeSound.downloaded) {
                    universeSoundInjector = Audio.playSound(universeSound, {
                            "loop": true,
                            "localOnly": true,
                            "volume": universeVolume
                            });
                    univerSoundPlaying = 1;
                }   
            }
            // ######### END UNIVERSE SOUD VOLUME MANAGEMENT ######## 
            //############## NOCTURN LIGHTNINGS AND THUNDER #############
            
            var d29CurrentHour = (GetCurrentCycleValue(8640000, DAY_DURATION)/100) / 3600;
            
            //if ( d29CurrentHour > 11.5 || d29CurrentHour < 11 ) { //debug
            if ( d29CurrentHour > 1 && d29CurrentHour < 2 ) {
                if (storming) {
                    // Manage thunder and color
                    Entities.editEntity(lightningsID, { "position": Vec3.sum(myAvPos, Vec3.multiply(Quat.getForward(myAvRot), 2 )) });
                    
                    if (Math.random() < 0.05 && universeVolume != 0) { //0.05 = 1 fois par 20 sec
                        var thunderVolume = Math.random() * (universeVolume/UNIVERSE_SOUND_VOLUME_MAXIMUM);
                        var thunderSoundIndex = Math.floor(Math.random() * thunderSound.length);
                        var thunderPitch = (0.6 + (Math.random() * 1.5));
                        thunderInjector = Audio.playSound(thunderSound[thunderSoundIndex], {
                            "loop": false,
                            "localOnly": true,
                            "volume": thunderVolume,
                            "pitch": thunderPitch
                            });
                    }
                } else {
                    //initiate the storm
                    lightningsID = Entities.addEntity({
                        "type": "ParticleEffect",
                        "name": "NOCTURN_STORM",
                        "dimensions": {
                            "x": 3000,
                            "y": 3000,
                            "z": 3000
                        },
                        "position": Vec3.sum(myAvPos, Vec3.multiply(Quat.getForward(myAvRot), 2 )),
                        "grab": {
                            "grabbable": false
                        },
                        "shapeType": "ellipsoid",
                        "textures": LIGNTNINGS_PARTICLE_URL,
                        "maxParticles": 10,
                        "lifespan": 0.3,
                        "emitRate": 0.25,
                        "emitSpeed": 0,
                        "speedSpread": 0,
                        "emitOrientation": {
                            "x": 0,
                            "y": 0,
                            "z": 0,
                            "w": 1
                        },
                        "emitDimensions": {
                            "x": 3000,
                            "y": 3000,
                            "z": 3000
                        },
                        "polarStart": 0,
                        "polarFinish": Math.PI,
                        "azimuthStart": -Math.PI,
                        "azimuthFinish": Math.PI,
                        "emitAcceleration": {
                            "x": 0,
                            "y": 0,
                            "z": 0
                        },
                        "particleRadius": 900,
                        "radiusStart": 900,
                        "radiusFinish": 900,
                        "radiusSpread": 500,
                        "color": {
                            "red": 255,
                            "green": 255,
                            "blue": 255
                        },
                        "colorStart": {
                            "red": 255,
                            "green": 255,
                            "blue": 255
                        },
                        "colorFinish": {
                            "red": 255,
                            "green": 255,
                            "blue": 255
                        },
                        "colorSpread": {
                            "red": 255,
                            "green": 255,
                            "blue": 255
                        }, 
                        "alphaStart": 0.4,
                        "alpha": 0,
                        "alphaFinish": 0.4,
                        "particleSpin": 3.140000104904175,
                        "spinSpread": 3.140000104904175,
                        "spinStart": 3.140000104904175,
                        "spinFinish": 3.140000104904175,
                        "emitterShouldTrail": true
                    }, "local");
                    
                    storming = true;
                }
            } else {
                if (storming) {
                    // stop the storm
                    Entities.deleteEntity(lightningsID);
                    lightningsID = Uuid.NONE;
                    storming = false;
                }
            }
            
            //############## END NOCTURN LIGHTNINGS AND THUNDER #############
            
        }
    } 

    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}    
    // ################## END CYLCE AND TIME FUNCTIONS ###########################   

    function edgeOfUniverse() {
            //INFINIT AREA
            var myPosition = MyAvatar.position;
            var myRotation = MyAvatar.orientation;
            var isInTheEdge = 0;
            
            var distance = Vec3.distance(myPosition, universeCenter);
            var vecFromCenter = Vec3.subtract( myPosition, universeCenter);
            if (distance > (universeDimension.x / 2) - 100 && distance < (universeDimension.x / 2) + 300){
                myPosition.x = universeCenter.x - vecFromCenter.x;
                myPosition.y = universeCenter.y - vecFromCenter.y;
                myPosition.z = universeCenter.z - vecFromCenter.z;
                MyAvatar.goToLocation( myPosition, true, myRotation);
            } 
    }

    function positionIsInsideEntityBounds(entityID, targetPosition) {
        targetPosition = targetPosition || MyAvatar.position;

        var properties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
        var entityPosition = properties.position;
        var entityDimensions = properties.dimensions;
        var entityRotation = properties.rotation;

        var worldOffset = Vec3.subtract(targetPosition, entityPosition);
        targetPosition = Vec3.multiplyQbyV(Quat.inverse(entityRotation), worldOffset);

        var minX = -entityDimensions.x * HALF;
        var maxX = entityDimensions.x * HALF;
        var minY = -entityDimensions.y * HALF;
        var maxY = entityDimensions.y * HALF;
        var minZ = -entityDimensions.z * HALF;
        var maxZ = entityDimensions.z * HALF;

        return (targetPosition.x >= minX && targetPosition.x <= maxX
            && targetPosition.y >= minY && targetPosition.y <= maxY
            && targetPosition.z >= minZ && targetPosition.z <= maxZ);
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

})
