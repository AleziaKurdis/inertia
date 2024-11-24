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
    
    var SCREEN_RELATIVE_POSITION = {"x": 0.0, "y": 1.0, "z": 0.0};
    var SCREEN_RELATIVE_ROTATION = Quat.fromVec3Degrees({"x": 0.0, "y": 0.0, "z": 0.0});
    
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
            "localRoatation": SCREEN_RELATIVE_ROTATION,
            "sourceUrl": ROOT + "index.html",
            "dpi": 50,
            "maxFPS": 60
        }, "local");
        
        var today = new Date();
        processTimer = today.getTime();
        
        Script.update.connect(myTimer);
    };

    this.unload = function(entityID) {
        if (webID !== Uuid.NONE) {
            Entities.deleteEntity(webID);
            webID = Uuid.NONE;
        }
        
        Script.update.disconnect(myTimer);
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

        var rightHandWorldPosition = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, MyAvatar.rightHandPosition));
        var leftHandWorldPosition = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, MyAvatar.leftHandPosition));
        
        var messageToSend;
        
        if (Vec3.distance(rightHandWorldPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION)) < INTERACTION_DISTANCE ||
            Vec3.distance(leftHandWorldPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION)) < INTERACTION_DISTANCE) {
            messageToSend = {
                "channel": channel,
                "action": "START-PAUSE"
            };
            
            Entities.emitScriptEvent(thisEntityID, messageToSend);
            print("RIGHT: " + JSON.stringify(Vec3.distance(rightHandWorldPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION)))); //################# DEBUG TRASH
            print("LEFT: " + JSON.stringify(Vec3.distance(leftHandWorldPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION)))); //################# DEBUG TRASH
        }
        
        print("RIGHT: " + JSON.stringify(Vec3.distance(rightHandWorldPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION)))); //################# DEBUG TRASH
        //print("LEFT: " + JSON.stringify(Vec3.distance(leftHandWorldPosition, Vec3.sum(thisPosition, BUTTON_RELATIVE_POSITION)))); //################# DEBUG TRASH

    }

    Entities.webEventReceived.connect(function (message) {
        if (typeof message === "string") {
            var d = new Date();
            var n = d.getTime();
            var instruction = JSON.parse(message);
            if (instruction.channel === channel) {
                if (instruction.action === "ACTION_NAME") {
                    //Call a function to do something here
                }
            }
        }
    });


})
