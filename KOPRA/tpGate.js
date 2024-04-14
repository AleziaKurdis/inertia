//
//  tpGate.js
//
//  Created by Alezia Kurdis, April 13th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Generate color, light and tp.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("tpGate.js")[0];
    let tpGateItems = [];

    this.preload = function(entityID) {
        let colorLight, userData, id, scriptForTP;
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones", "userData"]);
        if (properties.userData === "") {
            userData = {
                "hue": 0,
                "tpUrl": ""
            };
            Entities.editEntity(entityID, {"userData": JSON.stringify(userData)});
        } else {
            userData = JSON.parse(properties.userData);
        }
        colorLight = hslToRgb((userData.hue/360), 1, 0.65);
        
        scriptForTP = ROOT + "teleport.js";
    
        //material Glow
        let bloomFactor = 2.7;
        let materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "plasma",
                    "albedo": [1, 1, 1],
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(colorLight[0]/255) * bloomFactor, (colorLight[1]/255) * bloomFactor, (colorLight[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };
                
        id = Entities.addEntity({
            "type": "Material",
            "parentID": entityID,
            "renderWithZones": properties.renderWithZones,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "plasma-material",
            "materialURL": "materialData",
            "priority": 3,
            "parentMaterialName": "mat::LIGHT",
            "materialData": JSON.stringify(materialContent)
        }, "local");
        tpGateItems.push(id);

        //tp intereactive box
        id = Entities.addEntity({
            "type": "Shape",
            "shape": "Cube",
            "parentID": entityID,
            "renderWithZones": properties.renderWithZones,
            "localPosition": {"x": -2.1, "y": 1.8, "z": -3.68},
            "localRotation": Quat.fromVec3Degrees( {"x": 0.0, "y": 90.0, "z": 0.0} ),
            "name": "Teleporter",
            "dimensions": {"x": 3.6, "y": 3.7, "z": 1.5},
            "visible": true,//########################################################################
            "canCastShadow": false,
            "collisionless": true,
            "script": scriptForTP,
            "description": userData.tpUrl,
            "grab": {
                "grabbable": false
            }
        }, "local");
        tpGateItems.push(id);

        //tp light
        id = Entities.addEntity({
            "type": "Light",
            "name": "ARRIVAL LIGHT",
            "parentID": entityID,
            "localPosition": {"x":-2.05, "y":1.5, "z":4.1},
            "dimensions": {
                "x": 5,
                "y": 5,
                "z": 5
            },
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": {"red": colorLight[0], "green": colorLight[1], "blue": colorLight[2]},
            "isSpotlight": false,
            "intensity": 15,
            "falloffRadius": 2
        }, "local");
        tpGateItems.push(id);
    };

    this.unload = function(entityID) {
        let i;
        for (i = 0; i < tpGateItems.length; i++) {
            Entities.deleteEntity(tpGateItems[i]);
        }
        tpGateItems = [];
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
        let r, g, b;
        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            let hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

})
