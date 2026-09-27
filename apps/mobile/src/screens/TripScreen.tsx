import { useState } from 'react';
import { router } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { Body, Button, Card, Choices, Dialog, Heading, Notice, Page, s } from '../components/ui';
import { findPlace } from '../lib/travel';
import { prototypePhotos } from '../assets/prototype-photos';
import { useTravel } from '../state/TravelContext';

export function TripScreen() {
  const state = useTravel();
  const { trip, dayIndex, setDayIndex, view, setView, newDemo, dirty, save, edit, canUndo, undo } = state;
  const [message, setMessage] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [reset, setReset] = useState(false);
  if (!trip) return <Page title="下一程，等你出发" eyebrow="YOUR ITINERARY"><Card><Heading>还没有打开行程</Heading><Body>先填写旅行需求，或者打开固定样例，体验按日查看、收藏和调整。</Body><Button title="创建旅行需求" onPress={() => router.push('/plan')} /><Button title="打开固定演示行程" secondary onPress={newDemo} /><Button title="查看本机保存" secondary onPress={() => router.navigate('/me')} /></Card><Notice>演示行程与表单输入无关，不能作为真实出行建议。</Notice></Page>;
  const day = trip.days[dayIndex] ?? trip.days[0]!;
  return <Page title={trip.title} eyebrow="YOUR ITINERARY · 演示" footer={<Button title={dirty ? '保存当前演示到本机' : '已保存 · 再次保存'} disabled={!state.ready || !!state.storageError} onPress={() => setMessage(save())} />}>
    <Body>{trip.hotel}　·　{dirty ? '有尚未保存的内容' : '与保存副本一致'}</Body>
    <Notice>固定样例：2026-10-01 至 10-03。时间仅示意，未核验营业、交通或返程缓冲，不依据你的需求生成。</Notice>
    <Choices values={trip.days.map((entry, index) => `第 ${index + 1} 天 · ${entry.date.slice(5)}`)} selected={[`第 ${dayIndex + 1} 天 · ${day.date.slice(5)}`]} onSelect={value => setDayIndex(trip.days.findIndex((entry, index) => value === `第 ${index + 1} 天 · ${entry.date.slice(5)}`))} />
    <Heading>{day.caption}</Heading>
    <Choices values={['时间线', '地图与顺序']} selected={[view === 'timeline' ? '时间线' : '地图与顺序']} onSelect={value => setView(value === '时间线' ? 'timeline' : 'map')} />
    <Notice>天气未知 · 尚未接入天气服务，不判断晴雨或温度。</Notice>
    {view === 'map' && <Card><Text style={{ fontSize: 38, color: '#78917d', textAlign: 'center' }}>⌁</Text><Heading>地图暂未连接</Heading><Body>没有真实坐标、底图或导航路线。下面仅展示与时间线一致的地点顺序，不表示距离或方位。</Body><Body>交通方式、距离与耗时：待接入地图服务。</Body></Card>}
    {!day.items.length && <Card><Heading>这一天留白了</Heading><Body>当天活动已移除。可撤销最后一次调整，或在页面底部新建一份完整样例。</Body></Card>}
    {day.items.map((item, index) => {
      const place = findPlace(item.placeId)!;
      return <Card key={item.id}>
        <View style={s.row}><Text style={[s.badge, { minWidth: 46 }]}>{view === 'map' ? `${index + 1}` : item.time}</Text><View style={s.grow}><Heading>{place.name}</Heading><Text style={s.hint}>{place.category} · {item.locked ? '已锁定活动与时段' : '可调整的示例'}</Text></View></View>
        {view === 'timeline' && place.photo && <Image source={{ uri: prototypePhotos[place.photo] }} style={[s.photo, { height: 125 }]} accessibilityLabel={`${place.name}演示图片`} />}
        <Button title={`查看${place.name}详情`} secondary onPress={() => router.push({ pathname: '/place', params: { id: place.id } })} />
        <View style={s.wrap}>
          <Button title={`${item.locked ? '解锁' : '锁定'} ${item.time}`} secondary onPress={() => edit(item.id, 'lock')} />
          <Button title={`替换 ${item.time}`} secondary disabled={item.locked} onPress={() => router.push({ pathname: '/adjust', params: { item: item.id } })} />
          <Button title={`移除 ${item.time}`} secondary disabled={item.locked} onPress={() => setRemoveId(item.id)} />
        </View>
        {index < day.items.length - 1 && <Text style={s.hint}>↓ 下一站交通信息未查询，不提供虚构耗时。</Text>}
      </Card>;
    })}
    <Button title="撤销上一次调整" secondary disabled={!canUndo} onPress={undo} />
    <Button title="新建一份完整演示" secondary onPress={() => setReset(true)} />
    {!!message && <Dialog title="保存结果" onClose={() => setMessage('')}><Body>{message}</Body></Dialog>}
    {removeId && <Dialog title="移除这项活动？" onClose={() => setRemoveId(null)} confirmLabel="确认移除" onConfirm={() => { edit(removeId, 'remove'); setRemoveId(null); }}><Body>仅修改当前演示。不会自动重排其他时间或重新计算交通；保存副本不会随之更改，直到你再次保存。</Body></Dialog>}
    {reset && <Dialog title="重新打开完整样例？" onClose={() => setReset(false)} confirmLabel="新建演示" onConfirm={() => { newDemo(); setReset(false); }}><Body>当前未保存的调整会被丢弃；已经保存到本机的副本不会删除。</Body></Dialog>}
  </Page>;
}
