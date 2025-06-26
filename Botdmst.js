import { Client as AttClient } from 'att-client';
import { Client as DiscordClient } from 'discord.js';
import { BotCreds } from './BotCreds.js';
import  Client  from 'discord.js';
import Intents from 'discord.js';
import ActivityType from 'discord.js';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { info } from 'console';

const bot = new AttClient(BotCreds);
const discordbot = new DiscordClient('--');
const discordChannelId = ---;
const channelName = '---';
const token = '--';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, 'player_eat_counts.json');


bot.on('ready', botready => {
  console.log('Ready To Start.')
  bot.openServerConnection(---)
  })


discordbot.on('ready', async () => {
  console.log(`logged in as ${discordbot.user.tag}`)
  discordbot.user.setActivity('HELP HELP ME!!!', { type: 'PLAYING' })
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);
});



bot.on('connect', connection => {
  console.log('Connected And Sending Api Data.');
  connection.subscribe('PlayerMovedChunk', message => {
    const {
      player,
      newChunk
    } = message.data;

    if (newChunk.startsWith('Cave Layer')) {
      console.log(`player ${player.username} Has Gone To "${newChunk}".`);
      }
    });
  });

bot.on('connect', connected => {
  console.log('connected and subed to playerjoined');
  connected.subscribe('PlayerJoined', messagejoined => {
    const {
      user
    } = messagejoined.data;
    console.log(`player ${user.username} has joined id is ${user.id}`);
    setTimeout(() => {
      connected.send(`player message ${user.id} "Welcome Back ${user.username} To DemonSlayer Modded V2!" 6`);
      discordbot.channels.cache.get("1242896477018263573").send(`Player ${user.username} Has Joined The Server!`);
      console.log('sent message.');
      },16000);     

   });
  });

bot.on('connect', ConnectedForLeaves => {
  console.log('Subing For Leaves')
  ConnectedForLeaves.subscribe('PlayerLeft', Leftplayer => {
    const {
      user
    } = Leftplayer.data;
    console.log(`${user.username} has left Demon Slayer Modded V2 There Id Is ${user.id}`);
    
    discordbot.channels.cache.get("1356014952409862376").send(`Player ${user.username} Has Left The Server.`);
  })
})




bot.on('connect', ConnectedForKills => {
  console.log('Ready To Send Kills.')
  ConnectedForKills.subscribe('PlayerKilled', async PlayerKilled => {
    const {
      killedPlayer,
      source,
      killerPlayer
    } = PlayerKilled.data;
    console.log(`Player ${killedPlayer.username} Was Killed There Id Is ${killedPlayer.id} Cause Of Death ${source}.`);

    discordbot.channels.cache.get("1355917260270600274").send(`Player ${killedPlayer.username} Was Killed By ${source}`);
    });
  });


bot.on('connect', headpos => {
  
  let players = {};

  
  function updatePlayerList() {
    headpos.send('player list').then(response => {
      const playerList = response.data.Result;

      playerList.forEach(player => {
        players[player.id] = { id: player.id, username: player.username };
      });

      console.log("Updated Players:", players);
    }).catch(err => console.error("Error fetching player list:", err));
  }

  
  function updatePlayerDetails() {
    Object.keys(players).forEach(playerId => {
      headpos.send(`player detailed ${playerId}`).then(response => {
        let playerData = response.data.Result;
        players[playerId] = { ...players[playerId], ...playerData };

        
        if (playerData.HeadForward && playerData.HeadForward[1] > 0.7) { 
          sendLookDownMessage(playerId, players[playerId].username);
        }

      }).catch(err => console.error(`Error fetching details for ${playerId}:`, err));
    });
  }

  
  function sendLookDownMessage(playerId, username) {
    headpos.send(`player message ${playerId} "DemonSlayer Bot Demo V1.1.2"`)
    console.log(`Sent message to ${username} for looking down.`);
  }

  
  setInterval(updatePlayerList, 500);

  setInterval(updatePlayerDetails, 500);
});

