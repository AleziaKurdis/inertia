//
//  soundFX.js
//
//  Created by Alezia Kurdis,November 10th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Space portal opening bearch sound.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("soundFX.js")[0];
    var BREACH_SOUND = ROOT + "breach.mp3";
    var breachSound;
    
    this.preload = function(entityID) {
        breachSound = SoundCache.getSound(BREACH_SOUND);
    }

    this.enterEntity = function(entityID) {
        var injector = Audio.playSound(breachSound, {
                            "position": MyAvatar.position,
                            "loop": false,
                            "localOnly": true,
                            "volume": 1
                            });
    }; 
    
    this.leaveEntity = function(entityID) {
        //do nothing.
    };
    
    
})
