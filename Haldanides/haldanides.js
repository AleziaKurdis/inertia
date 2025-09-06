//#####################
//
//  haldanides.js
//
//  Created by Alezia Kurdis, September 1st, 2025.
//  Copyright 2025, Overte e.V.
//
//  meteor shower.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("haldanides.js")[0];
    var isInitiated = false;
    var triggerPosition;
    var triggerRotation;
    var renderWithZones;
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var HALF = 0.5;
    let updateTimerIntervall = 20000; // 20 sec 
    var processTimer = 0;
    var catalogNumber;

    var entitiesToDelete = [];
    
    var DAY_DURATION = 68400; //D19

    var zoneID = Uuid.NONE;
    var thisEntityID;
   
    this.preload = function(entityID) {
        Workload.getConfig("controlViews")["regulateViewRanges"] = false;
        thisEntityID = entityID;
        catalogNumber = 0;
 
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

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > updateTimerIntervall ) {

            processHaldanides();
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function shutdown() {
        if (isInitiated){
            Script.update.disconnect(myTimer);
            Workload.getConfig("controlViews")["regulateViewRanges"] = true;
            
            if (zoneID !== Uuid.NONE) {
                Entities.deleteEntity(zoneID);
                zoneID = Uuid.NONE;
            }
            
            for (let i = 0; i < entitiesToDelete.length; i++) {
                Entities.deleteEntity(entitiesToDelete[i]);
            }
            entitiesToDelete = [];
        }
        isInitiated = false;
    }

    function initiate(EntID) {
        var properties = Entities.getEntityProperties(EntID, ["position", "renderWithZones", "rotation"]);
        triggerPosition = properties.position;
        triggerRotation = properties.rotation;
        renderWithZones = properties.renderWithZones;
        isInitiated = true; 
        generateBloomZone();
        
        var today = new Date();
        processTimer = today.getTime();
    
        Script.update.connect(myTimer);
    }

    function generateBloomZone() {
        if (zoneID === Uuid.NONE) {
            zoneID = Entities.addEntity({
                "type": "Zone",
                "name": "HALDANIDES_BLOOM_(!)_Z0N3",
                "dimensions": {
                    "x": 8000,
                    "y": 1000,
                    "z": 8000
                },
                "parentID": thisEntityID,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "grab": {
                    "grabbable": false
                },
                "shapeType": "box",
                "keyLight": {
                    "direction": {
                        "x": 0,
                        "y": -0.7071067690849304,
                        "z": 0.7071067690849304
                    },
                    "castShadows": true
                },
                "bloom": {
                    "bloomIntensity": 0.4,
                    "bloomThreshold": 0.8,
                    "bloomSize":0.5
                },
                "bloomMode": "enabled",
                "lifetime": DAY_DURATION
            },"local");
        }
    }

    function processHaldanides() {
        var d19CurrentHour = (GetCurrentCycleValue(86400000, DAY_DURATION)/1000) / 3600;
        
        //const TARGET_HOUR = 22.5;
        const TARGET_HOUR = 22.5; //DEBUG
        
        const RANDOM_CATALYZER = 0.2;
        
        if ( d19CurrentHour > (TARGET_HOUR - 1) && d19CurrentHour < (TARGET_HOUR + 1) ) {
            updateTimerIntervall = 700; // 0.7 sec
            let baseFrequency = -Math.abs(d19CurrentHour - TARGET_HOUR);
            let expFrequency = Math.pow((baseFrequency + 1),3);
            if (expFrequency > 1) {
                expFrequency = 1;
            } else if (expFrequency < 0){
                expFrequency = 0;
            }
            if (Math.random() < expFrequency * RANDOM_CATALYZER) {
                //print("expFrequency: " + expFrequency);
                let group;
                if (expFrequency < 0.4) {
                    group = [1];
                } else if (expFrequency < 0.7) {
                    group = [1, 2];
                } else {
                    group = [1, 2, 4];
                }
                let groupSet = group[Math.floor(Math.random() * group.length)];
                let colorSet = Math.floor(Math.random() * 7);
                
                let fileName = "HAL-" + groupSet + "-" + colorSet + ".fst";
                
                let dimensionsBolide;
                switch(groupSet) {
                    case 1:
                        dimensionsBolide = {"x":7.839242458343506,"y":7.606816291809082,"z":229.58192443847656};
                        break;
                    case 2:
                        dimensionsBolide = {"x":137.0283660888672,"y":7.808669567108154,"z":363.3722229003906};
                        break;
                    case 4:
                        dimensionsBolide = {"x":179.83761596679688,"y":72.03010559082031,"z":427.2826232910156};
                        break;
                } 
                
                const lifeTime = 38;
                
                let halID = Entities.addEntity({
                    "renderWithZones": renderWithZones,
                    "position": Vec3.sum(triggerPosition, {"x": (Math.random() * 2000) - 1000, "y": 100 + (Math.random() * 300), "z": -5000}),
                    "rotation": Quat.multiply(triggerRotation, Quat.fromVec3Degrees({"x": 0.0, "y": 0.0, "z": (Math.random() * 40) - 20})),
                    "dimensions":  {"x": 20.0, "y": 20.0, "z": 20.0},
                    "shape": "Cube",
                    "visible": true,
                    "alpha": 0.0,
                    "type": "Shape",
                    "lifetime": lifeTime,
                    "grab": {
                        "grabbable": false
                    },
                    "name": "Propeller 1",
                    "canCastShadow": false,
                    "velocity": {"x": 0.0, "y": 0.0, "z": 300.0},
                    "damping": 0,
                    "collisionless": true
                }, "local");
                
                //Faculative Propeller 2, this make reach 810 m/s (instead of 540m/s) 
                let propeller2ID = Entities.addEntity({
                    "parentID": halID,
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                    "dimensions":  {"x": 20.0, "y": 20.0, "z": 20.0},
                    "shape": "Cube",
                    "visible": true,
                    "alpha": 0.0,
                    "type": "Shape",
                    "lifetime": lifeTime,
                    "grab": {
                        "grabbable": false
                    },
                    "name": "Propeller 2",
                    "canCastShadow": false,
                    "localVelocity": {"x": 0.0, "y": 0.0, "z": 300.0},
                    "damping": 0,
                    "collisionless": true
                }, "local");
                
                let meteoreId = Entities.addEntity({
                    "parentID": propeller2ID, //halID, //if not use propeller 2
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                    "dimensions": Vec3.multiply(dimensionsBolide, 1 + (Math.random() * 3)),
                    "modelURL": ROOT + "models/" + fileName,
                    "useOriginalPivot": true,
                    "shapeType": "none",
                    "type": "Model",
                    "lifetime": lifeTime,
                    "grab": {
                        "grabbable": false
                    },
                    "name": "Haldanide",
                    "canCastShadow": false,
                    "localVelocity": {"x": 0.0, "y": 0.0, "z": 300.0},
                    "damping": 0,
                    "collisionless": true
                }, "local");
                
                //ADD LIGHT HERE
                
                //ADD SOUND HERE
                
                entitiesToDelete.push(halID);
                print("HALDANIDE-" + catalogNumber + " | " + fileName);
                catalogNumber++;
            }
        } else {
            updateTimerIntervall = 20000; // 20 sec
        }
        
    }

    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}    
    // ################## END CYLCE AND TIME FUNCTIONS ###########################   

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

    /*
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

})
