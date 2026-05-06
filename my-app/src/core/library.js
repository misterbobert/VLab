export const LIBRARY = [
  {
    id: "sources",
    name: "Surse",
    items: [
      {
        type: "battery",
        label: "Baterie DC",
        icon: "🔋",
        meta: "tensiune + mAh",
        sprite: "assets/sprites/battery.png",
      },
    ],
  },
  {
    id: "passive",
    name: "Componente pasive",
    items: [
      {
        type: "resistor",
        label: "Rezistor",
        icon: "R",
        meta: "Ω + benzi",
        sprite: null,
      },
      {
        type: "potentiometer",
        label: "Potențiometru",
        icon: "↗R",
        meta: "rezistență variabilă",
        sprite: null,
      },
      {
        type: "capacitor",
        label: "Condensator",
        icon: "C",
        meta: "F + încărcare",
        sprite: null,
      },
      {
        type: "bulb",
        label: "Bec",
        icon: "💡",
        meta: "luminozitate",
        sprite: null,
      },
      {
        type: "switch",
        label: "Întrerupător",
        icon: "S",
        meta: "deschis/închis",
        sprite: null,
      },
    ],
  },
  {
    id: "semiconductors",
    name: "Semiconductori",
    items: [
      {
        type: "diode",
        label: "Diodă",
        icon: "▷|",
        meta: "sens unic + Vf",
        sprite: null,
      },
      {
        type: "transistor_npn",
        label: "Tranzistor NPN",
        icon: "NPN",
        meta: "B · C · E",
        sprite: null,
      },
      {
        type: "transistor_pnp",
        label: "Tranzistor PNP",
        icon: "PNP",
        meta: "B · C · E",
        sprite: null,
      },
    ],
  },
  {
    id: "instruments",
    name: "Aparate de măsură",
    items: [
      {
        type: "voltmeter",
        label: "Voltmetru",
        icon: "V",
        meta: "tensiune",
        sprite: null,
      },
      {
        type: "ammeter",
        label: "Ampermetru",
        icon: "A",
        meta: "curent",
        sprite: null,
      },
      {
        type: "ohmmeter",
        label: "Ohmmetru",
        icon: "Ω",
        meta: "rezistență",
        sprite: null,
      },
    ],
  },
];