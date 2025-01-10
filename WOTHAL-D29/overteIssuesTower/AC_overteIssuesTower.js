//
//
//  AC_overteIssuesTower.js
//
//  Created by Alezia Kurdis on January 7th, 2025
//  Copyright 2025 Overte e.V.
//
//  Server side manager for Overte Issues Tower (OIT).
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

print("OIT: start running.");
var jsMainFileName = "AC_overteIssuesTower.js";
var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

var positionZero = { "x": 3384.25, "y": 6059.19, "z": 10164.4}; //<=== SET THE POSITION IN YOUR DOMAIN

var REFRESH_INTERVAL = 1200; //20 minutes in sec.
var updateTimerInterval = REFRESH_INTERVAL * 1000; //20minutes in millisec
var processTimer = 0;

const owner = "overte-org";
const repo = "overte";

var labels = [];
var data = [];
var forFastDeletion = []; 

var STEP_HEIGHT = 0.2;
var PARK_INTERVAL = 19;

var CONSIDERED_AS_OLD_STUFF = 12960000; //15 d24 days

function myTimer(deltaTime) {
    var today = new Date();
    if ((today.getTime() - processTimer) > updateTimerInterval ) {

        getGitHubIssues(1, owner, repo);

        today = new Date();
        processTimer = today.getTime();
    }
}

    function getGitHubIssues(page, owner, repo) {
        const url = "https://api.github.com/repos/" + owner + "/" + repo + "/issues?per_page=100&page=" + page + "&sort=updated&state=open&r=" + Math.floor(Math.random() * 65000);
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
        
        xhr.onreadystatechange = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                var pageData = JSON.parse(xhr.responseText);
                data = data.concat(pageData);
                if(pageData.length > 0) {
                    getGitHubIssues(page + 1, owner, repo);
                } else {
                    processData();
                }
            } else {
                print("OIT: Error: " + xhr.status + " - " + xhr.statusText);
            }
        };

        xhr.send();
    }

    function processData() {
        var tiles = [];
        var i;
        for (i = 0; i < data.length; i++) {
            if (data[i].pull_request === undefined) {
                var label = getLabelDataFrom(data[i].labels);
                var record = {
                    "title": data[i].title,
                    "body": data[i].body,
                    "number": data[i].number,
                    "htmlUrl": data[i].html_url,
                    "creationDate": dateToTimestamp(data[i].created_at),
                    "updateDate": dateToTimestamp(data[i].updated_at),
                    "labels": label.value,
                    "hueLabels": label.hue,
                    "creator": data[i].user.login
                };
                tiles.push(record);
            }
        }
        generateTower(tiles);
        //print("OIT: " + JSON.stringify(tiles));
    }
    
    function generateTower(tilesData) {
        forFastDeletion = [];
        var i;
        var radius = 9;
        var espacement = 4.5;
        var angleRad = 0;
        var corridorFactor = 1.7;
        var coy = 0.0;
        
        var placeArea = 0;
        for (i = 0;i < tilesData.length; i++) {
            
            var numbrePossiblePerRing, cox, coz, relativePosition;

            if ((i%PARK_INTERVAL) === 0 && i !== 0) {
                placeArea++;
                numbrePossiblePerRing = (radius * 2 * Math.PI) / espacement;
                radius = radius + (espacement/numbrePossiblePerRing) * corridorFactor;
                angleRad = angleRad + ((2 * Math.PI)/numbrePossiblePerRing);
                cox = Math.cos(angleRad) * radius;
                coz = Math.sin(angleRad) * radius;
                relativePosition = {"x": cox, "y": coy, "z": coz };
                
                var parkId = Entities.addEntity({
                    "type": "Model",
                    "name": "PARK-" + i,
                    "position": Vec3.sum(positionZero, relativePosition),
                    "rotation": Quat.fromVec3Radians( {"x": 0.0, "y": -angleRad + Math.PI, "z": 0.0} ),
                    "locked": false,
                    "dimensions": {
                        "x": 7.8822,
                        "y": 501.1473,
                        "z": 5.7883
                    },
                    "grab": {
                        "grabbable": false
                    },
                    "shapeType": "static-mesh",
                    "script": ROOT + "areas/area_" + placeArea + ".js",
                    "modelURL": ROOT + "models/PARK.fst",
                    "useOriginalPivot": true,
                    "lifetime": REFRESH_INTERVAL + 1
                }, "domain");
                
                forFastDeletion.push(parkId);
                
                var areaTextId = Entities.addEntity({
                        "type": "Text",
                        "parentID": parkId,
                        "name": "AREA " + placeArea,
                        "dimensions": {
                            "x": 4,
                            "y": 0.9,
                            "z": 0.01
                        },
                        "localPosition": {"x": 0.7, "y": 0, "z": 0},
                        "localRotation": Quat.fromVec3Radians( {"x": -Math.PI/2, "y": Math.PI/2, "z": 0} ),
                        "grab": {
                            "grabbable": false
                        },
                        "textColor": {
                            "red": 255,
                            "green": 200,
                            "blue": 0
                        },                        
                        "text": "AREA " + placeArea,
                        "lineHeight": 0.6,
                        "backgroundAlpha": 0.0,
                        "topMargin": 0.0,
                        "unlit": false,
                        "alignment": "center",
                        "locked": false,
                        "collisionless": true,
                        "ignoreForCollisions": true,
                        "lifetime": REFRESH_INTERVAL + 1
                    }, "domain");

                coy = coy - STEP_HEIGHT;
            }
            
            placeArea++;
            numbrePossiblePerRing = (radius * 2 * Math.PI) / espacement;
            radius = radius + (espacement/numbrePossiblePerRing) * corridorFactor;
            angleRad = angleRad + ((2 * Math.PI)/numbrePossiblePerRing);
            cox = Math.cos(angleRad) * radius;
            coz = Math.sin(angleRad) * radius;
            relativePosition = {"x": cox, "y": coy, "z": coz };
            
            var today = new Date();
            var curTime = today.getTime();
            var hecatePortalModelUrl;
            if (tilesData[i].creationDate >= tilesData[i].updateDate) {
                if (curTime - tilesData[i].updateDate < CONSIDERED_AS_OLD_STUFF) {
                    hecatePortalModelUrl = ROOT + "models/TILE_RED.fst";
                } else {
                    hecatePortalModelUrl = ROOT + "models/TILE_STANDARD.fst";
                }
            } else {
                if (curTime - tilesData[i].updateDate < CONSIDERED_AS_OLD_STUFF) {
                    hecatePortalModelUrl = ROOT + "models/TILE_BLUE.fst";
                } else {
                    hecatePortalModelUrl = ROOT + "models/TILE_STANDARD.fst";
                }
            }
            
            var portalId = Entities.addEntity({
                "type": "Model",
                "name": "ISSUE - " + tilesData[i].number,
                "position": Vec3.sum(positionZero, relativePosition),
                "rotation": Quat.fromVec3Radians( {"x": 0.0, "y": -angleRad + Math.PI, "z": 0.0} ),
                "locked": false,
                "dimensions": {
                    "x": 8.0673,
                    "y": 505.7698,
                    "z": 5.7883
                },
                "grab": {
                    "grabbable": false
                },
                "shapeType": "static-mesh",
                "modelURL": hecatePortalModelUrl,
                "useOriginalPivot": true,
                "lifetime": REFRESH_INTERVAL + 1
            }, "domain");
            
            forFastDeletion.push(portalId);
            
            coy = coy - STEP_HEIGHT;

            if (i === (tilesData.length - 1)) {
                var deadEndId = Entities.addEntity({
                    "type": "Model",
                    "name": "DEADEND",
                    "parentID": portalId,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                    //"position": Vec3.sum(positionZero, relativePosition),
                    //"rotation": Quat.fromVec3Radians( {"x": 0.0, "y": -angleRad + Math.PI, "z": 0.0} ),
                    "locked": false,
                    "dimensions": {
                        "x": 2.9488,
                        "y": 1.2709,
                        "z": 0.1825
                    },
                    "grab": {
                        "grabbable": false
                    },
                    "shapeType": "static-mesh",
                    "modelURL": ROOT + "models/deadend.fbx",
                    "useOriginalPivot": true,
                    "lifetime": REFRESH_INTERVAL + 1
                }, "domain");
            }

        }
    }
    
    function dateToTimestamp(dateString) {
        let date = new Date(dateString);
        return date.getTime();
    }
    
    function getLabelDataFrom(arOfLabels) {
        if (arOfLabels.length > 0) {
            var j;
            var value = "";
            var hue = -1;
            for (j = 0; j < arOfLabels.length; j++) {
                if (j === 0) {
                    value = arOfLabels[j].name;
                    hue = getHueFromHex(arOfLabels[j].color);
                } else {
                    value = value + ", " + arOfLabels[j].name;
                    hue = -1;
                }
            }
            return {"value": value, "hue": hue};
        } else {
            return {"value": "", "hue": -1};
        }
        
    }
    
    function getHueFromHex(hexColor) {
        hexColor = hexColor.replace(/^#/, '');
        const r = parseInt(hexColor.substring(0, 2), 16) / 255;
        const g = parseInt(hexColor.substring(2, 4), 16) / 255;
        const b = parseInt(hexColor.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        
        let hue = 0;

        if (delta !== 0) {
            if (max === r) {
                hue = ((g - b) / delta) % 6;
            } else if (max === g) {
                hue = (b - r) / delta + 2;
            } else {
                hue = (r - g) / delta + 4;
            }
        }

        hue = Math.round(hue * 60);
        if (hue < 0) {
            hue += 360;
        }

        return hue;
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


// ################## CYLCE AND TIME FUNCTIONS ###########################
function GetCurrentCycleValue(cyclelength, cycleduration){
    var today = new Date();
    var TodaySec = today.getTime()/1000;
    var CurrentSec = TodaySec%cycleduration;
    
    return (CurrentSec/cycleduration)*cyclelength;
    
}
// ################## END CYLCE AND TIME FUNCTIONS ###########################

getGitHubIssues(1, owner, repo);
Script.update.connect(myTimer);

Script.scriptEnding.connect(function () {
    var i;
    for (i = 0; i < forFastDeletion.length; i++) {
        Entities.deleteEntity(forFastDeletion[i]);
    }
    forFastDeletion = [];
    
    Script.update.disconnect(myTimer);
});

