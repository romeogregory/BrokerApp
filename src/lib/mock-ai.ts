import { Property, Advert, Platform } from "./types";

interface AdvertTemplate {
  titleTemplate: (p: Property) => string;
  descriptionTemplate: (p: Property) => string;
  featuresTemplate: (p: Property) => string[];
}

const historicTemplate: AdvertTemplate = {
  titleTemplate: (p) =>
    `Karakteristiek ${p.buildYear < 1900 ? "grachtenpand" : "herenhuis"} in ${p.city}`,
  descriptionTemplate: (p) =>
    `Prachtige woning aan ${p.address} in het hart van ${p.city}. ` +
    `Dit ${p.buildYear < 1900 ? "monumentale pand" : "sfeervolle herenhuis"} uit ${p.buildYear} biedt ${p.squareMeters}m² woonoppervlak ` +
    `verdeeld over ${p.rooms} kamers. De woning combineert authentieke details zoals hoge plafonds en ` +
    `originele ornamenten met moderne voorzieningen. ` +
    `De ${p.bedrooms} slaapkamers en ${p.bathrooms} badkamer${p.bathrooms > 1 ? "s" : ""} zijn stijlvol afgewerkt. ` +
    `Energielabel ${p.energyLabel} garandeert een comfortabel woonklimaat het hele jaar door. ` +
    `Een unieke kans om te wonen op een van de mooiste locaties van ${p.city}.`,
  featuresTemplate: (p) => [
    `Bouwjaar ${p.buildYear} met authentieke details`,
    `${p.squareMeters}m² woonoppervlak`,
    `${p.bedrooms} slaapkamers en ${p.bathrooms} badkamer${p.bathrooms > 1 ? "s" : ""}`,
    `Energielabel ${p.energyLabel}`,
    `Centrale ligging in ${p.city}`,
  ],
};

const modernTemplate: AdvertTemplate = {
  titleTemplate: (p) =>
    `Modern ${p.rooms}-kamerappartement in ${p.city}`,
  descriptionTemplate: (p) =>
    `Stijlvol en licht appartement aan ${p.address}, ${p.city}. ` +
    `Deze moderne woning uit ${p.buildYear} is perfect voor wie comfort en stedelijk wonen wil combineren. ` +
    `Met ${p.squareMeters}m² aan woonruimte, een open woonkeuken en ` +
    `${p.bedrooms} ruime slaapkamer${p.bedrooms > 1 ? "s" : ""} biedt deze woning alles wat u zoekt. ` +
    `Dankzij energielabel ${p.energyLabel} zijn de maandelijkse energiekosten aangenaam laag. ` +
    `De buurt biedt een breed scala aan voorzieningen, van winkels tot openbaar vervoer.`,
  featuresTemplate: (p) => [
    `Bouwjaar ${p.buildYear} — moderne afwerking`,
    `Energielabel ${p.energyLabel} — lage energiekosten`,
    `Open woonkeuken met apparatuur`,
    `${p.rooms} kamers waarvan ${p.bedrooms} slaapkamer${p.bedrooms > 1 ? "s" : ""}`,
    `Uitstekende bereikbaarheid met OV`,
  ],
};

const familyTemplate: AdvertTemplate = {
  titleTemplate: (p) =>
    `Ruime gezinswoning met ${p.bedrooms} slaapkamers in ${p.city}`,
  descriptionTemplate: (p) =>
    `Welkom in deze prachtige gezinswoning aan ${p.address} in ${p.city}. ` +
    `Met ${p.squareMeters}m² woonoppervlak en ${p.rooms} kamers is er ruimte voor het hele gezin. ` +
    `De ${p.bedrooms} slaapkamers bieden iedereen een eigen plek, terwijl de ${p.bathrooms} badkamer${p.bathrooms > 1 ? "s" : ""} ` +
    `zorgen voor comfort in het dagelijks leven. ` +
    `Gebouwd in ${p.buildYear} en voorzien van energielabel ${p.energyLabel}. ` +
    `De ligging in ${p.city} biedt nabijheid van scholen, parken en speeltuinen. ` +
    `Een ideale woning om in thuis te komen.`,
  featuresTemplate: (p) => [
    `${p.squareMeters}m² ruim woonoppervlak`,
    `${p.bedrooms} slaapkamers — ruimte voor het hele gezin`,
    `${p.bathrooms} badkamer${p.bathrooms > 1 ? "s" : ""}`,
    `Energielabel ${p.energyLabel}`,
    `Nabij scholen en voorzieningen in ${p.city}`,
    `Bouwjaar ${p.buildYear}`,
  ],
};

function selectTemplate(property: Property): AdvertTemplate {
  if (property.buildYear < 1940) {
    return historicTemplate;
  }
  if (property.bedrooms >= 3) {
    return familyTemplate;
  }
  return modernTemplate;
}

export async function generateAdvert(
  property: Property,
  delay?: number,
): Promise<Advert> {
  const waitMs = delay ?? 2000 + Math.random() * 1000; // 2-3 seconds

  await new Promise((resolve) => setTimeout(resolve, waitMs));

  const template = selectTemplate(property);

  return {
    id: `adv-${Date.now()}`,
    propertyId: property.id,
    title: template.titleTemplate(property),
    description: template.descriptionTemplate(property),
    features: template.featuresTemplate(property),
    platform: Platform.Funda,
    createdAt: new Date(),
  };
}
