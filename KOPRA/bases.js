//
//  bases.js
//
//  Created by Alezia Kurdis, April 1st, 2024.
//  Copyright 2024, Overte e.V.
//
//  Generate color and names on bases.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("bases.js")[0];
    let baseItems = [];

    this.preload = function(entityID) {
        let color, name, model, userData, id, alignment;
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones", "userData"]);
        if (properties.userData === "") {
            userData = {
                "hue": 0,
                "name": "NAME",
                "model": "1X1",
                "alignment": "center"
            };
            Entities.editEntity(entityID, {"userData": JSON.stringify(userData)});
        } else {
            userData = JSON.parse(properties.userData);
        }
        color = hslToRgb((userData.hue/360), 1, 0.6);
        name = userData.name;
        model = userData.model;
        
        if (userData.alignment === undefined) {
            alignment = "center";
        } else {
            alignment = userData.alignment;
        }
        //material
        let bloomFactor = 3;
        let materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "plasma",
                    "albedo": [1, 1, 1],
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(color[0]/255) * bloomFactor, (color[1]/255) * bloomFactor, (color[2]/255) * bloomFactor],
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
        baseItems.push(id);
        
        //texts
        let deltaX, deltaZ, alignX, alignZ;
        let deltaY = 0.29;
        switch (model) {
            case "1X1":
                deltaX = 8.01;
                deltaZ = 8.01;
                alignX = "center";
                alignZ = "center";
                break;
            case "2X1":
                deltaX = 8.01;
                deltaZ = 15.09;
                alignX = "center";
                alignZ = alignment;
                break;
            case "2X2":
                deltaX = 15.05;
                deltaZ = 15.05;
                alignX = alignment;
                alignZ = alignment;
                break;
            default:
                deltaX = 8.01;
                deltaZ = 8.01;
                alignX = "center";
                alignZ = "center";
        }
        
        let lineHeight = 1;
        let dimensions = {"x": 9, "y": 1.05, "z": 0.01};
        //SIDE 1:
        id = Entities.addEntity({
            "type": "Text",
            "parentID": entityID,
            "renderWithZones": properties.renderWithZones,
            "localPosition": {"x": deltaX, "y": deltaY, "z": 0},
            "localRotation": Quat.fromVec3Degrees( {"x": 0.0, "y": 90.0, "z": 0.0} ),
            "name": "baseTitle",
            "dimensions": dimensions,
            "text": name,
            "lineHeight": lineHeight,
            "textColor": {"red": color[0], "green": color[1], "blue": color[2]},
            "backgroundAlpha": 0,
            "unlit": true,
            "alignment": alignZ
        }, "local");
        baseItems.push(id);

        //SIDE 2:
        id = Entities.addEntity({
            "type": "Text",
            "parentID": entityID,
            "renderWithZones": properties.renderWithZones,
            "localPosition": {"x": -deltaX, "y": deltaY, "z": 0},
            "localRotation": Quat.fromVec3Degrees( {"x": 0.0, "y": 270.0, "z": 0.0} ),
            "name": "baseTitle",
            "dimensions": dimensions,
            "text": name,
            "lineHeight": lineHeight,
            "textColor": {"red": color[0], "green": color[1], "blue": color[2]},
            "backgroundAlpha": 0,
            "unlit": true,
            "alignment": alignZ
        }, "local");
        baseItems.push(id);
        
        //SIDE 3:
        id = Entities.addEntity({
            "type": "Text",
            "parentID": entityID,
            "renderWithZones": properties.renderWithZones,
            "localPosition": {"x": 0, "y": deltaY, "z": -deltaZ},
            "localRotation": Quat.fromVec3Degrees( {"x": 0.0, "y": 180.0, "z": 0.0} ),
            "name": "baseTitle",
            "dimensions": dimensions,
            "text": name,
            "lineHeight": lineHeight,
            "textColor": {"red": color[0], "green": color[1], "blue": color[2]},
            "backgroundAlpha": 0,
            "unlit": true,
            "alignment": alignX
        }, "local");
        baseItems.push(id);
        
        //SIDE 4:
        id = Entities.addEntity({
            "type": "Text",
            "parentID": entityID,
            "renderWithZones": properties.renderWithZones,
            "localPosition": {"x": 0, "y": deltaY, "z": deltaZ},
            "localRotation": Quat.fromVec3Degrees( {"x": 0.0, "y": 0.0, "z": 0.0} ),
            "name": "baseTitle",
            "dimensions": dimensions,
            "text": name,
            "lineHeight": lineHeight,
            "textColor": {"red": color[0], "green": color[1], "blue": color[2]},
            "backgroundAlpha": 0,
            "unlit": true,
            "alignment": alignX
        }, "local");
        baseItems.push(id);
    };

    this.unload = function(entityID) {
        let i;
        for (i=0; i < baseItems.length; i++) {
            Entities.deleteEntity(baseItems[i]);
        }
        baseItems = [];
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
