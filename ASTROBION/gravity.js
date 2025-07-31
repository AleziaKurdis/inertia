//#####################
//
//  gravity.js
//
//  Created by Alezia Kurdis, July 30th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Set Gavity specific to a zone.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("gravity.js")[0];
    var isInitiated = false;
    
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var HALF = 0.5;
    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;

    var originalGravity;
    var THIS_GRAVITY = 29; //%
    var currentGravity = -9.8 * (THIS_GRAVITY/100);
    var thisEntityID;

    this.preload = function(entityID) {
        thisEntityID = entityID;
        
        
        if (!isInitiated){
            if (positionIsInsideEntityBounds(entityID, MyAvatar.position)) {
                var today = new Date();
                processTimer = today.getTime();
                Script.update.connect(myTimer);
                
                initiate(entityID,"PRELOAD");
            }
        }  
        
    };

    this.enterEntity = function(entityID) {
        if (!isInitiated){
            initiate(entityID,"ENTER");
        }
    };

    this.leaveEntity = function(entityID) {
        setOriginalGravity();
    };
    
    this.unload = function(entityID) {
        setOriginalGravity();
        if (processTimer !== 0) {
            Script.update.disconnect(myTimer);
        }
    };

    function setOriginalGravity() {
        if (MyAvatar.getGravity() !== originalGravity) {
            MyAvatar.setGravity(originalGravity);
        }
        isInitiated = false;
    }
    
    function setThisGravity() {
        if (MyAvatar.getGravity() !== currentGravity) {
            MyAvatar.setGravity(currentGravity);
        }
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            
            if (!positionIsInsideEntityBounds(thisEntityID, MyAvatar.position)) {
                Script.update.disconnect(myTimer);
                processTimer = 0;
                setOriginalGravity();
            } else {
                today = new Date();
                processTimer = today.getTime();
            }
        }  
    }

    function initiate(EntID, from) {
        isInitiated = true; 
        originalGravity = MyAvatar.getGravity();
        setThisGravity();
 
        if (from === "PRELOAD") {
            var today = new Date();
            processTimer = today.getTime();
            Script.update.connect(myTimer);
        } else {
            processTimer = 0;
        }
    }

    function positionIsInsideEntityBounds(entityID, targetPosition) {
        targetPosition = targetPosition || MyAvatar.position;

        var properties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
        var entityPosition = properties.position;
        var entityDimensions = properties.dimensions;
        var entityRotation = properties.rotation;

        var worldOffset = Vec3.subtract(targetPosition, entityPosition);
        targetPosition = Vec3.multiplyQbyV(Quat.inverse(entityRotation), worldOffset);

        var minX = -entityDimensions.x * HALF;
        var maxX = entityDimensions.x * HALF;
        var minY = -entityDimensions.y * HALF;
        var maxY = entityDimensions.y * HALF;
        var minZ = -entityDimensions.z * HALF;
        var maxZ = entityDimensions.z * HALF;

        return (targetPosition.x >= minX && targetPosition.x <= maxX
            && targetPosition.y >= minY && targetPosition.y <= maxY
            && targetPosition.z >= minZ && targetPosition.z <= maxZ);
    }
    
})