bot.on('connect', Eatitem => {
  let players = {};

  function updatePlayerList() {
    Eatitem.send('player list').then(response => {
      const playerList = response.data.Result;

      playerList.forEach(player => {
        players[player.id] = { id: player.id, username: player.username };
      });

      console.log("Updated Players:", players);
    }).catch(err => console.error("Error fetching player list:", err));
  }

  function updateInventory() {
    Object.keys(players).forEach(playerId => {
      Eatitem.send(`player inventory ${playerId}`).then(response => {
        const inventory = response.data.Result;
        let inventoryData = Array.isArray(inventory) ? inventory[0] : inventory;


        const leftHand = inventoryData?.LeftHand || null;
        const rightHand = inventoryData?.RightHand || null;


        players[playerId].leftHandItem = leftHand?.Name || "Empty";
        players[playerId].rightHandItem = rightHand?.Name || "Empty";
        players[playerId].leftHandPrefab = leftHand?.PrefabHash || null;
        players[playerId].rightHandPrefab = rightHand?.PrefabHash || null;
        players[playerId].leftHandIdentifier = leftHand?.Identifier || null;
        players[playerId].rightHandIdentifier = rightHand?.Identifier || null;

        console.log(`Player ${playerId} - Left Hand: ${players[playerId].leftHandItem} (Prefab: ${players[playerId].leftHandPrefab}, Identifier: ${players[playerId].leftHandIdentifier}`);
        console.log(`Player ${playerId} - Right Hand: ${players[playerId].rightHandItem} (Prefab: ${players[playerId].rightHandPrefab}, Identifier: ${players[playerId].rightHandIdentifier}`);

        if (!rightHand) {
          console.warn(`Warning: Right hand data missing for player ${playerId}`);
        }

      }).catch(err => console.error(`Error fetching inventory for player ${playerId}:`, err));
    })};


  function updatePlayerDetails() {
    Object.keys(players).forEach(playerId => {
      Eatitem.send(`player detailed ${playerId}`).then(response => {
        let playerData = response.data.Result;
        players[playerId] = { ...players[playerId], ...playerData };
  

        if (isEating(playerId)) {
          const leftHandItem = players[playerId].leftHandIdentifier;
          const rightHandItem = players[playerId].rightHandIdentifier;
  

          if (players[playerId].leftHandPrefab === 39484) {
            
            if (players[playerId].rightHandPrefab !== 39484 || !rightHandItem) {
              eatItem.send(`wacky destroy ${leftHandItem}`);
              eatItem.send(`player setstat ${playerId} hunger 2`);
              console.log(`Player ${playerId} is eating with left hand. Destroying item:, ${leftHandItem}`);
            }
          }
  

          if (players[playerId].rightHandPrefab === 39484) {
            
            if (players[playerId].leftHandPrefab !== 39484 || !leftHandItem) {
              Eatitem.send(`wacky destroy ${rightHandItem}`);
              Eatitem.send(`player setstat ${playerId} hunger 2`);
              console.log(`Player ${playerId} is eating with right hand. Destroying item: ${rightHandItem}`);
            }
          }
        }
      }).catch(err => console.error(`Error fetching details for ${playerId}:`, err));
    });
  }
  
  
  function isEating(playerId) {
    const player = players[playerId];

    if (!player || !player.HeadPosition || (!player.LeftHandPosition && !player.RightHandPosition)) {
      return false;
    }

    const headPos = player.HeadPosition;
    const leftHandPos = player.LeftHandPosition || null;
    const rightHandPos = player.RightHandPosition || null;

    const threshold = 0.2;

    if (leftHandPos && getDistance(headPos, leftHandPos) < threshold && player.leftHandPrefab === 39484) {
      return true;
    }

    if (rightHandPos && getDistance(headPos, rightHandPos) < threshold && player.rightHandPrefab === 39484) {
      return true;
    }

    return false;
  }

  function getDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1[0] - pos2[0], 2) +
      Math.pow(pos1[1] - pos2[1], 2) +
      Math.pow(pos1[2] - pos2[2], 2)
    );
  }

  setInterval(updatePlayerList, 500);
  setInterval(updateInventory, 1000);
  setInterval(updatePlayerDetails, 1000);
});



bot.on('connect', friend => {
  let friends = {}; 

  const ids = [1418689061];

  function updatePlayerList() {
    friend.send('player list').then(response => {
      const playerList = response.data.Result;

      playerList.forEach(player => {
        friends[player.id] = { id: player.id, username: player.username };
      });
    }).catch(err => console.error("Error fetching player list:", err));
  }

  function updateInventory() {
    Object.keys(friends).forEach(playerId => {
      friend.send(`player inventory ${playerId}`).then(response => {
        const inventory = response.data.Result;
        let inventoryData = Array.isArray(inventory) ? inventory[0] : inventory;

        const leftHand = inventoryData?.LeftHand || null;
        const rightHand = inventoryData?.RightHand || null;

        friends[playerId].leftHandPrefab = leftHand?.PrefabHash || null;
        friends[playerId].rightHandPrefab = rightHand?.PrefabHash || null;
        checkSpecialItem(playerId, friends[playerId]);
      }).catch(err => console.error(`Error fetching inventory for player ${playerId}:`, err));
    });
  }

  function updatePlayerDetails() {
    Object.keys(friends).forEach(playerId => {
      friend.send(`player detailed ${playerId}`).then(response => {
        const playerData = response.data.Result;
        friends[playerId] = { ...friends[playerId], ...playerData };

      }).catch(err => console.error(`Error fetching detailed data for ${playerId}:`, err));
    });
  }

  function checkSpecialItem(playerId, player) {
    const isTargetPlayer = ids.includes(playerId);

    const holdingSpecialItem =
      player.leftHandPrefab === 15314 || player.rightHandPrefab === 15314;

    if (isTargetPlayer && holdingSpecialItem) {
        friend.send(`player message ${playerId} "Friend?"`);
      }
  }

  setInterval(updatePlayerList, 500);
  setInterval(updateInventory, 1000);
  setInterval(updatePlayerDetails, 1000);
});











