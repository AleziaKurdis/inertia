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
    let ritualPosition;
    
    let ritualId = Uuid.NONE;
    let ritualTime = 0;
    let tamtam1ID = Uuid.NONE;
    let tamtam2ID = Uuid.NONE;
    let tamtam3ID = Uuid.NONE;
    let currentVolume = 0.0;
    const FULL_VOLUME_RADIUS = 150;
    const MAX_AUDIBLE_RADIUS = 800;
    
    const D17_DAY_DURATION = 61200;
    
    this.preload = function(entityID) {
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        
        thisEntityID = entityID;
        let properties = Entities.getEntityProperties(entityID,["position", "renderWithZones"]);
        thisRenderWithZones = properties.renderWithZones;
        ritualPosition = properties.position;
    };

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > TIMER_INTERVAL) {
            
            dayNightLights();
            
            manageVolumes();
            
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

    let dayNightFires = [
        {"localPosition": {"x": 125.8977, "y": 29.7458, "z": -3.8523}, "diameter": 1.1, "noFlick": false, "id": Uuid.NONE }, //Top - CitySide
        {"localPosition": {"x": 125.8977, "y": 29.7458, "z": 2.3269}, "diameter": 1.1, "noFlick": false, "id": Uuid.NONE }, //Top - MountSide
        {"localPosition": {"x": 111.7332, "y": 19.3049, "z": -14.8054}, "diameter": 2.0, "noFlick": false, "id": Uuid.NONE }, //3rd - CitySide
        {"localPosition": {"x": 111.7332, "y": 19.3049, "z": 12.8105}, "diameter": 2.0, "noFlick": false, "id": Uuid.NONE }, //3rd - MountSide
        {"localPosition": {"x": -147.9866, "y": 38.4709, "z": -0.5427}, "diameter": 1.3056, "noFlick": false, "id": Uuid.NONE }, //Altar skull
        {"localPosition": {"x": 11.2847, "y": 3.0122, "z": -5.1023}, "diameter": 1.0, "noFlick": false, "id": Uuid.NONE }, //LOWDOOR - CitySide
        {"localPosition": {"x": 11.2847, "y": 3.0122, "z": 3.5586}, "diameter": 1.0, "noFlick": false, "id": Uuid.NONE }, //LOWDOOR - CitySide
        {"localPosition": {"x": -68.8528, "y": 1.2563, "z": -5.1023}, "diameter": 1.0, "noFlick": false, "id": Uuid.NONE }, //WALLDOOR - CitySide
        {"localPosition": {"x": -68.8528, "y": 1.2563, "z": 3.5586}, "diameter": 1.0, "noFlick": false, "id": Uuid.NONE }, //WALLDOOR - CitySide
    ];
    
    function dayNightLights() {
        let flickering = "";
        let d17CurrentHour = (GetCurrentCycleValue(8640000, D17_DAY_DURATION)/100) / 3600;
        for (let i = 0; i < dayNightFires.length; i++) {
            if ( d17CurrentHour > 19 || d17CurrentHour < 5) { 
                if (dayNightFires[i].id === Uuid.NONE) {
                    if (dayNightFires[i].noFlick) {
                        flickering = "NOFLICK";
                    } else {
                        flickering = "";
                    }
                    dayNightFires[i].id = Entities.addEntity({
                        "type": "Empty",
                        "name": "DAY_NIGHT_FIRE",
                        "renderWithZones": thisRenderWithZones,
                        "grab": {
                            "grabbable": false
                        },
                        "parentID": thisEntityID,
                        "localPosition": dayNightFires[i].localPosition,
                        "dimensions": {"x": dayNightFires[i].diameter, "y": dayNightFires[i].diameter, "z": dayNightFires[i].diameter},
                        "script": ROOT + "scalableFire.js",
                        "lifetime": Math.round(D17_DAY_DURATION * 0.41666),
                        "description": flickering
                    }, "local");
                }
            } else {
                if (dayNightFires[i].id !== Uuid.NONE) {
                    Entities.deleteEntity(dayNightFires[i].id);
                    dayNightFires[i].id = Uuid.NONE;
                }
            }
        }
    }

    function ceremonialFire(parentID, localPosition, diameter, lifeTime, isFlickering) {
        let flickering = "";

        if (!isFlickering) {
            flickering = "NOFLICK";
        } else {
            flickering = "";
        }
        let id = Entities.addEntity({
            "type": "Empty",
            "name": "RITUAL_FIRE",
            "renderWithZones": thisRenderWithZones,
            "grab": {
                "grabbable": false
            },
            "parentID": parentID,
            "localPosition": localPosition,
            "dimensions": {"x": diameter, "y": diameter, "z": diameter},
            "script": ROOT + "scalableFire.js",
            "lifetime": lifeTime,
            "description": flickering
        }, "local");
        
        return id;
    }

    function manageVolumes() {
        //eval volume
        let distance = Vec3.distance(ritualPosition, MyAvatar.position);

        if (distance < FULL_VOLUME_RADIUS) {
            currentVolume = 1.0;
        } else {
            let t = (distance - FULL_VOLUME_RADIUS) / MAX_AUDIBLE_RADIUS;
            t = Math.min(Math.max(t, 0.0), 1.0);

            // Exponential curve
            currentVolume = Math.pow(1.0 - t, 9.0);

            if (currentVolume < 0.0) {
                currentVolume = 0.0;
            }
        }
        
        //update volume
        if (tamtam1ID !== Uuid.NONE) {
            Entities.editEntity(tamtam1ID, {"volume": currentVolume});
        }
        
        if (tamtam2ID !== Uuid.NONE) {
            Entities.editEntity(tamtam2ID, {"volume": currentVolume});
        }
        
        if (tamtam3ID !== Uuid.NONE) {
            Entities.editEntity(tamtam3ID, {"volume": currentVolume});
        }
    }

    function processRitual() {
        ritualTime++;
        if (ritualTime === 1) {
            //initiate (build fires, light and effect
            initiateRitual();
            //start TAM TAM 1
            Entities.editEntity(tamtam1ID, {"playing": true});
        } else if (ritualTime === 12) {
            generatePonctualSound("HORN_1.mp3");
        } else if (ritualTime === 36) {
            generatePonctualSound("HORN_1.mp3");
        } else if (ritualTime === 48) {
            generatePonctualSound("SCREAM_1.mp3");
        } else if (ritualTime === 60) {
            //start TAMTAM  2
            Entities.editEntity(tamtam2ID, {"playing": true});
        } else if (ritualTime === 64) {
            //stop TAMTAM  1
            Entities.editEntity(tamtam1ID, {"playing": false});
        } else if (ritualTime === 69) {
            generatePonctualSound("SCREAM_4.mp3");
        } else if (ritualTime === 75) {
            generatePonctualSound("HORN_2.mp3");
        } else if (ritualTime === 85) {
            generatePonctualSound("SCREAM_3.mp3");
        } else if (ritualTime === 95) {
            generatePonctualSound("HORN_1.mp3");
        } else if (ritualTime === 120) {
            //start TAMTAM  3
            Entities.editEntity(tamtam3ID, {"playing": true});
        } else if (ritualTime === 124) {
            //stop TAMTAM  2
            Entities.editEntity(tamtam2ID, {"playing": false});
        } else if (ritualTime === 130) {
            generatePonctualSound("SCREAM_4.mp3");
        } else if (ritualTime === 137) {
            generatePonctualSound("HORN_2.mp3");
        } else if (ritualTime === 154) {
            generatePonctualSound("HORN_2.mp3");
        } else if (ritualTime === 180) {
            Entities.editEntity(tamtam3ID, {"playing": false});
            generatePonctualSound("SCREAM_2.mp3");
        } else if (ritualTime === 190) {
            //ending the ritual
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
                "lifetime": 230
            }, "local");
            
            tamtam1ID = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 1",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_1.mp3",
                "playing": false,
                "volume": currentVolume,
                "loop": true,
                "positional": false,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "localOnly": true
            }, "local");

            
            tamtam2ID = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 2",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_2.mp3",
                "playing": false,
                "volume": currentVolume,
                "loop": true,
                "positional": false,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "localOnly": true
            }, "local");

            tamtam3ID = Entities.addEntity({
                "type": "Sound",
                "name": "TAM TAM 3",
                "parentID": ritualId,
                "renderWithZones": thisRenderWithZones,
                "dimensions": {"x": 3.0, "y": 3.0, "z": 3.0},
                "soundURL": ROOT + "sounds/RITUAL/TAMTAM_3.mp3",
                "playing": false,
                "volume": currentVolume,
                "loop": true,
                "positional": false,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "localOnly": true
            }, "local");
            
            //FX
            ceremonialFire(ritualId, {"x": 85.8289, "y": 9.8379, "z": -14.8232}, 2.0, 230, true); //SKULL 2rnd Level City side
            ceremonialFire(ritualId, {"x": 85.8613, "y": 9.8379, "z": 12.8450}, 2.0, 230, true); //SKULL 2rnd Level Mount side
            ceremonialFire(ritualId, {"x": 66.0952, "y": -0.5793, "z": -14.7446}, 2.0, 230, true); //SKULL 3rnd Level City side
            ceremonialFire(ritualId, {"x": 66.0952, "y": -0.1597, "z": 12.7881}, 2.0, 230, true); //SKULL 3rnd Level Mount side
            ceremonialFire(ritualId, {"x": -76.6477, "y": -4.0374, "z": -32.9136}, 2.0, 230, true); //Wall Bowl City side
            ceremonialFire(ritualId, {"x": -88.2991, "y": -3.9307, "z": 35.4087}, 2.0, 230, true); //Wall Bowl Mount side
            ceremonialFire(ritualId, {"x": -11.7405, "y": 2.9050, "z": 3.5378}, 1.0, 230, true); //Central pol to wall City Side
            ceremonialFire(ritualId, {"x": -11.7405, "y": 2.9050, "z": 3.5378}, 1.0, 230, true); //Central pol to wall Mount Side
            ceremonialFire(ritualId, {"x": -4.3181, "y": 2.6719, "z": -14.9978}, 1.0, 230, true); //Central pol to city - wall Side
            ceremonialFire(ritualId, {"x": 4.3708, "y": 2.6719, "z": -14.9978}, 1.0, 230, true); //Central pol to city - Temple Side
            ceremonialFire(ritualId, {"x": -40.6765, "y": 2.0295, "z": 3.5693}, 1.0, 230, true); //Central pol Wall Alley City Side
            ceremonialFire(ritualId, {"x": -40.6765, "y": 2.0295, "z": -5.1250}, 1.0, 230, true); //Central pol  Wall Alley Mount Side
        }
    }

    function generatePonctualSound(filename) {
        let distance = Vec3.distance(ritualPosition, MyAvatar.position);
        if (distance < FULL_VOLUME_RADIUS) {
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
                "positional": false,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "localOnly": true,
                "lifetime": 180
            }, "local");
        }
    }

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
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
