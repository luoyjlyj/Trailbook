import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Body, Button, Card, Heading, Notice, Page } from '../components/ui';
import { findPlace, places } from '../lib/travel';
import { useTravel } from '../state/TravelContext';

export function AdjustScreen() {
  const { item: itemId } = useLocalSearchParams<{ item?: string }>();
  const { trip, dayIndex, edit } = useTravel();
  const item = trip?.days[dayIndex]?.items.find(value => value.id === itemId);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  if (!trip || !item) return <Page title="没有可调整的活动" back><Notice>当前活动不存在，可能是刷新、切换行程或移除后打开了旧链接。</Notice><Button title="返回行程" onPress={() => router.replace('/trip')} /></Page>;
  if (item.locked) return <Page title="这项活动已锁定" back><Notice>先回到行程解锁，才能替换或移除。当前安排保持不变。</Notice><Button title="返回行程" onPress={() => router.replace('/trip')} /></Page>;
  const day = trip.days[dayIndex]!;
  const candidates = places.filter(place => !day.items.some(entry => entry.placeId === place.id));
  return <Page title="保留喜欢的，换个体验" eyebrow="MAKE ROOM FOR SOMETHING NEW" back footer={<Button title="应用示例替换" disabled={!selected} onPress={() => {
    if (edit(item.id, 'replace', selected)) router.replace('/trip');
    else setError('活动已变化或被锁定，无法替换。请返回行程重新选择。');
  }} />}>
    <Card><Heading>要替换的安排</Heading><Body>第 {dayIndex + 1} 天 · {item.time} · {findPlace(item.placeId)?.name}</Body><Body>只替换地点，保留示例时段；不会调整其他活动。</Body></Card>
    <Notice warning>此处仅演示调整交互。没有验证营业时间、路线和天气，不代表替换可行；不会伪装成已完成局部重排。</Notice>
    {day.items.some(entry => entry.locked) && <Card><Heading>已锁定，保持不变</Heading>{day.items.filter(entry => entry.locked).map(entry => <Body key={entry.id}>{entry.time} · {findPlace(entry.placeId)?.name}</Body>)}</Card>}
    <Heading>选择一个演示备选</Heading>
    {candidates.map(place => <Card key={place.id}><Heading>{place.name}</Heading><Body>{place.description}</Body><Button title={`选择${place.name}`} secondary selected={selected === place.id} onPress={() => { setSelected(place.id); setError(''); }} /></Card>)}
    {!candidates.length && <Notice>当前没有不重复的备选，原活动保持不变。</Notice>}
    {!!error && <Notice warning>{error}</Notice>}
  </Page>;
}
