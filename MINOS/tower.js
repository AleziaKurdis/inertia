//
//  tower.js
//
//  Created by Alezia Kurdis, April 30th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Generate color tp, particle light and sound on towers.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("tower.js")[0];
    let towerItems = [];

    this.preload = function(entityID) {
        let color, colorLight, colorStart, colorEnd, name, model, userData, id, signImageUrl, scriptForTP;
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones", "userData"]);
        if (properties.userData === "") {
            userData = {
                "hue": 0,
                "tpHeight": 142
            };
            Entities.editEntity(entityID, {"userData": JSON.stringify(userData)});
        } else {
            userData = JSON.parse(properties.userData);
        }
        colorLight = hslToRgb((userData.hue/360), 1, 0.65);
        color = hslToRgb((userData.hue/360), 1, 0.5);
        colorStart = hslToRgb((userData.hue/360), 1, 0.9);
        colorEnd = hslToRgb((userData.hue/360), 1, 0.3);
        
        scriptForTPdown = ROOT + "towerTeleportDown.js";
        scriptForTPup = ROOT + "towerTeleportUp.js";
    
        const FLOOR_LEVEL = -158.25; //m
    
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
            "localPosition": {"x": 0.0, "y": 100.0, "z": 0.0},
            "name": "plasma-material",
            "materialURL": "materialData",
            "priority": 3,
            "parentMaterialName": "mat::LIGHT",
            "materialData": JSON.stringify(materialContent)
        }, "local");
        towerItems.push(id);
        


        //tp light FLOOR
        id = Entities.addEntity({
            "type": "Light",
            "name": "FLOOR LIGHT " + userData.hue,
            "parentID": entityID,
            "localPosition": {"x":0, "y": FLOOR_LEVEL, "z":0},
            "dimensions": {
                "x": 20,
                "y": 20,
                "z": 20
            },
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": {"red": color[0], "green": color[1], "blue": color[2]},
            "isSpotlight": false,
            "intensity": 20,
            "exponent": 1,
            "cutoff": 35,
            "falloffRadius": 3
        }, "local");
        towerItems.push(id);

        //tp light TOWER
        id = Entities.addEntity({
            "type": "Light",
            "name": "TOWER LIGHT " + userData.hue,
            "parentID": entityID,
            "localPosition": {"x":0, "y": userData.tpHeight, "z":0},
            "dimensions": {
                "x": 20,
                "y": 20,
                "z": 20
            },
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": {"red": color[0], "green": color[1], "blue": color[2]},
            "isSpotlight": false,
            "intensity": 25,
            "exponent": 1,
            "cutoff": 35,
            "falloffRadius": 4
        }, "local");
        towerItems.push(id);
        
        //tp intereactive box FLOOR
        id = Entities.addEntity({
            "type": "Shape",
            "shape": "Cylinder",
            "parentID": entityID,
            "renderWithZones": properties.renderWithZones,
            "localPosition": {"x": 0, "y": FLOOR_LEVEL, "z": 0},
            "name": "Teleporter-FLOOR",
            "dimensions": {"x": 3, "y": 4, "z": 3},
            "visible": false,
            "canCastShadow": false,
            "collisionless": true,
            "script": scriptForTPup,
            "grab": {
                "grabbable": false
            }
        }, "local");
        towerItems.push(id);

        //tp intereactive box TOWER
        id = Entities.addEntity({
            "type": "Shape",
            "shape": "Cylinder",
            "parentID": entityID,
            "renderWithZones": properties.renderWithZones,
            "localPosition": {"x": 0, "y": userData.tpHeight, "z": 0},
            "name": "Teleporter-TOWER",
            "dimensions": {"x": 3, "y": 4, "z": 3},
            "visible": false,
            "canCastShadow": false,
            "collisionless": true,
            "script": scriptForTPdown,
            "grab": {
                "grabbable": false
            }
        }, "local");
        towerItems.push(id);
        
        /*
        //tpfx & sound
        id = Entities.addEntity({
            "type": "ParticleEffect",
            "name": "TP_ARRIVAL-FX " + userData.landingBay,
            "parentID": entityID,
            "localPosition": {"x":-2.05, "y":1.8, "z":2.7},
            "localRotation": Quat.fromVec3Degrees({"x":0, "y":0, "z":0}),
            "userData": "{\n  \"soundURL\": \"" + ROOT + "sounds/metaspaceportPortalSound.mp3\",\n  \"soundVolume\": 0.15,\n  \"soundLoop\": true,\n  \"soundLocal\": true,\n  \"refreshInterval\": 1500\n}",
            "dimensions": {
                "x": 13.238809585571289,
                "y": 13.238809585571289,
                "z": 13.238809585571289
            },
            "renderWithZones": idZoneParticle,
            "grab": {
                "grabbable": false
            },
            "script": ROOT + "soundplayer.js",
            "shapeType": "box",
            "color": {"red": color[0], "green": color[1], "blue": color[2]},
            "alpha": 0.4,
            "textures": ROOT + "images/PARTICULE_OPERA_007.png",
            "maxParticles": 1536,
            "lifespan": 2.7,
            "emitRate": 100,
            "emitSpeed": 0,
            "emitRadiusStart": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.7,
                "y": 1.5,
                "z": 0.01
            },
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": Vec3.multiplyQbyV(properties.rotation, { "x": 0, "y": 0, "z": -0.9}),
            "particleRadius": 2,
            "radiusSpread": 0.3,
            "radiusStart": 1,
            "radiusFinish": 2,
            "colorSpread": {
                "red": 0,
                "green": 0,
                "blue": 0
            },
            "colorStart": {"red": colorStart[0], "green": colorStart[1], "blue": colorStart[2]},
            "colorFinish": {"red": colorEnd[0], "green": colorEnd[1], "blue": colorEnd[2]},
            "alphaSpread": 0.1,
            "alphaStart": 0.8,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinSpread": 0.05000000074505806,
            "spinStart": -0.17000000178813934,
            "spinFinish": 0.17000000178813934
        }, "local");
        towerItems.push(id);
        
        */
    };

    this.unload = function(entityID) {
        let i;
        for (i = 0; i < towerItems.length; i++) {
            Entities.deleteEntity(towerItems[i]);
        }
        towerItems = [];
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