//
//  d24Clock.js
//
//  Created by Alezia Kurdis on February 17th, 2024.
//  Copyright 2024 Alezia Kurdis.
//
//  D24 (Dilatation 24 Hours Time) library.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var jsMainFileName = "d24Clock.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    var D24Lib = Script.require(ROOT + "d24_library.js");
    
    var UPDATE_TIMER_INTERVAL = 60000; //each 72.5 sec timer 
    var processTimer = 0;
    var thisID;
    var thisPosition;
    var thisRenderWithZones;
    var thisDimensions;
    
    var clockID = Uuid.NULL;
    var greetingID = Uuid.NULL;
    var hourID = Uuid.NULL;
    var dayID = Uuid.NULL;
    var dateID = Uuid.NULL;
    var UNIT = "D24";
    
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
            Entities.deleteEntity(clockID);
            clockID = Uuid.NULL;
            
            Entities.deleteEntity(hourID);
            hourID = Uuid.NULL;

            //Entities.deleteEntity(greetingID);
            //greetingID = Uuid.NULL;

            Entities.deleteEntity(dayID);
            dayID = Uuid.NULL;

            Entities.deleteEntity(dateID);
            dateID = Uuid.NULL;
        }
    }

    function updateClock() {
        
        //color value  =========
        var HUE_DAY_DURATION = 86400; //24h
        var HUE_WEEK_DURATION = HUE_DAY_DURATION * 9;
        var hue = D24Lib.GetCurrentCycleValue(1, HUE_WEEK_DURATION);
        var color = hslToRgb(hue, 1, 0.5);
        //=======================================
        var D24textOfficialColor = {"red": 125, "green": 205, "blue": 255}; //blue
        
        if (clockID === Uuid.NULL){
            //create clock
            clockID = Entities.addEntity({
                "type": "Text",
                "name": "TIME DILATATION UNIT",
                "dimensions": {
                    "x": thisDimensions.x * 0.9,
                    "y": thisDimensions.y * 0.09,
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
                "text": UNIT,
                "renderWithZones": thisRenderWithZones,
                "lineHeight": thisDimensions.y * 0.07,
                "textColor": D24textOfficialColor,
                "backgroundAlpha": 0,
                "unlit": true,
                "alignment": "right"
            },"local");
            
            hourID = Entities.addEntity({
                "type": "Text",
                "name": "HOUR",
                "dimensions": {
                    "x": thisDimensions.x * 0.9,
                    "y": thisDimensions.y * 0.52,
                    "z": 0.01
                },
                "parentID": thisID,
                "localPosition": {
                    "x": 0, 
                    "y": (thisDimensions.y * 0.5) * 0.3, 
                    "z": 0.02
                },
                "grab": {
                    "grabbable": false
                },
                "text": D24Lib.getClockText(0, true, false),
                "renderWithZones": thisRenderWithZones,
                "lineHeight": thisDimensions.y * 0.5,
                "textColor": D24textOfficialColor,
                "backgroundAlpha": 0,
                "unlit": true,
                "alignment": "center"
            },"local");
            
            dateID = Entities.addEntity({
                "type": "Text",
                "name": "DATE",
                "dimensions": {
                    "x": thisDimensions.x * 0.9,
                    "y": thisDimensions.y * 0.17,
                    "z": 0.01
                },
                "parentID": thisID,
                "localPosition": {
                    "x": 0, 
                    "y": (thisDimensions.y * 0.5) * -0.80, 
                    "z": 0.02
                },
                "grab": {
                    "grabbable": false
                },
                "text": D24Lib.getClockText(4, true, false),
                "renderWithZones": thisRenderWithZones,
                "lineHeight": thisDimensions.y * 0.15,
                "textColor": D24textOfficialColor,
                "backgroundAlpha": 0,
                "unlit": true,
                "alignment": "center"
            },"local");

            dayID = Entities.addEntity({
                "type": "Text",
                "name": "DAY OF THE WEEK",
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
                "text": D24Lib.getClockText(7, true, false),
                "renderWithZones": thisRenderWithZones,
                "lineHeight": thisDimensions.y * 0.2,
                "textColor": {"red": color[0], "green": color[1], "blue": color[2]},
                "backgroundAlpha": 0,
                "unlit": true,
                "alignment": "center"
            },"local");
            
        } else {
            Entities.editEntity(hourID, {
                "text": D24Lib.getClockText(0, true, false)
            });

            Entities.editEntity(dayID, {
                "text": D24Lib.getClockText(7, true, false),
                "textColor": {"red": color[0], "green": color[1], "blue": color[2]},
            });

            Entities.editEntity(dateID, {
                "text": D24Lib.getClockText(4, true, false)
            });
            
        }
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
