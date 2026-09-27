import { z } from 'zod';

export const interests = ['地道美食', '城市夜景', '历史人文', '城市漫步', '室内备选'] as const;
export const paces = ['留点空白', '刚刚好', '尽兴多逛'] as const;
export const transports = ['步行＋地铁', '打车优先'] as const;

export function dateValue(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || year < 2000 || year > 2100 || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value ? date.getTime() : null;
}

const text = () => z.string({ error: '请填写文字。' }).trim();
const date = text().refine(value => dateValue(value) !== null, '请输入有效日期 YYYY-MM-DD（2000 至 2100 年）。');
const time = text().regex(/^([01]\d|2[0-3]):[0-5]\d$/, '请输入有效的 24 小时制时间 HH:mm。');
const location = text().min(1, '请填写地点或住宿信息。').max(120, '请控制在 120 字以内。');

// Independently validate all input: client-side checks are not a trust boundary.
export const travelRequestSchema = z.strictObject({
  city: text().refine(value => value === '重庆', '当前仅支持重庆。'),
  startDate: date,
  endDate: date,
  arrivalTime: time,
  departureTime: time,
  arrivalPlace: location,
  departurePlace: location,
  hotel: location,
  guide: text().max(2000, '攻略线索请控制在 2000 字以内。').default(''),
  interests: z.array(z.enum(interests, { error: '包含不支持的兴趣选项。' }), { error: '兴趣必须为数组。' })
    .min(1, '请至少选择一个兴趣。').max(5, '兴趣最多选择 5 项。')
    .refine(values => new Set(values).size === values.length, '兴趣选项不能重复。'),
  pace: z.enum(paces, { error: '请选择有效的行程节奏。' }),
  transport: z.enum(transports, { error: '请选择有效的交通偏好。' }),
  needs: text().max(500, '特殊需求请控制在 500 字以内。').default(''),
}).superRefine((value, context) => {
  const start = dateValue(value.startDate);
  const end = dateValue(value.endDate);
  if (start === null || end === null) return;
  if (end < start || (end === start && value.departureTime <= value.arrivalTime)) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: '离开时间必须晚于到达时间。' });
  } else if ((end - start) / 86400000 > 6) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: '首版请填写 1 至 7 个自然日的旅行。' });
  }
});

export type TravelRequest = z.infer<typeof travelRequestSchema>;
