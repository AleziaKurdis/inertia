//
//  scene_app.js
//
//  Created by Alezia Kurdis, August 30th 2026.
//  Copyright 2026 Overte e.V.
//
//  Scene application for Nebula-Bazaar.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    const jsMainFileName = "scene_app.js";
    const ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    const APP_NAME = "SCENE";
    const APP_URL = ROOT + "application/scene.html";
    const APP_ICON_INACTIVE = ROOT + "application/icon_inactive.png";
    const APP_ICON_ACTIVE = ROOT + "application/icon_active.png";
    let appStatus = false;
    const ICON_CAPTION_COLOR = "#ffae00";
    let button;
    let isRunning = false;
    let thisEntityID;
    
    let thisPosition;
    const UPDATE_TIMER_INTERVAL = 5000;
    let renderWithZones;
    
    const channel = "nebulaBazaar.application.ak.scene";
    let timestamp = 0;
    const INTERCALL_DELAY = 200; //0.3 sec
    
    let tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    
    let timerStatus = false;
    let timer;

    let spotlights = {
        "L-1": { 
            "id": Uuid.NONE, 
            "localPosition": {
                "x": -8.05615234375,
                "y": 4.3408203125,
                "z": 0.8662109375
            }, 
            "rotation": {
                "w": 0.9281235337257385,
                "x": -0.33780932426452637,
                "y": 0.08972713351249695,
                "z": -0.12814362347126007
            },
            "dimensions": {
                "x": 8.54151439666748,
                "y": 8.54151439666748,
                "z": 9.089690208435059
            },
            "cutoff": 70,
            "hue": -1
        },
        "R-1": { 
            "id": Uuid.NONE, 
            "localPosition": {
                "x": -8.05615234375,
                "y": 4.3408203125,
                "z": -4.47216796875
            }, 
            "rotation": {
                "w": 0.09305079281330109,
                "x": 0.12575092911720276,
                "y": 0.9366482496261597,
                "z": 0.3133981227874756
            },
            "dimensions": {
                "x": 8.54151439666748,
                "y": 8.54151439666748,
                "z": 9.089690208435059
            },
            "cutoff": 70,
            "hue": -1
        },
        "L0": { 
            "id": Uuid.NONE, 
            "localPosition": {
                "x": -5.36572265625,
                "y": 4.3408203125,
                "z": -0.01025390625
            }, 
            "rotation": {
                "w": 0.8870108127593994,
                "x": -0.4617486000061035,
                "y": 0,
                "z": 0
            },
            "dimensions": {
                "x": 8.54151439666748,
                "y": 8.54151439666748,
                "z": 9.089690208435059
            },
            "cutoff": 70,
            "hue": -1
        },
        "R0": { 
            "id": Uuid.NONE, 
            "localPosition": {
                "x": -5.36572265625,
                "y": 4.3408203125,
                "z": -3.23046875
            }, 
            "rotation": {
                "w": 0,
                "x": 0,
                "y": 0.887010931968689,
                "z": 0.4617486298084259
            },
            "dimensions": {
                "x": 8.54151439666748,
                "y": 8.54151439666748,
                "z": 9.089690208435059
            },
            "cutoff": 70,
            "hue": -1
        },
        "L+1": { 
            "id": Uuid.NONE, 
            "localPosition": {
                "x": -3.607421875,
                "y": 4.3408203125,
                "z": 0.1787109375
            }, 
            "rotation": {
                "w": 0.8853564858436584,
                "x": -0.4608874022960663,
                "y": 0.028189081698656082,
                "z": -0.05415072292089462
            },
            "dimensions": {
                "x": 6.963106632232666,
                "y": 6.963106632232666,
                "z": 9.089690208435059
            },
            "cutoff": 50,
            "hue": -1
        },
        "R+1": { 
            "id": Uuid.NONE, 
            "localPosition": {
                "x": -3.607421875,
                "y": 4.3408203125,
                "z": -3.23046875
            }, 
            "rotation": {
                "w": 0.028189077973365784,
                "x": 0.054150719195604324,
                "y": 0.8853564262390137,
                "z": 0.4608873426914215
            },
            "dimensions": {
                "x": 6.963106632232666,
                "y": 6.963106632232666,
                "z": 9.089690208435059
            },
            "cutoff": 50,
            "hue": -1
        },
        "FC": { 
            "id": Uuid.NONE, 
            "localPosition": {
                "x": -1.31640625,
                "y": 5.2529296875,
                "z": -1.62060546875
            }, 
            "rotation": {
                "w": -0.704416036605835,
                "x": 0.704416036605835,
                "y": -0.061628419905900955,
                "z": 0.06162843480706215
            },
            "dimensions": {
                "x": 3.773848295211792,
                "y": 3.773848295211792,
                "z": 12.21242904663086
            },
            "cutoff": 18,
            "hue": -1
        }
    };
    
    function updateSpot(name, hue) {
        const spot = spotlights[name];
        print("SPOT: " + JSON.stringify(spot));
        
        if (spot.id !== Uuid.NONE && hue === -1) {
            Entities.deleteEntity(spot.id);
            spotlights[name].id = Uuid.NONE;
            spotlights[name].hue = -1;
            return;
        }
        if (spot.id !== Uuid.NONE) {
            Entities.deleteEntity(spot.id);
            spotlights[name].id = Uuid.NONE;
            spotlights[name].hue = -1;
            return;
        }
        
        let intensity = 18.0;
        if (name === "FC") {
            intensity = 24.0;
        }
        spotlights[name].hue = hue;
        spotlights[name].id = Entities.addEntity({
            "angularDamping": 0,
            "cutoff": spot.cutoff,
            "damping": 0,
            "dimensions": spot.dimensions,
            "exponent": 1,
            "falloffRadius": 3.618,
            "grab": {
                "grabbable": false
            },
            "intensity": intensity,
            "isSpotlight": true,
            "name": "FC+1",
            "parentID": thisEntityID,
            "localPosition": spot.localPosition,
            "renderWithZones": renderWithZones,
            "rotation": spot.rotation,
            "type": "Light"
        }, "local");
        
    }

    function clearSpotLights() {
        for (let name in spotlights) {
            if (spotlights[name].id !== Uuid.NONE) {
                Entities.deleteEntity(spotlights[name].id);
                spotlights[name].id = Uuid.NONE;
                spotlights[name].hue = -1;
            }
        }
    }
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        let properties = Entities.getEntityProperties(entityID, ["position", "renderWithZones"]);
        thisPosition = properties.position;
        renderWithZones = properties.renderWithZones;
        
        
        timer = Script.setInterval(checkDistance, UPDATE_TIMER_INTERVAL);
        timerStatus = true;
    }

    this.unload = function(entityID) {
        cleanup();
    }

    function checkDistance() {
        if (Vec3.distance(MyAvatar.position, thisPosition) > 30) {
            if (isRunning) {
                tablet.screenChanged.disconnect(onScreenChanged);
                if (button) {
                    button.clicked.disconnect(clicked);
                    tablet.removeButton(button);
                    button = null;
                }
                isRunning = false;
            }
        } else {
            if (!isRunning) {
                tablet.screenChanged.connect(onScreenChanged);

                button = tablet.addButton({
                    "text": APP_NAME,
                    "icon": APP_ICON_INACTIVE,
                    "activeIcon": APP_ICON_ACTIVE,
                    "sortOrder": 0,
                    "captionColor": ICON_CAPTION_COLOR
                });
                isRunning = true;
                
                button.clicked.connect(clicked);
            }
        }
    }

    function onAppWebEventReceived(message) {
        if (typeof message === "string") {
            var d = new Date();
            var n = d.getTime();

            var instruction;
            try {
                instruction = JSON.parse(message);
            } catch(e) {
                return;
            }
            
            if (instruction.channel === channel) {
                if (instruction.action === "SET_SPOT" && (n - timestamp) > INTERCALL_DELAY) {
                    d = new Date();
                    timestamp = d.getTime();
                    updateSpot(instruction.name, instruction.hue);
                } else if (instruction.action === "UI_READY") {
                    var messageToSent = {
                        "channel": channel,
                        "action": "CURRENT_STATE",
                        "data": spotlights
                    };
                    tablet.emitScriptEvent(JSON.stringify(messageToSent));
                }
            }
        }
    }

    function clicked(){
        var colorCaption;
        if (appStatus === true) {
            tablet.webEventReceived.disconnect(onAppWebEventReceived);
            tablet.gotoHomeScreen();
            colorCaption = ICON_CAPTION_COLOR;
            appStatus = false;
        }else{
            tablet.gotoWebScreen(APP_URL);
            tablet.webEventReceived.connect(onAppWebEventReceived);
            colorCaption = "#000000";
            appStatus = true;
        }

        button.editProperties({
            "isActive": appStatus,
            "captionColor": colorCaption
        });
    }

    function onScreenChanged(type, url) {
        var colorCaption;
        if (type === "Web" && url.indexOf(APP_URL) !== -1) {
            colorCaption = "#000000";
            appStatus = true;
        } else {
            colorCaption = ICON_CAPTION_COLOR;
            appStatus = false;
        }
        
        button.editProperties({
            isActive: appStatus,
            captionColor: colorCaption
        });
    }

    function onDomainChanged(domain) {
        cleanup();
        Window.domainChanged.disconnect(onDomainChanged);
    }

    Window.domainChanged.connect(onDomainChanged);

    function cleanup() {
        clearSpotLights();
        if (appStatus) {
            tablet.gotoHomeScreen();
            tablet.webEventReceived.disconnect(onAppWebEventReceived);
            appStatus = false;
        }
        if (isRunning) {
            tablet.screenChanged.disconnect(onScreenChanged);
            if (button) {
                button.clicked.disconnect(clicked);
                tablet.removeButton(button);
                button = null;
            }
            isRunning = false;
        }
        if (timerStatus) {
            Script.clearInterval(timer);
            timerStatus = false;
        }
    }

    Script.scriptEnding.connect(cleanup);
})
