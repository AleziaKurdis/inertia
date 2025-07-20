//#####################
//
//  navPanel.js
//
//  Created by Alezia Kurdis, July 18th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Navigation panel for hyperspatial travel with the Breemor.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("navPanel.js")[0];
    var isInitiated = false;
    var triggerDimensions;
    var triggerPosition;
    var renderWithZones;
    var uniqueKey;
    
    var channelName = "org.overte.ak.breemor";
    
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var HALF = 0.5;
    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;

    var thisEntityID;
    var webID = Uuid.NONE;

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
        setPanelOff();
    };
    
    this.unload = function(entityID) {
        setPanelOff();
        if (processTimer !== 0) {
            Script.update.disconnect(myTimer);
        }
    };

    function setPanelOff() {
        if (webID !== Uuid.NONE) {
            Entities.deleteEntity(webID);
            webID = Uuid.NONE;
        }
        isInitiated = false;
    }
    
    function setPanelOn() {
        webID = Entities.addEntity({
            "type": "Web",
            "parentID": thisEntityID,
            "name": "Breemor - Navigation Panel",
            "dimensions": {"x": 0.43, "y": 0.23, "z": 0.01},
            "localPosition": {"x": 0.0, "y": 0.0, "z": (triggerDimensions.z/2)},
            "localRotation": Quat.fromVec3Degrees({"x": 0.0, "y": 180.0, "z": 0.0}),
            "sourceUrl": ROOT + "navPanel.html",
            "grab": {
                "grabbable": false
            },
            "useBackground": true,
            "lifetime": 25200
        }, "local");
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            
            if (!positionIsInsideEntityBounds(thisEntityID, MyAvatar.position)) {
                Script.update.disconnect(myTimer);
                processTimer = 0;
                setPanelOff();
            } else {
                today = new Date();
                processTimer = today.getTime();
            }
        }  
    }

    Entities.webEventReceived.connect(function (entityID, message ) {
        if (entityID === webID) {
            Messages.sendMessage(channelName, "HYPERSPACE_" + message);
            setPanelOff();
        }
    });

    function initiate(EntID, from) {
        var properties = Entities.getEntityProperties(EntID, ["description", "renderWithZones", "position", "dimensions"]);
        triggerPosition = properties.position;
        triggerDimensions = properties.dimensions;
        uniqueKey = properties.description;
        renderWithZones = properties.renderWithZones;
        channelName = channelName + "." + uniqueKey;
        isInitiated = true; 
        
        setPanelOn();
 
        if (from === "PRELOAD") {
            var today = new Date();
            processTimer = today.getTime();
            Script.update.connect(myTimer);
        } else {
            processTimer = 0;
        }
    }


    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = (today.getTime()- deltaWithServerTime)/1000;
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
