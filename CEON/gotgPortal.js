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
    var portals = [
        {"name": "SANCTUARY", "id": Uuid.NULL, "localPosition": {"x": 906.3857421875,"y": 205.67919921875,"z":-200.65283203125}}
    ];
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

    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["position"]);
        thisPosition = properties.position;
        thisEntityID = entityID;
    }

    this.unload = function(entityID) {
        removeBeacons();
    }

    function removeBeacons() {
        if (timer !== null) {
            Script.clearInterval(timer);
            timer = null;
        }
        var i;
        for (i = 0; i < portals.length; i++) {
            if (portals[i].id !== Uuid.NULL) {
                Entities.deleteEntity(portals[i].id);
                portals[i].id = Uuid.NULL;
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

    function clicked(){
        if (appStatus === true) {
            removeBeacons();
            appStatus = false;
        }else{
            showBeacons();
            appStatus = true;
        }

        button.editProperties({
            isActive: appStatus
        });
    }

    button.clicked.connect(clicked);

    function cleanup() {
        tablet.removeButton(button);
    }

    Script.scriptEnding.connect(cleanup);
})
