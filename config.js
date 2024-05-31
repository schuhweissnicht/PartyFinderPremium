import { @Vigilant, @CheckboxProperty, @TextProperty } from 'Vigilance';

@Vigilant("PartyFinderPremium", "§3§lPartyFinderPremium", {
  getCategoryComparator: () => (a, b) => {
    const categories = ["General", "Autokick"];
    return categories.indexOf(a.name) - categories.indexOf(b.name);
  }
})
class Settings {

  @TextProperty({
    name: "Prefix",
    description: "The prefix the mod will use. Default: &3PartyFinderPremium &r>&3",
    category: "General",
    placeholder: ""
  })
  PREFIX = "&3&lPartyFinderPremium &r>&3";

  @CheckboxProperty({
    name: "Automatically Kick Throwers",
    description: "Automatically kick players that are on your throwers list.",
    category: "General",
    subcategory: '/pfp add <username> <reason> | /pfp remove <username> | /pfp list'
  })
  throwerkick = true;

  @CheckboxProperty({
    name: "Send Kick Reason in Party Chat",
    description: "When enabled, it will send the kick reason in party chat.\n(also useful if you are not the Leader)",
    category: "Autokick"
  })
  kickReason = false;

  @CheckboxProperty({
    name: "Archer Allowed",
    category: "Autokick",
    subcategory: 'Allow Classes'
  })
  archerAllowed = true;

  @CheckboxProperty({
    name: "Berserker Allowed",
    category: "Autokick",
    subcategory: 'Allow Classes'
  })
  berserkAllowed = true;

  @CheckboxProperty({
    name: "Mage Allowed",
    category: "Autokick",
    subcategory: 'Allow Classes'
  })
  mageAllowed = true;

  @CheckboxProperty({
    name: "Tank Allowed",
    category: "Autokick",
    subcategory: 'Allow Classes'
  })
  tankAllowed = true;

  @CheckboxProperty({
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
