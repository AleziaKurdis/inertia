//#####################
//
//  lanscapeGenerator.js
//
//  Created by Alezia Kurdis, January 16th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Generate expanded landscape for the SCILLIA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("lanscapeGenerator.js")[0];
    let isInitiated = false;
    let universeDimension;
    let universeCenter;
    let renderWithZones;
    const DEGREES_TO_RADIANS = Math.PI / 180.0;
    const HALF = 0.5;
    let thisEntityID;
    let landscapeID = Uuid.NONE;
   
    this.preload = function(entityID) {
        thisEntityID = entityID;

        if (!isInitiated){
            if (positionIsInsideEntityBounds(entityID, MyAvatar.position)) {
                initiate(entityID);
            }
        }  
        
    };

    this.enterEntity = function(entityID) {
        if (!isInitiated){
            initiate(entityID);
        }
    };

    this.leaveEntity = function(entityID) {
        shutdown();
    };
    
    this.unload = function(entityID) {
        shutdown();
    };    

    function shutdown() {
        if (isInitiated){
            if (landscapeID !== Uuid.NONE){
                Entities.deleteEntity(landscapeID);
                landscapeID = Uuid.NONE;
            }
        }
        isInitiated = false;
    }

    function initiate(EntID) {
        var properties = Entities.getEntityProperties(EntID, ["position", "dimensions", "renderWithZones"]);
        universeCenter = properties.position;
        universeDimension = properties.dimensions;
        renderWithZones = properties.renderWithZones;

        isInitiated = true; 

        if (landscapeID === Uuid.NONE){
            landscapeID = Entities.addEntity({
                "type": "Model",
                "parentID": thisEntityID,
                "localPosition": {
                    "x": 0.0,
                    "y": -400.0,
                    "z": 0.0
                },
                "name": "DISTANCE",
                "dimensions": {
                    "x": 24835.109375,
                    "y": 800,
                    "z": 24840.841796875
                },
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "damping": 0,
                "angularDamping": 0,
                "modelURL": ROOT + "models/DISTANCE.fst",
                "useOriginalPivot": true
            }, "local");
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