bot.on('connect', async (mitsuriquestitems) => {
  let players = {};
  await loadPlayerData();
  const targetPosition = [-794.991, 142.434, 144.083];
  const detectionRadius = 0.5;
  const climbingTowerPos = [-874.104, 528.386963, -1760.453];
  const altQuestTimeLimit = 10 * 60 * 1000;
  const climbingTowerRadius = 1.5;

  function updatePlayerList() {
    mitsuriquestitems.send('player list').then(response => {
      const playerList = response.data.Result;

      playerList.forEach(player => {
        if (!players[player.id]) {
          players[player.id] = {
            id: player.id,
            username: player.username,
            hasTalkedToMitsuri: false,
            completedQuest: false,
            eatenCount18734: 0,
            eatenCount61648: 0,
            eatenCount31034: 0,
            eatenCount55054: 0
          };
        }
      });

      console.log("Updated Players:", players);
    }).catch(err => console.error("Error fetching player list:", err));
  }

  async function savePlayerData() {
    try {
      await writeFile(dataFilePath, JSON.stringify(players, null, 2));
      console.log('Player data saved successfully.');
    } catch (error) {
      console.error('Error saving player data:', error);
    }
  }

  async function loadPlayerData() {
    try {
      const data = await readFile(dataFilePath, 'utf8');
      players = JSON.parse(data);
      console.log('Player data loaded successfully.');
  

      Object.keys(players).forEach(playerId => {
        const player = players[playerId];
        if (player.startedTowerChallenge && player.isReturningFromTower) {
          const elapsedTime = Date.now() - player.towerStartTime;
          if (elapsedTime > altQuestTimeLimit) {
            players[playerId].isReturningFromTower = false;
            players[playerId].startedTowerChallenge = false;
            savePlayerData();
          }
        }
      });
  
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No previous data found, starting fresh.');
      } else {
        console.error('Error loading player data:', error);
      }
    }
  }

  function updateInventory() {
    Object.keys(players).forEach(playerId => {
      mitsuriquestitems.send(`player inventory ${playerId}`).then(response => {
        const inventory = response.data.Result;
        let inventoryData = Array.isArray(inventory) ? inventory[0] : inventory;

        players[playerId].leftHandPrefab = inventoryData?.LeftHand?.PrefabHash || null;
        players[playerId].rightHandPrefab = inventoryData?.RightHand?.PrefabHash || null;
        players[playerId].leftHandIdentifier = inventoryData?.LeftHand?.Identifier || null;
        players[playerId].rightHandIdentifier = inventoryData?.RightHand?.Identifier || null;
      }).catch(err => console.error(`Error fetching inventory for player ${playerId}:`, err));
    });
  }

  function updatePlayerDetails() {
    Object.keys(players).forEach(playerId => {
      mitsuriquestitems.send(`player detailed ${playerId}`).then(response => {
        let playerData = response.data.Result;
        players[playerId] = { ...players[playerId], ...playerData };

        if (isEating(playerId)) {
          let ateSomething = false;

          ateSomething ||= handleEating(playerId, 18734, "Quest 1", 20, "eatenCount18734");
          ateSomething ||= handleEating(playerId, 61648, "Quest 2", 200, "eatenCount61648");
          ateSomething ||= handleEating(playerId, 31034, "Quest 3", 20, "eatenCount31034");
          ateSomething ||= handleEating(playerId, 55054, "Quest 4", 1, "eatenCount55054");
          

          if (!ateSomething) {
            console.warn(`Eating attempt detected, but no valid item was destroyed for player ${playerId}.`);
          }
        }

        if (players[playerId].startedAltQuest && isEating(playerId)) {
          let altAte = false;
        
          altAte ||= handleAltEating(playerId, 19658, "Alt Quest (Coal)", 200, "eatenAltCoal");
          altAte ||= handleAltEating(playerId, 61648, "Alt Quest (Coins)", 200, "eatenAltCoins");
          altAte ||= handleAltEating(playerId, 18734, "Alt Quest (Feathers)", 25, "eatenAltFeathers");
        
          if (!altAte) {
            console.warn(`Alt quest eating detected but item was invalid for player ${playerId}`);
          }
        }

      }).catch(err => console.error(`Error fetching details for ${playerId}:`, err));
    });
  }

  function handleEating(playerId, prefabId, questName, maxAmount, countProperty) {
    if (players[playerId].startedAltQuest) return false;
  
    if (players[playerId].leftHandPrefab === prefabId && players[playerId][countProperty] < maxAmount) {
      return eatItem(playerId, players[playerId].leftHandIdentifier, questName, maxAmount, countProperty);
    }
    if (players[playerId].rightHandPrefab === prefabId && players[playerId][countProperty] < maxAmount) {
      return eatItem(playerId, players[playerId].rightHandIdentifier, questName, maxAmount, countProperty);
    }
    return false;
  }
  
  
  function handleAltEating(playerId, prefabId, questName, maxAmount, countProperty) {
    if (players[playerId].leftHandPrefab === prefabId && players[playerId][countProperty] < maxAmount) {
      return eatItem(playerId, players[playerId].leftHandIdentifier, questName, maxAmount, countProperty);
    }
    if (players[playerId].rightHandPrefab === prefabId && players[playerId][countProperty] < maxAmount) {
      return eatItem(playerId, players[playerId].rightHandIdentifier, questName, maxAmount, countProperty);
    }
    return false;
  }
  


  function startMainQuest(playerId) {
    players[playerId].hasTalkedToMitsuri = true;
    savePlayerData();
  
    console.log(`Sending first message to player ${playerId}`);
  
    mitsuriquestitems.send(`Player message ${playerId} "Mitsuri: Hiya There!" 5`);
    setTimeout(() => {
      mitsuriquestitems.send(`Player message ${playerId} "Mitsuri: Did You Come To Learn Love Breathing?" 10`);
      setTimeout(() => {
        mitsuriquestitems.send(`Player message ${playerId} "Mitsuri: Well Okay Then! Can You Get 20 Red Feathers, 200 Coins, 20 Red Iron, and A Red Wood Tree Seed?" 20`);
        setTimeout(() => {
          mitsuriquestitems.send(`Player message ${playerId} "Mitsuri: Come back Once You Get All That Stuff!!!" 10`);
        }, 3500);
      }, 3500);
    }, 3500);
  }

  function checkQuestCompletion(playerId) {
    let player = players[playerId];
    if (!player || player.startedAltQuest) return false;
  
    return (
      player.eatenCount18734 >= 20 &&
      player.eatenCount61648 >= 200 &&
      player.eatenCount31034 >= 20 &&
      player.eatenCount55054 >= 1
    );
  }

function checkAltQuestCompletion(playerId) {
  const player = players[playerId];
  if (!player || !player.startedAltQuest) return false;

  return (
    player.eatenAltCoal >= 200 &&
    player.eatenAltCoins >= 200 &&
    player.eatenAltFeathers >= 25
  );
}




function updatePlayerDetailsMitsuriMessage() {
  Object.keys(players).forEach(playerId => {
    mitsuriquestitems.send(`player detailed ${playerId}`).then(response => {
      let playerData = response.data.Result;
      players[playerId] = { ...players[playerId], ...playerData };

      if (isAtLocation(playerId, targetPosition, detectionRadius)) {
        if (!players[playerId].hasTalkedToMitsuri) {
          console.log(`Player ${playerId} is near Mitsuri and hasn't talked to her yet.`);
          startMainQuest(playerId); 
        }


        if (players[playerId].isReturningFromTower) {
          console.log(`Player ${playerId} returned to Mitsuri, checking challenge completion.`);
          handleTowerReturn(playerId);
        }
      }


      if (isAtLocation(playerId, climbingTowerPos, climbingTowerRadius) && !players[playerId].startedTowerChallenge) {
        startTowerChallenge(playerId);
      }
    }).catch(err => console.error(`Error fetching details for ${playerId}:`, err));
  });


  function startAltQuest(playerId) {
    if (players[playerId].hasTalkedToMitsuri && players[playerId].unlockedAltQuest) {
        setTimeout(() => {
          mitsuriquestitems.send(`Player message ${playerId} "Mitsuri: Wel- EHH!? You Want To Learn Flame Breathing Instead!?" 10`);
          setTimeout(() => {
            mitsuriquestitems.send(`Player message ${playerId} "Mitsuri: W-Well I Guess I Can Teach You!" 10`);
            setTimeout(() => {
              mitsuriquestitems.send(`Player message ${playerId} "Mitsuri: First Get!" 10`);
              setTimeout(() => {
                mitsuriquestitems.send(`Player message ${playerId} "Mitsuri: 200 Coal, 200 Coins, 25 Red Feathers!" 20`);
                setTimeout(() => {
                  mitsuriquestitems.send(`Player message ${playerId} "Mitsuri: Come Back Once You Get All That Stuff And Il Teach You Flame Breathing!!!" 10`);
                },10000)
              },10000)
            },10000)
          },20000)
        },10000)
        players[playerId].startedAltQuest = true;
        savePlayerData();
    }
}

function startTowerChallenge(playerId) {
  if (!players[playerId].hasTalkedToMitsuri) {
    return;
  }


  players[playerId].startedTowerChallenge = true;
  players[playerId].isReturningFromTower = true;
  players[playerId].unlockedAltQuest = false


  players[playerId].towerStartTime = Date.now();

  savePlayerData();

  console.log(`Player ${playerId} started the climbing tower challenge at ${players[playerId].towerStartTime}.`);
  mitsuriquestitems.send(`player message ${playerId} "."`)
}



function handleTowerReturn(playerId) {
  const elapsedTime = Date.now() - players[playerId].towerStartTime;
  players[playerId].isReturningFromTower = false;

  if (elapsedTime <= altQuestTimeLimit) {
      players[playerId].unlockedAltQuest = true;
      players[playerId].startedTowerChallenge = false;

      savePlayerData();


      startAltQuest(playerId);
  } else {
      players[playerId].startedTowerChallenge = false;
      players[playerId].unlockedAltQuest = false;

      savePlayerData();
  }
}}



function isAtLocation(playerId, targetPos, threshold) {
  const player = players[playerId];
  if (!player || !player.Position) return false;

  const playerPos = player.Position;
  return getDistance(playerPos, targetPos) < threshold;
}

function getDistance(pos1, pos2) {
  return Math.sqrt(
    Math.pow(pos1[0] - pos2[0], 2) +
    Math.pow(pos1[1] - pos2[1], 2) +
    Math.pow(pos1[2] - pos2[2], 2)
  );
}

async function eatItem(playerId, itemId, questName, maxAmount, countProperty) {
  mitsuriquestitems.send(`wacky destroy ${itemId}`);

  players[playerId][countProperty]++;
  console.log(`Player ${playerId} ate for ${questName}. Count: ${players[playerId][countProperty]}`);

  mitsuriquestitems.send(`Player message ${playerId} "${players[playerId][countProperty]}/${maxAmount}"`);
  await savePlayerData()


  if (checkQuestCompletion(playerId) && !players[playerId].completedQuest) {
    players[playerId].completedQuest = true;
    await savePlayerData();

    
    mitsuriquestitems.send(`Player message ${playerId} "All Items Gotten Return To Mitsuri" 10`);

  }

  if (players[playerId].startedAltQuest && checkAltQuestCompletion(playerId)) {
    players[playerId].completedAltQuest = true;
    savePlayerData();
    mitsuriquestitems.send(`player message ${playerId} All Items Gotten Return To Mitsuri.`);
  }
  


}

  

  function isEating(playerId) {
    const player = players[playerId];

    if (!player || !player.hasTalkedToMitsuri) {
      return false;
    }

    if (!player.HeadPosition || (!player.LeftHandPosition && !player.RightHandPosition)) {
      return false;
    }

    const headPos = player.HeadPosition;
    const leftHandPos = player.LeftHandPosition || null;
    const rightHandPos = player.RightHandPosition || null;
    const threshold = 0.2;

    return (
      (leftHandPos && getDistance(headPos, leftHandPos) < threshold && 
        (player.leftHandPrefab === 18734 || player.leftHandPrefab === 61648 || 
        player.leftHandPrefab === 31034 || player.leftHandPrefab === 55054)) ||
      (rightHandPos && getDistance(headPos, rightHandPos) < threshold && 
        (player.rightHandPrefab === 18734 || player.rightHandPrefab === 61648 || 
        player.rightHandPrefab === 31034 || player.rightHandPrefab === 55054))
    );
  }

  setInterval(updatePlayerList, 500);
  setInterval(updateInventory, 1000);
  setInterval(updatePlayerDetails, 1000);
  setInterval(updatePlayerDetailsMitsuriMessage, 500);
  setInterval(savePlayerData, 5000);
});








