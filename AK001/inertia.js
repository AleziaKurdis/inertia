"use strict";
//
//  inertia.js
//
//  Created by Alezia Kurdis, July 26th, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  Serverless Overte domain sandbox / home with a dynamic ambience.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("inertia.js")[0];
	var soundURL = ROOT + 'inertiaAmbience.mp3';
    var NORMAL_MAP_URL = ROOT + 'panel_normal_512.jpg';
	var mySound;
    var injector;
    var UPDATE_TIMER_INTERVAL = 10000; // 10 sec 
    var processTimer = 0;
    var thisEntity;
    var skyId;
    var SKYBOX_URL = "http://metaverse.bashora.com/scripts/hytrion_cloud/skybox/skybox.php";
    var MAX_VELOCITY = 80;
    var MAX_DISTANCE = 1250;
    
    var cuboidID = [];
    var cuboidMaterialsID = [];
    
    function playsound(){
        injector = Audio.playSound(mySound, {
            loop: true,
            stereo: true,
            localOnly: true,
            volume: 0.2
        });
    }

    this.preload = function(entityID) { 
        thisEntity = entityID;
        mySound = SoundCache.getSound(soundURL);


        if (mySound.downloaded) {
            playsound();
        } else {
            mySound.ready.connect(onSoundReady);
        }

        //Generate Sky
        genSky();
        //Generate Material for current cube
        mainCubeMaterialId = genMaterial(thisEntity, false);
        //Generate other cube and their material
        var cubeId;
        var laneVelocity;
        var velocityDirection;
        var initialPosition;
        var cubeMaterialId;
        for (var x = -3; x < 3; x++) {
            for (var y = 0; y < 3; y++) {
                if (x !== 0 || y !== 0) {
                    if (Math.random() < 0.5) {
                        velocityDirection = 1;
                    } else {
                        velocityDirection = -1;
                    }                    
                    laneVelocity = Math.random() * Math.random() * MAX_VELOCITY * velocityDirection;
                    initialPosition = getTowPositionOnALane();
                    cubeId = genCube(6000 + (x * 175), 6000 + (y * 75), laneVelocity, initialPosition.a);
                    cubeMaterialId = genMaterial(cubeId, true);
                    cuboidID.push(cubeId);
                    cuboidMaterialsID.push(cubeMaterialId);
                    cubeId = genCube(6000 + (x * 175), 6000 + (y * 75), laneVelocity, initialPosition.b);
                    cubeMaterialId = genMaterial(cubeId, true);
                    cuboidID.push(cubeId);
                    cuboidMaterialsID.push(cubeMaterialId);                    
                    
                    
                }
            }              
        }

        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);        
    }; 

    function getTowPositionOnALane() {
        var points = {
            "a": 0,
            "b": 0
        };
        
        points.a = 6000 + ((Math.random() * 2 * MAX_DISTANCE) - MAX_DISTANCE);
        if (points.a > 6000) {
            points.b = points.a - 1050 - (Math.random() * 500);
        } else {
            points.b = points.a + 1050 + (Math.random() * 500);
        }
        return points;
    }

    function myTimer(deltaTime) {
        var velocityDirection, newOrigin;
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            //Manage moving cubes
            var properties;
            for (var i = 0; i < cuboidID.length; i++) {
                properties = Entities.getEntityProperties(cuboidID[i], ["position", "velocity"]);
                if (properties.position.z > (6000 + MAX_DISTANCE) || properties.position.z < (6000 - MAX_DISTANCE)) {
                    if (properties.position.z < (6000 - MAX_DISTANCE)) {
                        newOrigin = 6000 + MAX_DISTANCE;
                    } else {
                        newOrigin = 6000 - MAX_DISTANCE;
                    }                    
                    Entities.editEntity(cuboidID[i],{
                        "position": {
                            "x": properties.position.x,
                            "y": properties.position.y,
                            "z": newOrigin
                        },
                        "velocity": properties.velocity
                    });
                }
            }
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function onSoundReady() {
        mySound.ready.disconnect(onSoundReady);
        playsound();
    }

    this.unload = function(entityID) {
		injector.stop();
        Script.update.disconnect(myTimer);
        Entities.deleteEntity(skyId);
        Entities.deleteEntity(mainCubeMaterialId);
        for (var i = 0; i < cuboidID.length; i++) {
            Entities.deleteEntity(cuboidID[i]);
            Entities.deleteEntity(cuboidMaterialsID[i]);
        }
        
    };
    
    function genSky() {
        var lightHue = Math.random();
        var atmosphericHue = lightHue - ((Math.random() * 0.2) + 0.4);
        if (atmosphericHue < 0) {
            atmosphericHue = atmosphericHue + 1;
        }
        var keylightcolor = hslToRgb(lightHue, 1, 0.8);
        var keylight = { "red": keylightcolor[0], "green": keylightcolor[1], "blue": keylightcolor[2] };

        var glareColor = hslToRgb(lightHue, 1, 0.7);
        var glare = { "red": glareColor[0], "green": glareColor[1], "blue": glareColor[2] };

        var backGroundColor = hslToRgb(atmosphericHue, 1, 0.01);
        var bgColor = { "red": backGroundColor[0], "green": backGroundColor[1], "blue": backGroundColor[2] };
        
        var hazeFogColor = hslToRgb(atmosphericHue, 0.8, 0.15);
        var hazeColor = { "red": hazeFogColor[0], "green": hazeFogColor[1], "blue": hazeFogColor[2] };        

        skyId = Entities.addEntity({
            "type": "Zone",
            "locked": true,
            "name": "LIMBOSPHERE",
            "dimensions": {
                "x": 12000,
                "y": 12000,
                "z": 12000
            },
            "rotation": {
                "x":0,
                "y":0,
                "z":-0.3826834559440613,
                "w":0.9238795042037964
            },
            "position": {
                "x": 6000,
                "y": 6000,
                "z": 6000
            },            
            "grab": {
                "grabbable": false
            },
            "shapeType": "box",
            "keyLight": {
                "color": keylight,
                "intensity": 3,
                "direction": {
                    "x": 0.6426933407783508,
                    "y": -0.4259394705295563,
                    "z": 0.6368052363395691
                },
                "castShadows": true,
                "shadowMaxDistance": 250,
                "shadowBias": 0.1
            },
            "ambientLight": {
                "ambientIntensity": 0.6000000238418579,
                "ambientURL": SKYBOX_URL + "?h=" + Math.floor(atmosphericHue * 360) + "&s=18", 
            },
            "skybox": {
                "url": SKYBOX_URL  + "?h=" + Math.floor(atmosphericHue * 360) + "&s=18", 
                "color": bgColor
            },
            "haze": {
                "hazeColor": hazeColor,
                "hazeGlareColor": glare,
                "hazeEnableGlare": true,
                "hazeGlareAngle": 25
            },
            "bloom": {
                "bloomIntensity": 0.5009999871253967,
                "bloomThreshold": 0.7059999704360962,
                "bloomSize": 0.890999972820282
            },
            "keyLightMode": "enabled",
            "ambientLightMode": "enabled",
            "skyboxMode": "enabled",
            "hazeMode": "enabled",
            "bloomMode": "enabled",
            "angularDamping": 0,
            "localAngularVelocity": {
                "x": 0.0,
                "y": 0.034,
                "z": 0.0
            },
        }, "local");
    }

    function genMaterial(parentId, isRepeat) {
        var nbrRepeat = 1;
        if (isRepeat) {
            nbrRepeat = 100;
        }
        
        var materialId = Entities.addEntity({
            "position": {
                "x": 6000,
                "y": 6000,
                "z": 6000                
                },
            "type": "Material",
            "parentID": parentId,
            "name": "CUBE_MATERIAL",
            "grab": {
                "grabbable": false
                },
            "materialURL": "materialData",
            "materialData": genMaterialData(),
            "priority": 1,
            "materialMappingScale": {
                "x": nbrRepeat,
                "y": nbrRepeat
                }
        }, "local");
        
        return materialId; 
    }

    function genMaterialData() {
        var hue = (Math.random() * 360)/360;
        var color = hslToRgb(hue, 1, 0.3);
        var albedo = [(color[0]/255), (color[1]/255), (color[2]/255)];
        var materialObj = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "CUBE",
                    "model": "hifi_pbr",
                    "albedo": albedo,
                    "roughness": 0.2,
                    "metallic": 1,
                    "normalMap": NORMAL_MAP_URL
                }
            ]
        };
        return JSON.stringify(materialObj);
    }

    function genCube(positionX, positionY, laneVelocity, initialPosition) {
        var position = {"x": positionX, "y": positionY, "z": initialPosition};
        
        var id = Entities.addEntity({
            "type": "Model",
            "name": "NOMADIC_CUBES " + positionX + " " + positionY,
            "locked": false,
            "dimensions": {
                "x": 1025,
                "y": 200,
                "z": 275
            },
            "rotation": {"x":0,"y":0.7071068286895752,"z":0,"w":0.7071068286895752},
            "position": position,            
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "friction": 0,
            "velocity": {
                "x": 0,
                "y": 0,
                "z": laneVelocity
            },
            "shapeType": "none",
            "modelURL": "https://aleziakurdis.github.io/inertia/AK001/aerolithes.fbx",
            "useOriginalPivot": true
        }, "local");
        return id;
    }

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


})
