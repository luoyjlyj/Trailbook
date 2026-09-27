import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Body, Button, Card, Choices, Field, Heading, Notice, Page } from '../components/ui';
import { interests, paces, transports, validateDraft, type Draft, type DraftErrors } from '../lib/travel';
import { RequestError, submitTravelRequest } from '../lib/api';
import { useTravel } from '../state/TravelContext';

export function PlanScreen() {
  const { draft, setDraft, setReceipt } = useTravel();
  const [attempted, setAttempted] = useState(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState('');
  const [serverErrors, setServerErrors] = useState<DraftErrors>({});
  const activeRequest = useRef<AbortController | null>(null);
  useEffect(() => () => { activeRequest.current?.abort(); activeRequest.current = null; }, []);
  const errors = { ...serverErrors, ...(attempted ? validateDraft(draft) : {}) };
  const cancel = () => { activeRequest.current?.abort(); activeRequest.current = null; setPending(false); };
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    cancel(); setReceipt(null); setFailure(''); setServerErrors({});
    setDraft(current => ({ ...current, [key]: value }));
  };
  const field = (key: Exclude<keyof Draft, 'interests'>, label: string, placeholder: string, hint?: string) => <Field label={label} value={draft[key]} onChange={value => update(key, value)} placeholder={placeholder} error={errors[key]} hint={hint} />;
  const submit = async () => {
    if (activeRequest.current) return;
    setAttempted(true); setFailure(''); setServerErrors({}); setReceipt(null);
    if (Object.keys(validateDraft(draft)).length) return;
    const snapshot = { ...draft, interests: [...draft.interests] };
    const controller = new AbortController();
    activeRequest.current = controller; setPending(true);
    try {
      const result = await submitTravelRequest(snapshot, { signal: controller.signal });
      if (controller.signal.aborted || activeRequest.current !== controller) return;
      setReceipt({ inputKey: JSON.stringify(snapshot), result });
      router.push('/review');
    } catch (error) {
      if (controller.signal.aborted || activeRequest.current !== controller) return;
      setFailure(error instanceof Error ? error.message : '提交失败，请重试。');
      if (error instanceof RequestError) setServerErrors(error.fields);
    } finally {
      if (activeRequest.current === controller) { activeRequest.current = null; setPending(false); }
    }
  };
  return <Page title="先确定你的起点" eyebrow="01 / PLAN YOUR TRIP" back footer={<View style={{ gap: 8 }}>{Object.keys(errors).length > 0 && <Notice warning>还有 {Object.keys(errors).length} 项需要检查，请查看表单中的提示。</Notice>}{!!failure && <Notice warning>{failure}</Notice>}<Button title={pending ? '正在提交，请稍候…' : failure ? '重新提交校验' : '提交到后端校验'} disabled={pending} onPress={() => void submit()} />{pending && <Button title="取消本次提交" secondary onPress={cancel} />}</View>}>
    <Body>把时间、住处和喜欢的体验记下来。先填好需求，再出发。</Body>
    <Notice>点击提交后会将以下信息发送到本地后端做校验，不保存、不生成行程，不调用地图或天气。草稿刷新会清空；编辑或离开页面会取消等待。</Notice>
    <Card><Heading>01　目的地与时间</Heading>{field('city', '目的城市', '重庆', '当前只开放重庆演示。')}
      {field('startDate', '到达日期', '2026-10-01', '格式：YYYY-MM-DD，按目的地当地时间填写。')}
      {field('arrivalTime', '到达时间', '18:30', '24 小时制：HH:mm。')}
      {field('endDate', '离开日期', '2026-10-03')}{field('departureTime', '离开时间', '14:00')}
    </Card>
    <Card><Heading>02　从哪里出发</Heading>
      {field('arrivalPlace', '到达地点', '例如：重庆北站')}{field('departurePlace', '返程地点', '例如：江北机场')}
      {field('hotel', '住宿名称或地址', '例如：解放碑附近的住处', '只是文字信息，尚未定位或核验酒店。')}
    </Card>
    <Card><Heading>03　这次想体验什么</Heading><Choices values={interests} selected={draft.interests} onSelect={value => update('interests', draft.interests.includes(value) ? draft.interests.filter(item => item !== value) : [...draft.interests, value])} />{errors.interests && <Notice warning>{errors.interests}</Notice>}
      <Heading>行程节奏</Heading><Choices values={paces} selected={[draft.pace]} onSelect={value => update('pace', value)} />
      <Heading>交通偏好</Heading><Choices values={transports} selected={[draft.transport]} onSelect={value => update('transport', value)} />
    </Card>
    <Card><Heading>04　还有什么想告诉我们</Heading>
      <Field label="攻略线索（选填）" value={draft.guide} onChange={value => update('guide', value)} placeholder="粘贴来源链接，或写下想去的地点" multiline maxLength={2000} error={errors.guide} hint="原文会随表单提交校验，不保存、不抓取链接、不交给模型。" />
      <Field label="同行、步行与饮食需求（选填）" value={draft.needs} onChange={value => update('needs', value)} placeholder="例如：带长辈、少爬坡、不吃辣" multiline maxLength={500} error={errors.needs} />
    </Card>
  </Page>;
}

export function ReviewScreen() {
  const { draft: currentDraft, receipt, trip, newDemo } = useTravel();
  const valid = Object.keys(validateDraft(currentDraft)).length === 0;
  if (!valid) return <Page title="先补齐出行信息" back><Notice>未找到有效的需求表单，可能是刷新后草稿已清空。</Notice><Button title="前往创建计划" onPress={() => router.replace('/plan')} /></Page>;
  if (!receipt || receipt.inputKey !== JSON.stringify(currentDraft)) return <Page title="这份需求还未通过后端校验" back><Notice>表单可能已修改，或尚未提交。旧校验结果不会用于新的需求。</Notice><Button title="返回表单提交" onPress={() => router.replace('/plan')} /></Page>;
  const draft = receipt.result.request;
  return <Page title="这次，按你的节奏来" eyebrow="02 / YOUR TRAVEL BRIEF" back>
    <Notice>后端校验通过 · 未保存 · 未生成行程。以下是后端返回的需求摘要，共 {receipt.result.durationDays} 个自然日，按重庆当地时间解释。</Notice>
    <Card><Heading>{draft.city} · 出行需求</Heading><Body>到达：{draft.startDate} {draft.arrivalTime} · {draft.arrivalPlace.trim()}</Body><Body>离开：{draft.endDate} {draft.departureTime} · {draft.departurePlace.trim()}</Body><Body>住宿：{draft.hotel.trim()}</Body><Body>兴趣：{draft.interests.join('、')}</Body><Body>{draft.pace} · {draft.transport}</Body>{!!draft.needs.trim() && <Body>特殊需求：{draft.needs.trim()}</Body>}{!!draft.guide.trim() && <Body>攻略原文：{draft.guide.trim()}</Body>}</Card>
    <Card><Heading>真实规划尚未接入</Heading><Body>地点检索、酒店定位、营业时间、交通、天气和规划接口均未连接。现在不会生成真实行程，也不会模拟“AI 正在计算”的进度。</Body><Button title="返回修改需求" secondary onPress={() => router.replace('/plan')} /></Card>
    <Notice warning>你可以继续体验独立的重庆三日样例（2026-10-01 至 10-03）。它不使用上面的日期、住宿或偏好排程，所有时间仅为界面示例。</Notice>
    <Button title={trip ? '继续查看当前演示行程' : '打开固定演示行程'} onPress={() => { if (!trip) newDemo(); router.push('/trip'); }} />
  </Page>;
}
