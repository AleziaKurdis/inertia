//
//  aleziaDiapo
//
//  Created by Alezia Kurdis on May 29th, 2023.
//  Copyright 2023 Alezia Kurdis.
//
//  frame that is a diaporama of the picture of the Alezia's adventures.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var jsMainFileName = "aleziaDiapo.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var thisSecToChange;
    var processTimer = 0;
    var thisID;
    var thisPosition;
    var thisRenderWithZones;
    var thisDisplayRadius;
    var thisEmissive;
    var tableauID = Uuid.NULL;
    
    this.preload = function(entityID) {
        //Generate the Clock text local entity.
        thisID = entityID;
        var properties = Entities.getEntityProperties(thisID, ["position", "renderWithZones", "userData"] );
        thisPosition =  properties.position;
        thisRenderWithZones = properties.renderWithZones;
        thisDisplayRadius = properties.userData.displayRadius !== undefined?properties.userData.displayRadius: 400;
        thisSecToChange = properties.userData.secToChange !== undefined?properties.userData.secToChange: 300;
        thisEmissive = properties.userData.emissive !== undefined?properties.userData.emissive: true;
        
        updateTableau();
        
        today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);
    };

    this.unload = function(entityID) {
        shutdown();
    };

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > thisSecToChange ) {

            updateTableau();

            today = new Date();
            processTimer = today.getTime();
        }  
    }


    function shutdown() {
        if (tableauID !== Uuid.NULL){
            Entities.deleteEntity(tableauID);
            tableauID = Uuid.NULL;
        }
        Script.update.disconnect(myTimer);
    }

    function updateTableau() {
        if (tableauID !== Uuid.NULL){
            Entities.deleteEntity(tableauID);
            tableauID = Uuid.NULL;
        }
        if (Vec3.distance(MyAvatar.position, thisPosition) < thisDisplayRadius) {
            var tableauNo = Math.ceil(GetCurrentCycleValue(4472, thisSecToChange * 4472));
            
            //exclusion here: 3441, 3444, 3445, 3447, 3487
            if (tableauNo === 3441 || tableauNo === 3444 || tableauNo === 3445 || tableauNo === 3447 || tableauNo === 3487) {
                tableauNo = 3453;
            }
            
            var url = "http://book.bashora.com/img/" + tableauNo + ".jpg";
            var textures = {
                "base_color_texture": url
            };
            
            var signFile = "framed_sign_";
            if (thisEmissive) {
                signFile = "framed_sign_emissive_";
                textures = {
                    "base_color_texture": url,
                    "emission_color_texture": url
                };
            }

            var dimensions = {"x": 2.0, "y": 1.22, "z": 0.0400};
            
            tableauID = Entities.addEntity({
               "name": "alezia_story",
               "type": "Model",
               "localPosition": {"x": 0, "y": 0, "z": 0},
               "parentID": thisID,
               "dimensions": dimensions,
               "modelURL": ROOT + "models/" + signFile + "h.fst",
               "useOriginalPivot": true,
               "shapeType": "box",
               "grab": {
                   "grabbable": false
               },
               "textures": JSON.stringify(textures),
               "renderWithZones": thisRenderWithZones
            }, "local");
        }

    } 

    function GetCurrentCycleValue(cyclelength, cycleduration){
        var today = new Date();
        var TodaySec = today.getTime()/1000;
        var CurrentSec = TodaySec%cycleduration;
        
        return (CurrentSec/cycleduration)*cyclelength;
        
    }
})
