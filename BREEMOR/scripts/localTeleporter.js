//
//  localTeleporter.js
//
//  Created by Alezia Kurdis, May 20th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Teleportation script for elevator.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("localTeleporter.js")[0];
    var arrivalYposition;
    var SOUND = SoundCache.getSound(ROOT + "../sounds/elevator.mp3");
    var MAX_CLICKABLE_DISTANCE_M = 2; 
    var oneTimeOnly = false;
    
    this.preload = function(entityID) {
        arrivalYposition = parseFloat(Entities.getEntityProperties(entityID, ["description"]).description);
        if(!arrivalYposition) {
            arrivalYposition = 0.0;
        }
    }

    
    // Constructor
    var _this = null;

    function clickableUI() {
        _this = this;
        this.entityID = null;
    }

    function trigger() {
        if (oneTimeOnly === false) {
            var novaPosition = {"x": MyAvatar.position.x, "y": arrivalYposition, "z": MyAvatar.position.z};
            print("ARRIVAL POSITION: " + JSON.stringify(novaPosition));
            print("arrivalYposition: " + arrivalYposition);
            MyAvatar.goToLocation(novaPosition);
            var injectorOptions = {
                "position": MyAvatar.position,
                "volume": 0.5,
                "loop": false,
                "localOnly": false
            };
            var injector = Audio.playSound(SOUND, injectorOptions);
            
            oneTimeOnly = true;
            Script.setTimeout(function () {
                oneTimeOnly = false;
            }, 3000);
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
                    trigger();
            }
        },

        unload: function () {
            HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
        }
    };

    
    return new clickableUI();

});
