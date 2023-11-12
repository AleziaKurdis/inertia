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
        portals = Script.require(ROOT + "gotgPortalAssets/portals_domain.json");
    } else {
        serverlessReachDestination();
        portals = Script.require(ROOT + "gotgPortalAssets/portals_serverless.json");
    }
    
    for (i = 0; i < portals.length; i++) {
        portals[i].id = Uuid.NULL;
        portals[i].beaconTextID = Uuid.NULL;
        portals[i].zoneID = Uuid.NULL;
    }

    //###########################################################################################################

    
    var APP_NAME = "SPACE NAV";
    var APP_ICON_INACTIVE = ROOT + "gotgPortalAssets/icon_template_inactive.png";
    var APP_ICON_ACTIVE = ROOT + "gotgPortalAssets/icon_template_active.png";
    var appStatus = false;
    var UPDATE_INTERVAL_MS = 200;
    var timer = null;
    var thisPosition;
    var thisEntityID;
    var MIN_DISTANCE_TO_STAY_VISIBLE = 200; //in meters
    var ICON_CAPTION_COLOR = "#ffae00";
    var HUD_COLOR = { "red": 130, "green": 211, "blue": 255 };
    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

    var button = tablet.addButton({
        "text": APP_NAME,
        "icon": APP_ICON_INACTIVE,
        "activeIcon": APP_ICON_ACTIVE,
        "sortOrder": 0,
        "captionColor": ICON_CAPTION_COLOR
    });
    
    function serverlessReachDestination() {
        var coordinate = getParameterObj();
        if (!coordinate.isInvalide) {
            MyAvatar.position = coordinate.position;
            MyAvatar.orientation = coordinate.rotation;
        }
    }
    
    function getParameterObj() {
        var index;
        var obj;
        var objResult = {};
        var tmp;
        var thisLocation = location.href;
        var theParam = thisLocation.split("?");
        if (theParam.length < 2) {
            return { "isInvalide": true };
        } else {
            var items = theParam[1].split("&");
            //print("ITEMS: " + JSON.stringify(items));
            var position = {"x": 0, "y": 0, "z": 0};
            var rotation = {"x": 0, "y":0, "z":0, "w":0};
            var isInvalide = false;
            if ( items.length !== 0 ) {
                for (index = 0; index < items.length; index++) {
                    tmp = items[index].split("=");
                    objResult[tmp[0]] = tmp[1];
                }
                if (objResult.px !== undefined) {
                    position.x = parseFloat(objResult.px);
                } else { isInvalide = true; }
                if (objResult.py !== undefined) {
                    position.y = parseFloat(objResult.py);
                } else { isInvalide = true; }
                if (objResult.pz !== undefined) {
                    position.z = parseFloat(objResult.pz);
                } else { isInvalide = true; }
                if (objResult.rx !== undefined) {
                    rotation.x = parseFloat(objResult.rx);
                } else { isInvalide = true; }
                if (objResult.ry !== undefined) {
                    rotation.y = parseFloat(objResult.ry);
                } else { isInvalide = true; }
                if (objResult.rz !== undefined) {
                    rotation.z = parseFloat(objResult.rz);
                } else { isInvalide = true; }
                if (objResult.rw !== undefined) {
                    rotation.w = parseFloat(objResult.rw);
                } else { isInvalide = true; }
            } else {isInvalide = true;}
            return { "position": position, "rotation": rotation, "isInvalide": isInvalide}; 
        }
    }
    
    this.preload = function(entityID) {
        var id;
        var properties = Entities.getEntityProperties(entityID, ["position"]);
        thisPosition = properties.position;
        thisEntityID = entityID;
        
        if (portals.length !== 0) {
            for (i = 0; i < portals.length; i++) {
                portals[i].zoneID = Entities.addEntity({
                    "position": Vec3.sum(thisPosition, portals[i].localPosition),
                    "name": "JUMP POINT - " + portals[i].name,
                    "type": "Zone",
                    "shapeType": "Sphere",
                    "dimensions": {"x": 250, "y": 250, "z": 250},
                }, "local");
                
                id = Entities.addEntity({
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
                    "modelURL": ROOT + "gotgPortalAssets/GOTG_FLT_FX.fst",
                    "useOriginalPivot": true
                }, "local");
                
                var matId = addSkyMaterial(id, [portals[i].zoneID], portals[i].destinationSkyUrl);
                matId = addLightMaterial(id, [portals[i].zoneID]);
                
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
                    "script": ROOT + "gotgPortalAssets/teleport.js"
                }, "local");
                
            }
        }
    }

    function addSkyMaterial(id, rwz, skyUrl) {
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "SKY",
                    "albedo": [1, 1, 1],
                    "albedoMap": skyUrl,
                    "metallic": 0.001,
                    "roughness": 1,
                    "emissiveMap": skyUrl,
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };
        var matId = Entities.addEntity({
            "type": "Material",
            "parentID": id,
            "renderWithZones": rwz,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "OTHER SKY MATERIAL",
            "materialURL": "materialData",
            "priority": 3,
            "parentMaterialName": "mat::SKY",
            "materialData": JSON.stringify(materialContent)
        }, "local");
        return matId;
    }

    function addLightMaterial(id, rwz) {
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "LIGHT",
                    "albedo": [1, 1, 1],
                    "metallic": 0.001,
                    "roughness": 1,
                    "emissive": [2,2,2],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };
        var matId = Entities.addEntity({
            "type": "Material",
            "parentID": id,
            "renderWithZones": rwz,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "plasma-material",
            "materialURL": "materialData",
            "priority": 3,
            "parentMaterialName": "mat::LIGHT",
            "materialData": JSON.stringify(materialContent),
            "script": ROOT + "gotgPortalAssets/portalMaterialFX.js"
        }, "local");
        return matId;
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
                        "color": HUD_COLOR,
                        "dimensions": {"x": radius * 2, "y": radius * 2, "z": radius * 2},
                        "visible": visible
                    }, "local");
                    
                    portals[i].beaconTextID = Entities.addEntity({
                        "type": "Text",
                        "grab": {
                            "grabbable": false
                        },
                        "text": portals[i].name,
                        "lineHeight": radius * 0.3, 
                        "dimensions": {"x": radius * 3, "y": radius * 0.5, "z": 0.01},
                        "textColor": HUD_COLOR,
                        "backgroundAlpha": 0,
                        "unlit": true,
                        "alignment": "center",
                        "parentID": portals[i].id,
                        "name": "JUMP POINT BEACON TEXT",
                        "renderLayer": "front",
                        "billboardMode": "full",
                        "localPosition": {"x": 0, "y": radius * 1.3, "z": 0},
                        "visible": visible
                    }, "local");
                } else {
                    Entities.editEntity(portals[i].id, {
                        "dimensions": {"x": radius * 2, "y": radius * 2, "z": radius * 2}, 
                        "visible": visible
                        });
                    Entities.editEntity(portals[i].beaconTextID, {
                        "localPosition": {"x": 0, "y": radius * 1.3, "z": 0}, 
                        "lineHeight": radius * 0.3, 
                        "dimensions": {"x": radius * 3, "y": radius * 0.5, "z": 0.01}
                        "visible": visible
                        });
                }
            }
        }
    }

    function clicked(){
        var colorCaption;
        if (appStatus === true) {
            removeBeacons();
            colorCaption = ICON_CAPTION_COLOR;
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

//######################## CYCLE & COLOR #############################
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

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}
//######################## END CYCLE & COLOR #############################


    button.clicked.connect(clicked);

    function cleanup() {
        tablet.removeButton(button);
    }

    Script.scriptEnding.connect(cleanup);
})
