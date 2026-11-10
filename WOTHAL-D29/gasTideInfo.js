//
//  gasTideInfo.js
//
//  Created by Alezia Kurdis on November 9th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Gas Tide Information panel.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var jsMainFileName = "gasTideInfo.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var D29_DAY_LENGTH = 104400;
    var UPDATE_TIMER_INTERVAL = (D29_DAY_LENGTH/(24 * 60)) * 1000;
    var processTimer = 0;
    
    const TIDE_DURATION = 4.0;
    
    var thisID;
    var thisPosition;
    var thisRenderWithZones;
    var thisDimensions;

    var gasTideInfoID = Uuid.NONE;
    var progressionID = Uuid.NONE;
    var tideID = Uuid.NONE;
    
    this.preload = function(entityID) {
        //Generate the Clock text local entity.
        thisID = entityID;
        var properties = Entities.getEntityProperties(thisID, ["position","renderWithZones", "dimensions"] );
        thisPosition = properties.position;
        thisRenderWithZones = properties.renderWithZones;
        thisDimensions = properties.dimensions;
        
        updateTideInfo();
        
        today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);
    };

    this.unload = function(entityID) {
        shutdown();
    };

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {

            updateTideInfo();

            today = new Date();
            processTimer = today.getTime();
        }  
    }


    function shutdown() {
        if (gasTideInfoID !== Uuid.NONE){
            Script.update.disconnect(myTimer);
            
            Entities.deleteEntity(gasTideInfoID);
            gasTideInfoID = Uuid.NONE;

            Entities.deleteEntity(progressionID);
            progressionID = Uuid.NONE;

            Entities.deleteEntity(tideID);
            tideID = Uuid.NONE;
        }
    }

    function updateTideInfo() {
        var angle = GetCurrentCycleValue(Math.PI * 2, Math.floor((D29_DAY_LENGTH/24) * TIDE_DURATION));
        var gravityPercent = (Math.sin(angle) * 100); // -100 to 100 %
        var progression;
        var progressionColor;
        
        if (angle < (Math.PI/2) || angle > (3 * Math.PI/2)) {
            progression = "+ INCREASING";
            progressionColor = {"red": 140, "green": 255, "blue": 138};
        } else {
            progression = "- DECREASING";
            progressionColor = {"red": 255, "green": 82, "blue": 82};
        }

        var textOfficialColor = {"red": 255, "green": 255, "blue": 255};
        
        if (gasTideInfoID === Uuid.NONE){
            //create clock
            gasTideInfoID = Entities.addEntity({
                "type": "Text",
                "name": "GAS TIDE INFORMATION",
                "dimensions": {
                    "x": thisDimensions.x * 0.9,
                    "y": thisDimensions.y * 0.52,
                    "z": 0.01
                },
                "parentID": thisID,
                "localPosition": {
                    "x": 0, 
                    "y": (thisDimensions.y * 0.5) * -0.05, 
                    "z": 0.02
                },
                "grab": {
                    "grabbable": false
                },
                "text": "Gas Altitude Tide: " + gravityPercent.toFixed(1) + " %",
                "renderWithZones": thisRenderWithZones,
                "lineHeight": thisDimensions.y * 0.4,
                "textColor": textOfficialColor,
                "backgroundAlpha": 0,
                "unlit": true,
                "alignment": "center"
            },"local");
            
            tideID = Entities.addEntity({
                "type": "Text",
                "name": "Tide",
                "dimensions": {
                    "x": thisDimensions.x * 0.9,
                    "y": thisDimensions.y * 0.5,
                    "z": 0.01
                },
                "parentID": thisID,
                "localPosition": {
                    "x": 0, 
                    "y": (thisDimensions.y * 0.5) * 0.45, 
                    "z": 0.02
                },
                "grab": {
                    "grabbable": false
                },
                "text": "(Cycle: 4h)",
                "renderWithZones": thisRenderWithZones,
                "lineHeight": thisDimensions.y * 0.2,
                "textColor": textOfficialColor,
                "backgroundAlpha": 0,
                "unlit": true,
                "alignment": "center"
            },"local");

            progressionID = Entities.addEntity({
                "type": "Text",
                "name": "PROGRESSION",
                "dimensions": {
                    "x": thisDimensions.x * 0.7,
                    "y": thisDimensions.y * 0.22,
                    "z": 0.01
                },
                "parentID": thisID,
                "localPosition": {
                    "x": 0, 
                    "y": (thisDimensions.y * 0.5) * -0.55, 
                    "z": 0.02
                },
                "grab": {
                    "grabbable": false
                },
                "text": progression,
                "renderWithZones": thisRenderWithZones,
                "lineHeight": thisDimensions.y * 0.2,
                "textColor": progressionColor,
                "backgroundAlpha": 0,
                "unlit": true,
                "alignment": "right"
            },"local");
            
        } else {
            Entities.editEntity(gasTideInfoID, {
                "text": "Gas Altitude Tide: " + gravityPercent.toFixed(1) + " %"
            });

            Entities.editEntity(progressionID, {
                "text": progression,
                "textColor": progressionColor,
            });
            
        }
    } 
    
    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
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
