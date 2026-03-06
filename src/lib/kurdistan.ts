import type { AppLanguage } from "@/lib/locale";

export interface LocalizedOption {
  value: string;
  label: Record<AppLanguage, string>;
}

export interface KurdistanGovernorate extends LocalizedOption {
  cities: LocalizedOption[];
}

export const KURDISTAN_COUNTRY = {
  code: "IQ",
  label: {
    en: "Iraq",
    ckb: "عێراق",
  },
} as const;

export const DEFAULT_DELIVERY_LOCATION = {
  en: "Erbil, Kurdistan Region",
  ckb: "هەولێر، هەرێمی کوردستان",
} as const;

export const KURDISTAN_MARKET_LABEL = {
  en: "Kurdistan",
  ckb: "کوردستان",
} as const;

export const KURDISTAN_GOVERNORATES: KurdistanGovernorate[] = [
  {
    value: "Erbil Governorate",
    label: {
      en: "Erbil Governorate",
      ckb: "پارێزگای هەولێر",
    },
    cities: [
      { value: "Erbil", label: { en: "Erbil", ckb: "هەولێر" } },
      { value: "Shaqlawa", label: { en: "Shaqlawa", ckb: "شەقڵاوە" } },
      { value: "Koya", label: { en: "Koya", ckb: "کۆیە" } },
    ],
  },
  {
    value: "Sulaymaniyah Governorate",
    label: {
      en: "Sulaymaniyah Governorate",
      ckb: "پارێزگای سلێمانی",
    },
    cities: [
      { value: "Sulaymaniyah", label: { en: "Sulaymaniyah", ckb: "سلێمانی" } },
      { value: "Chamchamal", label: { en: "Chamchamal", ckb: "چەمچەماڵ" } },
      { value: "Ranya", label: { en: "Ranya", ckb: "ڕانیە" } },
    ],
  },
  {
    value: "Duhok Governorate",
    label: {
      en: "Duhok Governorate",
      ckb: "پارێزگای دهۆک",
    },
    cities: [
      { value: "Duhok", label: { en: "Duhok", ckb: "دهۆک" } },
      { value: "Zakho", label: { en: "Zakho", ckb: "زاخۆ" } },
      { value: "Akre", label: { en: "Akre", ckb: "ئاکرێ" } },
    ],
  },
  {
    value: "Halabja Governorate",
    label: {
      en: "Halabja Governorate",
      ckb: "پارێزگای هەڵەبجە",
    },
    cities: [
      { value: "Halabja", label: { en: "Halabja", ckb: "هەڵەبجە" } },
      { value: "Khurmal", label: { en: "Khurmal", ckb: "خورمال" } },
    ],
  },
];

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function findGovernorate(governorateValue: string | null | undefined) {
  if (!governorateValue) return null;
  const normalized = normalizeText(governorateValue);
  return KURDISTAN_GOVERNORATES.find((option) => normalizeText(option.value) === normalized) ?? null;
}

export function findGovernorateForCity(cityValue: string | null | undefined) {
  if (!cityValue) return null;
  const normalized = normalizeText(cityValue);
  return (
    KURDISTAN_GOVERNORATES.find((governorate) =>
      governorate.cities.some((city) => normalizeText(city.value) === normalized),
    ) ?? null
  );
}

export function inferGovernorateFromLabel(label: string | null | undefined) {
  if (!label) return null;
  const normalized = normalizeText(label);
  const aliases: Array<{ match: string[]; value: string }> = [
    {
      value: "Erbil Governorate",
      match: ["erbil", "hawler", "هەولێر", "اربيل", "أربيل"],
    },
    {
      value: "Sulaymaniyah Governorate",
      match: ["sulaymaniyah", "sulaimani", "slimani", "سلێمانی", "السليمانية", "سليمانية"],
    },
    {
      value: "Duhok Governorate",
      match: ["duhok", "dihok", "دهۆک", "دهوك", "دهوك"],
    },
    {
      value: "Halabja Governorate",
      match: ["halabja", "هەڵەبجە", "حلبجة"],
    },
  ];

  return aliases.find((entry) => entry.match.some((candidate) => normalized.includes(candidate)))?.value ?? null;
}

export function getLocalizedGovernorateLabel(governorateValue: string | null | undefined, language: AppLanguage) {
  return findGovernorate(governorateValue ?? "")?.label[language] ?? governorateValue ?? "";
}

export function getLocalizedCityLabel(
  cityValue: string | null | undefined,
  governorateValue: string | null | undefined,
  language: AppLanguage,
) {
  const governorate = findGovernorate(governorateValue ?? "") ?? findGovernorateForCity(cityValue ?? "");
  return governorate?.cities.find((city) => city.value === cityValue)?.label[language] ?? cityValue ?? "";
}

export function normalizeIraqPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  let normalized = digits;
  if (normalized.startsWith("964")) normalized = normalized.slice(3);
  if (normalized.startsWith("0")) normalized = normalized.slice(1);

  if (!/^7\d{9}$/.test(normalized)) {
    return null;
  }

  return `+964${normalized}`;
}
