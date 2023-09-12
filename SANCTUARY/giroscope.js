"use strict";
//
//  giroscope.js
//
//  Created by Alezia Kurdis, September 10th, 2023.
//  Copyright 2023, Alezia Kurdis.
//
//  Giroscope with dark sound ambience for Sanctuary.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("giroscope.js")[0];
    var D29_DAY_DURATION = 104400; //sec
    var darkSound;
    var darkSoundInjector;
    var darkSoundPlaying = 0;
    var DARKSOUND_VOLUME = 0.2;
    var giroscopePosition;
    var thisEntity = Uuid.NULL;
    var giroLightID = Uuid.NULL;
    

    this.preload = function(entityID) {
        thisEntity = entityID;
        var properties = Entities.getEntityProperties(thisEntity, ["position", "renderWithZones"]);
        giroscopePosition = properties.position;
        var rwz = properties.renderWithZones;
        //generate sound
        darkSound = SoundCache.getSound(ROOT + "sounds/darkside.mp3");
        darkSound.ready.connect(onSoundReady);
        
        var antiHue = 0.5 + GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        if (antiHue > 1) {
            antiHue = antiHue - 1;
        }
        var antiHueColor = hslToRgb(antiHue, 1, 0.5);
        
        //Generate ligth (color of the anti Hue)
        var giroLightID = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 0,
                "y": 1.5,
                "z": 0
            },
            "parentID": thisEntity,
            "name": "GIROSCOPE_LIGHT",
            "dimensions": {
                "x": 9.85885238647461,
                "y": 9.85885238647461,
                "z": 9.85885238647461
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "renderWithZones": rwz,
            "grab": {
                "grabbable": false
            },
            "color": {
                "red": antiHueColor[0],
                "green": antiHueColor[1],
                "blue": antiHueColor[2]
            },
            "isSpotlight": true,
            "intensity": 40,
            "exponent": 1,
            "cutoff": 90,
            "falloffRadius": 5
        }, "local");
        
        //Generating partxle fx
        
    };

    function onSoundReady() {
        darkSound.ready.disconnect(onSoundReady);
        print("audioInjector: " + JSON.stringify(darkSoundInjector));
        darkSoundInjector = Audio.playSound(darkSound, {
                            "loop": true,
                            "localOnly": true,
                            "volume": DARKSOUND_VOLUME,
                            "position": giroscopePosition,
                            "pitch": 0.0625
                        });
        darkSoundPlaying = 1;
        print("audioInjector: " + JSON.stringify(darkSoundInjector));
    }
    
    this.unload = function(entityID) {
        if (darkSoundPlaying === 1) {
            darkSoundInjector.stop();
            darkSoundPlaying = 0;
        }

        if (giroLightID !== Uuid.NULL) {
            Entities.deleteEntity(giroLightID);
            giroLightID = Uuid.NULL;
        }

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

});