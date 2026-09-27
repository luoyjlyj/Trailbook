export const interests = ['地道美食', '城市夜景', '历史人文', '城市漫步', '室内备选'] as const;
export const paces = ['留点空白', '刚刚好', '尽兴多逛'] as const;
export const transports = ['步行＋地铁', '打车优先'] as const;

export type Draft = {
  city: string; startDate: string; endDate: string; arrivalTime: string; departureTime: string;
  arrivalPlace: string; departurePlace: string; hotel: string; guide: string;
  interests: string[]; pace: string; transport: string; needs: string;
};
export const emptyDraft: Draft = {
  city: '重庆', startDate: '', endDate: '', arrivalTime: '', departureTime: '',
  arrivalPlace: '', departurePlace: '', hotel: '', guide: '', interests: [],
  pace: '刚刚好', transport: '步行＋地铁', needs: '',
};

export type Place = { id: string; name: string; category: string; photo?: 'night' | 'street' | 'noodles' | 'hotpot'; description: string; reason: string };
export const places: Place[] = [
  { id: 'night', name: '洪崖洞夜景', category: '城市夜景', photo: 'night', description: '以山城江岸夜色为主题的演示地点。实际开放范围、人流与可达性需要查询。', reason: '展示晚间游览卡片与夜景主题，不代表已核验最佳游玩时间。' },
  { id: 'street', name: '山城街巷', category: '城市漫步', photo: 'street', description: '街巷漫步的体验示例，不是一条已测量的步行路线。台阶、坡度和无障碍条件待核验。', reason: '展示慢行体验；正式安排需要结合体力、天气和道路情况。' },
  { id: 'noodles', name: '重庆小面', category: '地道美食', photo: 'noodles', description: '小面用餐的示例卡片，尚未选择具体门店。地址、价格、营业时间和过敏原未知。', reason: '演示午餐时段的表达，不是餐厅推荐或预订。' },
  { id: 'hotpot', name: '重庆火锅', category: '地道美食', photo: 'hotpot', description: '火锅用餐的示例卡片，尚未选择具体门店。需核对饮食限制和等位情况。', reason: '演示晚餐安排；不能据此推算与前后地点的交通时间。' },
  { id: 'museum', name: '室内展馆（示例）', category: '室内备选', description: '用于练习替换操作的虚拟室内候选，未指定真实展馆。预约、开放时间和位置均未知。', reason: '展示室内备选的交互，并不表示当天天气有雨或该候选真实可用。' },
  { id: 'culture', name: '人文展览（示例）', category: '历史人文', description: '用于页面演示的虚拟人文体验，未指定展览或场馆。', reason: '展示兴趣筛选与详情结构，内容仍需人工核验。' },
];
export const findPlace = (id: string) => places.find(place => place.id === id);
export type Activity = { id: string; placeId: string; time: string; locked: boolean };
export type Day = { date: string; caption: string; items: Activity[] };
export type Trip = { id: string; title: string; hotel: string; days: Day[] };
export type SavedTrip = { trip: Trip; savedAt: string };
export const copyTrip = (trip: Trip): Trip => ({ ...trip, days: trip.days.map(day => ({ ...day, items: day.items.map(item => ({ ...item })) })) });

// A fixed UI fixture, deliberately unrelated to form input. Not a route planner.
export function makeDemoTrip(): Trip {
  return {
    id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: '重庆三天两夜', hotel: '解放碑附近的住处（示例）',
    days: [
      { date: '2026-10-01', caption: '抵达 · 慢慢进入山城', items: [
        { id: 'd1-dinner', placeId: 'hotpot', time: '19:30', locked: false },
        { id: 'd1-night', placeId: 'night', time: '21:00', locked: false },
      ] },
      { date: '2026-10-02', caption: '街巷 · 留点空白', items: [
        { id: 'd2-walk', placeId: 'street', time: '10:00', locked: false },
        { id: 'd2-lunch', placeId: 'noodles', time: '12:00', locked: false },
        { id: 'd2-culture', placeId: 'culture', time: '15:30', locked: false },
        { id: 'd2-dinner', placeId: 'hotpot', time: '18:00', locked: false },
      ] },
      { date: '2026-10-03', caption: '返程 · 告别这座城', items: [
        { id: 'd3-walk', placeId: 'street', time: '09:30', locked: false },
        { id: 'd3-lunch', placeId: 'noodles', time: '11:30', locked: false },
      ] },
    ],
  };
}

