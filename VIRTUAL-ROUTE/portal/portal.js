//
//  portal.js
//
//  Created by Alezia Kurdis, December 17th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Advanced Portal for the Virtual Route.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("portal.js")[0];
    
    let renderWithZones;
    let portalData;
    let destination = "";
    
    let portalHorizonID = null;
    let thisEntityID;
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        let properties = Entities.getEntityProperties(entityID, ["userData", "renderWithZones", "rotation"]);
        renderWithZones = properties.renderWithZones;
        let userData = properties.userData;
        let portalRotation = properties.rotation;
        
        if (userData === "") {
            let template = {
                "placeName": "",
                "isAlpha": true
            };
            
            Entities.editEntity(entityID, {"userData": JSON.stringify(template)});
            portalData = template;
        } else {
            portalData = JSON.parse(userData);
        }
        
        
        let virtualRoute = Script.require(ROOT + "../virtualRoute.json");
        
        let previousUrl;
        if (portalData.isAlpha) {
            previousUrl = virtualRoute[virtualRoute.length - 1].omegaArrivalUrl;
            for (let i = 0; i < virtualRoute.length; i++) {
                if (virtualRoute[i].placeName === portalData.placeName) {
                    destination = previousUrl;
                    break;
                } else {
                    previousUrl = virtualRoute[i].omegaArrivalUrl;
                }
            }
        } else {
            previousUrl = virtualRoute[0].alphaArrivalUrl;
            for (let i = virtualRoute.length -1; i >= 0; i--) {
                if (virtualRoute[i].placeName === portalData.placeName) {
                    destination = previousUrl;
                    break;
                } else {
                    previousUrl = virtualRoute[i].alphaArrivalUrl;
                }
            }
        }
        
        if (destination !== "") {
            let imageUrl, portalName;
            
            if (portalData.isAlpha) {
                //ALPHA
                imageUrl = ROOT + "SPRITE_PORTAL_02.png";
                portalName = "ALPHA";
            } else {
                //OMEGA
                imageUrl = ROOT + "SPRITE_PORTAL_01.png";
                portalName = "OMEGA";
            }
            
            let shader = {
                "ProceduralEntity": {
                    "channels": [
                        imageUrl
                    ],
                    "shaderUrl": ROOT + "spriteSheet.fs",
                    "uniforms": {
                        "uAlphaCutoff": 1,
                        "uColumns": 3,
                        "uEmit": 1,
                        "uEndFrame": 12,
                        "uFps": 30,
                        "uRows": 4,
                        "uShine": 255
                    },
                    "version": 2
                }
            };
            
            portalHorizonID = Entities.addEntity({
                "type": "Box",
                "parentID": entityID,
                "name": "portalHorizon " + portalName,
                "userData": JSON.stringify(shader),
                "description": destination,
                "localPosition": {
                    "x": 0.000016367353964596987,
                    "y": 0,
                    "z": -3.22021484375
                },
                "dimensions": {
                    "x": 3.379631996154785,
                    "y": 3.3796374797821045,
                    "z": 1.8029603958129883
                },
                "localRotation": {
                    "x": 0.28185975551605225,
                    "y": -0.959455668926239,
                    "z": 0,
                    "w": 0
                },
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                //"angularVelocity": Vec3.multiplyQbyV(portalRotation, {"x": 0.0, "y": 0.0, "z": -0.31415900588035583}),
                "damping": 0,
                "angularDamping": 0,
                "collisionless": true,
                "ignoreForCollisions": true,
                "shape": "Cube",
                "script": ROOT + "teleporter.js",
                "lifetime": 43200
            }, "local");
            
            //Light
            //noflyzone
            //Douane
            //signs inside
            //signs outside
            
        }
    };

    this.unload = function(entityID) {
        if (portalHorizonID !== null) {
            Entities.deleteEntity(portalHorizonID);
            portalHorizonID = null;
        }
    };

})
