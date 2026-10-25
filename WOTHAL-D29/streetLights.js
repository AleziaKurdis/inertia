//
//  streetLights.js
//
//  Created by Alezia Kurdis, October 25th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Street Lights generator for the WOTHAL - AZMORITH PEAK scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("streetLights.js")[0];
    const COORD_REFERENCE = {"x":6527.78271484375,"y":6000.296875,"z":8624.091796875};
    let lightEntries = [
        {"name": "POLE 1", "lightType": "STREETPOLE", "position": {"x":6524.3447265625,"y":6131.20458984375,"z":8569.1533203125}},
        {"name": "POLE 2", "lightType": "STREETPOLE", "position": {"x":6524.95458984375,"y":6131.20458984375,"z":8582.802734375}},
        {"name": "POLE 3", "lightType": "STREETPOLE", "position": {"x":6523.37939453125,"y":6131.240234375,"z":8604.513671875}},
        {"name": "POLE 4", "lightType": "STREETPOLE", "position": {"x":6529.73095703125,"y":6131.20166015625,"z":8626.521484375}},
        {"name": "POLE 5", "lightType": "STREETPOLE", "position": {"x":6532.85009765625,"y":6131.22021484375,"z":8637.109375}},
        {"name": "POLE 6", "lightType": "STREETPOLE", "position": {"x":6531.6123046875,"y":6131.62255859375,"z":8652.91796875}},
        {"name": "MURAL 1", "lightType": "STREETPOLE", "position": {"x":6515.5869140625,"y":6131.23291015625,"z":8656.125}},
        {"name": "MURAL 2", "lightType": "STREETPOLE", "position": {"x":6508.400390625,"y":6131.23291015625,"z":8663.87890625}},
        {"name": "MURAL 3", "lightType": "STREETPOLE", "position": {"x":6532.3916015625,"y":6131.23779296875,"z":8674.05078125}},
        {"name": "MURAL 4", "lightType": "STREETPOLE", "position": {"x":6544.98046875,"y":6131.23486328125,"z":8680.6953125}},
        {"name": "MURAL 5", "lightType": "STREETPOLE", "position": {"x":6562.37744140625,"y":6131.2392578125,"z":8678.6357421875}},
        {"name": "MURAL 6", "lightType": "STREETPOLE", "position": {"x":6564.5625,"y":6131.23388671875,"z":8692.78515625}},
        {"name": "MURAL 7", "lightType": "STREETPOLE", "position": {"x":6524.9111328125,"y":6131.23681640625,"z":8693.005859375}},
        {"name": "MURAL 8", "lightType": "STREETPOLE", "position": {"x":6520.546875,"y":6131.24609375,"z":8684.8564453125}},
        {"name": "MURAL 9", "lightType": "STREETPOLE", "position": {"x":6510.11572265625,"y":6131.24658203125,"z":8689.1103515625}},
        {"name": "MURAL 10", "lightType": "STREETPOLE", "position": {"x":6504.90380859375,"y":6131.24658203125,"z":8681.830078125}},
        {"name": "MURAL 11", "lightType": "STREETPOLE", "position": {"x":6515.7822265625,"y":6131.2392578125,"z":8669.353515625}},
        {"name": "MURAL 12", "lightType": "STREETPOLE", "position": {"x":6494.91943359375,"y":6131.25341796875,"z":8675.359375}},
        {"name": "MURAL 13", "lightType": "STREETPOLE", "position": {"x":6491.0888671875,"y":6131.24951171875,"z":8665.576171875}},
        {"name": "MURAL 14", "lightType": "STREETPOLE", "position": {"x":6489.87109375,"y":6131.24072265625,"z":8684.802734375}},
        {"name": "MURAL 15", "lightType": "STREETPOLE", "position": {"x":6459.046875,"y":6131.2431640625,"z":8685.9638671875}},
        {"name": "MURAL 16", "lightType": "STREETPOLE", "position": {"x":6468.41845703125,"y":6131.2177734375,"z":8681.4189453125}},
        {"name": "MURAL 17", "lightType": "STREETPOLE", "position": {"x":6479.111328125,"y":6131.2421875,"z":8680.7841796875}},
        {"name": "MURAL 18", "lightType": "STREETPOLE", "position": {"x":6468.30126953125,"y":6131.24169921875,"z":8639.244140625}},
        {"name": "MURAL 19", "lightType": "STREETPOLE", "position": {"x":6475.2978515625,"y":6131.2373046875,"z":8634.6767578125}},
        {"name": "MURAL 20", "lightType": "STREETPOLE", "position": {"x":6486.255859375,"y":6131.23681640625,"z":8639.2880859375}},
        {"name": "MURAL 21", "lightType": "STREETPOLE", "position": {"x":6496.8623046875,"y":6131.244140625,"z":8649.0634765625}}
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
