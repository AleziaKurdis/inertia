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

var positionZero = { "x": -8000, "y": -8000, "z": -8000}; //<=== SET THE POSITION IN YOUR DOMAIN

var REFRESH_INTERVAL = 14400; //4h in sec.
var updateTimerInterval = REFRESH_INTERVAL * 1000; // in millisec
var processTimer = 0;

const owner = "overte-org";
const repo = "overte";

var labels = [];
var data = [];
var forFastDeletion = []; 

var STEP_HEIGHT = 0.2;
var PARK_INTERVAL = 19;

var LIMIT_BLUE_90DAYS = 3600 * 24 * 90 * 1000;
var LIMIT_ORANGE_1YEAR = 3600 * 24 * 365 * 1000;
var LIMIT_GOLD_2YEARS = 3600 * 24 * 365 * 2 * 1000;
var LIMIT_SILVER_3YEARS = 3600 * 24 * 365 * 3 * 1000;

function myTimer(deltaTime) {
    var today = new Date();
    if ((today.getTime() - processTimer) > updateTimerInterval ) {

        data = [];
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
                    "labels": label,
                    "creator": data[i].user.login
                };
                tiles.push(record);
            }
        }
        generateTower(tiles);
        print("OIT: Number of Tiles found: " + tiles.length);
    }
    
    function generateTower(tilesData) {
        EntityViewer.queryOctree();
        forFastDeletion = [];
        var zoneID = genVisibilityZone();
        forFastDeletion.push(zoneID);
        var renderWithZones = [];
        renderWithZones.push(zoneID);
        var i;
        var radius = 9;
        var espacement = 4.5;
        var angleRad = 0;
        var corridorFactor = 1.7;
        var coy = 0.0;
        var currentYears = 0;
        var placeArea = 0;
        var currentsubVisibilityZoneID;
        var subRenderWithZones = [];
        
        for (i = 0;i < tilesData.length; i++) {
            
            var numbrePossiblePerRing, cox, coz, relativePosition;
            
            if (i%100 === 0) {
                currentsubVisibilityZoneID = genSubVisibilityZone(coy);
                forFastDeletion.push(currentsubVisibilityZoneID);
                subRenderWithZones = [];
                subRenderWithZones.push(currentsubVisibilityZoneID);
            }
            
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
                    "lifetime": REFRESH_INTERVAL + 1,
                    "renderWithZones": renderWithZones
                }, "domain");
                EntityViewer.queryOctree();
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
                    "lifetime": REFRESH_INTERVAL + 1,
                    "renderWithZones": renderWithZones
                }, "domain");
                EntityViewer.queryOctree();
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



            hecatePortalModelUrl = ROOT + "models/TILE_BLUE.fst";
            var eventToSet = "";
            if (curTime - tilesData[i].updateDate < LIMIT_BLUE_90DAYS) {
                hecatePortalModelUrl = ROOT + "models/TILE_BLUE.fst";
                currentYears = 0;
            } else if (curTime - tilesData[i].updateDate < LIMIT_ORANGE_1YEAR) {
                if (currentYears === 0) {
                    eventToSet = "1YEAR";
                }
                hecatePortalModelUrl = ROOT + "models/TILE_ORANGE.fst";
                currentYears = 1;
            } else if (curTime - tilesData[i].updateDate < LIMIT_GOLD_2YEARS) {
                if (currentYears === 1) {
                    eventToSet = "2YEARS";
                }
                hecatePortalModelUrl = ROOT + "models/TILE_GOLD.fst";
                currentYears = 2;
            } else if (curTime - tilesData[i].updateDate < LIMIT_SILVER_3YEARS) {
                if (currentYears === 2) {
                    eventToSet = "3YEARS";
                }                
                hecatePortalModelUrl = ROOT + "models/TILE_SILVER.fst";
                currentYears = 3;
            } else {
                if (currentYears === 3) {
                    eventToSet = "4YEARS";
                }                 
                hecatePortalModelUrl = ROOT + "models/TILE_BLACK.fst";
                currentYears = 4;
            }

            if (tilesData[i].creationDate >= tilesData[i].updateDate) { 
                hecatePortalModelUrl = ROOT + "models/TILE_RED.fst";
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
                "lifetime": REFRESH_INTERVAL + 1,
                "renderWithZones": renderWithZones
            }, "domain");
            EntityViewer.queryOctree();
        
            //ISSUE NUMBER text
            var issueNumberPortalId = Entities.addEntity({
                "type": "Text",
                "parentID": portalId,
                "locked": false,
                "name": "PORTAL_NUMBER_TEXT - " + tilesData[i].number,
                "dimensions": {
                    "x": 2.4119091033935547,
                    "y": 0.35,
                    "z": 0.009999999776482582
                },
                "localRotation": {
                    "x": 0,
                    "y": 0.7071067690849304,
                    "z": 0,
                    "w": 0.7071067690849304
                },
                "localPosition": {
                    "x": 1.28,
                    "y": 4.70,
                    "z": 0
                },
                "grab": {
                    "grabbable": false
                },
                "text": tilesData[i].number,
                "lineHeight": 0.3,
                "backgroundAlpha": 0.7,
                "bottomMargin": 0.05,
                "unlit": true,
                "textEffectThickness": 0.23999999463558197,
                "alignment": "center",
                "verticalAlignment": "center",
                "textColor": {"red": 247, "green": 88, "blue": 30},
                "renderWithZones": subRenderWithZones
            },"domain");
            EntityViewer.queryOctree();

            var issueTitlePortalId = Entities.addEntity({
                "type": "Text",
                "parentID": portalId,
                "locked": false,
                "name": "PORTAL_TITLE_TEXT - " + tilesData[i].number,
                "dimensions": {
                    "x": 2.4119091033935547,
                    "y": 0.96,
                    "z": 0.009999999776482582
                },
                "localRotation": {
                    "x": 0,
                    "y": 0.7071067690849304,
                    "z": 0,
                    "w": 0.7071067690849304
                },
                "localPosition": {
                    "x": 1.28,
                    "y": 3.9307,
                    "z": 0
                },
                "grab": {
                    "grabbable": false
                },
                "text": tilesData[i].title,
                "lineHeight": 0.17,
                "backgroundAlpha": 0.7,
                "leftMargin": 0.07,
                "rightMargin": 0.07,
                "unlit": true,
                "textEffectThickness": 0.23999999463558197,
                "alignment": "center",
                "verticalAlignment": "center",
                "textColor": {"red": 255, "green": 255, "blue": 255},
                "renderWithZones": subRenderWithZones
            },"domain");
            EntityViewer.queryOctree();

            var issueBodyPortalId = Entities.addEntity({
                "type": "Text",
                "parentID": portalId,
                "locked": false,
                "name": "PORTAL_BODY_TEXT - " + tilesData[i].number,
                "dimensions": {
                    "x": 2.4119091033935547,
                    "y": 2.38,
                    "z": 0.009999999776482582
                },
                "localRotation": {
                    "x": 0,
                    "y": 0.7071067690849304,
                    "z": 0,
                    "w": 0.7071067690849304
                },
                "localPosition": {
                    "x": 1.28,
                    "y": 2.07,
                    "z": 0
                },
                "grab": {
                    "grabbable": false
                },
                "text": tilesData[i].body,
                "lineHeight": 0.10,
                "backgroundAlpha": 0.7,
                "topMargin": 0.07,
                "leftMargin": 0.07,
                "rightMargin": 0.07,
                "unlit": true,
                "textEffectThickness": 0.23999999463558197,
                "alignment": "left",
                "verticalAlignment": "top",
                "textColor": {"red": 255, "green": 255, "blue": 255},
                "renderWithZones": subRenderWithZones
            },"domain");
            EntityViewer.queryOctree();

            //CATEGORIES

            if (tilesData[i].labels.length > 0) {
                var fullWidth = 2.4119091033935547;
                var labelsWidth = fullWidth/tilesData[i].labels.length;
                
                var initialZpos = 0.0 - ((tilesData[i].labels.length - 1) * (labelsWidth/2));

                var k;
                var bgColor;
                var foreColor;
                for (k = 0; k < tilesData[i].labels.length; k++) {
                    bgColor = tilesData[i].labels[k].labelBgColor;
                    foreColor = getContrastingColor(bgColor);
                    
                    var issueCategoryPortalId = Entities.addEntity({
                        "type": "Text",
                        "parentID": portalId,
                        "locked": false,
                        "name": "PORTAL_CATEGORY_TEXT - " + tilesData[i].number + " - " + tilesData[i].labels[k].labelText,
                        "dimensions": {
                            "x": labelsWidth,
                            "y": 0.35,
                            "z": 0.009999999776482582
                        },
                        "localRotation": {
                            "x": 0,
                            "y": 0.7071067690849304,
                            "z": 0,
                            "w": 0.7071067690849304
                        },
                        "localPosition": {
                            "x": 1.28,
                            "y": 0.5425,
                            "z": initialZpos + (k * labelsWidth)
                        },
                        "grab": {
                            "grabbable": false
                        },
                        "text": tilesData[i].labels[k].labelText,
                        "lineHeight": 0.13,
                        "backgroundAlpha": 1.0,
                        "backgroundColor": bgColor,
                        "topMargin": 0.0,
                        "leftMargin": 0.0,
                        "rightMargin": 0.0,
                        "unlit": true,
                        "textEffectThickness": 0.23999999463558197,
                        "alignment": "center",
                        "verticalAlignment": "center",
                        "textColor": foreColor,
                        "renderWithZones": subRenderWithZones
                    },"domain");
                    EntityViewer.queryOctree();
                }
            } else {
                var issueCategoryNOTAGId = Entities.addEntity({
                    "type": "Shape",
                    "shape": "Cube",
                    "parentID": portalId,
                    "locked": false,
                    "name": "PORTAL_NO_CATEGORY - " + tilesData[i].number,
                    "dimensions": {
                        "x": 2.4119091033935547,
                        "y": 0.35,
                        "z": 0.009999999776482582
                    },
                    "localRotation": {
                        "x": 0,
                        "y": 0.7071067690849304,
                        "z": 0,
                        "w": 0.7071067690849304
                    },
                    "localPosition": {
                        "x": 1.28,
                        "y": 0.5425,
                        "z": 0
                    },
                    "grab": {
                        "grabbable": false
                    },
                    "alpha": 0.7,
                    "color": {"red": 0, "green": 0, "blue": 0},
                    "unlit": true,
                    "renderWithZones": subRenderWithZones
                },"domain");
                EntityViewer.queryOctree();
            }
            // END CATEGORIES

            forFastDeletion.push(portalId);
            
            coy = coy - STEP_HEIGHT;
            
            if (eventToSet !== "") {
                var sectionGateId = Entities.addEntity({
                    "type": "Model",
                    "name": "SECTION " + eventToSet,
                    "parentID": portalId,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                    "locked": false,
                    "dimensions": {"x":5.299069404602051,"y":5.224411487579346,"z":0.25771236419677734},
                    "grab": {
                        "grabbable": false
                    },
                    "shapeType": "static-mesh",
                    "modelURL": ROOT + "models/GATE_" + eventToSet + ".fst",
                    "useOriginalPivot": true,
                    "lifetime": REFRESH_INTERVAL + 1,
                    "renderWithZones": subRenderWithZones
                }, "domain");
                EntityViewer.queryOctree();
            }
            
            if (i === (tilesData.length - 1)) {
                var deadEndId = Entities.addEntity({
                    "type": "Model",
                    "name": "DEADEND",
                    "parentID": portalId,
                    "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
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
                    "lifetime": REFRESH_INTERVAL + 1,
                    "renderWithZones": renderWithZones
                }, "domain");
                
            }
            EntityViewer.queryOctree();
        }
    }
    
    function genVisibilityZone() {
        EntityViewer.queryOctree();
        var zID = Entities.addEntity({
            "type":"Zone",
            "name":"OVERTE_ISSUES_TOWER_VISIBILITY_ZONE",
            "locked": false,
            "dimensions":{
                "x":4000,
                "y":4000,
                "z":4000
            },
            "position": positionZero,
            "grab":{
                "grabbable": false
            },
            "shapeType":"box",
            "lifetime": REFRESH_INTERVAL + 15,
            "keyLightMode": "inherit",
            "keyLight": {
                "direction": {
                    "x":0,
                    "y":-1,
                    "z":0
                },
                "intensity": 1,
                "castShadows": true,
                "shadowBias":0.02,
                "shadowMaxDistance": 150
            },
            "ambientLightMode": "inherit",
            "skyboxMode": "inherit",
            "hazeMode": "inherit",
            "bloomMode": "inherit",
            "tonemappingMode": "inherit",
            "ambientOcclusionMode": "inherit"
        }, "domain");
        if (!zID) {print("OIT: main visibility return false.");} //############################ DEBUG
        EntityViewer.queryOctree();
        return zID;
    }

    function genSubVisibilityZone(coy) {
        var zonePosition = {
            "x": positionZero.x,
            "y": positionZero.y + coy,
            "z": positionZero.z
        };
        EntityViewer.queryOctree();
        var zID = Entities.addEntity({
            "type":"Zone",
            "name":"SUB_VISIBILITY_ZONE (" + coy + ")",
            "locked": false,
            "dimensions":{
                "x":4000,
                "y":40,
                "z":4000
            },
            "position": zonePosition,
            "grab":{
                "grabbable": false
            },
            "shapeType":"box",
            "lifetime": REFRESH_INTERVAL + 15,
            "keyLightMode": "inherit",
            "keyLight": {
                "direction": {
                    "x":0,
                    "y":-1,
                    "z":0
                },
                "intensity": 1,
                "castShadows": true,
                "shadowBias":0.02,
                "shadowMaxDistance": 150
            },
            "ambientLightMode": "inherit",
            "skyboxMode": "inherit",
            "hazeMode": "inherit",
            "bloomMode": "inherit",
            "tonemappingMode": "inherit",
            "ambientOcclusionMode": "inherit"
        }, "domain");
        EntityViewer.queryOctree();
        if (!zID) {print("OIT: sub visibility return false. (coy = " + coy + ")");} //############################ DEBUG
        return zID;
    }
    
    function dateToTimestamp(dateString) {
        let date = new Date(dateString);
        return date.getTime();
    }
    
    function getLabelDataFrom(arOfLabels) {
        if (arOfLabels.length > 0) {
            var j;
            var labelz = [];
            var labelObj;
            for (j = 0; j < arOfLabels.length; j++) {
                labelObj = {
                    "labelText": arOfLabels[j].name,
                    "labelBgColor": getColorRGBFromHex(arOfLabels[j].color)
                };
                labelz.push(labelObj);
            }
            return labelz;
        } else {
            return [];
        }
    }

    function getColorRGBFromHex(hex) {
        hex = hex.replace(/^#/, '');
        
        // If it's a shorthand hex color, expand it (e.g., "03F" -> "0033FF")
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
            return { "red": 0, "green": 0, "blue": 0 };
        } else {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);

            return { "red": r, "green": g, "blue": b };
        }
    }

    function getContrastingColor(colorVec) {
        var r = colorVec.red;
        var g = colorVec.green;
        var b = colorVec.blue;
        
        // Calculate the relative luminance of the color
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // If luminance is greater than 0.5, return black; otherwise, return white
        return luminance > 0.5 ? { "red": 0, "green": 0, "blue": 0 } : { "red": 255, "green": 255, "blue": 255 };
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

function setUpEntityViewer() {
    EntityViewer.setPosition(positionZero);
    EntityViewer.setCenterRadius(8000);
    EntityViewer.queryOctree();
}

// ################## CYLCE AND TIME FUNCTIONS ###########################
function GetCurrentCycleValue(cyclelength, cycleduration){
    var today = new Date();
    var TodaySec = today.getTime()/1000;
    var CurrentSec = TodaySec%cycleduration;
    
    return (CurrentSec/cycleduration)*cyclelength;
    
}
// ################## END CYLCE AND TIME FUNCTIONS ###########################

Script.update.connect(myTimer);
setUpEntityViewer();

Script.scriptEnding.connect(function () {
    var i;
    for (i = 0; i < forFastDeletion.length; i++) {
        Entities.deleteEntity(forFastDeletion[i]);
        EntityViewer.queryOctree();
    }
    forFastDeletion = [];
    
    Script.update.disconnect(myTimer);
});

