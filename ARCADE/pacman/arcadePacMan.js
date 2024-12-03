//
//  arcadePacMan.js
//
//  Created by Alezia Kurdis, November 19th, 2024.
//  Copyright 2024 Overte e.V.
//
//  Archade machine for pac-man
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    print("PACMAN STARTED!");
    
    var jsMainFileName = "arcadePacMan.js"; 
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var channel = "overte.ak.arcadeGame.pacman";
    var webID = Uuid.NONE;
    var thisEntityID;
    var thisPosition;
    
    var UPDATE_TIMER_INTERVAL = 200;
    var processTimer = 0;
    
    var SCREEN_RELATIVE_POSITION = {"x": 0.105, "y": 0.49, "z": 0.0};
    var SCREEN_RELATIVE_ROTATION = Quat.fromVec3Degrees({"x": -12.5, "y": 90.0, "z": 0.0});
    
    var INTERACTION_DISTANCE_BUTTON = 0.06;
    var INTERACTION_DISTANCE_MOVE = 0.1;
    var BUTTON_RELATIVE_POSITION = {"x": 0.2966, "y": 0.2266, "z": 0.2674};
    var MOVE_RELATIVE_POSITION = {"x": 0.3104, "y": 0.2745, "z": 0.0033};
    
    var BEGIN_SOUND = SoundCache.getSound(ROOT + "sounds/BEGIN.wav");
    var CHOMP_SOUND = SoundCache.getSound(ROOT + "sounds/CHOMP.wav");
    var DEATH_SOUND = SoundCache.getSound(ROOT + "sounds/DEATH.wav");
    var ENERGY_SOUND = SoundCache.getSound(ROOT + "sounds/ENERGY.wav");
    var EAT_GHOST_SOUND = SoundCache.getSound(ROOT + "sounds/EAT_GHOST.wav");
    var EXTRA_SOUND = SoundCache.getSound(ROOT + "sounds/EXTRA.wav");
    var INTERMISSION_SOUND = SoundCache.getSound(ROOT + "sounds/INTERMISSION.wav");
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        thisPosition = Entities.getEntityProperties(entityID, ["position"]).position;
        
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
        
        if (webID !== Uuid.NONE) {
            Entities.deleteEntity(webID);
            webID = Uuid.NONE;
        }
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
        var VEC3_PALM = {"x": 0.0, "y": 0.0, "z": 0.05};
        
        var rightRotHand = Quat.lookAt(MyAvatar.rightHandPosition, MyAvatar.rightHandTipPosition, Vec3.UNIT_NEG_Y);
        var leftRotHand = Quat.lookAt(MyAvatar.leftHandPosition, MyAvatar.leftHandTipPosition, Vec3.UNIT_NEG_Y);
        
        var rightHandWorldPosition = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, MyAvatar.rightHandPosition));
        var leftHandWorldPosition = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, MyAvatar.leftHandPosition));
        
        var rightHandler = Vec3.sum(rightHandWorldPosition,Vec3.multiplyQbyV(rightRotHand, Vec3.multiply(VEC3_PALM * MyAvatar.scale));
        var leftHandler = Vec3.sum(leftHandWorldPosition,Vec3.multiplyQbyV(leftRotHand, Vec3.multiply(VEC3_PALM * MyAvatar.scale));
        
        var messageToSend;
        
        //START BUTTON
        var rightDistance = Vec3.distance(rightHandler, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION));
        var leftDistance = Vec3.distance(leftHandler, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION));
        if (rightDistance < INTERACTION_DISTANCE_BUTTON || leftDistance < INTERACTION_DISTANCE_BUTTON) {
            messageToSend = {
                "channel": channel,
                "action": "START-PAUSE"
            };
            
            Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
            
            if (rightDistance < leftDistance) {
                Controller.triggerShortHapticPulse(0.3, RIGHT_HAND_INDEX);
            } else {
                Controller.triggerShortHapticPulse(0.3, LEFT_HAND_INDEX);
            }
            
        }
        
        //print("RIGHT: " + rightDistance); //########################################### DEBUG TRASH
        //print("LEFT: " + leftDistance); //############################################# DEBUG TRASH
        
        //MOVES
        var rightDistance = Vec3.distance(rightHandler, Vec3.sum(thisPosition, MOVE_RELATIVE_POSITION));
        var leftDistance = Vec3.distance(leftHandler, Vec3.sum(thisPosition, MOVE_RELATIVE_POSITION));
        if (rightDistance < INTERACTION_DISTANCE_MOVE || leftDistance < INTERACTION_DISTANCE_MOVE) {
            //find the azimut and the distance
            var vecFromJoystick, handActing;
            var interact = false;
            if (rightDistance < leftDistance) {
                //RIGHT HAND
                vecFromJoystick = Vec3.subtract(rightHandler, Vec3.sum(thisPosition, MOVE_RELATIVE_POSITION));
                handActing = "RIGHT";
            } else {
                //LEFT HAND
                vecFromJoystick = Vec3.subtract(leftHandler, Vec3.sum(thisPosition, MOVE_RELATIVE_POSITION));
                handActing = "LEFT";
            }
            var polar = Vec3.toPolar(vecFromJoystick);
            var polarAzimuth = polar.y;
            if (polarAzimuth < 0) {
                polarAzimuth = (Math.PI * 2) - polarAzimuth;
            }
            if (polar.z > (INTERACTION_DISTANCE_MOVE/3) && polar.x < Math.PI/3) {
                if (polarAzimuth > (Math.PI/4) && polarAzimuth <= (3 * Math.PI/4)) {
                    messageToSend = {
                        "channel": channel,
                        "action": "UP"
                    };
                    Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
                    interact = true;
                } else if (polarAzimuth > (3 * Math.PI/4) && polarAzimuth <= (5 * Math.PI/4)) {
                    messageToSend = {
                        "channel": channel,
                        "action": "LEFT"
                    };
                    Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
                    interact = true;
                } else if (polarAzimuth > (5 * Math.PI/4) && polarAzimuth <= (7 * Math.PI/4)) {
                    messageToSend = {
                        "channel": channel,
                        "action": "DOWN"
                    };
                    Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
                    interact = true;
                } else if (polarAzimuth > (7 * Math.PI/4) || polarAzimuth <= (Math.PI/4)) {
                    messageToSend = {
                        "channel": channel,
                        "action": "RIGHT"
                    };
                    Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
                    interact = true;
                }

            }
            if (interact) {
                if (handActing === "RIGHT") {
                    Controller.triggerShortHapticPulse(0.2, RIGHT_HAND_INDEX);
                } else {
                    Controller.triggerShortHapticPulse(0.2, LEFT_HAND_INDEX);
                }
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
                            playSoundFX(BEGIN_SOUND);
                            break;
                        case "CHOMP":
                            playSoundFX(CHOMP_SOUND);
                            break;
                        case "DEATH":
                            playSoundFX(DEATH_SOUND);
                            break;
                        case "ENERGY":
                            playSoundFX(ENERGY_SOUND);
                            break;
                        case "EAT_GHOST":
                            playSoundFX(EAT_GHOST_SOUND);
                            break;
                        case "INTERMISSION":
                            playSoundFX(INTERMISSION_SOUND);
                            break;
                        case "EXTRA":
                            playSoundFX(EXTRA_SOUND);
                    } 
                }
            }
        }
    }

    function playSoundFX(soundCode) {
        var injectorOptions = {
            "position": MyAvatar.position,
            "volume": 0.25,
            "loop": false,
            "localOnly": false
        };
        var injector = Audio.playSound(soundCode, injectorOptions);
        
    }
    
})
