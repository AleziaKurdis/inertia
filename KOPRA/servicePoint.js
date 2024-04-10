//
//  servicePoint.js
//
//  Created by Alezia Kurdis, April 9th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Generate color , sign and observatory trigger on Service Point.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("servicePoint.js")[0];
    let servicePointItems = [];

    this.preload = function(entityID) {
        let color, colorLight, userData, id;
        let properties = Entities.getEntityProperties(entityID, ["position", "rotation", "renderWithZones", "userData"]);
        if (properties.userData === "") {
            userData = {
                "hue": 0,
                "sector": "0"
            };
            Entities.editEntity(entityID, {"userData": JSON.stringify(userData)});
        } else {
            userData = JSON.parse(properties.userData);
        }
        colorLight = hslToRgb((userData.hue/360), 1, 0.65);
        color = hslToRgb((userData.hue/360), 1, 0.5);
        
        //material Glow
        let bloomFactor = 2.7;
        let materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "LIGHT",
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
            "name": "MaterialLight-ServicePoint Sector " + userData.sector,
            "materialURL": "materialData",
            "priority": 3,
            "parentMaterialName": "mat::LIGHT",
            "materialData": JSON.stringify(materialContent)
        }, "local");
        servicePointItems.push(id);

        //material Sign
        materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "SIGN",
                    "albedo": [1, 1, 1],
                    "albedoMap": ROOT + "models/servicePoint/" + userData.sector + ".jpg",
                    "metallic": 0.01,
                    "roughness": 0.13,
                    "unlit": true,
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
            "name": "MaterialSign-ServicePoint Sector " + userData.sector,
            "materialURL": "materialData",
            "priority": 3,
            "parentMaterialName": "mat::SIGN",
            "materialData": JSON.stringify(materialContent)
        }, "local");
        servicePointItems.push(id);

        //observatory trigger
        id = Entities.addEntity({
            "type": "Shape",
            "shape": "Cylinder",
            "parentID": entityID,
            "renderWithZones": properties.renderWithZones,
            "localPosition": {"x": 0, "y": 2.5, "z": 0},
            "localRotation": Quat.fromVec3Degrees( {"x": 0.0, "y": 0.0, "z": 0.0} ),
            "name": "Observatory-ServicePoint Sector " + userData.sector,
            "dimensions": {"x": 5, "y": 5, "z": 5},
            "visible": false,
            "canCastShadow": false,
            "collisionless": true,
            "script": ROOT + "triggerObservatory.js",
            "grab": {
                "grabbable": false
            }
        }, "local");
        servicePointItems.push(id);
/*
        //light
        id = Entities.addEntity({
            "type": "Light",
            "name": "ARRIVAL LIGHT " + userData.landingBay,
            "parentID": entityID,
            "localPosition": {"x":-2.05, "y":1.5, "z":4.1},
            "dimensions": {
                "x": 9.085314750671387,
                "y": 9.085314750671387,
                "z": 24.178146362304688
            },
            "localRotation": Quat.fromVec3Degrees({"x":180, "y":180, "z":0}),
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": {"red": colorLight[0], "green": colorLight[1], "blue": colorLight[2]},
            "isSpotlight": true,
            "intensity": 15,
            "exponent": 1,
            "cutoff": 35,
            "falloffRadius": 2
        }, "local");
        servicePointItems.push(id);
*/
    };

    this.unload = function(entityID) {
        let i;
        for (i = 0; i < servicePointItems.length; i++) {
            Entities.deleteEntity(servicePointItems[i]);
        }
        servicePointItems = [];
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
