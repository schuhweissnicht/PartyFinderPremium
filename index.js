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
            ChatLib.command(`pc ${user} is on my thrower list! Reason: ${reason}`);
          }, 150);
        }
        setTimeout(() => {
          ChatLib.command(`p kick ${user}`);
        }, KICKDELAY);
      } else if (!Settings[`${userClass.toLowerCase()}Allowed`]) {
        ChatLib.chat(`${Settings.PREFIX} &c<!> &eThis user is playing the &c&l${userClass} &eclass, which you have not allowed to join your party.`);
        if (Settings.kickReason) {
          setTimeout(() => {
            ChatLib.command(`pc ${user} no ${userClass}!`);
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

register("command", (arg1, arg2, ...args) => {
  if (!arg1) {
    Settings.openGUI();
  } else if (arg1.toLowerCase() == "add") {
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
  } else if (arg1.toLowerCase() == "list") {
    ChatLib.chat("&9&m-----------------------------------------------------");
    ChatLib.chat("&r" + Pog.throwernames.map((name, index) => `&3${name} &7(Reason: ${Pog.reasons[index]})`).join("\n&r"));
    ChatLib.chat("&9&m-----------------------------------------------------");
  } else if (arg1.toLowerCase() == "remove") {
    if (arg2) {
      let index = Pog.throwernames.indexOf(arg2.toLowerCase());
      if (index !== -1) {
        Pog.throwernames.splice(index, 1);
        Pog.throwers.splice(index, 1);
        Pog.reasons.splice(index, 1); 
        Pog.save();
        ChatLib.chat(`${Settings.PREFIX} &eRemoved &7` + arg2 + `&e from your thrower list!`);
      } else {
        ChatLib.chat(`${Settings.PREFIX} &cThis person isn't on your thrower list!`);
      }
    } else {
      ChatLib.chat(`${Settings.PREFIX} &cPlease state who you want to remove from your thrower list!`);
    }
  }
}).setName("pfp");
