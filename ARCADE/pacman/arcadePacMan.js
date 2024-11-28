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
    
    var UPDATE_TIMER_INTERVAL = 500;
    var processTimer = 0;
    
    var SCREEN_RELATIVE_POSITION = {"x": 0.12, "y": 0.49, "z": 0.0};
    var SCREEN_RELATIVE_ROTATION = Quat.fromVec3Degrees({"x": -14.0, "y": 90.0, "z": 0.0});
    
    var INTERACTION_DISTANCE = 0.07;
    var BUTTON_RELATIVE_POSITION = {"x": 0.0, "y": 0.08, "z": 0.0};
    var MOVE_UP_RELATIVE_POSITION = {"x": 0.0, "y": 1.0, "z": 0.0};
    var MOVE_DOWN_RELATIVE_POSITION = {"x": 0.0, "y": 1.0, "z": 0.0};
    var MOVE_LEFT_RELATIVE_POSITION = {"x": 0.0, "y": 1.0, "z": 0.0};
    var MOVE_RIGHT_RELATIVE_POSITION = {"x": 0.0, "y": 1.0, "z": 0.0};
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        thisPosition = Entities.getEntityProperties(entityID, ["position"]).position;
        
        webID = Entities.addEntity({
            "type": "Web",
            "name": "arcade game screen",
            "parentID": entityID,
            "dimensions": {"x": 0.6, "y": 0.4, "z": 0.01},
            "localPosition": SCREEN_RELATIVE_POSITION,
            "localRotation": SCREEN_RELATIVE_ROTATION,
            "sourceUrl": ROOT + "index.html",
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
        
        var rightHandWorldPosition = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, MyAvatar.rightHandPosition));
        var leftHandWorldPosition = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, MyAvatar.leftHandPosition));
        
        var messageToSend;
        
        var rightDistance = Vec3.distance(rightHandWorldPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION));
        var leftDistance = Vec3.distance(leftHandWorldPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION));
        if (rightDistance < INTERACTION_DISTANCE || leftDistance < INTERACTION_DISTANCE) {
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
            
            print("RIGHT: " + rightDistance); //################# DEBUG TRASH
            print("LEFT: " + leftDistance); //################# DEBUG TRASH
        }
        
    }

    function onWebEventReceived(entityID, message) {
        if (typeof message === "string" &&  entityID === webID) {
            var d = new Date();
            var n = d.getTime();
            var instruction = JSON.parse(message);
            if (instruction.channel === channel) {
                if (instruction.action === "TEST") {
                    print("YES!");
                }
            }
        }
    }

    Script.setTimeout(function () {
        print("triggered!");
        var messageToSend = {
            "channel": channel,
            "action": "START-PAUSE"
        };
        
        Entities.emitScriptEvent(webID, JSON.stringify(messageToSend));
    }, 5000);

})
