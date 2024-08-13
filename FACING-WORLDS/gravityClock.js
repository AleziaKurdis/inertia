//
//  gravityClock.js
//
//  Created by Alezia Kurdis on August 12th, 2024.
//  Copyright 2024 Alezia Kurdis.
//
//  Gravitational Tide Clock.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var jsMainFileName = "gravityClock.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var D29_DAY_LENGTH = 104400;
    var UPDATE_TIMER_INTERVAL = (D29_DAY_LENGTH/(24 * 60)) * 1000;
    var processTimer = 0;
    var thisID;
    var thisPosition;
    var thisRenderWithZones;
    var thisDimensions;

    var gravityID = Uuid.NULL;
    var progressionID = Uuid.NULL;
    var tideID = Uuid.NULL;
    
    this.preload = function(entityID) {
        //Generate the Clock text local entity.
        thisID = entityID;
        var properties = Entities.getEntityProperties(thisID, ["position","renderWithZones", "dimensions"] );
        thisPosition = properties.position;
        thisRenderWithZones = properties.renderWithZones;
        thisDimensions = properties.dimensions;
        
        updateClock();
        
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

            updateClock();

            today = new Date();
            processTimer = today.getTime();
        }  
    }


    function shutdown() {
        if (clockID !== Uuid.NULL){
            Script.update.disconnect(myTimer);
            
            Entities.deleteEntity(gravityID);
            gravityID = Uuid.NULL;

            Entities.deleteEntity(progressionID);
            progressionID = Uuid.NULL;

            Entities.deleteEntity(tideID);
            tideID = Uuid.NULL;
        }
    }

    function updateClock() {
        var angle = GetCurrentCycleValue(Math.PI * 2, Math.floor((D29_DAY_LENGTH/24) * 1.618));
        var currentGravity = (Math.sin(angle) * 3.5) - 6.3; // -9.8 to -2.8 m/s2
        var gravityPercent = 100 * (Math.abs(currentGravity)/9.8);
        
        var progression = "+ UP";
        var progressionColor = {"red": 140, "green": 255, "blue": 138};
        
        if (angle > (Math.PI/2) && angle < (3 * Math.PI/2)) {
            progression = "- DOWN";
            progressionColor = {"red": 255, "green": 82, "blue": 82};
        }

        var textOfficialColor = {"red": 255, "green": 255, "blue": 255};
        
        if (gravityID === Uuid.NULL){
            //create clock
            gravityID = Entities.addEntity({
                "type": "Text",
                "name": "GRAVITY",
                "dimensions": {
                    "x": thisDimensions.x * 0.9,
                    "y": thisDimensions.y * 0.52,
                    "z": 0.01
                },
                "parentID": thisID,
                "localPosition": {
                    "x": 0, 
                    "y": 0, //(thisDimensions.y * 0.5) * 0.3, 
                    "z": 0.02
                },
                "grab": {
                    "grabbable": false
                },
                "text": "GRAVITY: " + gravityPercent.toFixed(1) + " %",
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
                    "y": (thisDimensions.y * 0.5) * 0.80, 
                    "z": 0.02
                },
                "grab": {
                    "grabbable": false
                },
                "text": "GRAVITATIONAL TIDE\n(1.618 hours cycle)",
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
                    "x": thisDimensions.x * 0.9,
                    "y": thisDimensions.y * 0.22,
                    "z": 0.01
                },
                "parentID": thisID,
                "localPosition": {
                    "x": 0, 
                    "y": (thisDimensions.y * 0.5) * -0.40, 
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
                "alignment": "center"
            },"local");
            
        } else {
            Entities.editEntity(gravityID, {
                "text": "GRAVITY: " + gravityPercent.toFixed(1) + " %"
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