bot.on('connect', async (murichiroquestitems) => {
  let players = {};
  await loadPlayerData();
  const targetPosition = [-759.712, 142.434, 117.606];
  const detectionRadius = 0.5;

  function updatePlayerList() {
    murichiroquestitems.send('player list').then(response => {
      const playerList = response.data.Result;

      playerList.forEach(player => {
        if (!players[player.id]) {
          players[player.id] = {
            id: player.id,
            username: player.username,
            hasTalkedToMurichiro: false,
            completedQuest: false,
            eatenCountmistbluefeathers: 0,
            eatenCountmistwhitegold: 0,
            eatenCountmistgold: 0
          };
        }
      });

      console.log("Updated Players:", players);
    }).catch(err => console.error("Error fetching player list:", err));
  }

  async function savePlayerData() {
    try {
      await writeFile(dataFilePath, JSON.stringify(players, null, 2));
      console.log('Player data saved successfully.');
    } catch (error) {
      console.error('Error saving player data:', error);
    }
  }

  async function loadPlayerData() {
    try {
      const data = await readFile(dataFilePath, 'utf8');
      players = JSON.parse(data);
      console.log('Player data loaded successfully.');
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No previous data found, starting fresh.');
      } else {
        console.error('Error loading player data:', error);
      }
    }
  }

  function updateInventory() {
    Object.keys(players).forEach(playerId => {
      murichiroquestitems.send(`player inventory ${playerId}`).then(response => {
        const inventory = response.data.Result;
        let inventoryData = Array.isArray(inventory) ? inventory[0] : inventory;

        players[playerId].leftHandPrefab = inventoryData?.LeftHand?.PrefabHash || null;
        players[playerId].rightHandPrefab = inventoryData?.RightHand?.PrefabHash || null;
        players[playerId].leftHandIdentifier = inventoryData?.LeftHand?.Identifier || null;
        players[playerId].rightHandIdentifier = inventoryData?.RightHand?.Identifier || null;
      }).catch(err => console.error(`Error fetching inventory for player ${playerId}:`, err));
    });
  }

  function updatePlayerDetails() {
    Object.keys(players).forEach(playerId => {
      murichiroquestitems.send(`player detailed ${playerId}`).then(response => {
        let playerData = response.data.Result;
        players[playerId] = { ...players[playerId], ...playerData };

        if (isEating(playerId)) {
          let ateSomething = false;

          ateSomething ||= handleEating(playerId, 1918, "Quest 1", 15, "eatenCountmistbluefeathers");
          ateSomething ||= handleEating(playerId, 13158, "Quest 2", 8, "eatenCountmistwhitegold");
          ateSomething ||= handleEating(playerId, 61648, "Quest 3", 50, "eatenCountmistgold");

          if (!ateSomething) {
            console.warn(`Eating attempt detected, but no valid item was destroyed for player ${playerId}.`);
          }
        }

      }).catch(err => console.error(`Error fetching details for ${playerId}:`, err));
    });
  }

  function handleEating(playerId, prefabId, questName, maxAmount, countProperty) {
    if (players[playerId].leftHandPrefab === prefabId && players[playerId][countProperty] < maxAmount) {
      return eatItem(playerId, players[playerId].leftHandIdentifier, questName, maxAmount, countProperty);
    }
    if (players[playerId].rightHandPrefab === prefabId && players[playerId][countProperty] < maxAmount) {
      return eatItem(playerId, players[playerId].rightHandIdentifier, questName, maxAmount, countProperty);
    }
    return false;
  }

  function startMainQuest(playerId) {
    players[playerId].hasTalkedToMurichiro = true;
    savePlayerData();

    console.log(`Sending first message to player ${playerId}`);

    murichiroquestitems.send(`Player message ${playerId} "Muichiro:  What was that bird called? a... bluebird was it?" 10`);
    setTimeout(() => {
      murichiroquestitems.send(`Player message ${playerId} "Muichiro: maybe... it was? anyways what brings you here." 10`);
      setTimeout(() => {
        murichiroquestitems.send(`Player message ${playerId} "Muichiro: oh... i see... you come to learn mist breathing..." 10`);
        setTimeout(() => {
          murichiroquestitems.send(`Player message ${playerId} "Muichiro: i can teach you mist... at some requirements of course." 10`);
          setTimeout(() => {
            murichiroquestitems.send(`Player message ${playerId} "Muichiro: these are the requirements..." 10`); 
            setTimeout(() => {
              murichiroquestitems.send(`Player message ${playerId} "Muichiro: 15 blue feathers 8 whitegold for my new sword, and 50 coins." 10`);
              setTimeout(() => {
                murichiroquestitems.send(`Player message ${playerId} "Muichiro: come back once you get all those requirements." 10`);
              }, 10000);
            }, 1000);
          }, 10000);
        }, 10000);
      }, 10000);
    }, 10000);
  }

  function checkQuestCompletion(playerId) {
    let player = players[playerId];
    return (
      player.eatenCountmistbluefeathers >= 15 &&
      player.eatenCountmistwhitegold >= 8 &&
      player.eatenCountmistgold >= 50
    );
  }
  

  function updatePlayerDetailsMurichiroMessage() {
    Object.keys(players).forEach(playerId => {
      murichiroquestitems.send(`player detailed ${playerId}`).then(response => {
        let playerData = response.data.Result;
        players[playerId] = { ...players[playerId], ...playerData };

        if (isAtLocation(playerId, targetPosition, detectionRadius)) {
          if (!players[playerId].hasTalkedToMurichiro) {
            console.log(`Player ${playerId} is near Muichiro and hasn't talked to him yet.`);
            startMainQuest(playerId);
          }
        }
      }).catch(err => console.error(`Error fetching details for ${playerId}:`, err));
    });
  }

  function isAtLocation(playerId, targetPos, threshold) {
    const player = players[playerId];
    if (!player || !player.Position) return false;

    const playerPos = player.Position;
    return getDistance(playerPos, targetPos) < threshold;
  }

  function getDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1[0] - pos2[0], 2) +
      Math.pow(pos1[1] - pos2[1], 2) +
      Math.pow(pos1[2] - pos2[2], 2)
    );
  }

  async function eatItem(playerId, itemId, questName, maxAmount, countProperty) {
    murichiroquestitems.send(`wacky destroy ${itemId}`);

    players[playerId][countProperty]++;
    console.log(`Player ${playerId} ate for ${questName}. Count: ${players[playerId][countProperty]}`);

    murichiroquestitems.send(`Player message ${playerId} "${players[playerId][countProperty]}/${maxAmount}"`);
    await savePlayerData();

    if (checkQuestCompletion(playerId) && !players[playerId].completedQuest) {
      players[playerId].completedQuest = true;
      await savePlayerData();
      murichiroquestitems.send(`Player message ${playerId} "All Items Gotten Return To Muichiro" 10`);
    }
  }

  function isEating(playerId) {
    const player = players[playerId];

    if (!player || !player.hasTalkedToMurichiro) return false;

    if (!player.HeadPosition || (!player.LeftHandPosition && !player.RightHandPosition)) return false;

    const headPos = player.HeadPosition;
    const leftHandPos = player.LeftHandPosition || null;
    const rightHandPos = player.RightHandPosition || null;
    const threshold = 0.2;

    return (
        (leftHandPos && getDistance(headPos, leftHandPos) < threshold &&
          (player.leftHandPrefab === 13158 || player.leftHandPrefab === 61648 || player.leftHandPrefab === 7918)) ||
        (rightHandPos && getDistance(headPos, rightHandPos) < threshold &&
          (player.rightHandPrefab === 13158 || player.rightHandPrefab === 61648 || player.rightHandPrefab === 7918))
      );
  }

  setInterval(updatePlayerList, 500);
  setInterval(updateInventory, 1000);
  setInterval(updatePlayerDetails, 1000);
  setInterval(updatePlayerDetailsMurichiroMessage, 500);
  setInterval(savePlayerData, 5000);
});











