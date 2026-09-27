import { router } from 'expo-router';
import { Button, Notice, Page } from '../src/components/ui';
export default function NotFound() { return <Page title="这条路还没有开通" back><Notice>没有找到这个页面，你的当前表单和演示行程不会因此删除。</Notice><Button title="回到首页" onPress={() => router.replace('/')} /></Page>; }
