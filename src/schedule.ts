export type Station = {
  id: string;
  name: string;
  minFromRetiro: number;
};

export type Line = {
  id: string;
  name: string;
  stations: Station[];
};

export type Train = {
  clock: string;
  inMin: number;
};

const TZ = "America/Argentina/Buenos_Aires";

export const LINES: Line[] = [
  {
    id: "mitre-retiro-tigre",
    name: "Mitre · Retiro–Tigre",
    stations: [
      { id: "retiro", name: "Retiro", minFromRetiro: 0 },
      { id: "lisandro", name: "Lisandro de la Torre", minFromRetiro: 3 },
      { id: "belgrano-c", name: "Belgrano C", minFromRetiro: 7 },
      { id: "nunez", name: "Núñez", minFromRetiro: 10 },
      { id: "rivadavia", name: "Rivadavia", minFromRetiro: 13 },
      { id: "vicente-lopez", name: "Vicente López", minFromRetiro: 16 },
      { id: "olivos", name: "Olivos", minFromRetiro: 20 },
      { id: "la-lucila", name: "La Lucila", minFromRetiro: 23 },
      { id: "martinez", name: "Martínez", minFromRetiro: 26 },
      { id: "acassuso", name: "Acassuso", minFromRetiro: 29 },
      { id: "san-isidro", name: "San Isidro", minFromRetiro: 32 },
      { id: "beccar", name: "Beccar", minFromRetiro: 36 },
      { id: "victoria", name: "Victoria", minFromRetiro: 40 },
      { id: "virreyes", name: "Virreyes", minFromRetiro: 44 },
      { id: "san-fernando", name: "San Fernando", minFromRetiro: 47 },
      { id: "carupa", name: "Carupá", minFromRetiro: 51 },
      { id: "tigre", name: "Tigre", minFromRetiro: 58 },
    ],
  },
];

const WEEKDAY = {
  toTigre: { first: hm("06:55"), last: hm("21:32"), every: 15 },
  toRetiro: { first: hm("06:40"), last: hm("20:53"), every: 15 },
};

const WEEKEND = {
  toTigre: { first: hm("07:40"), last: hm("21:30"), every: 25 },
  toRetiro: { first: hm("07:40"), last: hm("20:57"), every: 25 },
};

function hm(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function range(first: number, last: number, every: number) {
  const out: number[] = [];
  for (let t = first; t <= last; t += every) out.push(t);
  return out;
}

export function clockNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const weekday = get("weekday");
  return {
    minutes: hour * 60 + minute,
    weekend: weekday === "Sat" || weekday === "Sun",
    label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

function formatClock(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function nextTrains(line: Line, stationId: string, now = new Date()): {
  toTigre: Train[];
  toRetiro: Train[];
} {
  const { minutes, weekend } = clockNow(now);
  const stations = line.stations;
  const index = stations.findIndex((s) => s.id === stationId);
  if (index < 0) return { toTigre: [], toRetiro: [] };
  const cfg = weekend ? WEEKEND : WEEKDAY;
  const total = stations[stations.length - 1].minFromRetiro;
  const offset = stations[index].minFromRetiro;

  const pick = (times: number[]): Train[] =>
    times
      .filter((t) => t > minutes)
      .slice(0, 3)
      .map((t) => ({ clock: formatClock(t), inMin: t - minutes }));

  const toTigre =
    index === stations.length - 1
      ? []
      : pick(range(cfg.toTigre.first, cfg.toTigre.last, cfg.toTigre.every).map((dep) => dep + offset));

  const toRetiro =
    index === 0
      ? []
      : pick(
          range(cfg.toRetiro.first, cfg.toRetiro.last, cfg.toRetiro.every).map(
            (dep) => dep + (total - offset),
          ),
        );

  return { toTigre, toRetiro };
}
