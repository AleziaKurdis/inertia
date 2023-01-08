"use strict";
//
//  D19_PlanetaryClock.js
//
//  Created by Alezia Kurdis, January 7th 2023.
//  Copyright 2023, Overte e.V.
//
//  Generate a D19 (HUT) Planetary clock.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("D19_PlanetaryClock.js")[0];
    var thisEntity;
    
    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;
    
    var HYTRION_DAY_DURATION = 68400; //sec
    var STAR_DIAMATER = 10; //m
    var DISTANCE_RATIO = 2;
    var DIAMETER_RATIO = 6;
    
    var planets = [
        {
            "name": "Star Year", 
            "duration": 360 * HYTRION_DAY_DURATION,
            "id": Uuid.NULL
        },
        {
            "name": "Planet Month", 
            "duration": 36 * HYTRION_DAY_DURATION,
            "id": Uuid.NULL 
        },
        {
            "name": "Planet Week", 
            "duration": 9 * HYTRION_DAY_DURATION,
            "id": Uuid.NULL 
        },
        {
            "name": "Planet Day", 
            "duration": 9 * HYTRION_DAY_DURATION,
            "id": Uuid.NULL 
        },
        {
            "name": "Planet Hour", 
            "duration": HYTRION_DAY_DURATION / 24,
            "id": Uuid.NULL
        },
        {
            "name": "Planet Minute", 
            "duration": HYTRION_DAY_DURATION / 24 * 60,
            "id": Uuid.NULL
        },
        {
            "name": "Planet Second", 
            "duration": HYTRION_DAY_DURATION / 24 * 3600,
            "id": Uuid.NULL
        }      
    ];

    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones"]);
        
        
        for (var i = 0; i < planets.length; i++) {
            var parentID;
            var rotation = GetCurrentCycleValue(360, planets[i].duration);
            if (i === 0) {
                parentID = entityID;
                planets[i].diameter = STAR_DIAMATER;
                planets[i].localPosition = {"x": 0, "y": 0, "z": 0};
                
            } else {
                parentID = planets[i - 1].id;
                planets[i].diameter = planets[i - 1].diameter / DIAMETER_RATIO; 
                planets[i].localPosition = {"x": 0, "y": 0, "z": -planets[i].diameter * DISTANCE_RATIO};
            }
            planets[i].id = Entities.addEntity({
                "name": planets[i].name,
                "parentID": parentID,
                "dimensions": {"x": planets[i].diameter, "y": planets[i].diameter, "z": planets[i].diameter},
                "localPosition": planets[i].localPosition,
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": properties.renderWithZones,
                "localRotation": Quat.fromVec3Degrees({"x": 0, "y": rotation, "z": 0}),
                "angularDamping": 0,
                "angularVelocity": {"x": 0, "y": 0, "z": 0}
            }, "local");
        }

        
        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer); 
    }


    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            //here's the processing

            for (var i = 0; i < planets.length; i++) {
                if (planets[i].id !== Uuid.NULL) {
                    var rotation = GetCurrentCycleValue(360, planets[i].duration);
                    Entities.editEntity(planets[i].id, {
                        "localRotation": Quat.fromVec3Degrees({"x": 0, "y": rotation, "z": 0}),
                    });
                }
            }

            today = new Date();
            processTimer = today.getTime();
        }  
    }   

    this.unload = function(entityID) {
        for (var i = 0; i < planets.length; i++) {
            if (planets[i].id !== Uuid.NULL) {
                Entities.deleteEntity(planets[i].id);
            }
        }
        Script.update.disconnect(myTimer);
    };

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

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}    


})
