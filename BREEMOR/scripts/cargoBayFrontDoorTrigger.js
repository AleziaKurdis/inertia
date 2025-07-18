//
//  cargoBayFrontDoorTrigger.js
//
//  Created by Alezia Kurdis, May 15th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Trigger for the Front Cargo Bay Door of the Breemor spaceship.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("cargoBayFrontDoorTrigger.js")[0];

    var channelName = "org.overte.ak.breemor";
    
    this.preload = function(entityID) {
        var userData = JSON.parse(Entities.getEntityProperties(entityID, ["userData"]).userData);
        channelName = channelName + "." + userData.uniqueKey;
    };

    this.enterEntity = function(entityID) {
        Messages.sendMessage(channelName, "OPEN_CARGO_DOOR");
    };

    this.leaveEntity = function(entityID) {
        Messages.sendMessage(channelName, "CLOSE_CARGO_DOOR");
    };

})
