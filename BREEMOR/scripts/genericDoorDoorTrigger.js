//
//  genericDoorDoorTrigger.js
//
//  Created by Alezia Kurdis, May 17th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Trigger for the Front Cargo Bay Door of the Breemor spaceship.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("genericDoorDoorTrigger.js")[0];

    var channelName = "org.overte.ak.breemor";
    var doorNo = null;
    
    this.preload = function(entityID) {
        doorNo = parseInt(Entities.getEntityProperties(entityID, ["description"]).description, 10);
        var userData = JSON.parse(Entities.getEntityProperties(entityID, ["userData"]).userData);
        channelName = channelName + "." + userData.uniqueKey;
    };
    
    this.enterEntity = function(entityID) {
        Messages.sendMessage(channelName, "OPEN_GENERIC_DOOR " + doorNo);
    };

    this.leaveEntity = function(entityID) {
        Messages.sendMessage(channelName, "CLOSE_GENERIC_DOOR " + doorNo);
    };

})
