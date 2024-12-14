//
//  arcadeTetris.js
//
//  Created by Alezia Kurdis, December 13th, 2024.
//  Copyright 2024 Overte e.V.
//
//  Archade machine for tetris
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    print("TETRIS STARTED!");
    
    var jsMainFileName = "arcadeTetris.js"; 
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var channel = "overte.ak.arcadeGame.tetris";
    var webID = Uuid.NONE;
    var thisEntityID;
    var thisPosition;
    
    var musicInjector = Uuid.NONE;
    
    var UPDATE_TIMER_INTERVAL = 100;
    var processTimer = 0;
    
    var SCREEN_RELATIVE_POSITION = {"x": 0.105, "y": 0.49, "z": 0.0};
    var SCREEN_RELATIVE_ROTATION = Quat.fromVec3Degrees({"x": -12.5, "y": 90.0, "z": 0.0});
    
    var rightHandleID = Uuid.NONE;
    var leftHandleID = Uuid.NONE;
    
    var INTERACTION_DISTANCE_BUTTON = 0.06;
    var INTERACTION_DISTANCE_MOVE = 0.14;
    var BUTTON_RELATIVE_POSITION = {"x": 0.2966, "y": 0.2266, "z": 0.2674};
    var MOVE_RELATIVE_POSITION = {"x": 0.3104, "y": 0.2745, "z": 0.0033};
    
    var BEGIN_SOUND, CHOMP_SOUND, DEATH_SOUND, ENERGY_SOUND, EAT_GHOST_SOUND, EXTRA_SOUND, INTERMISSION_SOUND;
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        thisPosition = Entities.getEntityProperties(entityID, ["position"]).position;

        MUSIC_SOUND = SoundCache.getSound(ROOT + "sounds/MUSIC.mp3");
        CLEAR_ROW_SOUND = SoundCache.getSound(ROOT + "sounds/CLEAR_ROW.mp3");

        webID = Entities.addEntity({
            "type": "Web",
            "name": "arcade game screen",
            "parentID": entityID,
            "dimensions": {"x": 0.63, "y": 0.42, "z": 0.01},
            "localPosition": SCREEN_RELATIVE_POSITION,
            "localRotation": SCREEN_RELATIVE_ROTATION,
            "sourceUrl": ROOT + "index.html",
            "grab": {
                "grabbable": false
            },
            "dpi": 50,
            "maxFPS": 60
        }, "local");
        
        var today = new Date();
        processTimer = today.getTime();
        
        Script.update.connect(myTimer);
        Entities.webEventReceived.connect(onWebEventReceived);
    };

    this.unload = function(entityID) {
        Script.update.disconnect(myTimer);
        Entities.webEventReceived.disconnect(onWebEventReceived);
        
        if (rightHandleID !== Uuid.NONE) {
            Entities.deleteEntity(rightHandleID);
            Entities.deleteEntity(leftHandleID);
            rightHandleID = Uuid.NONE;
            leftHandleID = Uuid.NONE;
        }
        
        if (webID !== Uuid.NONE) {
            Entities.deleteEntity(webID);
            webID = Uuid.NONE;
        }
        
        stopMusic();
    };

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            
            checkHands();
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function checkHands() {
        var RIGHT_HAND_INDEX = 1;
        var LEFT_HAND_INDEX = 0;
        
        if (Vec3.distance(thisPosition, MyAvatar.position) < 1) {
            if (rightHandleID === Uuid.NONE) {
                var rightBoneIndex = MyAvatar.getJointIndex("RightHandMiddle1");
                var leftBoneIndex = MyAvatar.getJointIndex("LeftHandMiddle1");

                rightHandleID = Entities.addEntity({
                    "name": "right PacMan handle",
                    "type": "Shape",
                    "shape": "Sphere",
                    "dimensions": {"x": 0.05, "y": 0.05, "z": 0.05 },
                    "color": {"red": 255, "green": 0, "blue": 0},
                    "alpha": 0.2,
                    "unlit": true,
                    "visible": true,
                    "parentID": MyAvatar.sessionUUID,
                    "parentJointIndex": rightBoneIndex,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.028},
                    "primitiveMode": "lines",
                    "grab": {
                        "grabbable": false
                    }
                }, "local");
                
                leftHandleID = Entities.addEntity({
                    "name": "left PacMan handle",
                    "type": "Shape",
                    "shape": "Sphere",
                    "dimensions": {"x": 0.05, "y": 0.05, "z": 0.05 },
                    "color": {"red": 255, "green": 0, "blue": 0},
                    "alpha": 0.2,
                    "unlit": true,
                    "visible": true,
                    "parentID": MyAvatar.sessionUUID,
                    "parentJointIndex": leftBoneIndex,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.028},
                    "primitiveMode": "lines",
                    "grab": {
                        "grabbable": false
                    }
                }, "local");
                
            }

            var rightHandlerPosition = Entities.getEntityProperties(rightHandleID, ["position"]).position;
            var leftHandlerPosition = Entities.getEntityProperties(leftHandleID, ["position"]).position;
            
            var messageToSend;
            
            //START BUTTON
            var rightDistance = Vec3.distance(rightHandlerPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION));
            var leftDistance = Vec3.distance(leftHandlerPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION));
            if (rightDistance < INTERACTION_DISTANCE_BUTTON || leftDistance < INTERACTION_DISTANCE_BUTTON) {
                messageToSend = {
                    "channel": channel,
                    "action": "START-PAUSE"
                };
                
                Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
                
                if (rightDistance < leftDistance) {
                    Controller.triggerShortHapticPulse(0.2, RIGHT_HAND_INDEX);
                } else {
                    Controller.triggerShortHapticPulse(0.2, LEFT_HAND_INDEX);
                }
                
            }
            
            //MOVES
            var joyStickPosition = Vec3.sum(thisPosition, MOVE_RELATIVE_POSITION);
            if (Math.abs(rightHandlerPosition.y - joyStickPosition.y) < 0.08 || Math.abs(leftHandlerPosition.y - joyStickPosition.y) < 0.08) {
                var rightSameLeveljoyStickPosition = {"x": joyStickPosition.x, "y": rightHandlerPosition.y, "z": joyStickPosition.z};
                var leftSameLeveljoyStickPosition = {"x": joyStickPosition.x, "y": leftHandlerPosition.y, "z": joyStickPosition.z};
                var rightDistance = Vec3.distance(rightHandlerPosition, rightSameLeveljoyStickPosition);
                var leftDistance = Vec3.distance(leftHandlerPosition, leftSameLeveljoyStickPosition);
                
                if (rightDistance < INTERACTION_DISTANCE_MOVE || leftDistance < INTERACTION_DISTANCE_MOVE) {
                    //find the azimut and the distance
                    var vecFromJoystick, handActing;
                    var interact = false;
                    if (rightDistance < leftDistance) {
                        //RIGHT HAND
                        vecFromJoystick = Vec3.subtract(rightHandlerPosition, rightSameLeveljoyStickPosition);
                        handActing = "RIGHT";
                    } else {
                        //LEFT HAND
                        vecFromJoystick = Vec3.subtract(leftHandlerPosition, leftSameLeveljoyStickPosition);
                        handActing = "LEFT";
                    }
                    var polar = Vec3.toPolar(vecFromJoystick);
                    var polarAzimuth = polar.y;
                    if (polarAzimuth < 0) {
                        polarAzimuth = (Math.PI * 2) + polarAzimuth;
                    }
                    if (polar.z > (INTERACTION_DISTANCE_MOVE * 0.382)) {
                        if (polarAzimuth > (Math.PI/4) && polarAzimuth <= (3 * Math.PI/4)) {
                            messageToSend = {
                                "channel": channel,
                                "action": "DOWN"
                            };
                            Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
                            interact = true;
                        } else if (polarAzimuth > (3 * Math.PI/4) && polarAzimuth <= (5 * Math.PI/4)) {
                            messageToSend = {
                                "channel": channel,
                                "action": "RIGHT"
                            };
                            Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
                            interact = true;
                        } else if (polarAzimuth > (5 * Math.PI/4) && polarAzimuth <= (7 * Math.PI/4)) {
                            messageToSend = {
                                "channel": channel,
                                "action": "UP"
                            };
                            Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
                            interact = true;
                        } else if (polarAzimuth > (7 * Math.PI/4) || polarAzimuth <= (Math.PI/4)) {
                            messageToSend = {
                                "channel": channel,
                                "action": "LEFT"
                            };
                            Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
                            interact = true;
                        }

                    }
                    if (interact) {
                        if (handActing === "RIGHT") {
                            Controller.triggerShortHapticPulse(0.08, RIGHT_HAND_INDEX);
                        } else {
                            Controller.triggerShortHapticPulse(0.08, LEFT_HAND_INDEX);
                        }
                    }
                }
            }

        } else {
            if (rightHandleID !== Uuid.NONE) {
                Entities.deleteEntity(rightHandleID);
                Entities.deleteEntity(leftHandleID);
                rightHandleID = Uuid.NONE;
                leftHandleID = Uuid.NONE;
            }
        }

    }

    function onWebEventReceived(entityID, message) {
        if (typeof message === "string" &&  entityID === webID) {
            var d = new Date();
            var n = d.getTime();
            var instruction = JSON.parse(message);
            if (instruction.channel === channel) {
                if (instruction.action === "PLAYSOUND") {
                    switch(instruction.sound) {
                        case "BEGIN":
                            playMusic();
                            break;
                        case "END":
                            stopMusic();
                            break;
                        case "CLEAR-ROW":
                            playSoundFX(CLEAR_ROW_SOUND);
                    } 
                }
            }
        }
    }

    function playMusic() {
        
    }

    function stopMusic() {
        if (musicInjector !== Uuid.NONE) {
            //stop mucic
            musicInjector = Uuid.NONE;
        }
    }

    function playSoundFX(soundCode) {
        var injectorOptions = {
            "position": Vec3.sum(thisPosition, SCREEN_RELATIVE_POSITION),
            "volume": 0.5,
            "loop": false,
            "localOnly": false
        };
        var injector = Audio.playSound(soundCode, injectorOptions);
        
    }
    
})
