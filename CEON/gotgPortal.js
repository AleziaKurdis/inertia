//
//  gotgPortal.js
//
//  Created by Alezia Kurdis, November 6th 2023.
//  Copyright 2023 Overte e.V.
//
//  gotg like space portal & navigation app.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var jsMainFileName = "gotgPortal.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

    //################################# PORTAL LIST #############################################################
   
    var portals;
    if (location.protocol === "hifi") {
       // portals = Script.require(ROOT + "portals_domain.json");
    } else {
        //serverlessReachDestination();
       // portals = Script.require(ROOT + "portals_serverless.json");
    }
    portals = [];
    print("PORTALS: " + JSON.stringify(portals));
    
    for (i = 0; i < portals.length; i++) {
        portals[i].id = Uuid.NULL;
        portals[i].zoneID = Uuid.NULL;
    }

    //###########################################################################################################

    
    var APP_NAME = "SPACE NAV";
    var APP_ICON_INACTIVE = ROOT + "images/icon_template_inactive.png";
    var APP_ICON_ACTIVE = ROOT + "images/icon_template_active.png";
    var appStatus = false;
    var UPDATE_INTERVAL_MS = 200;
    var timer = null;
    var thisPosition;
    var thisEntityID;
    var MIN_DISTANCE_TO_STAY_VISIBLE = 200; //in meters

    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

    var button = tablet.addButton({
        "text": APP_NAME,
        "icon": APP_ICON_INACTIVE,
        "activeIcon": APP_ICON_ACTIVE,
        "sortOrder": 0,
        "captionColor": "#ffae00"
    });
    
    function serverlessReachDestination() {
        var coordinate = getParameterObj();
        MyAvatar.position = coordinate.position;
        MyAvatar.orientation = coordinate.rotation;
    }    
    
    function getParameterObj() {
        var index;
        var objResult = {};
        var tmp = [];
        var thisLocation = location.href;
        var theParam = thisLocation.split("?");
        var items = theParam[1].split("&");
        //print("GOTG thisLocation: " + JSON.stringify(items));
        for (index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            objResult[tmp[0]] = tmp[1];
        }
        var position = {"x": 0, "y": 0, "z": 0};
        var rotation = {"x": 0, "y":0, "z":0, "w":0};
        if (objResult.px !== undefined) {
            position.x = parseFloat(objResult.px);
        }
        if (objResult.py !== undefined) {
            position.y = parseFloat(objResult.py);
        }
        if (objResult.pz !== undefined) {
            position.z = parseFloat(objResult.pz);
        }
        if (objResult.rx !== undefined) {
            rotation.x = parseFloat(objResult.rx);
        }
        if (objResult.ry !== undefined) {
            rotation.y = parseFloat(objResult.ry);
        }
        if (objResult.rz !== undefined) {
            rotation.z = parseFloat(objResult.rz);
        }
        if (objResult.rw !== undefined) {
            rotation.w = parseFloat(objResult.rw);
        } 
        
        return {"position": position, "rotation": rotation};
    }
    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["position"]);
        thisPosition = properties.position;
        thisEntityID = entityID;
        
        if (portals.length !== 0) {
            for (i = 0; i < portals.length; i++) {
                portals[i].zoneID = Entities.addEntity({
                    "position": Vec3.sum(thisPosition, portals[i].localPosition),
                    "name": "JUMP POINT - " + portals[i].Name,
                    "type": "Zone",
                    "shapeType": "Sphere",
                    "dimensions": {"x": 250, "y": 250, "z": 250},
                }, "local");
                
                var id = Entities.addEntity({
                    "type": "Model",
                    "localPosition": {"x": 0, "y": 0, "z": 0},
                    "parentID": portals[i].zoneID,
                    "renderWithZones": [portals[i].zoneID],
                    "name": "FTL-FX",
                    "dimensions": {
                        "x": 117.60910034179688,
                        "y": 107.577880859375,
                        "z": 9.917415618896484
                    },
                    "billboardMode": "full",
                    "grab": {
                        "grabbable": false
                    },
                    "damping": 0,
                    "angularDamping": 0,
                    "modelURL": ROOT + "models/GOTG_FLT_FX.fst",
                    "useOriginalPivot": true
                }, "local");

                id = Entities.addEntity({
                    "type": "Shape",
                    "shape": "Sphere",
                    "localPosition": {"x": 0, "y": 0, "z": 0},
                    "parentID": portals[i].zoneID,
                    "renderWithZones": [portals[i].zoneID],
                    "name": "FTL-JUMP-TRIGGER",
                    "dimensions": {
                        "x": 20,
                        "y": 20,
                        "z": 20
                    },
                    "grab": {
                        "grabbable": false
                    },
                    "visible": false,
                    "description": portals[i].destinationURL,
                    "script": ROOT + "teleport.js"
                }, "local");
                
            }
        }
    }

    this.unload = function(entityID) {
        removeBeacons();
        if (portals.length !== 0) {
            for (i = 0; i < portals.length; i++) {
                if (portals[i].zoneID !== Uuid.NULL) {
                    Entities.deleteEntity(portals[i].zoneID);
                    portals[i].zoneID = Uuid.NULL;
                }
            }
        }
    }

    function removeBeacons() {
        if (timer !== null) {
            Script.clearInterval(timer);
            timer = null;
        }
        var i;
        if (portals.length !== 0) {
            for (i = 0; i < portals.length; i++) {
                if (portals[i].id !== Uuid.NULL) {
                    Entities.deleteEntity(portals[i].id);
                    portals[i].id = Uuid.NULL;
                }
            }
        }
    };

    function showBeacons() {
        timer = Script.setInterval(function () {
            updateBeacons();
        }, UPDATE_INTERVAL_MS);
    }

    function updateBeacons() {
        var i;
        var radius;
        var visible = false;
        var eye = Camera.position;
        var distance, position;
        if (portals.length !== 0) {
            for (i = 0; i < portals.length; i++) {
                position = Vec3.sum(thisPosition, portals[i].localPosition);
                distance = Vec3.distance(position, eye);
                if (distance < MIN_DISTANCE_TO_STAY_VISIBLE) {
                    visible = false;
                } else {
                    visible = true;
                }
                radius = 0.032 * distance;
                dimensions = {"x": 0, "y": 0, "z": 0,};
                if (portals[i].id === Uuid.NULL) {
                    portals[i].id = Entities.addEntity({
                        "type": "Shape",
                        "shape": "sphere",
                        "position": position,
                        "name": "JUMP POINT BEACON",
                        "renderLayer": "front",
                        "primitiveMode": "lines",
                        "grab": {
                            "grabbable": false
                        },
                        "damping": 0,
                        "angularDamping": 0,
                        "collisionless": true,
                        "ignoreForCollisions": true,
                        "color": {
                            "red": 255,
                            "green": 111,
                            "blue": 0
                        },
                        "dimensions": {"x": radius * 2, "y": radius * 2, "z": radius * 2},
                        "visible": visible
                    }, "local");
                } else {
                    Entities.editEntity(portals[i].id, {"dimensions": {"x": radius * 2, "y": radius * 2, "z": radius * 2}, "visible": visible});
                }
            }
        }
    }

    function clicked(){
        var colorCaption;
        if (appStatus === true) {
            removeBeacons();
            colorCaption = "#ffae00";
            appStatus = false;
        }else{
            showBeacons();
            colorCaption = "#000000";
            appStatus = true;
        }

        button.editProperties({
            "isActive": appStatus,
            "captionColor": colorCaption
        });
    }

    button.clicked.connect(clicked);

    function cleanup() {
        tablet.removeButton(button);
    }

    Script.scriptEnding.connect(cleanup);
})
