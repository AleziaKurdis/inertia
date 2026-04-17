//
//  gong.js
//
//  Created by Alezia Kurdis, April 6th, 2026.
//  Copyright 2026 Alezia Kurdis.
//
//  Gong to start the ritual of the Zamyru Temple.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    const ROOT = Script.resolvePath('').split("gong.js")[0]; 
    const MAX_CLICKABLE_DISTANCE_M = 6;
    const channelComm = "ak.ukong.ritual.communications";
    const D17_DAY_DURATION = 61200;
    let oneTimeOnly = false;
    let SOUND = SoundCache.getSound(ROOT + "sounds/RITUAL/GONG.mp3");
    
    // Constructor
    let _this = null;

    function clickableUI() {
        _this = this;
        this.entityID = null;
    }

    function trigger(entityID) {
        let d17CurrentHour = (GetCurrentCycleValue(8640000, D17_DAY_DURATION)/100) / 3600;
        //if ( d17CurrentHour > 12 || d17CurrentHour < 11.9) { //FOR DEBUG
        if ( d17CurrentHour > 19 || d17CurrentHour < 5) {
            let messageToSend = {
                "action": "START_ZAMYRU_RITUAL_OF_DEATH"
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));
        }

        let injectorOptions = {
            "position": MyAvatar.position,
            "volume": 1.0,
            "loop": false,
            "localOnly": false
        };
        let injector = Audio.playSound(SOUND, injectorOptions);
        let timer = Script.setTimeout(function () {
            //avoid too fast closure for the sound
        }, 11000);
    }; 

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

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