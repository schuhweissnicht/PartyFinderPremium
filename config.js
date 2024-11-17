import { @Vigilant, @SwitchProperty, @CheckboxProperty, @TextProperty, @NumberProperty, @ButtonProperty } from 'Vigilance';

@Vigilant("PartyFinderPremium", "§3§lPartyFinderPremium", {
  getCategoryComparator: () => (a, b) => {
    const categories = ["General", "Autokick"];
    return categories.indexOf(a.name) - categories.indexOf(b.name);
  }
})
class Settings {

  @TextProperty({
    name: "Prefix",
    description: "The prefix the mod will use for clientside messages. Default: &3PartyFinderPremium &r>&3",
    category: "General",
    placeholder: ""
  })
  PREFIX = "&3PartyFinderPremium &r>&3";

  @TextProperty({
    name: "Thrower Message",
    description: "Customize the party message for when a thrower from your list joins! (The reason is given at the end of the message.)\n§3{user} = Player Name",
    category: "General",
    placeholder: ""
  })
  THROWERMSG = "{user} is on my thrower list!";

  @TextProperty({
    name: "Class kick Message",
    description: "Customize the party message for the classes that you are not allowing!\n§3{user} = Player Name | {class} = Class Name",
    category: "General",
    placeholder: ""
  })
  CLASSKICKMSG = "{user} no {class}!";

  @ButtonProperty({
    name: "Discord",
    description: `Join my Discord Server if you have any questions, feedback, ideas or bug reports! &3Give yourself the Skyblock role to enter the correct channel.`,
    category: "General",
    placeholder: "Join"
})
MyDiscord() {
    java.awt.Desktop.getDesktop().browse(new java.net.URI(`https://discord.com/invite/AtJ2xgzjQY`));
}
  
  @SwitchProperty({
    name: "Dungeon Sweat?",
    description: "§7§kiiiiiiii",
    category: "General",
  })
  bottomline = false;

  @SwitchProperty({
    name: "Edit Party Finders",
    description: "Edit the Tooltip of Partys with Thrower/s inside of the Party Finder GUI.",
    category: "General",
  })
  editpf = true;

  @SwitchProperty({
    name: "Automatically Kick Throwers",
    description: "Automatically kick players that are on your throwers list.",
    category: "General",
    subcategory: '/pfp add <username> [reason] | /pfp remove <username> | /pfp list | /pfp check <username>'
  })
  throwerkick = true;

  @SwitchProperty({
    name: "Send Kick Reason in Party Chat",
    description: "When enabled, it will send the kick reason in party chat.\n(also useful if you are not the Leader)",
    category: "Autokick"
  })
  kickReason = true;

  @SwitchProperty({
    name: "Archer Allowed",
    category: "Autokick",
    subcategory: 'Allow Classes'
  })
  archerAllowed = true;

  @SwitchProperty({
    name: "Berserker Allowed",
    category: "Autokick",
    subcategory: 'Allow Classes'
  })
  berserkAllowed = true;

  @SwitchProperty({
    name: "Mage Allowed",
    category: "Autokick",
    subcategory: 'Allow Classes'
  })
  mageAllowed = true;

  @SwitchProperty({
    name: "Tank Allowed",
    category: "Autokick",
    subcategory: 'Allow Classes'
  })
  tankAllowed = true;

  @SwitchProperty({
    name: "Healer Allowed",
    category: "Autokick",
    subcategory: 'Allow Classes'
  })
  healerAllowed = true;

  constructor() {
    this.initialize(this);
  }
}

export default new Settings;
