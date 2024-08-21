//"use strict";
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
(function() {
    var ROOT = Script.resolvePath('').split("start.js")[0]; 
    var MAX_CLICKABLE_DISTANCE_M = 4;
    var channelComm = "ak.ctf.ac.communication"; 
    var oneTimeOnly = false;
    var SOUND = SoundCache.getSound(ROOT + "sounds/pressButton.mp3");
    
    // Constructor
    var _this = null;

    function clickableUI() {
        _this = this;
        this.entityID = null;
    }

    function trigger(entityID) {
        if (oneTimeOnly === false) {
            var message = {
                "action": "START"
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
            
            var injectorOptions = {
                "position": MyAvatar.position,
                "volume": 0.4,
                "loop": false,
                "localOnly": false
            };
            var injector = Audio.playSound(SOUND, injectorOptions);
            
            oneTimeOnly = true;
        }

    }; 

    // Entity methods
    clickableUI.prototype = {
        preload: function (id) {
            _this.entityID = id;
            HMD.displayModeChanged.connect(this.displayModeChangedCallback);
        },

        displayModeChangedCallback: function() {
            if (_this && _this.entityID) {
                //Nothing
            }
        },

        mousePressOnEntity: function (entityID, event) {
            if (event.isPrimaryButton && 
                Vec3.distance(MyAvatar.position, Entities.getEntityProperties(_this.entityID, ["position"]).position) <= MAX_CLICKABLE_DISTANCE_M) {
                    trigger(entityID);
            }
        },

        unload: function () {
            HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
        }
    };

    
    return new clickableUI();

});