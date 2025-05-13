//
//  breemorManager.js
//
//  Created by Alezia Kurdis, May 7th, 2025.
//  Copyright 2025, Overte e.V.
//
//  manager script for the spaceship Breemor.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("breemorManager.js")[0];
    var renderWithZones = [];
    var entitiesToDelete = [];
    this.preload = function(entityID) {
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        
        //Ship Lights
        var lightDefinition = [
            {"name": "CARGO BAY 1", "dimensions": {"x":15.171574592590332,"y":15.171574592590332,"z":23.602781295776367}, "localPosition": {"x": 3.6099,"y": 5.4194,"z": 55.7471}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 40},
            {"name": "CARGO BAY 2", "dimensions": {"x":15.171574592590332,"y":15.171574592590332,"z":23.602781295776367}, "localPosition": {"x": -3.6099,"y": 5.4194,"z": 55.7471}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 40},
            {"name": "CARGO BAY 3", "dimensions": {"x":15.171574592590332,"y":15.171574592590332,"z":23.602781295776367}, "localPosition": {"x": 0.0,"y": 5.4194,"z": 67.2246}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 40},
            {"name": "CARGO BAY ENTRANCE", "dimensions": {"x":8.02638,"y":8.02638,"z":9.2680}, "localPosition": {"x": 0.0,"y": -0.8521,"z": 47.4229}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 10, "falloffRadius": 1.0, "cutoff": 60},
            {"name": "SOUTE 1A", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": 3.6387,"y": 0.7871,"z": 2.2438}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 1B", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": -3.6387,"y": 0.7871,"z": 2.2438}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 2A", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": 3.6387,"y": 0.7871,"z": 12.1289}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 2B", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": -3.6387,"y": 0.7871,"z": 12.1289}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 3A", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": 3.6387,"y": 0.7871,"z": 25.0972}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 3B", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": -3.6387,"y": 0.7871,"z": 25.0972}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 4A", "dimensions": {"x":30.9626522064209,"y":30.9626522064209,"z":31.4403018951416}, "localPosition": {"x": 3.6387,"y": 0.7871,"z": 34.7954}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 4B", "dimensions": {"x":30.9626522064209,"y":30.9626522064209,"z":31.4403018951416}, "localPosition": {"x": -3.6387,"y": 0.7871,"z": 34.7954}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "LEVEL 200 B1", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": -17.7490,"y": 0.7224,"z": -18.5469}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 200 A1", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": 17.7490,"y": 0.7224,"z": -18.5469}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 200 B2", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": -17.7490,"y": 0.7224,"z": -30.3364}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 200 A2", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": 17.7490,"y": 0.7224,"z": -30.3364}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 200 C", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": 0.0, "y": 0.7224, "z": -30.3364}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 300 B1", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": -17.7490,"y": 5.9182,"z": -18.5469}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 300 A1", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": 17.7490,"y": 5.9182,"z": -18.5469}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 300 B2", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": -17.7490,"y": 5.9182,"z": -30.3364}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 300 A2", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": 17.7490,"y": 5.9182,"z": -30.3364}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 300 C", "dimensions": {"x":35.45307922363281,"y":35.45307922363281,"z":36.0}, "localPosition": {"x": 0.0, "y": 5.9182, "z": -30.3364}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 100 1B", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": -8.7703, "y": -5.3997, "z": -14.4600}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 100 1A", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": 8.7703, "y": -5.3997, "z": -14.4600}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 100 2B", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": -8.7703, "y": -5.3997, "z": -25.7078}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 100 2A", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": 8.7703, "y": -5.3997, "z": -25.7078}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 100 3B", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": -5.5896, "y": -5.3997, "z": -29.8911}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 100 3A", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": 5.5896, "y": -5.3997, "z": -29.8911}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 400 3A", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": 7.2537, "y": 13.4329, "z": -29.6064}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 400 3B", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": -7.2537, "y": 13.4329, "z": -29.6064}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 400 2A", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": 4.9912, "y": 13.4329, "z": -21.8269}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 400 2B", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": -4.9912, "y": 13.4329, "z": -21.8269}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 400 1A", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": 4.9912, "y": 13.4329, "z": -16.3779}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 400 1B", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": -4.9912, "y": 13.4329, "z": -16.3779}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 400 1C", "dimensions": {"x":16.140056610107422,"y":16.140056610107422,"z":16.3890438079834}, "localPosition": {"x": 0.0, "y": 13.4329, "z": -12.5610}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 80},
            {"name": "LEVEL 400 INFIRMERY BO", "dimensions": {"x":9.400369644165039,"y":9.400369644165039,"z":16.3890438079834}, "localPosition": {"x": 0.0, "y": 13.1418, "z": -16.4028}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 35},
            {"name": "COCKPIT", "dimensions": {"x":5.715744495391846,"y":5.715744495391846,"z":8.083283424377441}, "localPosition": {"x": 0.8877, "y": 19.9729, "z": -12.4661}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.0, "cutoff": 45},
            {"name": "DETENTION 1", "dimensions": {"x":6.192154407501221,"y":6.192154407501221,"z":8.083283424377441}, "localPosition": {"x": 4.0627, "y": 0.2139, "z": -35.1631}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.0, "cutoff": 50},
            {"name": "DETENTION 2", "dimensions": {"x":6.192154407501221,"y":6.192154407501221,"z":8.083283424377441}, "localPosition": {"x": 4.0627, "y": 0.2139, "z": -37.7778}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.0, "cutoff": 50},
            {"name": "DETENTION 3", "dimensions": {"x":13.804311752319336,"y":13.804311752319336,"z":13.804311752319336}, "localPosition": {"x": -2.5791, "y": 0.2644, "z": -38.8616}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 90},
            {"name": "MAIN AIRLOCK B", "dimensions": {"x":8.035924911499023,"y":8.035924911499023,"z":9.279086112976074}, "localPosition": {"x": 26.9019, "y": 0.6895, "z": -30.3335}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 60},
            {"name": "MAIN AIRLOCK A", "dimensions": {"x":8.035924911499023,"y":8.035924911499023,"z":9.279086112976074}, "localPosition": {"x": -26.9019, "y": 0.6895, "z": -30.3335}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 9, "falloffRadius": 1.5, "cutoff": 60}
        ];
        var i, id;
        for (i=0; i < lightDefinition.length; i++) {
            id = Entities.addEntity({
                "type": "Light",
                "name": "Breemor Light " + lightDefinition[i].name,
                "dimensions": lightDefinition[i].dimensions,
                "rotation": Quat.fromVec3Degrees({ "x": -90, "y": 0, "z": 0}),
                "localPosition": lightDefinition[i].localPosition,
                "parentID": entityID,
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "collisionless": true,
                "ignoreForCollisions": true,
                "color": lightDefinition[i].color,
                "isSpotlight": true,
                "intensity": lightDefinition[i].intensity,
                "exponent": 1,
                "cutoff": lightDefinition[i].cutoff,
                "falloffRadius": lightDefinition[i].falloffRadius,
                "lifetime": 25200
            }, "local");
            
            entitiesToDelete.push(id);
        }
    };

    this.unload = function(entityID) {
        var i;
        for (i=0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
            
        }
        entitiesToDelete = [];
    };    

})
