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
(function() {
    var jsMainFileName = "arcadePacMan.js"; 
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var channel = "overte.ak.arcadeGame.pacman";
    var webID = Uuid.NONE;
    var thisEntityID;
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        
        webID = Entities.addEntity({
            "type": "Web",
            "name": "arcade game screen",
            "parentID": entityID,
            "dimensions": {"x": 0.6, "y": 0.4, "z": 0.01},
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "sourceUrl": ROOT + "index.html",
            "dpi": 12,
            "maxFPS": 60
        }, "local");
    };

    this.unload = function(entityID) {
        if (webID !== Uuid.NONE) {
            Entities.deleteEntity(webID);
            webID = Uuid.NONE;
        }
    };

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

/*    //to send
    webID.emitScriptEvent(stringmessage);
*/

}());
