"use strict";

const util = require("../util/util"),
    config = require("../config").hiscores,
    request = require("request-promise"),
    helper = require("./hiscores.helper");

function hiscores(options) {
    /**
     * Gets a players stats, minigame data
     *
     * @param  player The players name
     * @param  type   [Optional] normal, ironman, hardcore, ultimate, deadman
     */
    this.getPlayer = (username, type) => {
        if (type == null || type == undefined) {
            type = 'normal';
        }
        return new Promise((resolve, reject) => {
            if (typeof (username) != "string") {
                reject(new Error("Username must be a string"));
            }
            request.get(config[type.toLowerCase()] + encodeURIComponent(username)).then(response => {
                util.csvToJson(response)
                    .then(playerData => {
                        var player = {
                            skills: helper.mapSkills(playerData),
                            minigames: helper.mapMinigames(playerData)
                        }
                        resolve(player);
                    })
            }).catch(reject);
        });
    }
    /*
     * Gets a players stats, minigame data
     *
     * @param  players The players names
     */
    this.getPlayers = (players) => {
        return new Promise((resolve, reject) => {
            let playerMap = {};
            let playerCounter = 0;
            let playerObj = [];
            let promiseStack = [];
            for (var i = 0; i < players.length; i++) {
                promiseStack.push(this.getPlayer(players[i].username, players[i].type));
            }
            Promise.all(promiseStack).then(values => {
                for (i = 0; i < values.length; i++) {
                    let playerIndex = 0;

                    if (playerMap[players[i].username] === undefined) {
                        playerMap[players[i].username] = playerCounter++;
                    }
                    
                    playerIndex = playerMap[players[i].username];

                    if (!playerObj[playerIndex]) {
                        playerObj[playerIndex] = {
                            'username': players[i].username,
                            'stats': {}
                        }
                    }

                    playerObj[playerIndex]['stats'][players[i].type] = values[i];
                }
                resolve(playerObj);
            }).catch(reject);
        })
    }
}

module.exports = hiscores;