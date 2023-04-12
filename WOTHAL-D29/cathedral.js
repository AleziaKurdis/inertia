//#####################
//
//  cathedral.js
//
//  Created by Alezia Kurdis, April 6th, 2023.
//  Copyright 2023, Overte e.V.
//
//  light and other stuff generated for teh Black Cathedral of Wothal.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("cathedral.js")[0];

    var centralLightID = Uuid.NULL;
    var thisEntity = Uuid.NULL;
    var renderWithZones;
    
    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;
    
    var starId = Uuid.NULL;
    var fireMatId = Uuid.NULL;
    var fireLightId = Uuid.NULL;
    var fireParticles = Uuid.NULL;
    
    var STAR_DIAMETER = 20;
    
    this.preload = function(entityID) {
        thisEntity = entityID;
        var properties = Entities.getEntityProperties(thisEntity, ["renderWithZones"]);
        renderWithZones = properties.renderWithZones;
        
        centralLightID = Entities.addEntity({
            "parentID": thisEntity,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0, "y": 294.5840, "z": 0},
            "type": "Light",
            "name": "CATHEDRAL CENTRAL LIGHT",
            "localRotation": {"x":-0.7071488499641418,"y":-0.0000152587890625,"z":-0.0000152587890625,"w":0.7070878744125366},
            "dimensions": {
                "x": 70,
                "y": 70,
                "z": 241
            },
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "color": {
                "red": 255,
                "green": 121,
                "blue": 38
            },
            "isSpotlight": true,
            "intensity": 60,
            "exponent": 1,
            "cutoff": 17,
            "falloffRadius": 15
        }, "local");

        starId = Entities.addEntity({
                "name": "STAR",
                "parentID": thisEntity,
                "dimensions": {"x": STAR_DIAMETER, "y": STAR_DIAMETER/4, "z": STAR_DIAMETER},
                "localPosition": {"x": 0, "y": 177, "z": 0},
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones
        }, "local");

        updateStar();

        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);
    };

    
    this.unload = function(entityID) {
        shutdown();
    };    

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            
            updateStar();
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function updateStar() {
        
    }

    function shutdown() {
        Script.update.disconnect(myTimer);
        if (centralLightID != Uuid.NULL){
            Entities.deleteEntity(centralLightID);
            centralLightID = Uuid.NULL;
        }
        if (starId != Uuid.NULL){
            Entities.deleteEntity(starId);
            starId = Uuid.NULL;
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
