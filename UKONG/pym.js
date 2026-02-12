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
    var pymDirection = "Z+";
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
        var properties = Entities.getEntityProperties(entityID, ["tags", "dimensions", "position"]);
        var tags = properties.tags;
        entityPosition = properties.position;
        entityDimensions = properties.dimensions;
        if (tags.indexOf("UP") !== -1) {
            pymType = "UP";
        } else {
            pymType = "DOWN";
        }
        if (tags.indexOf("Z+") !== -1) {
            pymDirection = "Z+";
        } else {
            pymDirection = "Z-";
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
            
            var zScale = ((myZposition - entityPosition.z + (entityDimensions.z/2))/entityDimensions.z);
            if (pymDirection === "Z+") {
                zScale = 1 - zScale;
            }
            
            if (pymType === "DOWN") {
                factor = MIN_SCALE + (1 - MIN_SCALE) * zScale;
            } else {
                factor = 1 + MAX_SCALE * zScale;
            }

        } else {
            //outside
            if (pymType === "DOWN") {
                if (myZposition < entityPosition.z) {
                    if (pymDirection === "Z+") {
                        factor = MIN_SCALE;
                    } else {
                        factor = 1;
                    }
                } else {
                    if (pymDirection === "Z+") {
                        factor = 1;
                    } else {
                        factor = MIN_SCALE;
                    }
                }
            } else {
                if (myZposition < entityPosition.z) {
                   if (pymDirection === "Z+") {
                        factor = MAX_SCALE;
                    } else {
                        factor = 1;
                    }
                } else {
                    if (pymDirection === "Z+") {
                        factor = 1;
                    } else {
                        factor = MAX_SCALE;
                    }
                }    
            }
        }
        
        MyAvatar.scale = originalScale * factor;
    }
})