// THIS PART IS FOR BREATHING STYLES NOT QUEST USE SPACE ABOVE!!!
// THIS PART IS FOR BREATHING STYLES NOT QUEST USE SPACE ABOVE!!!
// THIS PART IS FOR BREATHING STYLES NOT QUEST USE SPACE ABOVE!!!
// THIS PART IS FOR BREATHING STYLES NOT QUEST USE SPACE ABOVE!!!
// THIS PART IS FOR BREATHING STYLES NOT QUEST USE SPACE ABOVE!!!
// THIS PART IS FOR BREATHING STYLES NOT QUEST USE SPACE ABOVE!!!
// THIS PART IS FOR BREATHING STYLES NOT QUEST USE SPACE ABOVE!!!
// THIS PART IS FOR BREATHING STYLES NOT QUEST USE SPACE ABOVE!!!

bot.on('connect', (BreathingBot) => {
  let players = {};

  function updatePlayerList() {
    BreathingBot.send('player list').then(response => {
      const playerList = response.data.Result;

      playerList.forEach(player => {
        players[player.id] = { id: player.id, username: player.username };
      });
    }).catch(err => console.error("Error fetching player list:", err));
  }

  function updateInventory() {
    Object.keys(players).forEach(playerId => {
      BreathingBot.send(`player inventory ${playerId}`).then(response => {
        const inventory = response.data.Result;
        let inventoryData = Array.isArray(inventory) ? inventory[0] : inventory;

        const leftHand = inventoryData?.LeftHand || null;
        const rightHand = inventoryData?.RightHand || null;

        players[playerId].leftHandItem = leftHand?.Name || "Empty";
        players[playerId].rightHandItem = rightHand?.Name || "Empty";
        players[playerId].leftHandPrefab = leftHand?.PrefabHash || null;
        players[playerId].rightHandPrefab = rightHand?.PrefabHash || null;
        players[playerId].leftHandIdentifier = leftHand?.Identifier || null;
        players[playerId].rightHandIdentifier = rightHand?.Identifier || null;
      }).catch(err => console.error(`Error fetching inventory for ${playerId}:`, err));
    });
  }

  function updatePlayerDetails() {
    Object.keys(players).forEach(playerId => {
      BreathingBot.send(`player detailed ${playerId}`).then(response => {
        const playerData = response.data.Result;
        players[playerId] = { ...players[playerId], ...playerData };

        checkBreathingReady(playerId, players[playerId]);
      }).catch(err => console.error(`Error fetching detailed data for ${playerId}:`, err));
    });
  }

  // ===== Breathing Activation Check =====
  function isNearPosition(handPos, targetPos, radius = 0.3) {
    if (!handPos || !targetPos) return false;
    const dx = handPos[0] - targetPos[0];
    const dy = handPos[1] - targetPos[1];
    const dz = handPos[2] - targetPos[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz) < radius;
  }

  function isNearBody(pos, body, radius = 0.3) {
    if (!pos || !body) return false;
    return isNearPosition(pos, body, radius);
  }

  function checkBreathingReady(playerId, player) {
    const stanceA = [-894.026733, 161.293076, 60.51569];
    const stanceB = [-894.6758, 161.821426, 60.7480431];

    const leftHand = player.LeftHandPosition;
    const rightHand = player.RightHandPosition;
    const body = player.BodyPosition;

    const holdingKatana = 
      player.leftHandPrefab === 34994 || player.rightHandPrefab === 34994;

    const handsInStanceA =
      isNearPosition(leftHand, stanceA) &&
      isNearPosition(rightHand, stanceA) &&
      isNearBody(leftHand, body) &&
      isNearBody(rightHand, body);

    const handsInStanceB =
      isNearPosition(leftHand, stanceB) &&
      isNearPosition(rightHand, stanceB) &&
      isNearBody(leftHand, body) &&
      isNearBody(rightHand, body);

    if (holdingKatana && (handsInStanceA || handsInStanceB)) {
      if (!player.breathingReady) {
        player.breathingReady = true;
        BreathingBot.send(`player message ${playerId} "You are ready to perform your breathing form!"`);
      }
    } else {
      player.breathingReady = false;
    }
  }

  // ===== Update Loops =====
  setInterval(updatePlayerList, 1000);
  setInterval(updateInventory, 1000);
  setInterval(updatePlayerDetails, 500);
});





