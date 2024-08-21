//
//  start.js
//
//  Created by Alezia Kurdis, August 20th, 2024.
//  Copyright 2024 Alezia Kurdis.
//
//  trigger to start the CTF game.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var jsMainFileName = "start.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];    
    var channelComm = "ak.ctf.ac.communication"; 
    var oneTimeOnly = false;
    var SOUND_FLIP = SoundCache.getSound(ROOT + "sounds/pressButton.mp3");
    
    function trigger(entityID) {
        if (oneTimeOnly === false) {
            var message = {
                "action": "START"
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
            print("START"):
            
            var injectorOptions = {
                "position": MyAvatar.position,
                "volume": 0.4,
                "loop": false,
                "localOnly": false
            };
            var injector = Audio.playSound(SOUND_FLIP, injectorOptions);
            
            oneTimeOnly = true;
        }

    }; 

    var MAX_CLICKABLE_DISTANCE_M = 3;
    
    this.preload = function(entityID) {
        Entities.mousePressOnEntity.connect(onMousePressOnEntity);
    };
    
    this.unload = function(entityID) {
        Entities.mousePressOnEntity.disconnect(onMousePressOnEntity);
    };

    function onMousePressOnEntity(entityID, event) {
        if (event.isPrimaryButton && 
            Vec3.distance(MyAvatar.position, Entities.getEntityProperties(_this.entityID, ["position"]).position) <= MAX_CLICKABLE_DISTANCE_M) {
                trigger(entityID);
        }
    }

})
