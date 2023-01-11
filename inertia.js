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
    var MAX_DISTANCE = 1200;
    
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
        mainCubeMaterialId = genMaterial(thisEntity);
        //Generate other cube and their material
        var cubeId;
        var cubeMaterialId;
        for (var x = -7; x < 8; x++) {
            for (var y = -2; y < 8; y++) {
                if (x !== 0 || y !== 0) {
                    if (x !== 0 || y !== -1) {
                        cubeId = genCube(6000 + (x * 65), 6025 + (y * 65));
                        cubeMaterialId = genMaterial(cubeId);
                        cuboidID.push(cubeId);
                        cuboidMaterialsID.push(cubeMaterialId);
                    }
                }
            }              
        }

        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);        
    }; 

    function myTimer(deltaTime) {
        var velocityDirection, newOrigin;
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            //Manage moving cubes
            var properties;
            for (var i = 0; i < cuboidID.length; i++) {
                properties = Entities.getEntityProperties(cuboidID[i], ["position", "velocity"]);
                if (properties.position.z > (6000 + MAX_DISTANCE) || properties.position.z < (6000 - MAX_DISTANCE)) {
                    velocityDirection = 1;
                    newOrigin = 6000 - MAX_DISTANCE;
                    if (Math.random() > 0.5){
                        velocityDirection = -1;
                        newOrigin = 6000 + MAX_DISTANCE;
                    }                      
                    Entities.editEntity(cuboidID[i],{
                        "position": {
                            "x": properties.position.x,
                            "y": properties.position.y,
                            "z": newOrigin
                        },
                        "velocity": {
                            "x": 0,
                            "y": 0,
                            "z": Math.random() * Math.random() * MAX_VELOCITY * velocityDirection
                        }
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

    function genMaterial(parentId) {
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
                "x": 50,
                "y": 50
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

    function genCube(positionX, positionY) {
        var shapes = ["Cube", "Sphere", "Icosahedron", "dodecahedron"];
        shuffle(shapes);
        var position = {"x": positionX, "y": positionY, "z": 6000 + ((Math.random() * 2 * MAX_DISTANCE) - MAX_DISTANCE)};
        var velocityDirection = 1;
        if (Math.random() > 0.5){
            velocityDirection = -1;
        }  
        
        var id = Entities.addEntity({
            "type": "Shape",
            "name": "NOMADIC_CUBE " + positionX + " " + positionY,
            "locked": false,
            "dimensions": {
                "x": 50,
                "y": 50,
                "z": 50
            },
            "rotation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "position": position,            
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "friction": 0,
            "velocity": {
                "x": 0,
                "y": 0,
                "z": Math.random() * Math.random() * MAX_VELOCITY * velocityDirection
            },
            "color": {
                "red": 0,
                "green": 0,
                "blue": 0
            },
            "shape": shapes[0]           
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

    function shuffle(array) {
        let currentIndex = array.length;  
        var randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

})