bot.on('connect', tokenBot => {
  const TARGET_POSITIONS = {
    slayer: { x: -650.874146, y: 129.5223, z: 188.732666 },
    demon: { x: -651.4052, y: 129.526184, z: 188.783127 }
  };

  const THRESHOLD = 0.4;
  const playerFactions = {};

  function getDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1[0] - pos2.x, 2) +
      Math.pow(pos1[1] - pos2.y, 2) +
      Math.pow(pos1[2] - pos2.z, 2)
    );
  }

  function updatePlayerPositions() {
    tokenBot.send("player list").then(res => {
      const players = res.data.Result;

      players.forEach(player => {
        const playerId = player.id;

        tokenBot.send(`player inventory ${playerId}`).then(res => {
          const invo = res.data.Result;

        if (playerFactions[playerId]) return;

        tokenBot.send(`player detailed ${playerId}`).then(res => {
          const data = res.data.Result;


          const left = data.LeftHandPosition;
          const right = data.RightHandPosition;
                    if (!left && !right) return;

          const isNear = (handPos, tokenPos) =>
            handPos && getDistance(handPos, tokenPos) < THRESHOLD;

          if (isNear(left, TARGET_POSITIONS.slayer) || isNear(right, TARGET_POSITIONS.slayer)) {
            playerFactions[playerId] = "slayer";
            setTimeout(() => {
              tokenBot.send(`player message ${playerId} "Check Your Mail Box For Your Starter Gear" 3`)
              tokenBot.send(`trade post ${playerId} katana`)
              tokenBot.send(`trade post ${playerId} bag`)
            },5000)
            tokenBot.send(`player message ${playerId} "You joined the Demon Slayer Corps!" 3`)
          } else if (isNear(left, TARGET_POSITIONS.demon) || isNear(right, TARGET_POSITIONS.demon)) {
            playerFactions[playerId] = "demon";
            setTimeout(() => {
              tokenBot.send(`player message ${playerId} "check your mailbox for your buff (later on the buff will be applied right from the start)"`)
              tokenBot.send(`trade post ${playerId} flowerred`)
              tokenBot.send(`trade post ${playerId} bag`)
            },5000)
            tokenBot.send(`player message ${playerId} "You embraced the power of demons!"`)
          }
          function isNearPosition(handPos, targetPos, radius = 0.3) {
            const dx = handPos[0] - targetPos[0];
            const dy = handPos[1] - targetPos[1];
            const dz = handPos[2] - targetPos[2];
            return Math.sqrt(dx * dx + dy * dy + dz * dz) < radius;
          }
          function isNearBody(pos, body, radius = 0.3) {
            if (!pos || !body) return false;
            return isNearPosition(pos, body, radius);
          }} 
       )});

       function isNearPosition(handPos, targetPos, radius = 0.3) {
        const dx = handPos[0] - targetPos[0];
        const dy = handPos[1] - targetPos[1];
        const dz = handPos[2] - targetPos[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz) < radius;
      }
      
      function isNearBody(pos, body, radius = 0.3) {
        if (!pos || !body) return false;
        return isNearPosition(pos, body, radius);
      }
      });
    });    
  }
setInterval(updatePlayerPositions, 1000);
});


bot.start();
discordbot.login('---');
