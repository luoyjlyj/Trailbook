import { useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'react-native';
import { Body, Button, Card, Choices, Field, Heading, Notice, Page, s } from '../components/ui';
import { places, interests } from '../lib/travel';
import { prototypePhotos } from '../assets/prototype-photos';
import { useTravel } from '../state/TravelContext';

export function DiscoverScreen() {
  const [filter, setFilter] = useState('全部');
  const [search, setSearch] = useState('');
  const { setDraft } = useTravel();
  const shown = places.filter(place => (filter === '全部' || place.category === filter) && `${place.name}${place.category}`.includes(search.trim()));
  return <Page title={'先找到喜欢的，\n再慢慢出发。'} eyebrow="EXPLORE THE CITY">
    <Body>从一碗小面到一片灯火，收藏你喜欢的城市片段。</Body><Notice>以下为人工固定演示卡片，不是实时搜索、推荐或已核验地点库。</Notice>
    <Field label="搜索演示内容" value={search} onChange={setSearch} placeholder="例如：小面、夜景" />
    <Choices values={['全部', ...interests]} selected={[filter]} onSelect={setFilter} />
    {shown.map(place => <Card key={place.id}>{place.photo && <Image source={{ uri: prototypePhotos[place.photo] }} style={s.photo} accessibilityLabel={`${place.name}演示图片`} />}<Heading>{place.name}</Heading><Body>{place.category} · {place.description}</Body><Button title={`查看${place.name}详情`} secondary onPress={() => router.push({ pathname: '/place', params: { id: place.id } })} /><Button title={`带着${place.category}去计划`} onPress={() => { setDraft(current => ({ ...current, interests: [...new Set([...current.interests, place.category])] })); router.push('/plan'); }} /></Card>)}
    {!shown.length && <Card><Heading>还没找到这个关键词</Heading><Body>这里只搜索本地几张演示卡片，不会查询外部地点。</Body><Button title="清除筛选" secondary onPress={() => { setFilter('全部'); setSearch(''); }} /></Card>}
    <Button title="记录自己的攻略线索" secondary onPress={() => router.push('/plan')} />
  </Page>;
}
