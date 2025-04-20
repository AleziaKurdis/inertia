//
// sittableUIClient.js
//
// Created by Robin Wilson 5/7/2019
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {

    var DEBUG = false;

    var MAX_SIT_DISTANCE_M = 5;

    var displayIntervalTimer = 2000; // 2 sec 
    var MAX_LAPS = 15; //15 X interval (30 sec)
    var laps = MAX_LAPS;
    var processTimer = 0;
    var TURN_ON_DISTANCE = 3; //3m
    var WAS_OFF = 10000; //High number to indicate that it was previously far.
    var uiPosition;
    
    // Constructor
    var _this = null;
    var SITTABLE_IMAGE_URL_HMD = Script.resolvePath("./images/triggerToSit.png");
    var SITTABLE_IMAGE_URL_DESKTOP = Script.resolvePath("./images/clickToSit.png");
    function SittableClickableUI() {
        _this = this;
        this.entityID = null;
        this.sitEntityID = null;
    }


    // Entity methods
    SittableClickableUI.prototype = {
        preload: function (id) {
            _this.entityID = id;

            var properties = Entities.getEntityProperties(id);
            this.sitEntityID = properties.parentID;
            uiPosition = properties.position;
            HMD.displayModeChanged.connect(this.displayModeChangedCallback);

            var today = new Date();
            processTimer = today.getTime();
            Script.update.connect(this.displayTimer);            
        },

        displayTimer: function(deltaTime) {
            var today = new Date();
            var distance = Vec3.distance(MyAvatar.position, uiPosition);
            if ((today.getTime() - processTimer) > displayIntervalTimer ) {
                if (distance < TURN_ON_DISTANCE) {
                    if (laps == WAS_OFF) {
                        Entities.editEntity( _this.entityID, { "visible": true });
                        laps = MAX_LAPS;                        
                    } else {
                        laps = laps -1;
                        if (laps < 0) {
                            Entities.editEntity( _this.entityID, { "visible": false });
                            laps = 0;
                        }
                    }
                } else {
                    laps = WAS_OFF;
                    Entities.editEntity( _this.entityID, { "visible": false });
                }
                processTimer = today.getTime();
            }            
        },

        displayModeChangedCallback: function() {
            if (_this && _this.entityID) {
                Entities.editEntity(
                    _this.entityID,
                    { imageURL: HMD.active ? SITTABLE_IMAGE_URL_HMD : SITTABLE_IMAGE_URL_DESKTOP }
                );
            }
        },

        mousePressOnEntity: function (entityID, event) {
            if (DEBUG) {
                console.log("sittableUIClient.js: " + _this.entityID + ": `mousePressOnEntity()`");
            }
            if (event.isPrimaryButton && 
                Vec3.distance(MyAvatar.position, Entities.getEntityProperties(_this.entityID, ["position"]).position) <= MAX_SIT_DISTANCE_M) {
                Entities.callEntityServerMethod(_this.sitEntityID, "onMousePressOnEntity", [MyAvatar.sessionUUID]);
            }
        },

        unload: function () {
            HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
            Script.update.disconnect(this.displayTimer);
        }
    };

    
    return new SittableClickableUI();
});
