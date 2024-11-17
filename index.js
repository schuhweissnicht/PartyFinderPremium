/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import Settings from "./config";
import request from "RequestV2";
import PogObject from "PogData";

let KICKDELAY = 600;

const Pog = new PogObject('PartyFinderPremium', {
  throwers: [],
  throwernames: [],
  reasons: [],
});


ChatLib.chat("&9&m--------------------------------------------------");
ChatLib.chat("&3PartyFinderPremium &aLoaded!");
ChatLib.chat("&7Use &3/pfp help &7- Shows all available commands");
ChatLib.chat("&7Use &3/pfp sync &7- Keep usernames up-to-date regularly.");
ChatLib.chat("&9&m--------------------------------------------------");

register('tick', () => {
  if (!Settings.bottomline) return;

  Scoreboard.setLine(1, `§3Ugly Dungeon Rat!`, true)
})

register("chat", (event) => {
  if (!Settings.throwerkick) return;

  let message = ChatLib.getChatMessage(event).removeFormatting();
  let splitMessage = message.split(" joined the dungeon group! ");
  
  if (splitMessage.length < 2) return;

  let user = splitMessage[0].replace("Party Finder > ", "");
  let userClass = splitMessage[1].split(" Level ")[0].split("(")[1];

  if (user === Player.getName()) return;

  request(`https://api.mojang.com/users/profiles/minecraft/${user}`).then((data) => {
    try {
      let jsonData = JSON.parse(data);
      if (!jsonData.id) {
        throw new Error("Invalid Mojang API response");
      }
      let uuid = jsonData.id.toLowerCase();

      let throwerIndex = Pog.throwers.indexOf(uuid);
      if (throwerIndex !== -1) {
        let reason = Pog.reasons[throwerIndex] || "No reason specified";
        ChatLib.chat(`${Settings.PREFIX} &c<!> &eUser &c&l${user} &eis on your thrower list! Reason: ${reason}`);
        if (Settings.kickReason) {
          setTimeout(() => {
            ThrowerMessage = Settings.THROWERMSG.replace("{user}", user);
            ChatLib.command(`pc ${ThrowerMessage} Reason: ${reason}`);
          }, 150);
        }
        setTimeout(() => {
          ChatLib.command(`p kick ${user}`);
        }, KICKDELAY);
      } else if (!Settings[`${userClass.toLowerCase()}Allowed`]) {
        ChatLib.chat(`${Settings.PREFIX} &c<!> &eThis user is playing the &c&l${userClass} &eclass, which you have not allowed to join your party.`);
        if (Settings.kickReason) {
          setTimeout(() => {
            ClassKickMessage = Settings.CLASSKICKMSG.replace("{class}", userClass).replace("{user}", user);
            ChatLib.command(`pc ${ClassKickMessage}`);
          }, 150);
        }
        setTimeout(() => {
          ChatLib.command(`p kick ${user}`);
        }, KICKDELAY)
      }
    } catch (error) {
      ChatLib.chat(`${Settings.PREFIX} &cError parsing Mojang API response: ${error.message}`);
    }
  }).catch((error) => {
    ChatLib.chat(`${Settings.PREFIX} &cThere was an error retrieving user data: ${error.message}`);
  });
}).setCriteria("&r&ejoined the dungeon group! ").setContains();

let syncActive = false;
let syncIndex = 0;
let syncCooldown = 0;
let updatedCount = 0;
let isProcessing = false;

