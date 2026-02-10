//
//  pym.js
//
//  Created by Alezia Kurdis, Octorber 12th, 2024.
//  Copyright 2024, Overte e.V.
//
//  PYM CORRIDOR (UP 1 to 20 and DOWN 1 to 0.2).
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("pym.js")[0];
    var thisEntityID;
    var pymType = "DOWN";
    var isProcessing = false;
    var originalScale;
    var entityPosition;
    var entityDimensions;
    var updateTimerInterval = 200; //0.2sec.
    var processTimer = 0;
    var MIN_SCALE = 0.2;
    var MAX_SCALE = 20;
    
    this.preload = function (entityID) {
        thisEntityID = entityID;
        var properties = Entities.getEntityProperties(entityID, ["description", "dimensions", "position"]);
        var description = properties.description;
        entityPosition = properties.position;
        entityDimensions = properties.dimensions;
        if (description === "UP") {
            pymType = "UP";
        } else {
            pymType = "DOWN";
        }
        originalScale = MyAvatar.scale;
    };

    this.enterEntity = function(entityID) {
        Script.update.connect(myTimer);
        isProcessing = true;
        manageScale();
    }; 

    this.leaveEntity = function(entityID) {
        Script.update.disconnect(myTimer);
        isProcessing = false;
        manageScale();
    }; 

    this.unload = function(entityID) {
        if (isProcessing) {
            Script.update.disconnect(myTimer);
        }
        MyAvatar.scale = originalScale;
    }; 
    
    function myTimer(deltaTime) {
        var today = new Date();
        
        if ((today.getTime() - processTimer) > updateTimerInterval ) {
            
            manageScale();
            
            today = new Date();
            processTimer = today.getTime();
        }
    }

    function manageScale() {
        var factor = 1;
        var myZposition = MyAvatar.position.z;
        if (Math.abs(myZposition - entityPosition.z) < (entityDimensions.z/2)) {
            //inside
            if (pymType === "DOWN") {
                factor = MIN_SCALE + (1 - MIN_SCALE) *((myZposition - entityPosition.z + (entityDimensions.z/2))/entityDimensions.z);
            } else {
                factor = 1 + MAX_SCALE *((myZposition - entityPosition.z + (entityDimensions.z/2))/entityDimensions.z);
            }
        } else {
            //outside
            if (pymType === "DOWN") {
                if (myZposition < entityPosition.z) {
                    factor = MIN_SCALE;
                } else {
                    factor = 1;
                }
            } else {
                if (myZposition < entityPosition.z) {
                    factor = 1;
                } else {
                    factor = MAX_SCALE;
                }
            }
        }
        
        MyAvatar.scale = originalScale * factor;
    }
})
