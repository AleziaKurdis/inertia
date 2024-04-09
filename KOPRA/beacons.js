//
//  beacons.js
//
//  Created by Alezia Kurdis, April 3rd 2024.
//  Copyright 2024 Overte e.V.
//
//  draw and hide area localization beacons.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    let jsMainFileName = "beacons.js";
    let ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    const CHANNEL = "overte.ak.intertia.kopra.beacons";
    
    //################################# AREA LIST #############################################################
    let areas = [
        {"position":{"x":-3831.833984375,"y":-3636.7666015625,"z":-3829.380859375},"hue":75,"name":"1"},
        {"position":{"x":-4348.04931640625,"y":-4032.705078125,"z":-3737.44921875},"hue":0,"name":"2"},
        {"position":{"x":-3188.366943359375,"y":-3976.20072265625,"z":-4515.3251953125},"hue":120,"name":"3"},
        {"position":{"x":-3640.874267578125,"y":-4556.0146875,"z":-4571.90380859375},"hue":320,"name":"4"},
        {"position":{"x":-4567.25732421875,"y":-4202.46923828125,"z":-4232.50537109375},"hue":210,"name":"5"},
        {"position":{"x":-4440.0390625,"y":-4287.2900390625,"z":-3299.052734375},"hue":30,"name":"6"},
        {"position":{"x":-3831.78173828125,"y":-3905.453408203125,"z":-4479.99365234375},"hue":260,"name":"7"},
        {"position":{"x":-3683.388671875,"y":-4244.884765625,"z":-3864.7763671875},"hue":180,"name":"8"},
        {"position":{"x":-5062.1962890625,"y":-3806.46875,"z":-4352.7626953125},"hue":290,"name":"9"}
    ];
    const COOR_REF_VECTOR = {"x":-4000,"y":-4000,"z":-4000};
    
    
    for (i = 0; i < areas.length; i++) {
        areas[i].id = Uuid.NULL;
        areas[i].beaconTextID = Uuid.NULL;
    }    
    //###########################################################################################################

    const UPDATE_INTERVAL_MS = 200;
    let timer = null;
    let thisPosition;
    let thisEntityID;
    let renderWithZones;
    const MIN_DISTANCE_TO_STAY_VISIBLE = 200; //in meters

    
    this.preload = function(entityID) {
        let properties = Entities.getEntityProperties(entityID, ["position", "renderWithZones"]);
        thisPosition = properties.position;
        thisEntityID = entityID;
        renderWithZones = properties.renderWithZones;
        Messages.subscribe(CHANNEL);
        Messages.messageReceived.connect(onMessageReceived);
    }

    this.unload = function(entityID) {
        removeBeacons();
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(CHANNEL);
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel === CHANNEL && sender === MyAvatar.sessionUUID) {
            let objMessage = JSON.parse(message);
            if (objMessage.action === "SHOW_BEACONS") {
                showBeacons(objMessage.emphasisNo, objMessage.showOnlyEmphasis, objMessage.duration);
            } else if (objMessage.action === "HIDE_BEACONS") {
                removeBeacons();
            }
        }
    }

    function removeBeacons() {
        if (timer !== null) {
            Script.clearInterval(timer);
            timer = null;
        }
        let i;
        if (areas.length !== 0) {
            for (i = 0; i < areas.length; i++) {
                if (areas[i].id !== Uuid.NULL) {
                    Entities.deleteEntity(areas[i].id);
                    areas[i].id = Uuid.NULL;
                }
            }
        }
    };

    function showBeacons(emphasisNo, showOnlyEmphasis, duration) {
        let count = Math.round(duration/(UPDATE_INTERVAL_MS/1000));
        timer = Script.setInterval(function () {
            updateBeacons(emphasisNo, showOnlyEmphasis);
            count = count -1;
            if (count < 0) {
                removeBeacons();
            }
        }, UPDATE_INTERVAL_MS);
    }

    function updateBeacons(emphasisNo, showOnlyEmphasis) {
        let i;
        let radius;
        let visible = false;
        let eye = Camera.position;
        let distance, position, color, innerRadius, dimFactor, distFactor;
        if (areas.length !== 0) {
            for (i = 0; i < areas.length; i++) {
                if ((emphasisNo === areas[i].name && showOnlyEmphasis) || !showOnlyEmphasis) {
                    position = Vec3.sum(thisPosition, Vec3.subtract(areas[i].position, COOR_REF_VECTOR));
                    distance = Vec3.distance(position, eye);
                    if (distance < MIN_DISTANCE_TO_STAY_VISIBLE) {
                        visible = false;
                    } else {
                        visible = true;
                    }
                    distFactor = 1 - ((distance-200)/2000);
                    if (distFactor > 1) {
                        distFactor = 1;
                    }
                    if (distFactor < 0.3) {
                        distFactor = 0.3;
                    }
                    radius = (0.032 * distance) * distFactor;
                    dimensions = {"x": 0, "y": 0, "z": 0};
                    color = hslToRgb(areas[i].hue/360, 1, 0.5);
                    if (emphasisNo === areas[i].name) {
                        innerRadius = 0.60 + (Math.floor(GetCurrentCycleValue(2, 0.4)) * 0.35);
                        dimFactor = 3;
                    } else {
                        innerRadius = 0.80 + (Math.floor(GetCurrentCycleValue(2, 0.4)) * 0.15);
                        dimFactor = 2;
                    }
                    
                    if (areas[i].id === Uuid.NULL) {
                        areas[i].id = Entities.addEntity({
                            "type": "Gizmo",
                            "gizmoType": "ring",
                            "position": position,
                            "renderWithZones": renderWithZones,
                            "name": "BEACON " + areas[i].name,
                            "renderLayer": "front",
                            "primitiveMode": "solid",
                            "grab": {
                                "grabbable": false
                            },
                            "dimensions": {"x": radius * dimFactor, "y": radius * dimFactor, "z": radius * dimFactor},
                            "visible": visible,
                            "ring": {
                                "innerRadius": innerRadius,
                                "innerStartColor": {
                                    "red": color[0],
                                    "green": color[1],
                                    "blue": color[2]
                                },
                                "innerEndColor": {
                                    "red": color[0],
                                    "green": color[1],
                                    "blue": color[2]
                                },
                                "outerStartColor": {
                                    "red": color[0],
                                    "green": color[1],
                                    "blue": color[2]
                                },
                                "outerEndColor": {
                                    "red": color[0],
                                    "green": color[1],
                                    "blue": color[2]
                                },
                                "outerStartAlpha": 0.0,
                                "outerEndAlpha": 0.0,
                                "innerStartAlpha": 0.9,
                                "innerEndAlpha": 0.9
                            },
                            "billboardMode": "full"
                        }, "local");
                        makeUnlit(areas[i].id);
                        
                        areas[i].beaconTextID = Entities.addEntity({
                            "type": "Text",
                            "grab": {
                                "grabbable": false
                            },
                            "text": areas[i].name,
                            "lineHeight": radius * 1.2, 
                            "dimensions": {"x": radius * 2, "y": radius * 1.2, "z": 0.01},
                            "textColor": {
                                "red": color[0],
                                "green": color[1],
                                "blue": color[2]
                            },
                            "backgroundAlpha": 0,
                            "unlit": true,
                            "alignment": "center",
                            "parentID": areas[i].id,
                            "name": "Beacon Text " + areas[i].name,
                            "renderLayer": "front",
                            "billboardMode": "full",
                            "localPosition": {"x": 0, "y": 0, "z": 0},
                            "visible": visible
                        }, "local");
                    } else {
                        Entities.editEntity(areas[i].id, {
                            "dimensions": {"x": radius * dimFactor, "y": radius * dimFactor, "z": radius * dimFactor}, 
                            "visible": visible,
                            "ring": {
                                "innerRadius": innerRadius
                            }
                        });
                    Entities.editEntity(areas[i].beaconTextID, {
                            "lineHeight": radius * 1.2, 
                            "dimensions": {"x": radius * 2, "y": radius * 1.2, "z": 0.01},
                            "visible": visible
                        });
                    }
                }
            }
        }
    }

    function makeUnlit(id) {
        var materialData = "{\n  \"materialVersion\": 1,\n  \"materials\": [\n    {\n      \"name\": \"0\",\n      \"defaultFallthrough\": true,\n      \"unlit\": true,\n      \"model\": \"hifi_pbr\"\n    }\n  ]\n}";
        var materialEntityID = Entities.addEntity({
            "type": "Material",
            "parentID": id,
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "name": "Unlit-material",
            "parentMaterialName": "0",
            "materialURL": "materialData",
            "priority": 1,
            "materialMappingMode": "uv",
            "ignorePickIntersection": true,
            "materialData": materialData
        }, "local");
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
        let r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            let hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function GetCurrentCycleValue(cyclelength, cycleduration){
		let today = new Date();
		let TodaySec = today.getTime()/1000;
		let CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}
})