register("command", (arg1, arg2, ...args) => {
  if (!arg1) {
    Settings.openGUI();
  } else if (arg1.toLowerCase() === "help") {
    ChatLib.chat("&9&m-----------------------------------------------------");
    ChatLib.chat("&3Usage of /pfp:");
    ChatLib.chat("&3/pfp &7- Opens the Config");
    ChatLib.chat("&3/pfp add <name> [reason] &7- Adds a user to the thrower list with an optional reason");
    ChatLib.chat("&3/pfp list &7- Shows the full thrower list");
    ChatLib.chat("&3/pfp remove <name> &7- Removes a user from the thrower list");
    ChatLib.chat("&3/pfp check <name> &7- Checks if a user is on the thrower list");
    ChatLib.chat("&9&m-----------------------------------------------------");
  } else if (arg1.toLowerCase() === "add") {
    if (arg2) {
      let reason = args && args.length > 0 ? args.join(" ") : "No reason specified";
      ChatLib.chat(`${Settings.PREFIX} &eWorking...`);
      request(`https://api.mojang.com/users/profiles/minecraft/${arg2}`).then((data) => {
        try {
          let jsonData = JSON.parse(data);
          if (!jsonData.id) {
            throw new Error("Invalid Mojang API response");
          }
          let uuid = jsonData.id.toLowerCase();

          let throwerIndex = Pog.throwers.indexOf(uuid);
          if (throwerIndex !== -1) {
            Pog.reasons[throwerIndex] = reason;
            ChatLib.chat(`${Settings.PREFIX} &7${arg2} &eis already on your thrower list. Reason updated to: &7${reason}.`);
          } else {
            Pog.throwers.push(uuid);
            Pog.throwernames.push(arg2.toLowerCase());
            Pog.reasons.push(reason);
            ChatLib.chat(`${Settings.PREFIX} &7${arg2} &ehas been added to your thrower list with reason: &7${reason}.`);
          }
          Pog.save();
        } catch (error) {
          ChatLib.chat(`${Settings.PREFIX} &cError parsing Mojang API response: ${error.message}`);
        }
      }).catch((error) => {
        ChatLib.chat(`${Settings.PREFIX} &cThere was an error adding this user to your thrower list: ${error.message}`);
      });
    } else {
      ChatLib.chat(`${Settings.PREFIX} &cPlease provide a username to add to the thrower list.`);
    }
  } else if (arg1.toLowerCase() === "list") {
    ChatLib.chat("&9&m-----------------------------------------------------");
    ChatLib.chat("&r" + Pog.throwernames.map((name, index) => `&3${name} &7(Reason: ${Pog.reasons[index]})`).join("\n&r"));
    ChatLib.chat("&9&m-----------------------------------------------------");
  } else if (arg1.toLowerCase() === "remove") {
    if (arg2) {
      let index = Pog.throwernames.indexOf(arg2.toLowerCase());
      if (index !== -1) {
        Pog.throwernames.splice(index, 1);
        Pog.throwers.splice(index, 1);
        Pog.reasons.splice(index, 1); 
        Pog.save();
        ChatLib.chat(`${Settings.PREFIX} &eRemoved &7${arg2}&e from your thrower list!`);
      } else {
        ChatLib.chat(`${Settings.PREFIX} &cThis person isn't on your thrower list!`);
      }
    } else {
      ChatLib.chat(`${Settings.PREFIX} &cPlease state who you want to remove from your thrower list!`);
    }
  } else if (arg1.toLowerCase() === "check") { 
    if (!arg2) {
      ChatLib.chat(`${Settings.PREFIX} &cPlease provide a username to check.`);
      return;
    }

    let index = Pog.throwernames.indexOf(arg2.toLowerCase());
    if (index !== -1) {
        let reason = Pog.reasons[index] || "No reason specified";
        ChatLib.chat(`${Settings.PREFIX} &7${arg2} &eis on your thrower list! Reason: &7${reason}`);
    } else {
        ChatLib.chat(`${Settings.PREFIX} &7${arg2} &eis not on your thrower list!`);
    }
  } else if (arg1 && arg1.toLowerCase() === "sync") {
    let throwers = Pog.throwers;
    let throwerNames = Pog.throwernames;

    if (throwers.length === 0) {
        ChatLib.chat(`${Settings.PREFIX} &cNo throwers to synchronize.`);
        return;
    }

    let estimatedTime = throwers.length;
    let timeMessage = estimatedTime > 60
        ? `${Math.floor(estimatedTime / 60)}m ${estimatedTime % 60}s`
        : `${estimatedTime}s`;

    ChatLib.chat(`${Settings.PREFIX} &aStarting synchronization of ${throwers.length} entries...`);
    ChatLib.chat(`${Settings.PREFIX} &aEstimated time: &e${timeMessage}`);

    syncActive = true;
    syncIndex = 0;
    syncCooldown = 0;
    updatedCount = 0;
    isProcessing = false;
} else {
  ChatLib.chat("&cUnknown command! Use &b/pfp help &cfor a list of commands.");
}
}).setName("pfp");

