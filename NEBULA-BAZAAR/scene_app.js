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
                "y": 4.6,
                "z": 1.375
            }, 
            "rotation": {"x":0.7071068286895752,"y":0,"z":0,"w":-0.7071068286895752},
            "dimensions": {"x":9.914294242858887,"y":9.914294242858887,"z":9.914294242858887},
            "cutoff": 90,
            "hue": -1, 
            "fogLocalPosition": {
                "x": 0.4272,
                "y": 1.1079,
                "z": -2.9316
            },
            "fogActive": false
        },
        "R-1": { 
            "id": Uuid.NONE, 
            "localPosition": {
                "x": -8.05615234375,
                "y": 4.6,
                "z": -4.032
            }, 
            "rotation": {"x":0.7071068286895752,"y":0,"z":0,"w":-0.7071068286895752},
            "dimensions": {"x":9.914294242858887,"y":9.914294242858887,"z":9.914294242858887},
            "cutoff": 90,
            "hue": -1, 
            "fogLocalPosition": {
                "x": 0.4561,
                "y": -0.7217,
                "z": -2.9702
            },
            "fogActive": false
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
            "hue": -1, 
            "fogLocalPosition": {
                "x": 0.4121,
                "y": -1.5864,
                "z": -2.6157
            },
            "fogActive": false
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
            "hue": -1, 
            "fogLocalPosition": {
                "x": -0.2334,
                "y": -1.5396,
                "z": -2.6738
            },
            "fogActive": false
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
            "hue": -1, 
            "fogLocalPosition": {
                "x": 0.4224,
                "y": -1.2090,
                "z": -2.9932
            },
            "fogActive": false
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
            "hue": -1, 
            "fogLocalPosition": {
                "x": -0.1563,
                "y": -1.1387,
                "z": -3.0288
            },
            "fogActive": false
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
            "hue": -1, 
            "fogLocalPosition": {
                "x": -0.1084,
                "y": -0.0023,
                "z": -4.1631
            },
            "fogActive": false
        }
    };
    
    function updateSpot(name, hue, isFog) {
        spotlights[name].fogActive = isFog;
        const spot = spotlights[name];
        //print("SPOT: " + JSON.stringify(spot));
        
        if (spot.id !== Uuid.NONE && hue === -1) {
            Entities.deleteEntity(spot.id);
            spotlights[name].id = Uuid.NONE;
            spotlights[name].hue = -1;
            return;
        }
        if (spot.id !== Uuid.NONE) {
            Entities.deleteEntity(spot.id);
        }
        
        let intensity = 18.0;
        if (name === "FC") {
            intensity = 24.0;
        }
        if (hue === 888) {
            hue = spotlights[name].hue;
        } else {
            spotlights[name].hue = hue;
        }
        let color = [0,0,0];
        if (hue !== -1) {
            if (hue === 999) {
                color = [255,255,255];
            } else {
                color = hslToRgb(hue/360, 1, 0.5);
            }
        }
        let isSpotlight = true;
        if (spot.cutoff === -1) {
            isSpotlight = false;
        }
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
            "isSpotlight": isSpotlight,
            "name": name,
            "parentID": thisEntityID,
            "color": {
                "red": color[0],
                "green": color[1],
                "blue": color[2]
            },
            "localPosition": spot.localPosition,
            "renderWithZones": renderWithZones,
            "rotation": spot.rotation,
            "type": "Light"
        }, "local");
        
        if (isFog) {
            let size = 4;
            if (name === "FC") {
                size = 3;
            }
            
            let fogID = Entities.addEntity({
                "parentID": spotlights[name].id,
                "renderWithZones": renderWithZones,
                "accelerationSpread": {
                    "x": 0,
                    "y": 0.009999999776482582,
                    "z": 0
                },
                "alpha": 0.019999999552965164,
                "alphaFinish": 0,
                "alphaStart": 0,
                "angularDamping": 0,
                "azimuthFinish": 3.140000104904175,
                "color": {
                    "blue": color[2],
                    "green": color[1],
                    "red": color[0]
                },
                "colorFinish": {
                    "blue": 0,
                    "green": 0,
                    "red": 0
                },
                "colorStart": {
                    "blue": 0,
                    "green": 0,
                    "red": 0
                },
                "damping": 0,
                "dimensions": {
                    "x": 9.600000381469727,
                    "y": 9.600000381469727,
                    "z": 9.600000381469727
                },
                "emitAcceleration": {
                    "x": 0,
                    "y": 0.009999999776482582,
                    "z": 0
                },
                "emitDimensions": {
                    "x": size,
                    "y": 0.5,
                    "z": size
                },
                "emitOrientation": {
                    "w": 1,
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "emitRadiusStart": 0,
                "emitRate": 10,
                "emitSpeed": 0,
                "grab": {
                    "grabbable": false
                },
                "lifespan": 10,
                "maxParticles": 100,
                "name": "fog " + name,
                "particleRadius": 1.5,
                "polarFinish": 3.140000104904175,
                "radiusFinish": 2.5,
                "radiusSpread": 0.30000001192092896,
                "radiusStart": 0.8500000238418579,
                "shapeType": "ellipsoid",
                "speedSpread": 0,
                "spinFinish": 0.17000000178813934,
                "spinSpread": 0.17000000178813934,
                "spinStart": -0.17000000178813934,
                "textures": ROOT + "images/fog.png",
                "type": "ParticleEffect",
                "rotation": Quat.IDENTITY,
                "localPosition": spot.fogLocalPosition
            }, "local");
        }
        
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
                    updateSpot(instruction.name, instruction.hue, instruction.fogActive);
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
    function hslToRgb(h, s, l) {
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
