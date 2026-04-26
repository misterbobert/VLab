export const LIBRARY = [
  {
    id: "sources",
    name: "Sources",
    items: [{ type: "battery", label: "Baterie", icon: "🔋", meta: "V + Rezistență internă", sprite: "assets/sprites/battery.png" }],
  },
  {
    id: "passive",
    name: "Passive",
    items: [
  { type: "resistor", label: "Resistor", icon: "R", meta: "Ω bands", sprite: null },
  { type: "capacitor", label: "Capacitor", icon: "C", meta: "charge", sprite: null },
  { type: "bulb", label: "Bulb", icon: "💡", meta: "brightness", sprite: null },
  { type: "switch", label: "Switch", icon: "S", meta: "open/close", sprite: null },
],
  },
  {
    id: "instruments",
    name: "Instruments",
    items: [
      { type: "voltmeter", label: "Voltmetru", icon: "V", meta: "ΔV", sprite: null },
      { type: "ammeter", label: "Ampermetru", icon: "A", meta: "I", sprite: null },
      { type: "ohmmeter", label: "Ohmmetru", icon: "Ω", meta: "Req", sprite: null },
    ],
  },
];