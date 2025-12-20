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
    let portalLightID = null;
    let portalFlyZoneID = null;
    let portalDouaneID = null;
    let portalFrontSignID = null;
    let portalSoundID = null;
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
            let imageUrl, portalName, lightColor, frontsignModelUrl;
            
            if (portalData.isAlpha) {
                //ALPHA
                imageUrl = ROOT + "SPRITE_PORTAL_02.png";
                portalName = "ALPHA";
                lightColor = {
                    "red": 156,
                    "green": 255,
                    "blue": 250
                };
                frontsignModelUrl = ROOT + "FRONTSIGN-ALPHA.fst";
            } else {
                //OMEGA
                imageUrl = ROOT + "SPRITE_PORTAL_01.png";
                portalName = "OMEGA";
                lightColor = {
                    "red": 255,
                    "green": 200,
                    "blue": 156
                };
                frontsignModelUrl = ROOT + "FRONTSIGN-OMEGA.fst";
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
                    "x": 0.0,
                    "y": 0.0,
                    "z": -3.72021484375
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
                "angularVelocity": Vec3.multiplyQbyV(portalRotation, {"x": 0.0, "y": 0.0, "z": -0.31415900588035583}),
                "damping": 0,
                "angularDamping": 0,
                "collisionless": true,
                "ignoreForCollisions": true,
                "shape": "Cube",
                "script": ROOT + "teleporter.js",
                "lifetime": 43200
            }, "local");
            
            //Light
            portalLightID = Entities.addEntity({
                "type": "Light",
                "parentID": entityID,
                "name": "portal Light " + portalName,
                "localPosition": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": -4.1
                },
                "dimensions": {"x":14.273547172546387,"y":14.273547172546387,"z":20.18584442138672},
                "localRotation": {"x":-1,"y":-0.0000152587890625,"z":-0.0000152587890625,"w":-0.0000152587890625},
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "intensity": 8,
                "falloffRadius": 0.8,
                "isSpotlight": true,
                "cutoff": 45,
                "color": lightColor,
                "lifetime": 43200
            }, "local");
            
            //flyzone
            portalFlyZoneID = Entities.addEntity({
                "type": "Zone",
                "parentID": entityID,
                "name": "portal FlyZone " + portalName,
                "localPosition": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": -0.5648
                },
                "dimensions": {"x":4.500001430511475,"y":4.500001430511475,"z":8.611637115478516},
                "localRotation": {"x":0,"y":0,"z":0,"w":1},
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "shapeType": "box",
                "keyLight": {
                    "direction": {
                        "x": 0,
                        "y": -0.7071067690849304,
                        "z": 0.7071067690849304
                    },
                    "castShadows": true
                },
                "flyingAllowed": true,
                "lifetime": 43200
            }, "local");
            
            //Douane
            portalDouaneID = Entities.addEntity({
                "type": "Shape",
                "shape": "Cube",
                "parentID": entityID,
                "name": "portal douane " + portalName,
                "localPosition": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 2.7440
                },
                "alpha": 0.0,
                "collisionless": true,
                "dimensions": {"x": 4.5,"y": 4.5,"z": 2.0},
                "localRotation": {"x":0,"y":0,"z":0,"w":1},
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "script": "",
                "lifetime": 43200
            }, "local");
            

            //signs 
            portalFrontSignID = Entities.addEntity({
                "type": "Model",
                "parentID": entityID,
                "name": "portal frontSigns " + portalName,
                "localPosition": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0
                },
                "collisionless": true,
                "dimensions": {"x":4.293360710144043,"y":0.41530081629753113,"z":5.49279260635376},
                "localRotation": {"x":0,"y":0,"z":0,"w":1},
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "modelURL": frontsignModelUrl,
                "useOriginalPivot": true,
                "lifetime": 43200
            }, "local");
            
            //sound
            portalSoundID = Entities.addEntity({
                "type": "Sound",
                "parentID": entityID,
                "name": "portal Sound " + portalName,
                "localPosition": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": -4.1
                },
                "dimensions": {"x":1;0,"y":1.0,"z":1.0},
                "localRotation": {"x":0,"y":0,"z":0,"w":1},
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "soundURL": ROOT + "portalSound.mp3",
                "volume": 0.3,
                "loop": true,
                "positional": true,
                "localOnly": true,
                "lifetime": 43200
            }, "local");
        }
    };

    this.unload = function(entityID) {
        if (portalHorizonID !== null) {
            Entities.deleteEntity(portalHorizonID);
            portalHorizonID = null;
        }

        if (portalLightID !== null) {
            Entities.deleteEntity(portalLightID);
            portalLightID = null;
        }

        if (portalFlyZoneID !== null) {
            Entities.deleteEntity(portalFlyZoneID);
            portalFlyZoneID = null;
        }
        
        if (portalDouaneID !== null) {
            Entities.deleteEntity(portalDouaneID);
            portalDouaneID = null;
        }
        
        if (portalFrontSignID !== null) {
            Entities.deleteEntity(portalFrontSignID);
            portalFrontSignID = null;
        }
        if (portalSoundID !== null) {
            Entities.deleteEntity(portalSoundID);
            portalSoundID = null;
        }
        
    };

})
