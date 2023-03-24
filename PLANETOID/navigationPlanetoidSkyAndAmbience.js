//#####################
//
//  navigationPlanetoidSkyAndAmbience.js
//
//  Created by Alezia Kurdis, March 11th, 2023.
//  Copyright 2023, Overte e.V.
//
//  PLANETOID sky, Navigation and ambience.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("navigationPlanetoidSkyAndAmbience.js")[0];
    var isInitiated = false;
    var universeDimension;
    var universeCenter;
    var universeRenderWithZones = [];
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

    var SKY_TEXTURE = ROOT + "images/SKY-PLANET-W-11_JUNE_2019.jpg";
    var entitiesToDelete = [];
    var zoneID = Uuid.NULL;
    var darkZoneID = Uuid.NULL;
    var thisEntity = Uuid.NULL;
    var UNIVERSE_SOUND = ROOT + "sounds/limboAmbience.mp3";
    var UNIVERSE_SOUND_VOLUME_MAXIMUM = 0.2;
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
        thisEntity = entityID;
        airSound = SoundCache.getSound(AIR_SOUND);
        universeSound = SoundCache.getSound(UNIVERSE_SOUND);

        
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
            if (skyProcessingTimer > 20) {
                updateSky();
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
            if (darkZoneID !== Uuid.NULL) {
                Entities.deleteEntity(darkZoneID);
                darkZoneID = Uuid.NULL;
            }
            
            for (var i = 0; i < entitiesToDelete.length; i++) {
                Entities.deleteEntity(entitiesToDelete[i]);
            }
        }
        isInitiated = false;
    }

    function initiate(EntID) {
        var properties = Entities.getEntityProperties(EntID, ["position", "dimensions"]);
        universeCenter = properties.position;
        universeDimension = properties.dimensions;
        universeRenderWithZones.push(EntID);

        isInitiated = true; 
 
        univerSoundPlaying = 0;
        updateSky();
        
        darkZoneID = Entities.addEntity({
            "type": "Zone",
            "name": "PLANETOID_DARKN3SS-D29_(!)_Z0N3",
            "dimensions": {
                "x": 1293,
                "y": 1293,
                "z": 1293
            },
            "parentID": EntID,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "grab": {
                "grabbable": false
            },
            "shapeType": "sphere",
            "keyLight": {
                "color": {
                    "red": 181,
                    "green": 195,
                    "blue": 255
                },
                "intensity": 0.05,
                "direction": Vec3.fromPolar( 89.9 * DEGREES_TO_RADIANS, 0 * DEGREES_TO_RADIANS),
                "castShadows": true,
            },
            "ambientLight": {
                "ambientIntensity": 0.03,
                "ambientURL": SKY_TEXTURE
            },
            "skybox": {
                "color": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "url": SKY_TEXTURE
            },
            "bloom": {
                "bloomIntensity": 0.5,
                "bloomThreshhold": 0.7,
                "bloomSize": 0.8
            },
            "keyLightMode": "enabled",
            "ambientLightMode": "enabled",
            "skyboxMode": "enabled",
            "hazeMode": "inherit",
            "bloomMode": "enabled"
        },"local");

        var id = Entities.addEntity({
            "type": "Light",
            "name": "INNER_INFLEXION_LIGHT",
            "locked": true,
            "renderWithZones": universeRenderWithZones,
            "parentID": EntID,
            "dimensions": {
                "x": 28.848323822021484,
                "y": 28.848323822021484,
                "z": 28.848323822021484
            },
            "rotation": {
                "x": 0.49242356419563293,
                "y": 0,
                "z": 0,
                "w": 0.8703556656837463
            },
            "localPosition": {"x":46.7099609375,"y":420.57177734375,"z":-370.63916015625},
            "grab": {
                "grabbable": false
            },
            "color": {
                "red": 255,
                "green": 51,
                "blue": 0
            },
            "intensity": 15,
            "exponent": 1,
            "cutoff": 75,
            "falloffRadius": 3
        }, "local");
        entitiesToDelete.push(id);
        
        id = Entities.addEntity({
            "type": "Light",
            "name": "EXO_INFLEXION_LIGHT",
            "locked": true,
            "renderWithZones": universeRenderWithZones,
            "parentID": EntID,
            "dimensions": {
                "x": 28.848323822021484,
                "y": 28.848323822021484,
                "z": 28.848323822021484
            },
            "rotation": {
                "x": 0.49242356419563293,
                "y": 0,
                "z": 0,
                "w": 0.8703556656837463
            },
            "localPosition": {"x":46.80322265625,"y":434.869140625,"z":-383.727294921875},
            "grab": {
                "grabbable": false
            },
            "color": {
                "red": 0,
                "green": 255,
                "blue": 157
            },
            "intensity": 15,
            "exponent": 1,
            "cutoff": 75,
            "falloffRadius": 3
        }, "local");
        entitiesToDelete.push(id);
        
        id = Entities.addEntity({
            "type": "Light",
            "name": "lavaLight",
            "locked": true,
            "renderWithZones": universeRenderWithZones,
            "parentID": EntID,
            "dimensions": {
                "x": 80,
                "y": 80,
                "z": 80
            },
            "localPosition": {"x": 123.71,"y": 445.50,"z": -342.45},
            "grab": {
                "grabbable": false
            },
            "color": {
                "red": 255,
                "green": 60,
                "blue": 0
            },
            "intensity": 20,
            "exponent": 1,
            "cutoff": 75,
            "falloffRadius": 3
        }, "local");
        entitiesToDelete.push(id);
        
        generateLanterns();

        var today = new Date();
        processTimer = today.getTime();
    
        Script.update.connect(myTimer);
    }

    function generateLanterns() {
        var lanterns = [
            {"position": {"x":4054.140380859375,"y":4416.908203125,"z":3498.732666015625}, "gravity": "EXO"},
            {"position": {"x":4113.36279296875,"y":4451.8515625,"z":3626.70947265625}, "gravity": "EXO"},
            {"position": {"x":4134.12060546875,"y":4425.20166015625,"z":3607.34423828125}, "gravity": "EXO"},
            {"position": {"x":4087.8662109375,"y":4418.1435546875,"z":3609.46435546875}, "gravity": "EXO"},
            {"position": {"x":4071.53369140625,"y":4429.77880859375,"z":3620.380615234375}, "gravity": "EXO"},
            {"position": {"x":4059.20849609375,"y":4426.40087890625,"z":3526.289794921875}, "gravity": "EXO"},
            {"position": {"x":4065.099609375,"y":4447.376953125,"z":3557.905029296875}, "gravity": "EXO"},
            {"position": {"x":4091.027587890625,"y":4445.69140625,"z":3568.681640625}, "gravity": "EXO"},
            {"position": {"x":4114.3564453125,"y":4427.1796875,"z":3561.130859375}, "gravity": "EXO"},
            {"position": {"x":4123.740234375,"y":4412.037109375,"z":3549.7880859375}, "gravity": "EXO"},
            {"position": {"x":4165.744140625,"y":4428.08447265625,"z":3580.9404296875}, "gravity": "EXO"},
            {"position": {"x":4147.20751953125,"y":4417.06201171875,"z":3555.38330078125}, "gravity": "EXO"},
            {"position": {"x":4182.74609375,"y":4455.61083984375,"z":3618.478759765625}, "gravity": "EXO"},
            {"position": {"x":4145.0185546875,"y":4464.1005859375,"z":3634.46044921875}, "gravity": "EXO"},
            {"position": {"x":4069.07666015625,"y":4418.66796875,"z":3626.72314453125}, "gravity": "INNER"},
            {"position": {"x":4103.55419921875,"y":4403.58642578125,"z":3619.75146484375}, "gravity": "INNER"},
            {"position": {"x":4129.3056640625,"y":4410.86767578125,"z":3644.137451171875}, "gravity": "INNER"},
            {"position": {"x":4115.072265625,"y":4428.3115234375,"z":3657.331787109375}, "gravity": "INNER"},
            {"position": {"x":4140.7939453125,"y":4428.03955078125,"z":3666.197021484375}, "gravity": "INNER"},
            {"position": {"x":4176.173828125,"y":4413.3447265625,"z":3669.866943359375}, "gravity": "INNER"},
            {"position": {"x":4153.34814453125,"y":4360.42431640625,"z":3641.41552734375}, "gravity": "INNER"},
            {"position": {"x":4120.6552734375,"y":4340.21484375,"z":3626.396484375}, "gravity": "INNER"},
            {"position": {"x":4101.50390625,"y":4353.71484375,"z":3633.78076171875}, "gravity": "INNER"},
            {"position": {"x":4093.785888671875,"y":4369.7490234375,"z":3652.677001953125}, "gravity": "INNER"}
        ];
        var modelUrl = "";
        var lightColor;
        var lanternRotation, direction, localUp, lanternID, lightID;
        for (var i = 0; i < lanterns.length; i++) {
            direction = Vec3.subtract(lanterns[i].position, universeCenter);
            localUp = Quat.getUp(Quat.IDENTITY);
            if (lanterns[i].gravity === "EXO") {
                modelUrl = ROOT + "models/lanternBlue.fst";
                lightColor = {
                    "red": 28,
                    "green": 142,
                    "blue": 255
                };
            } else {
                modelUrl = ROOT + "models/lanternOrange.fst";
                lightColor = {
                    "red": 255,
                    "green": 194,
                    "blue": 28
                };
                localUp = Quat.inverse(localUp);
            }
            lanternRotation = Quat.normalize(Quat.multiply(Quat.rotationBetween(localUp, direction), Quat.IDENTITY));
            
            lanternID = Entities.addEntity({
                "type": "Model",
                "name": "Lantern " + i,
                "modelURL": modelUrl,
                "position": lanterns[i].position,
                "rotation": lanternRotation,
                "useOriginalPivot": true,
                "renderWithZones": universeRenderWithZones,
                "dimensions": {"x": 0.2868, "y": 3.5952, "z": 0.3296}
            }, "local");
            
            lightID =  Entities.addEntity({
                "type": "Light",
                "name": "light lantern " + i,
                "parentID": lanternID,
                "renderWithZones": universeRenderWithZones,
                "localPosition": {"x": 0, "y": 0, "z": 0},
                "color": lightColor,
                "dimensions": {"x": 60, "y": 60, "z": 60},
                "intensity": 10,
                "falloffRadius": 1
            }, "local");
            
            entitiesToDelete.push(lanternID);
        }
    }

    function updateSky() {
		var currentsky = SKY_TEXTURE;
/*
        var hue = GetCurrentCycleValue(1, 9 * D29_DAY_DURATION); //1 D29 week cycle)
		var currentRGBsky = hslToRgb(hue, 1, 0.5); 
		var currentRGBlight = hslToRgb(hue, 1, 0.65); 
		var currentRGBhaze = hslToRgb(hue, 1, 0.2); 
		var hrange = 5 + GetCurrentCycleValue(995, D29_DAY_DURATION/4); //cycle 6h (D29 hours)
*/
        var ambientsky = SKY_TEXTURE;

        var zoneRotation = Quat.fromVec3Degrees( {"x": 90.0, "y": GetCurrentCycleValue(360, 720), "z": 0.0} ); //720 s = 12 minutes Days long. so 0.5 deg/s
        var anglVelo = 0.00872665;

        if (zoneID === Uuid.NULL) {
            zoneID = Entities.addEntity({
                "type": "Zone",
                "name": "PLANETOID_SKY-D29_(!)_Z0N3",
                "dimensions": {
                    "x": universeDimension.x - 20,
                    "y": universeDimension.y - 20,
                    "z": universeDimension.z - 20
                },
                "parentID": thisEntity,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "localRotation": zoneRotation,
                "angularVelocity": {"x": 0.0, "y": anglVelo, "z": 0.0},
                "angularDamping": 0.0,
                "grab": {
                    "grabbable": false
                },
                "shapeType": "sphere",
                "keyLight": {
                    "color": {
                        "red": 255,
                        "green": 242,
                        "blue": 207
                    },
                    "intensity": 3.25,
                    "direction": Vec3.fromPolar( 89.9 * DEGREES_TO_RADIANS, 0 * DEGREES_TO_RADIANS),
                    "castShadows": true,
                    "shadowBias": 0.03,
                    "shadowMaxDistance": 150
                },
                "ambientLight": {
                    "ambientIntensity": 0.3,
                    "ambientURL": ambientsky
                },
                "skybox": {
                    "color": {
                        "red": 255,
                        "green": 255,
                        "blue": 255
                    },
                    "url": currentsky
                },
                "bloom": {
                    "bloomIntensity": 0.5,
                    "bloomThreshhold": 0.7,
                    "bloomSize": 0.8
                },
                "keyLightMode": "enabled",
                "ambientLightMode": "enabled",
                "skyboxMode": "enabled",
                "hazeMode": "inherit",
                "bloomMode": "enabled"
            },"local");
        } else {
            Entities.editEntity(zoneID, {
                "localRotation": zoneRotation,
                "angularVelocity": {"x": 0.0, "y": anglVelo, "z": 0.0},
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
