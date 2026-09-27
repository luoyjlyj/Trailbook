import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'react-native';
import { Body, Button, Card, Dialog, Heading, Notice, Page, s } from '../components/ui';
import { findPlace } from '../lib/travel';
import { prototypePhotos } from '../assets/prototype-photos';
import { useTravel } from '../state/TravelContext';

export function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const place = typeof id === 'string' ? findPlace(id) : undefined;
  const { library, toggleFavorite, ready, storageError, persistent } = useTravel();
  const [message, setMessage] = useState('');
  if (!place) return <Page title="没有找到这个地点" back><Notice>链接中的地点不存在，演示内容未被更改。</Notice><Button title="去发现页看看" onPress={() => router.replace('/discover')} /></Page>;
  const favorite = library.favorites.includes(place.id);
  return <Page title={place.name} eyebrow={`PLACE NOTES · ${place.category}`} back>
    {place.photo && <Image source={{ uri: prototypePhotos[place.photo] }} accessibilityLabel={`${place.name}演示图片`} style={s.photo} />}
    <Notice warning>演示内容 · 未核验。图片沿用原型，不作为地点真实性或开放状态的证明。</Notice>
    <Card><Heading>关于这里</Heading><Body>{place.description}</Body><Heading>为什么出现在样例中</Heading><Body>{place.reason}</Body></Card>
    <Card><Heading>出发前还需要确认</Heading><Body>营业时间：未知</Body><Body>地址与坐标：尚未核验</Body><Body>价格、预约与无障碍条件：未知</Body><Body>来源：项目内固定演示资料，未查询外部平台</Body><Body>最近核验时间：尚未核验</Body></Card>
    <Button title={favorite ? '取消收藏' : '收藏这个示例'} disabled={!ready || !!storageError} onPress={() => {
      if (!toggleFavorite(place.id)) setMessage('操作未保存，请查看本机存储提示。');
      else setMessage(favorite ? '已取消收藏。' : persistent ? '已收藏到此浏览器，没有上传。' : '已收藏到本次运行内存，关闭后会丢失。');
    }} />
    {!!message && <Dialog title="收藏提示" onClose={() => setMessage('')}><Body>{message}</Body></Dialog>}
  </Page>;
}