register("tick", () => {
if (!syncActive || isProcessing) return;

let throwers = Pog.throwers;
let throwerNames = Pog.throwernames;

if (syncCooldown > 0) {
    syncCooldown--;
    return;
}

if (syncIndex >= throwers.length) {
    ChatLib.chat(`${Settings.PREFIX} &aSynchronization complete!`);
    ChatLib.chat(`${Settings.PREFIX} &a${updatedCount} names were updated.`);
    syncActive = false;
    Pog.save();
    return;
}

let uuid = throwers[syncIndex];
let storedName = throwerNames[syncIndex];

isProcessing = true;

request(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
    .then((response) => {
        try {
            let jsonResponse = JSON.parse(response);
            let currentName = jsonResponse.name.toLowerCase();

            if (currentName !== storedName) {
                throwerNames[syncIndex] = currentName;
                updatedCount++;
            }
        } catch (error) {
        }
    })
    .catch((error) => {
    })
    .then(() => {
        syncIndex++;
        syncCooldown = 20;
        isProcessing = false;
    });
});                                         

register("tick", () => {
  if (!Settings.editpf) return;
  if (Player.getOpenedInventory()?.getName() === "Party Finder") {
      let inventory = Player.getOpenedInventory();

      for (let i = 0; i < inventory.getSize(); i++) {
          let item = inventory.getStackInSlot(i);

          if (item && item.getID() === 397) {
              let lore = item.getLore();
              if (!lore) continue;

              if (!lore.some(line => line.includes("Dungeon:")) || !lore.some(line => line.includes("Members:"))) {
                  continue;
              }

              lore = lore.filter(line => !line.includes("'s Party"));

              if (lore.some(line => line.includes("§4⚠ THROWER IN PARTY ⚠"))) {
                  continue;
              }

              let members = [];
              let memberSection = false;

              for (let line of lore) {
                  if (line.includes("Members:")) {
                      memberSection = true;
                      continue;
                  }
                  if (memberSection) {
                      if (line.trim() === "" || line.startsWith("§8")) {
                          break;
                      }
                      if (line.includes(":")) {
                          let memberName = line.split(":")[0].trim();
                          memberName = ChatLib.removeFormatting(memberName).trim().toLowerCase();
                          members.push(memberName);
                      }
                  }
              }

              let throwerNames = [];
              let updatedLore = false;

              lore = lore.map(line => {
                  if (line.includes(":")) {
                      let parts = line.split(":");
                      let memberName = parts[0].trim();
                      let cleanName = ChatLib.removeFormatting(memberName).trim().toLowerCase();

                      if (Pog.throwernames.includes(cleanName)) {
                          throwerNames.push(cleanName);
                          let memberClass = parts[1].trim();
                          updatedLore = true;
                          return `§4§l${ChatLib.removeFormatting(memberName)}§r: ${memberClass}`;
                      }
                  }
                  return line;
              });

              if (throwerNames.length > 0) {
                  let throwerLine = `§7Thrower: §c${throwerNames.join(", ")}`;
                  let noteIndex = lore.findIndex(line => line.includes("Note:"));
                  if (noteIndex !== -1 && !lore.some(line => line.includes("Thrower:"))) {
                      lore.splice(noteIndex + 1, 0, throwerLine);
                      updatedLore = true;
                  }
              }

              if (throwerNames.length > 0 && !lore.some(line => line.includes("⚠ THROWER IN PARTY ⚠"))) {
                let maxLength = Math.max(...lore.map(line => ChatLib.removeFormatting(line).length));
                let warning = "⚠ THROWER IN PARTY ⚠";
                let padding = Math.max(0, Math.floor((maxLength - warning.length) / 2));
                let centeredWarning = " ".repeat(padding) + `§4${warning}`;
            
                lore.push(centeredWarning);
                updatedLore = true;
            	}

              if (updatedLore) {
                  item.setLore(lore);
              }
          }
      }
  }
});
