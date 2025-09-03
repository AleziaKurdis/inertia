//#####################
//
//  haldanides.js
//
//  Created by Alezia Kurdis, September 1st, 2025.
//  Copyright 2025, Overte e.V.
//
//  meteor shower.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("haldanides.js")[0];
    var isInitiated = false;
    var triggerPosition;
    var renderWithZones;
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var HALF = 0.5;
    let updateTimerIntervall = 20000; // 20 sec 
    var processTimer = 0;


    
    var DAY_DURATION = 68400; //D19

    var zoneID = Uuid.NONE;
    var thisEntityID;
   
    this.preload = function(entityID) {
        thisEntityID = entityID;
 
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
        if ((today.getTime() - processTimer) > updateTimerIntervall ) {

            processHaldanides();
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function shutdown() {
        if (isInitiated){
            Script.update.disconnect(myTimer);
            
            if (zoneID !== Uuid.NONE) {
                Entities.deleteEntity(zoneID);
                zoneID = Uuid.NONE;
            }
        }
        isInitiated = false;
    }

    function initiate(EntID) {
        var properties = Entities.getEntityProperties(EntID, ["position", "renderWithZones"]);
        triggerPosition = properties.position;
        renderWithZones = properties.renderWithZones;
        isInitiated = true; 
        generateBloomZone();
        
        var today = new Date();
        processTimer = today.getTime();
    
        Script.update.connect(myTimer);
    }

    function generateBloomZone() {
        if (zoneID === Uuid.NONE) {
            zoneID = Entities.addEntity({
                "type": "Zone",
                "name": "HALDANIDES_BLOOM_(!)_Z0N3",
                "dimensions": {
                    "x": 10000,
                    "y": 1000,
                    "z": 10000
                },
                "parentID": thisEntityID,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "grab": {
                    "grabbable": false
                },
                "shapeType": "box",
                "keyLight": {
                    "direction": {
                        "x": 0,
                        "y": -0.7071067690849304,
                        "z": 0.7071067690849304
                    },
                    "castShadows": true
                },
                "bloom": {
                    "bloomIntensity": 0.5
                },
                "bloomMode": "enabled",
                "lifetime": DAY_DURATION
            },"local");
        }
    }

    function processHaldanides() {
        var d19CurrentHour = (GetCurrentCycleValue(86400000, DAY_DURATION)/1000) / 3600;
        //const TARGET_HOUR = 22.5;
        const TARGET_HOUR = 4.5; //DEBUG
        if ( d19CurrentHour > (TARGET_HOUR - 1) && d19CurrentHour < (TARGET_HOUR + 1) ) {
            updateTimerIntervall = 1000; // 1 sec
            let baseFrequency = -Math.abs(d19CurrentHour - TARGET_HOUR);
            let expFrequency = Math.pow((baseFrequency + 1),3);
            if (expFrequency > 1) {
                expFrequency = 1;
            } else if (expFrequency < 0){
                expFrequency = 0;
            }
            if (Math.random() < expFrequency) {
                print("expFrequency: " + expFrequency);
                //HERE WE TRIGGER
            }
        } else {
            updateTimerIntervall = 20000; // 20 sec
        }
        
            //updateTimerIntervall = 10000; // 10 sec 
            
            /* //############## NOCTURN LIGHTNINGS AND THUNDER #############
            
            var d29CurrentHour = (GetCurrentCycleValue(8640000, DAY_DURATION)/100) / 3600;
            
            //if ( d29CurrentHour > 11.5 || d29CurrentHour < 11 ) { //debug
            if ( d29CurrentHour > 23 || d29CurrentHour < 5 ) {
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
*/
            
/*            //###################### ASTEROIDS ##############################
            var astroidEventFrequency = 0.033 + (Math.cos(GetCurrentCycleValue(360, UFO_TIDE_CYCLE_DURATION) * DEGREES_TO_RADIANS) * 0.013);
            
            if (Math.random() < astroidEventFrequency && astroidFXstatus) { //0.02 = 1 fois par 33 sec
                //trigger an astroid
                genAsteroid(myAvPos);
            }
            //###################### END ASTEROIDS ##########################
 */           

    }

    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}    
    // ################## END CYLCE AND TIME FUNCTIONS ###########################   

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
    
    function genAsteroid(avatarPosition) {
        var nowDate = new Date();
		var catalogNumber = nowDate.getTime();
        var i;
        for (i=0; i > asteroidStack.length; i++) {
            if (asteroidStack[i].expiration < catalogNumber) {
                Entities.deleteEntity(asteroidStack[i].id);
                asteroidStack.splice(i, 1);
            }
        }
        
        var FOG_DISTANCE = 2400;
        
        var astFromCap = Math.random() * (Math.PI * 2);
        var astFromInclinaison = (Math.random() * Math.PI) - (Math.PI / 2);
        var astPolarVec = Vec3.fromPolar({"x": astFromInclinaison,"y": astFromCap,"z": (FOG_DISTANCE * 1.2)});
        var astStartPoint = {"x": (avatarPosition.x + astPolarVec.x), "y": (avatarPosition.y + astPolarVec.y), "z": (avatarPosition.z + astPolarVec.z)}; 
            
        var astVelocity = (Math.random()* 150) + 25;
        var astLife = ((FOG_DISTANCE * 2.5) * 2) / astVelocity; 

        var canCollide = true;
        var asteroidMaxSize = 400;
        var asteroidScale = Math.random() * Math.random()  * Math.random() * asteroidMaxSize;
        var angVeloc = {
            x: (Math.random()*1.5) - 0.75, //Rad/sec
            y: (Math.random()*1.5) - 0.75,
            z: (Math.random()*1.5) - 0.75
        };  

        var asteroidModelURL, excentricity, astDimension;
        astDimension = {
            "x": (1 + Math.random() - 0.5) * asteroidScale,
            "y": (1 + Math.random() - 0.5) * asteroidScale,
            "z": (1 + Math.random() - 0.5) * asteroidScale
        };
        
        asteroidModelURL = ROOT + "models/ROCK/ASTEROID_" + (Math.floor(Math.random() * 6) + 1) + ".fst";
        
        
        var targetPoint = Vec3.sum(avatarPosition, Vec3.multiply( Vec3.multiplyQbyV(MyAvatar.orientation, Vec3.UNIT_NEG_Z), (250 + Math.random() * 500 )));
        
        var veloVec = Vec3.multiply(Vec3.normalize({"x": (targetPoint.x - astStartPoint.x), "y": (targetPoint.y - astStartPoint.y), "z": (targetPoint.z - astStartPoint.z)}), astVelocity);
        
		var properties = {
			"type": "Model",
			"name": "AST-" + catalogNumber,
			"position": astStartPoint,
			"useOriginalPivot": true,
			"dimensions": astDimension,
			"velocity": veloVec,
			"damping": 0,
			"angularVelocity": angVeloc,
			"angularDamping": 0,
			"restitution": 1,
			"friction": 0,
			"gravity": {
				"x": 0,
				"y": 0,
				"z": 0
			},
            "grab": {
                "grabbable": false
                },
			"density": 10,
			"dynamic": true,
			"collisionless": canCollide,
			"modelURL": asteroidModelURL,
			"shapeType": "sphere",
            "renderWithZones": [thisEntityID]
		};


		print("ASTEROID-" + catalogNumber + " : " + astVelocity + " | " + astLife);

		var id = Entities.addEntity(properties, "local");
        asteroidStack.push({"id": id, "expiration": catalogNumber + astLife});
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
