"use strict";
//
//  tpGenerator.js
//
//  Created by Alezia Kurdis, January 22nd, 2023.
//  Copyright 2023, Overte e.V.
//
//  Generate a teleporter triggers.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("tpGenerator.js")[0];
    var thisEntity;

 
    var entitiesToBeDeleted = [];
    
    var renderWithZones;
    
    var teleporters = [
        {
            "name": "TP-1", 
            "url": "hifi://virz/-5971.96,-4002.78,5992.28/0,0.738416,0,0.674346",
            "localPosition": {"x":-0.6606,"y":1.6391,"z":-6.6584},
            "rotation": {"x":-0.00002379536635999102,"y":-0.6208218336105347,"z":-0.000018843869838747196,"w":0.7839516997337341}
        },
        {
            "name": "TP-2", 
            "url": "hifi://virz/-5378.22,-3992.08,-5164.72/0,0.887725,0,-0.460373",
            "localPosition": {"x":-1.9340,"y":1.6391,"z":-6.4051},
            "rotation": {"x":-0.000023526783479610458,"y":-0.6208216547966003,"z":-0.000018631168131832965,"w":0.7839518785476685}
        },
        {
            "name": "TP-3", 
            "url": "hifi://hytrion/165.827,-10.2725,161.2/0,0.868674,0,-0.495384",
            "localPosition": {"x":-3.1737,"y":1.6391,"z":-5.8913},
            "rotation": {"x":-0.00003777828169404529,"y":-0.4559500813484192,"z":-0.000019353821699041873,"w":0.8900054693222046}
        },
        {
            "name": "TP-4", 
            "url": "",
            "localPosition": {"x":-4.2037,"y":1.6391,"z":-5.2030},
            "rotation": {"x":-0.00003777820529649034,"y":-0.4559510350227356,"z":-0.0000193538362509571,"w":0.8900048732757568}
        },
        {
            "name": "TP-5", 
            "url": "hifi://virz/-9036.29,-8952.54,-9011.16/0,0.00917235,0,0.999958",
            "localPosition": {"x":-5.1954,"y":1.6391,"z":-4.2208},
            "rotation": {"x":-0.00004615642683347687,"y":-0.2735596299171448,"z":-0.000013127275451552123,"w":0.9618551135063171}
        },
        {
            "name": "TP-6", 
            "url": "",
            "localPosition": {"x":-5.8942,"y":1.6391,"z":-3.1751},
            "rotation": {"x":-0.0000462453936052043,"y":-0.2735598087310791,"z":-0.00001315259032708127,"w":0.9618549346923828}
        },
        {
            "name": "TP-7", 
            "url": "hifi://vankh/-1815.24,5022.19,450.501/0,-0.00982832,0,0.999952",
            "localPosition": {"x":-6.4163,"y":1.6391,"z":-1.9246},
            "rotation": {"x":-0.000046210836444515735,"y":-0.08065378665924072,"z":-0.000003739257863344392,"w":0.9967422485351562}
        },
        {
            "name": "TP-8", 
            "url": "",
            "localPosition": {"x":-6.6636,"y":1.6391,"z":-0.6813},
            "rotation": {"x":-0.00004621269545168616,"y":-0.08065378665924072,"z":-0.0000037394074752228335,"w":0.9967422485351562}
        }
    ];

    this.preload = function(entityID) { 
        thisEntity = entityID;
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        
        for (var i = 0; i < teleporters.length; i++) {
            var id = Entities.addEntity({
                "type": "Box",
                "name": teleporters[i].name,
                "visible": false,
                "description": teleporters[i].url,
                "dimensions": {
                    "x": 1.1507105827331543,
                    "y": 3,
                    "z": 1.3401103019714355
                },
                "rotation": teleporters[i].rotation,
                "localPosition": teleporters[i].localPosition,
                "parentID": thisEntity,
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "collisionless": true,
                "ignoreForCollisions": true,
                "shape": "Cube",
                "script": ROOT + "teleporter.js"
            }, "local");
            entitiesToBeDeleted.push(id);
        }
    }

    this.unload = function(entityID) {
        for (var i = 0; i < entitiesToBeDeleted.length; i++) {
            if (entitiesToBeDeleted[i] !== Uuid.NULL) {
                Entities.deleteEntity(entitiesToBeDeleted[i]);
            }
        }
    };

})
