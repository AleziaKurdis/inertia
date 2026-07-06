//
//  altFireAK2026.js
//
//  Created by Alezia Kurdis, July 5th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Generate an alternative to a fire.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    const ROOT = Script.resolvePath('').split("altFireAK2026.js")[0];
    let soundURL = [
        ROOT + "0001.wav",
        ROOT + "0003.wav",
        ROOT + "0006.wav",
        ROOT + "0007.wav",
        ROOT + "0009.wav"
    ];
    let MySound; 
    let injector = null;
    let thisEntityID;
    let processInterval = null;
    let renderWithZones;
    
    const FIRE_DURATION = 120;

    function AddAFire(parentID, fireDuration) {
        let pattern = [];
        pattern[0] = {
            "textures": ROOT + "OPERA_008.png",
            "alpha": 0.5,
            "alphaFinish": 0,
            "alphaSpread": 0.1,
            "alphaStart": 0.8,
            "particleSpin": 0.5,
            "spinStart": 0,
            "spinSpread": 0.52,
            "spinFinish": -0.69,
            "particleRadius": 0.6000000238418579,
            "radiusSpread": 0.10000000149011612,
            "radiusStart": 0.10000000149011612,
            "radiusFinish": 0.4000000059604645,
            "maxParticles": 300,
            "lifespan": 2,
            "emitRate": 80,
            "emitSpeed": 0.12,
            "speedSpread": 0.10,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.1,
                "y": 0.1,
                "z": 0.1
            },
            "emitRadiusStart": 0.1,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0.1,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.1,
                "z": 0
            }
        };

        pattern[1] = {
            "textures": ROOT + "OPERA_005.png",
            "alpha": 0.7,
            "alphaFinish": 0.5,
            "alphaSpread": 0.2,
            "alphaStart": 0.0,
            "particleSpin": 0,
            "spinStart": 1.5707,
            "spinSpread": 1.5707,
            "spinFinish": -1.5707,
            "particleRadius": 0.3,
            "radiusSpread": 0.3,
            "radiusStart": 1,
            "radiusFinish": 0.1,
            "maxParticles": 300,
            "lifespan": 2,
            "emitRate": 50,
            "emitSpeed": 0,
            "speedSpread": 0.10,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.6,
                "y": 0.6,
                "z": 0.6
            },
            "emitRadiusStart": 0.6,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        };

        pattern[2] = {
            "textures": ROOT + "OPERA_019.png",
            "alpha": 0.6,
            "alphaFinish": 0.1,
            "alphaSpread": 0.2,
            "alphaStart": 1.0,
            "particleSpin": 0,
            "spinStart": 0.52,
            "spinSpread": 3.1415,
            "spinFinish": -0.52,
            "particleRadius": 0.7,
            "radiusSpread": 0.4,
            "radiusStart": 0.2,
            "radiusFinish": 0.2,
            "maxParticles": 300,
            "lifespan": 1.3,
            "emitRate": 200,
            "emitSpeed": 0.2,
            "speedSpread": 0.2,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.3,
                "y": 0.3,
                "z": 0.3
            },
            "emitRadiusStart": 0,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        };

        pattern[3] = {
            "textures": ROOT + "OPERA_53.png",
            "alpha": 0.3,
            "alphaFinish": 0,
            "alphaSpread": 0.1,
            "alphaStart": 0.6,
            "particleSpin": 0,
            "spinStart": -0.35,
            "spinSpread": 0.104,
            "spinFinish":0.7,
            "particleRadius": 0.3,
            "radiusSpread": 0.2,
            "radiusStart": 0.1,
            "radiusFinish": 0.8,
            "maxParticles": 300,
            "lifespan": 1.4,
            "emitRate": 70,
            "emitSpeed": 0.1,
            "speedSpread": 0.05,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.4,
                "y": 0.4,
                "z": 0.4
            },
            "emitRadiusStart": 0.1,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.1,
                "z": 0
            }
        };

        pattern[4] = {
            "textures": ROOT + "OPERA_55.png",
            "alpha": 0.05,
            "alphaFinish": 0,
            "alphaSpread": 0.03,
            "alphaStart": 0.15,
            "particleSpin": 0,
            "spinStart": 1.5707963705062866,
            "spinSpread": 0.2617993950843811,
            "spinFinish":-1.5707963705062866,
            "particleRadius": 0.6000000238418579,
            "radiusSpread": 0.20000000298023224,
            "radiusStart": 0.10000000149011612,
            "radiusFinish": 0.07000000029802322,
            "maxParticles": 300,
            "lifespan": 1.6,
            "emitRate": 150,
            "emitSpeed": 0.1,
            "speedSpread": 0.05,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.6,
                "y": 0.6,
                "z": 0.6
            },
            "emitRadiusStart": 0.1,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.10000000149011612,
                "z": 0
            }
        };	

        pattern[5] = {
            "textures": ROOT + "OPERA_52.png",
            "alpha": 0.699999988079071,
            "alphaFinish": 0,
            "alphaSpread": 0.30000001192092896,
            "alphaStart": 0.20000000298023224,
            "particleSpin": 0,
            "spinStart": 1.5707963705062866,
            "spinSpread": 1.5707000494003296,
            "spinFinish":-1.5707963705062866,
            "particleRadius": 0.20000000298023224,
            "radiusSpread": 0.07999999821186066,
            "radiusStart": 0.10000000149011612,
            "radiusFinish": 0.20000000298023224,
            "maxParticles": 300,
            "lifespan": 1.5,
            "emitRate": 200,
            "emitSpeed": 0.15,
            "speedSpread": 0.1,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.5,
                "y": 0.5,
                "z": 0.5
            },
            "emitRadiusStart": 0.25,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0.3,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.1,
                "z": 0
            }
        };

        pattern[6] = {
            "textures": ROOT + "OPERA_50.png",
            "alpha": 0.3,
            "alphaFinish": 0,
            "alphaSpread": 0.05,
            "alphaStart": 1,
            "particleSpin": 0,
            "spinStart": -1.5707963705062866,
            "spinSpread": 0.5199999809265137,
            "spinFinish": -1.5707963705062866,
            "particleRadius": 0.1,
            "radiusSpread": 0.05,
            "radiusStart": 0.05,
            "radiusFinish": 0.8,
            "maxParticles": 500,
            "lifespan": 2.5,
            "emitRate": 160,
            "emitSpeed": 0,
            "speedSpread": 0.1,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.2,
                "y": 0.2,
                "z": 0.2
            },
            "emitRadiusStart": 0.3,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0,
                "z": 0
            }			
        };

        pattern[7] = {
            "textures": ROOT + "OPERA_54.png",
            "alpha": 0.1,
            "alphaFinish": 0,
            "alphaSpread": 0.1,
            "alphaStart": 1,
            "particleSpin": 0,
            "spinStart": 1.5707963705062866,
            "spinSpread": 0.2617993950843811,
            "spinFinish": -1.5707963705062866,
            "particleRadius": 0.1,
            "radiusSpread": 0.1,
            "radiusStart": 0.2,
            "radiusFinish": 0.3,
            "maxParticles": 400,
            "lifespan": 1.8,
            "emitRate": 200,
            "emitSpeed": 0.15,
            "speedSpread": 0.08,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.2,
                "y": 0.2,
                "z": 0.2
            },
            "emitRadiusStart": 0.43,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0,
                "z": 0
            }			
        };

        pattern[8] = {
            "textures": ROOT + "OPERA_012.png",
            "alpha": 0.2,
            "alphaFinish": 0,
            "alphaSpread": 0.1,
            "alphaStart": 1,
            "particleSpin": 0,
            "spinStart": 0,
            "spinSpread": 3.1415927410125732,
            "spinFinish": 0,
            "particleRadius": 0.2,
            "radiusSpread": 0.1,
            "radiusStart": 0.1,
            "radiusFinish": 0.9,
            "maxParticles": 400,
            "lifespan": 1.8,
            "emitRate": 200,
            "emitSpeed": 0.15,
            "speedSpread": 0.08,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.1,
                "y": 0.1,
                "z": 0.1
            },
            "emitRadiusStart": 0.1,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0,
                "z": 0
            }			
        };
        
        pattern[9] = {
            "textures": ROOT + "OPERA_40.png",
            "alpha": 0.05,
            "alphaFinish": 0,
            "alphaSpread": 0.05,
            "alphaStart": 1,
            "particleSpin": 0,
            "spinStart": 1.5707963705062866,
            "spinSpread": 0.2617993950843811,
            "spinFinish": -1.5707963705062866,
            "particleRadius": 0.4,
            "radiusSpread": 0.1,
            "radiusStart": 0.15,
            "radiusFinish": 0.5,
            "maxParticles": 400,
            "lifespan": 2,
            "emitRate": 200,
            "emitSpeed": 0.1,
            "speedSpread": 0.08,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.1,
                "y": 0.1,
                "z": 0.1
            },
            "emitRadiusStart": 0.2,
            "polarStart": 0,
            "polarFinish": 3.1415927410125732,
            "azimuthStart": -3.141590118408203,
            "azimuthFinish": 3.141590118408203,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        };
        
        let chosen = Math.floor(GetCurrentCycleValue(pattern.length, fireDuration * pattern.length));
        
        let HighFlam = Entities.addEntity({
            "accelerationSpread": {  
                "x":  pattern[chosen].accelerationSpread.x,
                "y":  pattern[chosen].accelerationSpread.y,
                "z":  pattern[chosen].accelerationSpread.z
            }, 
            "alpha": pattern[chosen].alpha,
            "alphaFinish": pattern[chosen].alphaFinish,
            "alphaSpread": pattern[chosen].alphaSpread,
            "alphaStart": pattern[chosen].alphaStart,
            "azimuthStart": pattern[chosen].azimuthStart,
            "azimuthFinish": pattern[chosen].azimuthFinish,
            "collisionless": true,
            "color": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorFinish": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorSpread": {
                "blue": 15,
                "green": 15,
                "red": 15
            },
            "colorStart": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "dimensions": {
                "x": 2.5576000213623047,
                "y": 2.5576000213623047,
                "z": 2.5576000213623047
            },
            "emitAcceleration": {
                "x": pattern[chosen].emitAcceleration.x,
                "y": pattern[chosen].emitAcceleration.y,
                "z": pattern[chosen].emitAcceleration.z
            },
            "emitDimensions": {
                "x": pattern[chosen].emitDimensions.x,
                "y": pattern[chosen].emitDimensions.y,
                "z": pattern[chosen].emitDimensions.z
            },
            "emitOrientation": {
                "w": pattern[chosen].emitOrientation.w,
                "x": pattern[chosen].emitOrientation.x,
                "y": pattern[chosen].emitOrientation.y,
                "z": pattern[chosen].emitOrientation.z
            },
            "emitRadiusStart": pattern[chosen].emitRadiusStart,
            "emitRate": pattern[chosen].emitRate,
            "emitterShouldTrail": true,			
            "emitSpeed": pattern[chosen].emitSpeed,
            "ignoreForCollisions": true,
            "isEmitting": true,			
            "lifespan": pattern[chosen].lifespan,
            "maxParticles": pattern[chosen].maxParticles,
            "name": "ALT-FIRE",
            "polarStart": pattern[chosen].polarStart,
            "polarFinish": pattern[chosen].polarFinish,
            "localPosition":{
                "x": 0.0,
                "y": 0.3,
                "z": 0.0
            },
            "parentID": parentID,
            "lifetime": fireDuration,
            "particleRadius": pattern[chosen].particleRadius,
            "radiusSpread": pattern[chosen].radiusSpread,
            "radiusStart": pattern[chosen].radiusStart,
            "radiusFinish": pattern[chosen].radiusFinish,
            "speedSpread": pattern[chosen].speedSpread,
            "textures": pattern[chosen].textures,
            "type": "ParticleEffect",
            "grab": {
                "grabbable": false
            },
            "particleSpin": pattern[chosen].particleSpin,
            "spinStart": pattern[chosen].spinStart,
            "spinSpread": pattern[chosen].spinSpread,
            "spinFinish": pattern[chosen].spinFinish,
            "rotateWithEntity": true,
            "script": ROOT + "cycler.js?version=" + Math.floor(Math.random() * 100000),
            "renderWithZones": renderWithZones
        }, "local");
        
    }

	function AddALight(parentID, lightDuration){
		let lightEnt = Entities.addEntity({
            "color": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "cutoff": 90,
            "dimensions": {
                "x": 9,
                "y": 9,
                "z": 9
            },
            "exponent": 0.20,
            "falloffRadius": 3,
            "isSpotlight": true,
			"intensity": 10,
            "name": "ALT-FIRE-LIGHT",
            "localRotation": {
                "w": 0.7071067690849304,
                "x": 0.7071067690849304,
                "y": 0,
                "z": 0
            },
			"localPosition": {
				"x":0.0,
				"y": 0.11,
				"z": 0.0
			},
			"parentID": parentID,
			"lifetime": lightDuration,
            "script": ROOT + "flicker.js?version=" + Math.floor(Math.random() * 100000),
            "type": "Light",
            "grab": {
                "grabbable": false
			},
            "renderWithZones": renderWithZones
        }, "local");
		
	}
		

	
	function GenerateFire(){

		let thisDuration = FIRE_DURATION;
		
		AddAFire(thisEntityID, thisDuration );
		AddALight(thisEntityID, thisDuration );
        
        if (injector) {
            injector.stop();
            injector = null;
        }
		playsound(thisEntityID, thisDuration);

	}

    function playsound(entid, duration){
		let prop = Entities.getEntityProperties(entid); 
		let entposition = prop.position;
		let entrotation = prop.rotation;

		injector = Audio.playSound(MySound,  {
			"position": entposition,
			"orientation": entrotation,
			"loop": true,
			"localOnly": false,
			"volume": 0.16
			});
        let chosen = Math.floor(GetCurrentCycleValue(soundURL.length, duration * soundURL.length));
		MySound = SoundCache.getSound(soundURL[chosen]); //assign the next sound now
    }

	this.preload = function(entityID) { 
		thisEntityID = entityID;
        
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
		
        let chosen = Math.floor(GetCurrentCycleValue(soundURL.length, FIRE_DURATION * soundURL.length));
        MySound = SoundCache.getSound(soundURL[chosen]);
		//playsound(entityID, FIRE_DURATION);
				
		GenerateFire(); 
		
		processInterval = Script.setInterval(function() {
			GenerateFire(); 
		}, FIRE_DURATION * 1000);
    }; 

    this.unload = function(entityID) {
        if (injector) {
            injector.stop();
            injector = null;
        }
        if (processInterval !== null) {
            Script.clearInterval(processInterval);
            processInterval = null;
        }
    };
	
	
	// ############# UTILITIES #############

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

	
    function GetCurrentCycleValue(cyclelength, cycleduration, timeOffset = 0){
		var today = new Date();
		var TodaySec = (today.getTime()/1000) + timeOffset;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

})
