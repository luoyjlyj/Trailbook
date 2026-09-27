import { useState } from 'react';
import { router } from 'expo-router';
import { Body, Button, Card, Dialog, Heading, Notice, Page } from '../components/ui';
import { findPlace } from '../lib/travel';
import { useTravel } from '../state/TravelContext';

export function MeScreen() {
  const state = useTravel();
  const { library, ready, persistent, draft, dirty, trip } = state;
  const [confirm, setConfirm] = useState<{ title: string; body: string; action: () => void } | null>(null);
  const [message, setMessage] = useState('');
  const open = (id: string) => {
    const action = () => { if (state.openSaved(id)) router.navigate('/trip'); else setMessage('未找到这个保存副本。'); };
    if (trip && dirty) setConfirm({ title: '打开保存副本？', body: '当前未保存的行程调整会丢失。已保存的其他副本不会受影响。', action });
    else action();
  };
  return <Page title="我的路书" eyebrow="YOUR SPACE">
    <Card><Heading>你好，旅行者</Heading><Body>把喜欢的片段留下，把下一程慢慢安排。</Body><Notice>{persistent ? '仅此浏览器本地保存，没有登录或云同步。清理浏览器数据、更换端口或设备后，可能无法看到原记录。' : '当前平台仅在运行内存中保留内容，关闭应用后丢失；原生持久化尚未接入。'}</Notice></Card>
    {!ready && <Notice>正在读取本机演示数据…</Notice>}
    <Heading>已保存的演示 · {library.saved.length}</Heading>
    {ready && !library.saved.length && <Card><Body>还没有保存的演示行程。打开样例后，可以主动保存一份本机副本。</Body><Button title="去看看行程" secondary onPress={() => router.navigate('/trip')} /></Card>}
    {library.saved.map(entry => <Card key={entry.trip.id}><Heading>{entry.trip.title}</Heading><Body>{entry.trip.days[0]?.date} — {entry.trip.days[2]?.date}</Body><Body>保存于 {new Date(entry.savedAt).toLocaleString('zh-CN')}</Body><Button title="打开保存副本" onPress={() => open(entry.trip.id)} /><Button title="删除这个副本" secondary disabled={!!state.storageError} onPress={() => setConfirm({ title: '删除本机副本？', body: '只删除这份已保存的演示，没有云端备份。当前打开的行程仍会保留在内存中。', action: () => { if (!state.deleteSaved(entry.trip.id)) setMessage('删除失败，请查看本机存储提示。'); } })} /></Card>)}
    <Heading>收藏的示例 · {library.favorites.length}</Heading>
    {!library.favorites.length && <Body>还没有收藏。去“发现”打开详情，收藏喜欢的示例。</Body>}
    {library.favorites.map(id => <Button key={id} title={`查看${findPlace(id)?.name}详情`} secondary onPress={() => router.push({ pathname: '/place', params: { id } })} />)}
    <Card><Heading>本次出行偏好</Heading><Body>{draft.interests.length ? draft.interests.join('、') : '还没有选择兴趣'}</Body><Body>{draft.pace} · {draft.transport}</Body><Body>这里与当前需求表单共用状态，刷新后重置，不是账号偏好。</Body><Button title="编辑出行需求与偏好" secondary onPress={() => router.push('/plan')} /></Card>
    <Button title="清除本机演示存储" secondary disabled={!ready} onPress={() => setConfirm({ title: '清除本机演示存储？', body: '将删除此应用在本浏览器保存的全部演示副本和收藏，无法恢复。不清除其他网站数据，当前内存中的表单和行程也不会删除。', action: () => setMessage(state.clearLibrary() ? '演示存储已清除。当前表单和行程仍在内存中。' : '清除失败，请查看存储提示。') })} />
    {confirm && <Dialog title={confirm.title} onClose={() => setConfirm(null)} confirmLabel="确认继续" onConfirm={() => { confirm.action(); setConfirm(null); }}><Body>{confirm.body}</Body></Dialog>}
    {!!message && <Dialog title="操作结果" onClose={() => setMessage('')}><Body>{message}</Body></Dialog>}
  </Page>;
}
