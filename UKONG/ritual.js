//
//  ritual.js
//
//  Created by Alezia Kurdis, April 6th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Ritual manager for the Zamyru Temple
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    const ROOT = Script.resolvePath('').split("ritual.js")[0];
    
    const channelComm = "ak.ukong.ritual.communications";
    
    let ritualOngoing = false;
    
    let processTimer = 0;
    const TIMER_INTERVAL = 1000;
    
    let thisEntityID;
    let thisRenderWithZones;
    
    let ritualId = Uuid.NONE;
    let ritualTime = 0;
    let tamtam1IDa = Uuid.NONE;
    let tamtam2IDa = Uuid.NONE;
    let tamtam3IDa = Uuid.NONE;
    let tamtam1IDb = Uuid.NONE;
    let tamtam2IDb = Uuid.NONE;
    let tamtam3IDb = Uuid.NONE;
    let tamtam1IDc = Uuid.NONE;
    let tamtam2IDc = Uuid.NONE;
    let tamtam3IDc = Uuid.NONE;
    
    const RADIUS = 90;
    
    this.preload = function(entityID) {
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        
        thisEntityID = entityID;
        let properties = Entities.getEntityProperties(entityID,["renderWithZones"]);
        thisRenderWithZones = properties.renderWithZones;
    };

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > TIMER_INTERVAL) {
            
            processRitual();
            
            today = new Date();
            processTimer = today.getTime();
        }
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        var messageToSent;
        var i;
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "START_ZAMYRU_RITUAL_OF_DEATH") {
                if (!ritualOngoing) {
                    //start ritual here
                    ritualTime = 0;
                    Script.update.connect(myTimer);
                    ritualOngoing = true;
                }
            }
        }
    }

    function processRitual() {
        ritualTime++;
        if (ritualTime === 1) {
            //initiate (build fires, light and effect
            initiateRitual();
            //start TAM TAM 1
            Entities.editEntity(tamtam1IDa, {"playing": true});
            Entities.editEntity(tamtam1IDb, {"playing": true});
            Entities.editEntity(tamtam1IDc, {"playing": true});
        } else if (ritualTime === 12) {
            generatePonctualSound("HORN_1.mp3");
        } else if (ritualTime === 36) {
            generatePonctualSound("HORN_1.mp3");
        } else if (ritualTime === 60) {
            //start TAMTAM  2
            Entities.editEntity(tamtam2IDa, {"playing": true});
            Entities.editEntity(tamtam2IDb, {"playing": true});
            Entities.editEntity(tamtam2IDc, {"playing": true});
        } else if (ritualTime === 64) {
            //stop TAMTAM  1
            Entities.editEntity(tamtam1IDa, {"playing": false});
            Entities.editEntity(tamtam1IDb, {"playing": false});
            Entities.editEntity(tamtam1IDc, {"playing": false});
        } else if (ritualTime === 75) {
            generatePonctualSound("HORN_2.mp3");
        } else if (ritualTime === 95) {
            generatePonctualSound("HORN_1.mp3");
        } else if (ritualTime === 120) {
            //start TAMTAM  3
            Entities.editEntity(tamtam3IDa, {"playing": true});
            Entities.editEntity(tamtam3IDb, {"playing": true});
            Entities.editEntity(tamtam3IDc, {"playing": true});
        } else if (ritualTime === 124) {
            //stop TAMTAM  2
            Entities.editEntity(tamtam2IDa, {"playing": false});
            Entities.editEntity(tamtam2IDb, {"playing": false});
            Entities.editEntity(tamtam2IDc, {"playing": false});
        } else if (ritualTime === 137) {
            generatePonctualSound("HORN_2.mp3");
        } else if (ritualTime === 154) {
            generatePonctualSound("HORN_2.mp3");
        } else if (ritualTime === 180) {
            //ending the ritual
            Entities.editEntity(tamtam3IDa, {"playing": false});
            Entities.editEntity(tamtam3IDb, {"playing": false});
            Entities.editEntity(tamtam3IDc, {"playing": false});
            if (ritualId !== Uuid.NONE) {
                Entities.deleteEntity(ritualId);
                ritualId = Uuid.NONE;
            }
            ritualOngoing = false;
            Script.update.disconnect(myTimer);
        }
    }

    function initiateRitual() {
        if (ritualId === Uuid.NONE) {
            //Create the container
            ritualId = Entities.addEntity({
                "type": "Empty",
                "name": "RITUAL CONTAINER",
                "parentID": thisEntityID,
                "renderWithZones": thisRenderWithZones,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "dimensions": {"x": 10.0, "y": 10.0, "z": 10.0},
                "lifetime": 240
            }, "local");
            
            tamtam1IDa = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 1a",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_1.mp3",
                "playing": false,
                "volume": 1.0,
                "loop": true,
                "positional": true,
                "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
                "localOnly": true
            }, "local");

            tamtam1IDb = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 1b",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_1.mp3",
                "playing": false,
                "volume": 1.0,
                "loop": true,
                "positional": true,
                "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
                "localOnly": true
            }, "local");
            
            tamtam1IDc = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 1c",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_1.mp3",
                "playing": false,
                "volume": 1.0,
                "loop": true,
                "positional": true,
                "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
                "localOnly": true
            }, "local");
            
            tamtam2IDa = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 2a",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_2.mp3",
                "playing": false,
                "volume": 1.0,
                "loop": true,
                "positional": true,
                "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
                "localOnly": true
            }, "local");

            tamtam2IDb = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 2b",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_2.mp3",
                "playing": false,
                "volume": 1.0,
                "loop": true,
                "positional": true,
                "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
                "localOnly": true
            }, "local");
            
            tamtam2IDc = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 2c",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_2.mp3",
                "playing": false,
                "volume": 1.0,
                "loop": true,
                "positional": true,
                "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
                "localOnly": true
            }, "local");

            tamtam3IDa = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 3a",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_3.mp3",
                "playing": false,
                "volume": 1.0,
                "loop": true,
                "positional": true,
                "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
                "localOnly": true
            }, "local");

            tamtam3IDb = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 3b",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_3.mp3",
                "playing": false,
                "volume": 1.0,
                "loop": true,
                "positional": true,
                "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
                "localOnly": true
            }, "local");
            
            tamtam3IDc = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 3c",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_3.mp3",
                "playing": false,
                "volume": 1.0,
                "loop": true,
                "positional": true,
                "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
                "localOnly": true
            }, "local");
            //FX
            
        }
    }

    function generatePonctualSound(filename) {
        let id = Entities.addEntity({
            "type": "Sound",
            "name": filename,
            "parentID": ritualId,
            "renderWithZones": thisRenderWithZones,
            "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
            "soundURL": ROOT + "sounds/RITUAL/" + filename,
            "playing": true,
            "volume": 1.0,
            "loop": false,
            "positional": true,
            "localPosition": {"x": Math.floor(Math.random() * RADIUS * 2) - RADIUS, "y": 3.0, "z": Math.floor(Math.random() * RADIUS * 2) - RADIUS},
            "localOnly": true,
            "lifetime": 180
        }, "local");
    }

    this.unload = function(entityID) {
        if (ritualId !== Uuid.NONE) {
            Entities.deleteEntity(ritualId);
            ritualId = Uuid.NONE;
        }
        if (ritualOngoing) {
            Script.update.disconnect(myTimer);
        }
        ritualOngoing = false;
        
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
        
    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });
    
})
