//#####################
//
//  navigationAmbienceEldoria.js
//
//  Created by Alezia Kurdis, March 20th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Space Navigation and ambience, sound for the ELDORIA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("navigationAmbienceEldoria.js")[0];
    var isInitiated = false;
    var universeDimension;
    var universeCenter;
    var renderWithZones;
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var HALF = 0.5;
    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;
    var tideUpdateLap = 0;
    var waterDirection = 1;
    var WATER_SPEED = 0.04; // m/sec

    var astrolithID = Uuid.NULL;
    var ASTROLITH_URL = ROOT + "images/ASTROLITHE.png";
    
    var AIR_SOUND = ROOT + "sounds/air.mp3";
    var airSound, injector;    
    var playing = 0;
    var FLYING_AIR_MAX_VOLUME = 0.5;
    
    var DAY_DURATION = 104400; //D29
    var NBR_LAP_TIDE = 30; //N lap of UPDATE_TIMER_INTERVAL sec
    var seaId = Uuid.NULL;
    var TIDE_AMPLITUDE = 4; //in meter

    var thisEntityID;
    var UNIVERSE_SOUND = ROOT + "sounds/desertWindAmbient.mp3";
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
            if (astrolithID != Uuid.NULL){
                Entities.deleteEntity(astrolithID);
                astrolithID = Uuid.NULL;
            }
            if (univerSoundPlaying == 1) {
                universeSoundInjector.stop();
                univerSoundPlaying = 0;
            }
            if (seaId != Uuid.NULL){
                Entities.deleteEntity(seaId);
                seaId = Uuid.NULL;
            }
        }
        isInitiated = false;
    }

    function initiate(EntID) {
        var properties = Entities.getEntityProperties(EntID, ["position", "dimensions", "renderWithZones"]);
        universeCenter = properties.position;
        universeDimension = properties.dimensions;
        renderWithZones = properties.renderWithZones;

        isInitiated = true; 
 
        univerSoundPlaying = 0;
        tideUpdateLap = 0;
        waterDirection = 1;
        genWater();

        var today = new Date();
        processTimer = today.getTime();
    
        Script.update.connect(myTimer);
    }

    function genWater() {
        var tide = (TIDE_AMPLITUDE/2) + Math.sin(GetCurrentCycleValue(Math.PI * 2, Math.floor(DAY_DURATION * 12.41/24))) * TIDE_AMPLITUDE;
        currentOffset = waterDirection * NBR_LAP_TIDE * UPDATE_TIMER_INTERVAL * WATER_SPEED;
        waterDirection = -waterDirection;
        var velocity = {"x": 0.0 , "y": 0.0, "z": WATER_SPEED * waterDirection};
        var waterPosition = {"x":universeCenter.x,"y":universeCenter.y + tide,"z":universeCenter.z + currentOffset};
        
        if (seaId === Uuid.NULL) {
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
                "velocity": velocity
            }, "local");
            
        } else {
            Entities.editEntity(seaId,{
                "position": waterPosition,
                "velocity": velocity
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
            
            //######### UNIVERSE SOUND VOLUME MANAGEMENT ##############
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
            // ######### END UNIVERSE SOUND VOLUME MANAGEMENT ######## 

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