export function parseDate(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || year < 2000 || year > 2100 || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value ? date.getTime() : null;
}
export const parseTime = (value: string): number | null => /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) : null;
export type DraftErrors = Partial<Record<keyof Draft, string>>;
export function validateDraft(draft: Draft): DraftErrors {
  const errors: DraftErrors = {};
  if (draft.city.trim() !== '重庆') errors.city = '当前只提供重庆演示，请填写重庆。';
  const start = parseDate(draft.startDate), end = parseDate(draft.endDate);
  if (start === null) errors.startDate = '请输入有效日期，例如 2026-10-01。';
  if (end === null) errors.endDate = '请输入有效日期，例如 2026-10-03。';
  const arrival = parseTime(draft.arrivalTime), departure = parseTime(draft.departureTime);
  if (arrival === null) errors.arrivalTime = '请输入 24 小时制时间，例如 18:30。';
  if (departure === null) errors.departureTime = '请输入 24 小时制时间，例如 14:00。';
  if (start !== null && end !== null) {
    if (end < start || (end === start && arrival !== null && departure !== null && departure <= arrival)) errors.endDate = '离开时间必须晚于到达时间。';
    else if ((end - start) / 86400000 > 6) errors.endDate = '首版请填写 1 至 7 个自然日的旅行。';
  }
  for (const key of ['hotel', 'arrivalPlace', 'departurePlace'] as const) {
    if (!draft[key].trim()) errors[key] = '请填写此项；当前只记录文字，不查询位置。';
    else if (draft[key].length > 120) errors[key] = '请控制在 120 字以内。';
  }
  if (draft.guide.length > 2000) errors.guide = '攻略线索请控制在 2000 字以内。';
  if (draft.needs.length > 500) errors.needs = '特殊需求请控制在 500 字以内。';
  if (!draft.interests.length) errors.interests = '请至少选择一个兴趣。';
  return errors;
}

export function updateActivity(trip: Trip, dayIndex: number, itemId: string, action: 'lock' | 'remove' | 'replace', placeId?: string): Trip | null {
  const item = trip.days[dayIndex]?.items.find(entry => entry.id === itemId);
  if (!item || (action !== 'lock' && item.locked)) return null;
  if (action === 'replace' && (!placeId || !findPlace(placeId) || trip.days[dayIndex]?.items.some(entry => entry.placeId === placeId))) return null;
  const next = copyTrip(trip);
  const day = next.days[dayIndex]!;
  day.items = day.items.flatMap(entry => entry.id !== itemId ? [entry] : action === 'remove' ? [] : [{ ...entry, ...(action === 'lock' ? { locked: !entry.locked } : { placeId: placeId! }) }]);
  return next;
}

export type Library = { version: 1; saved: SavedTrip[]; favorites: string[] };
export const emptyLibrary = (): Library => ({ version: 1, saved: [], favorites: [] });
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isTrip(value: unknown): value is Trip {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.length > 100 || typeof value.title !== 'string' || value.title.length > 100 || typeof value.hotel !== 'string' || value.hotel.length > 200 || !Array.isArray(value.days) || value.days.length !== 3) return false;
  return value.days.every(day => isRecord(day) && typeof day.date === 'string' && parseDate(day.date) !== null && typeof day.caption === 'string' && day.caption.length < 200 && Array.isArray(day.items) && day.items.length <= 10 && new Set(day.items.map((item: unknown) => isRecord(item) ? item.id : null)).size === day.items.length && day.items.every((item: unknown) => isRecord(item) && typeof item.id === 'string' && item.id.length < 100 && typeof item.placeId === 'string' && !!findPlace(item.placeId) && typeof item.time === 'string' && parseTime(item.time) !== null && typeof item.locked === 'boolean'));
}
export function decodeLibrary(raw: string): Library {
  if (raw.length > 500000) throw new Error('本地数据过大');
  const data: unknown = JSON.parse(raw);
  if (!isRecord(data) || data.version !== 1 || !Array.isArray(data.saved) || data.saved.length > 20 || !Array.isArray(data.favorites) || data.favorites.length > places.length) throw new Error('本地数据版本或结构不正确');
  if (!data.favorites.every((id: unknown) => typeof id === 'string' && !!findPlace(id)) || !data.saved.every((entry: unknown) => isRecord(entry) && isTrip(entry.trip) && typeof entry.savedAt === 'string' && Number.isFinite(Date.parse(entry.savedAt)))) throw new Error('本地内容无法读取');
  const library = data as Library;
  if (new Set(library.saved.map(entry => entry.trip.id)).size !== library.saved.length) throw new Error('重复的行程');
  return library;
}
