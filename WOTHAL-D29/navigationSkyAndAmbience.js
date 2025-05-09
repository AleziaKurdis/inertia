//#####################
//
//  navigationSkyAndAmbience.js
//
//  Created by Alezia Kurdis, February 9th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Wothal D29 sky, Navigation and ambience.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("navigationSkyAndAmbience.js")[0];
    var isInitiated = false;
    var universeDimension;
    var universeCenter;
    var universeRenderWithZones;
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var HALF = 0.5;
    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;
    var skyProcessingTimer = 0;
    var astrolithID = Uuid.NULL;
    var ASTROLITH_URL = ROOT + "images/ASTROLITHE.png";
    
    var AIR_SOUND = ROOT + "sounds/air.mp3";
    var airSound, injector;    
    var playing = 0;
    var FLYING_AIR_MAX_VOLUME = 0.5;

    var UFO_TIDE_CYCLE_DURATION = 18720; //5.2 hours
    
    var D29_DAY_DURATION = 104400; //29h in sec.
    var storming = false;
    var lightningsID = Uuid.NULL;
    var LIGNTNINGS_PARTICLE_URL = ROOT + "images/PARTICLE_LIGHTNING_HYTRION_B.png";
    var THUNDER_SOUND_1 = ROOT + "sounds/thunder0.mp3";
    var THUNDER_SOUND_2 = ROOT + "sounds/thunder1.mp3";
    var THUNDER_SOUND_3 = ROOT + "sounds/thunder2.mp3";
    var THUNDER_SOUND_4 = ROOT + "sounds/thunder3.mp3";   
    var thunderSound = []; 
    var thunderInjector; 
    
    var vaporID = Uuid.NULL;

    var zoneID = Uuid.NULL;
    var thisEntity = Uuid.NULL;
    var UNIVERSE_SOUND = ROOT + "sounds/limboAmbience.mp3";
    var UNIVERSE_SOUND_VOLUME_MAXIMUM = 0.2;
    var universeSound, universeSoundInjector;
    var univerSoundPlaying = 0;
    var blindspots = [
        {
            "name": "BLACK CATHEDRAL",
            "position": {"x":5029,"y":5905,"z":9036},
            "occultationRadius": 50,
            "influenceRadius": 80,
            "astroids": false
        }
    ];
    
   
    this.preload = function(entityID) {
        thisEntity = entityID;
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
            skyProcessingTimer = skyProcessingTimer + 1;
            if (skyProcessingTimer > 5) {
                updateSky();
                updateVaporFX();
                skyProcessingTimer = 0;
            }
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function shutdown() {
        if (isInitiated){            
            Script.update.disconnect(myTimer);
            if (astrolithID != Uuid.NULL){
                Entities.deleteEntity(astrolithID);
                astrolithID = Uuid.NULL;
            }
            if (univerSoundPlaying == 1) {
                universeSoundInjector.stop();
                univerSoundPlaying = 0;
            }
            if (zoneID !== Uuid.NULL) {
                Entities.deleteEntity(zoneID);
                zoneID = Uuid.NULL;
            }
            if (vaporID !== Uuid.NULL) {
                Entities.deleteEntity(vaporID);
                vaporID = Uuid.NULL;
            }
            if (lightningsID !== Uuid.NULL) {
                Entities.deleteEntity(lightningsID);
                lightningsID = Uuid.NULL;
            }
        }
        isInitiated = false;
    }

    function initiate(EntID) {
        var properties = Entities.getEntityProperties(EntID, ["position", "dimensions", "renderWithZones"]);
        universeCenter = properties.position;
        universeDimension = properties.dimensions;
        universeRenderWithZones = properties.renderWithZones;

        isInitiated = true; 
 
        univerSoundPlaying = 0;
        updateSky();
        updateVaporFX();

        var today = new Date();
        processTimer = today.getTime();
    
        Script.update.connect(myTimer);
    }

    function updateVaporFX() {
        var avaPos = MyAvatar.position;
        var y = universeCenter.y -760 + (Math.sin(GetCurrentCycleValue(Math.PI * 2, D29_DAY_DURATION/6)) * 300); //4h D29 tide.
        var alphaFactor = Math.abs(Math.sin(GetCurrentCycleValue(Math.PI * 2, D29_DAY_DURATION * 3))); //3 day D29 intensity cycle.
        var hue = GetCurrentCycleValue(1, 9 * D29_DAY_DURATION); //1 D29 week cycle)
		var currentRGBsky = hslToRgb(hue, 1, 0.5);
        //print("y: " + y);
        //print("alphaFactor: " + alphaFactor);
        if (vaporID === Uuid.NULL) {
            vaporID = Entities.addEntity({
                "type": "ParticleEffect",
                "renderWithZones": universeRenderWithZones,
                "name": "vapor",
                "dimensions": {
                    "x": 9000,
                    "y": 9000,
                    "z": 9000
                },
                "parentID": thisEntity,
                "position":{
                    "x": avaPos.x,
                    "y": y,
                    "z": avaPos.z
                },
                "grab": {
                    "grabbable": false
                },
                "shapeType": "cylinder-y",
                "color": {
                    "red": currentRGBsky[0],
                    "green": currentRGBsky[1],
                    "blue": currentRGBsky[2]
                },
                "alpha": 0.2 * alphaFactor,
                "textures": ROOT + "images/FOG.png",
                "maxParticles": 2000,
                "lifespan": 10,
                "emitRate": 200,
                "emitSpeed": 0,
                "speedSpread": 0,
                "emitOrientation": {
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "emitDimensions": {
                    "x": 8000,
                    "y": 400,
                    "z": 8000
                },
                "emitRadiusStart": 0.009999999776482582,
                "polarFinish": 3.1415927410125732,
                "emitAcceleration": {
                    "x": 0,
                    "y": 9,
                    "z": 0
                },
                "particleRadius": 300,
                "radiusSpread": 100,
                "radiusStart": 200,
                "radiusFinish": 400,
                "colorStart": {
                    "red": 0,
                    "green": 0,
                    "blue": 0
                },
                "colorFinish": {
                    "red": 0,
                    "green": 0,
                    "blue": 0
                },
                "alphaStart": 0,
                "alphaFinish": 0,
                "emitterShouldTrail": true,
                "spinStart": null,
                "spinFinish": null,
                "spinSpread": Math.PI/3
            },"local");
        } else {
            Entities.editEntity(vaporID, {
                "position":{
                    "x": avaPos.x,
                    "y": y,
                    "z": avaPos.z
                },
                "color": {
                    "red": currentRGBsky[0],
                    "green": currentRGBsky[1],
                    "blue": currentRGBsky[2]
                },
                "alpha": 0.2 * alphaFactor
            });
        }
    }

    function updateSky() {
        var referenceAltitude = universeCenter.y;
		var skycode = new Array("A", "B", "C", "D");
		var currentsky = ROOT + "images/SKYBOX_WOTHAL_1024-" + skycode[Math.floor(GetCurrentCycleValue(4, 4 * D29_DAY_DURATION))] + ".png"; //change each D29 day

        var hue = GetCurrentCycleValue(1, 9 * D29_DAY_DURATION); //1 D29 week cycle)
		var currentRGBsky = hslToRgb(hue, 1, 0.5); 
		var currentRGBlight = hslToRgb(hue, 1, 0.65); 
		var currentRGBhaze = hslToRgb(hue, 1, 0.2); 
		var hrange = 5 + GetCurrentCycleValue(995, D29_DAY_DURATION/4); //cycle 6h (D29 hours)

        //var ambientsky = currentsky;
        var AMBIENT_SKYBOX_URL = "http://metaverse.bashora.com/scripts/hytrion_cloud/skybox/skybox.php";
        var ambientsky = AMBIENT_SKYBOX_URL + "?h=" + Math.floor(hue * 360) + "&s=18"

        var zoneRotation = Quat.fromVec3Degrees( {"x": 0.0, "y": GetCurrentCycleValue(360, D29_DAY_DURATION), "z": 0.0} );

        if (zoneID === Uuid.NULL) {
            zoneID = Entities.addEntity({
                "type": "Zone",
                "name": "W0TH4L-D29_(!)_Z0N3",
                "dimensions": {
                    "x": universeDimension.x - 20,
                    "y": universeDimension.y - 20,
                    "z": universeDimension.z - 20
                },
                "parentID": thisEntity,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "localRotation": zoneRotation,
                "grab": {
                    "grabbable": false
                },
                "shapeType": "sphere",
                "keyLight": {
                    "color": {
                        "red": currentRGBlight[0],
                        "green": currentRGBlight[1],
                        "blue": currentRGBlight[2]
                    },
                    "intensity": 2,
                    "direction": Vec3.fromPolar( 15 * DEGREES_TO_RADIANS, -78 * DEGREES_TO_RADIANS),
                    "castShadows": true,
                    "shadowBias": 0.03,
                    "shadowMaxDistance": 150
                },
                "ambientLight": {
                    "ambientIntensity": 0.07,
                    "ambientURL": ambientsky
                },
                "skybox": {
                    "color": {
                        "red": currentRGBsky[0],
                        "green": currentRGBsky[1],
                        "blue": currentRGBsky[2]
                    },
                    "url": currentsky
                },
                "bloom": {
                    "bloomIntensity": 0.5
                },
                "haze": {
                    "hazeRange": hrange,
                    "hazeColor": { "red": currentRGBhaze[0], "green": currentRGBhaze[1], "blue": currentRGBhaze[2] },
                    "hazeBackgroundBlend": 0,
                    "hazeEnableGlare": true,
                    //"hazeGlareColor": { "red": currentRGBlight[0], "green": currentRGBlight[1], "blue": currentRGBlight[2] },
                    "hazeGlareColor": { "red": 255, "green": 255, "blue": 255 },
                    "hazeGlareAngle": 10,
                    "hazeAltitudeEffect": true,
                    //"hazeBaseRef": referenceAltitude - 800,
                    //"hazeCeiling": referenceAltitude - 0,
                    "hazeBaseRef": referenceAltitude - 3000,
                    "hazeCeiling": referenceAltitude - 2100,
                    "hazeAttenuateKeyLight": false,
                    "hazeKeyLightRange": 300,
                    "hazeKeyLightAltitude": 300
                },                
                "keyLightMode": "enabled",
                "ambientLightMode": "enabled",
                "skyboxMode": "enabled",
                "hazeMode": "enabled",
                "bloomMode": "enabled"
            },"local");
        } else {
            Entities.editEntity(zoneID, {
                "localRotation": zoneRotation,
                "keyLight": {
                    "color": {
                        "red": currentRGBlight[0],
                        "green": currentRGBlight[1],
                        "blue": currentRGBlight[2]
                    }
                },
                "ambientLight": {
                    "ambientIntensity": 0.07,
                    "ambientURL": ambientsky
                },
                "skybox": {
                    "color": {
                        "red": currentRGBsky[0],
                        "green": currentRGBsky[1],
                        "blue": currentRGBsky[2]
                    },
                    "url": currentsky
                },
                "haze": {
                    "hazeRange": hrange,
                    "hazeColor": { "red": currentRGBhaze[0], "green": currentRGBhaze[1], "blue": currentRGBhaze[2] },
                    "hazeBackgroundBlend": 0,
                    "hazeEnableGlare": true,
                    //"hazeGlareColor": { "red": currentRGBlight[0], "green": currentRGBlight[1], "blue": currentRGBlight[2] },
                    "hazeGlareColor": { "red": 255, "green": 255, "blue": 255 },
                    "hazeGlareAngle": 10,
                    "hazeAltitudeEffect": true,
                    "hazeBaseRef": referenceAltitude - 3000,
                    "hazeCeiling": referenceAltitude - 2100,
                    //"hazeBaseRef": referenceAltitude - 800,
                    //"hazeCeiling": referenceAltitude - 0,
                    "hazeAttenuateKeyLight": false,
                    "hazeKeyLightRange": 300,
                    "hazeKeyLightAltitude": 300
                }
            });
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
                if (astrolithID == Uuid.NULL){
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
                if (astrolithID != Uuid.NULL){
                    Entities.deleteEntity(astrolithID);
                    astrolithID = Uuid.NULL;
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
            
            var d29CurrentHour = (GetCurrentCycleValue(8640000, D29_DAY_DURATION)/100) / 3600;
            
            //if ( d29CurrentHour > 11.5 || d29CurrentHour < 11 ) { //debug
            if ( d29CurrentHour > 16 && d29CurrentHour < 19 ) {
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
                        "name": "STORM",
                        "dimensions": {
                            "x": 6000,
                            "y": 6000,
                            "z": 6000
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
                            "x": 6000,
                            "y": 6000,
                            "z": 6000
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
                        "particleRadius": 1800,
                        "radiusStart": 1800,
                        "radiusFinish": 1800,
                        "radiusSpread": 1000,
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
                    lightningsID = Uuid.NULL;
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
/*
            if (myPosition.x > universeCenter.x + (universeDimension.x/2) - 100) {
                myPosition.x = universeCenter.x - (universeDimension.x/2) + 101;
                isInTheEdge = 1;
            } else {
                if (myPosition.x < universeCenter.x - (universeDimension.x/2) + 100) {
                    myPosition.x = universeCenter.x + (universeDimension.x/2) - 101;
                    isInTheEdge = 1;
                }
            }
            if (myPosition.y > universeCenter.y + (universeDimension.y/2) - 100) {
                myPosition.y = universeCenter.y - (universeDimension.y/2) + 101;
                isInTheEdge = 1;
            } else {
                if (myPosition.y < universeCenter.y - (universeDimension.y/2) + 100) {
                    myPosition.y = universeCenter.y + (universeDimension.y/2) - 101;
                    isInTheEdge = 1;
                }
            }
            if (myPosition.z > universeCenter.z + (universeDimension.z/2) - 100) {
                myPosition.z = universeCenter.z - (universeDimension.z/2) + 101;
                isInTheEdge = 1;
            } else {
                if (myPosition.z < universeCenter.z - (universeDimension.z/2) + 100) {
                    myPosition.z = universeCenter.z + (universeDimension.z/2) - 101;
                    isInTheEdge = 1;
                }
            }

            if (isInTheEdge == 1) {
                MyAvatar.goToLocation( myPosition, true, myRotation);
            }
        */
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
