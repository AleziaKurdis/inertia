//
//  galvronStreetLights.js
//
//  Created by Alezia Kurdis, November 15th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Street Lights generator for the WOTHAL - GALVRON PEAK scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("galvronStreetLights.js")[0];
    const COORD_REFERENCE = {"x":4489.611328125,"y":5883.6435546875,"z":7720.33056640625};
    let lightEntries = [
        {"name": "POLE 1", "lightType": "STREETPOLE", "position": {"x":4482.2529296875,"y":6114.79345703125,"z":7698.82470703125}},
        {"name": "POLE 2", "lightType": "STREETPOLE", "position": {"x":4478.57080078125,"y":6114.7939453125,"z":7716.6875}},
        {"name": "POLE 3", "lightType": "STREETPOLE", "position": {"x":4504.29150390625,"y":6114.79296875,"z":7702.00830078125}},
        {"name": "POLE 4", "lightType": "STREETPOLE", "position": {"x":4504.2724609375,"y":6114.79345703125,"z":7715.8505859375}},
        {"name": "POLE 5", "lightType": "STREETPOLE", "position": {"x":4495.8056640625,"y":6114.7939453125,"z":7730.103515625}},
        {"name": "POLE 6", "lightType": "STREETPOLE", "position": {"x":4495.80517578125,"y":6114.79443359375,"z":7743.46826171875}}
    ];

    let lights = [];
    
    const DAY_DURATION = 104400; //D29
    var materialID = Uuid.NONE;
    
    this.preload = function(entityID) {
        let i, id;
        let properties;
        const renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        
        let hue = GetCurrentCycleValue(1, DAY_DURATION * 9);
        
        //==== TURNING TO ANTI-HUE =====
        hue += 0.5;
        if (hue >= 1.0) {
            hue -= 1.0;
        }
        //==============================
        
        let color = hslToRgb(hue, 1, 0.55);
        let colorLight = hslToRgb(hue, 1, 0.65);

        //Material
        
        var sumColorCompnent = (color[0]/255) +(color[1]/255) +(color[2]/255);
        if (sumColorCompnent === 0) { 
            sumColorCompnent = 0.001; 
        }
        var bloomFactor = 9 / sumColorCompnent;

        var materialContent = {
            "materialVersion": 1,
            "materials": [
                    {
                        "name": "LIGHT",
                        "albedo": [1, 1, 1],
                        "metallic": 1,
                        "roughness": 1,
                        "opacity": 1,
                        "emissive": [(color[0]/255) * bloomFactor, (color[1]/255) * bloomFactor, (color[2]/255) * bloomFactor],
                        "scattering": 0,
                        "unlit": false,
                        "cullFaceMode": "CULL_NONE",
                        "model": "hifi_pbr"
                    }
                ]
            };
        
        materialID = Entities.addEntity({
            "type": "Material",
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 126.0, "z": 0.0},
            "name": "lightPole material",
            "materialURL": "materialData",
            "dimensions": {"x": 10.0, "y": 10.0, "z": 10.0},
            "parentMaterialName": "[mat::LIGHT]",
            "priority": 2,
            "materialData": JSON.stringify(materialContent)
        },"local");

        //LIGHTS

        
        for (i = 0; i < lightEntries.length; i++) {
            
            properties = null;
            if (lightEntries[i].lightType === "STREETPOLE" || lightEntries[i].lightType === "TUNEL" ) {
                properties = {
                    "type": "Light",
                    "name": lightEntries[i].lightType + " " + lightEntries[i].name,
                    "dimensions": {
                        "x": 32.485660552978516,
                        "y": 32.485660552978516,
                        "z": 33.631629943847656
                    },
                    "rotation": {
                        "x": 0.7071068286895752,
                        "y": 0,
                        "z": 0,
                        "w": -0.7071068286895752
                    },
                    "localPosition": Vec3.subtract(lightEntries[i].position, COORD_REFERENCE),
                    "parentID": entityID,
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "collisionless": true,
                    "ignoreForCollisions": true,
                    "color": {
                        "red": colorLight[0],
                        "green": colorLight[1],
                        "blue": colorLight[2]
                    },
                    "isSpotlight": true,
                    "intensity": 15,
                    "exponent": 1,
                    "cutoff": 75,
                    "falloffRadius": 1.5
                };
            } else if (lightEntries[i].lightType === "HANGOUT" ) {
                properties = {
                    "type": "Light",
                    "name": lightEntries[i].lightType + " " + lightEntries[i].name,
                    "dimensions": {
                        "x": 32.485660552978516,
                        "y": 32.485660552978516,
                        "z": 33.631629943847656
                    },
                    "rotation": {
                        "x": 0.7071068286895752,
                        "y": 0,
                        "z": 0,
                        "w": -0.7071068286895752
                    },
                    "localPosition": Vec3.subtract(lightEntries[i].position, COORD_REFERENCE),
                    "parentID": entityID,
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "collisionless": true,
                    "ignoreForCollisions": true,
                    "color": {
                        "red": 255,
                        "green": 236,
                        "blue": 201
                    },
                    "isSpotlight": true,
                    "intensity": 15,
                    "exponent": 1,
                    "cutoff": 75,
                    "falloffRadius": 1.0
                };
            }
            
            if (properties !== null) {
                id = Entities.addEntity(properties, "local");
                lights.push(id);
            }
        }
    };

    this.unload = function(entityID) {
        var i;
        for (i=0; i < lights.length; i++) {
            Entities.deleteEntity(lights[i]);
        }
        lights = [];

        if (materialID !== Uuid.NONE) {
            Entities.deleteEntity(materialID);
            materialID = Uuid.NONE;
        }
    };


    function GetCurrentCycleValue(cyclelength, cycleduration) {
        const today = new Date();
        const todaySec = today.getTime() / 1000;
        const currentSec = todaySec % cycleduration;

        return (currentSec / cycleduration) * cyclelength;
    }

    /*
     * Converts an HSL color value to RGB.
     * Assumes h, s, and l are in [0, 1].
     * Returns r, g, and b in [0, 255].
     */
    function hslToRgb(h, s, l) {
        let r;
        let g;
        let b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = function (p, q, t) {
                if (t < 0) {
                    t += 1;
                }
                if (t > 1) {
                    t -= 1;
                }
                if (t < 1 / 6) {
                    return p + (q - p) * 6 * t;
                }
                if (t < 1 / 2) {
                    return q;
                }
                if (t < 2 / 3) {
                    return p + (q - p) * (2 / 3 - t) * 6;
                }
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }

})
