//
//  storm.js
//
//  Created by Alezia Kurdis, July 16th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Generate a the BRAINSTORMER'S STORM components.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("storm.js")[0];
    var thisEntity;
    
    var generatorPosition;
    var renderWithZones;

    var D29_DAY_DURATION = 104400; //sec
    var DEGREES_TO_RADIANS = Math.PI / 180.0;

    var UPDATE_TIMER_INTERVAL = 2000; // 2 sec 
    var processTimer = 0;

    var storming = false;
    var lightningsID = Uuid.NONE;
    
    var LIGNTNINGS_PARTICLE_URL = ROOT + "images/PARTICLE_LIGHTNING_HYTRION_B.png";
    var THUNDER_SOUND_1 = ROOT + "sounds/thunder0.mp3";
    var THUNDER_SOUND_2 = ROOT + "sounds/thunder1.mp3";
    var THUNDER_SOUND_3 = ROOT + "sounds/thunder2.mp3";
    var THUNDER_SOUND_4 = ROOT + "sounds/thunder3.mp3";
    var thunderSound = []; 
    var thunderInjector;
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        
        var prop = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = prop.renderWithZones;
        generatorPosition = prop.position;
        
        thunderSound[0] = SoundCache.getSound(THUNDER_SOUND_1);
        thunderSound[1] = SoundCache.getSound(THUNDER_SOUND_2);
        thunderSound[2] = SoundCache.getSound(THUNDER_SOUND_3);
        thunderSound[3] = SoundCache.getSound(THUNDER_SOUND_4);
        
        var today = new Date();
        processTimer = today.getTime();
    
        Script.update.connect(myTimer);
    }

    function manageStorm() {
        if (storming) {
            if (Math.random() < 0.02) { //0.02 = 1 fois par 5 sec
                var thunderVolume = Math.random();
                var thunderSoundIndex = Math.floor(Math.random() * thunderSound.length);
                var thunderPitch = (0.6 + (Math.random() * 1.5));
                thunderInjector = Audio.playSound(thunderSound[thunderSoundIndex], {
                    "position": Entities.getEntityProperties(thisEntity, ["position"]).position,
                    "loop": false,
                    "localOnly": true,
                    "volume": thunderVolume,
                    "pitch": thunderPitch
                    });
            }
        } else {
            //initiate the storm
            lightningsID = Entities.addEntity({
                "type": "ParticleEffect",
                "name": "NOCTURN_STORM",
                "dimensions": {
                    "x": 970,
                    "y": 970,
                    "z": 970
                },
                "parentID": thisEntity,
                "localPosition": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0
                },
                "grab": {
                    "grabbable": false
                },
                "shapeType": "ellipsoid",
                "textures": LIGNTNINGS_PARTICLE_URL,
                "maxParticles": 10,
                "lifespan": 0.3,
                "emitRate": 0.25,
                "emitSpeed": 0,
                "speedSpread": 0,
                "emitOrientation": {
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "emitDimensions": {
                    "x": 100,
                    "y": 100,
                    "z": 100
                },
                "polarStart": 0,
                "polarFinish": Math.PI,
                "azimuthStart": -Math.PI,
                "azimuthFinish": Math.PI,
                "emitAcceleration": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "particleRadius": 100,
                "radiusStart": 100,
                "radiusFinish": 100,
                "radiusSpread": 80,
                "color": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "colorStart": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "colorFinish": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "colorSpread": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                }, 
                "alphaStart": 0.4,
                "alpha": 0,
                "alphaFinish": 0.4,
                "particleSpin": 3.140000104904175,
                "spinSpread": 3.140000104904175,
                "spinStart": 3.140000104904175,
                "spinFinish": 3.140000104904175,
                "emitterShouldTrail": true
            }, "local");
            
            storming = true;
        }
    }


    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            manageStorm();
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    this.unload = function(entityID) {
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
