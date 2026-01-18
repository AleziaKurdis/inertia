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
    let underWaterID = Uuid.NONE;
    let underWater2ID = Uuid.NONE;
    
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
            
            if (underWaterID !== Uuid.NONE){
                Entities.deleteEntity(underWaterID);
                underWaterID = Uuid.NONE;
            }
            
            if (underWater2ID !== Uuid.NONE){
                Entities.deleteEntity(underWater2ID);
                underWater2ID = Uuid.NONE;
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
        genUnderWaters();

        let today = new Date();
        processTimer = today.getTime();
    
        Script.update.connect(myTimer);
    }

    function genUnderWaters() {
        
        underWaterID = Entities.addEntity({
            "type": "Zone",
            "name": "UNDERWATER 1",
            "parentID": thisEntityID,
            "renderWithZones": renderWithZones,
            "localPosition": {
                "x": -2058.9893,
                "y": -324.3853,
                "z": -230.9443
            },
            "dimensions": {"x":2884.403076171875,"y":500.0,"z":1767.341552734375},
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "shapeType": "box",
            "keyLight": {
                "color": {
                    "red": 54,
                    "green": 48,
                    "blue": 176
                },
                "intensity": 1.5,
                "direction": {
                    "x": 0.0007962740492075682,
                    "y": -0.9999997019767761,
                    "z": 0
                },
                "castShadows": true,
                "shadowBias": 0.20000000298023224,
                "shadowMaxDistance": 200
            },
            "haze": {
                "hazeRange": 700,
                "hazeColor": {
                    "red": 0,
                    "green": 9,
                    "blue": 77
                }
            },
            "keyLightMode": "enabled",
            "hazeMode": "enabled"
        }, "local");
        
        underWater2ID = Entities.addEntity({
            "type": "Zone",
            "name": "UNDERWATER 2",
            "parentID": thisEntityID,
            "renderWithZones": renderWithZones,
            "localPosition": {
                "x": 1688.2427,
                "y": -345.9385,
                "z": -633.5015
            },
            "dimensions": {"x":2884.403076171875,"y":665.080078125,"z":2927.943603515625},
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "shapeType": "box",
            "keyLight": {
                "color": {
                    "red": 54,
                    "green": 48,
                    "blue": 176
                },
                "intensity": 1.5,
                "direction": {
                    "x": 0.0007962740492075682,
                    "y": -0.9999997019767761,
                    "z": 0
                },
                "castShadows": true,
                "shadowBias": 0.20000000298023224,
                "shadowMaxDistance": 200
            },
            "haze": {
                "hazeRange": 700,
                "hazeColor": {
                    "red": 0,
                    "green": 9,
                    "blue": 77
                }
            },
            "keyLightMode": "enabled",
            "hazeMode": "enabled"
        }, "local");
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
