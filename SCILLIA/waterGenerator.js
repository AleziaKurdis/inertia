//#####################
//
//  waterGenerator.js
//
//  Created by Alezia Kurdis, January 16th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Generate water material and zones for the SCILLIA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("waterGenerator.js")[0];
    let isInitiated = false;
    let universeDimension;
    let universeCenter;
    let renderWithZones;
    const DEGREES_TO_RADIANS = Math.PI / 180.0;
    const HALF = 0.5;
    let thisEntityID;
    let waterMaterialID = Uuid.NONE;
    
    const UPDATE_TIMER_INTERVAL = 80; // 80 milisec 
    let processTimer = 0;
   
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
        Script.update.disconnect(myTimer);
        if (isInitiated){
            if (waterMaterialID !== Uuid.NONE){
                Entities.deleteEntity(waterMaterialID);
                waterMaterialID = Uuid.NONE;
            }
        }
        isInitiated = false;
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            manageWater();
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function initiate(EntID) {
        let properties = Entities.getEntityProperties(EntID, ["position", "dimensions", "renderWithZones"]);
        universeCenter = properties.position;
        universeDimension = properties.dimensions;
        renderWithZones = properties.renderWithZones;

        isInitiated = true; 
        
        manageWater();

        let today = new Date();
        processTimer = today.getTime();
    
        Script.update.connect(myTimer);
    }

    function manageWater() {
        let waterPosition = GetCurrentCycleValue(1, 30);
        let matPos = {
            "x": waterPosition,
            "y": waterPosition
        };
        
        if (waterMaterialID === Uuid.NONE) {
            waterMaterialID = Entities.addEntity({
                "type": "Material",
                "parentID": thisEntityID,
                "localPosition": {
                    "x": 0.0,
                    "y": -1000.0,
                    "z": 0.0
                },
                "name": "WATER_MATERIAL",
                "dimensions": {
                    "x": 1,
                    "y": 1,
                    "z": 1
                },
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "damping": 0,
                "angularDamping": 0,
                "materialURL": ROOT + "models/WATER/waterMaterial.json",
                "priority": 3,
                "parentMaterialName": "mat::WATER",
                "materialMappingPos": matPos
            }, "local");
        } else {
            Entities.editEntity(waterMaterialID, {
                "materialMappingPos": matPos
            });
        }
    }

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
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
