import { useState, type ReactNode } from 'react';
import { router, usePathname } from 'expo-router';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTravel } from '../state/TravelContext';

export const theme = { ink: '#20342c', green: '#246352', muted: '#65776b', bg: '#f4f3ed', paper: '#fffdf8', line: '#e0e5d9' };
export function Button({ title, onPress, secondary = false, disabled = false, selected }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; selected?: boolean }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled, selected }} {...(Platform.OS === 'web' && selected !== undefined ? { 'aria-pressed': selected } : {})} disabled={disabled} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [s.button, secondary && s.secondary, selected && s.selected, focused && s.focus, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}><Text style={[s.buttonText, secondary && s.secondaryText]}>{title}</Text></Pressable>;
}
export function BottomNav() {
  const path = usePathname();
  return <View style={s.nav}>{([{ href: '/', title: '首页', icon: '⌂' }, { href: '/trip', title: '行程', icon: '⌁' }, { href: '/discover', title: '发现', icon: '✧' }, { href: '/me', title: '我的', icon: '◯' }] as const).map(tab => <NavButton key={tab.href} {...tab} selected={path === tab.href} />)}</View>;
}
function NavButton({ href, title, icon, selected }: { href: '/' | '/trip' | '/discover' | '/me'; title: string; icon: string; selected: boolean }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ selected }} {...(Platform.OS === 'web' ? { 'aria-current': selected ? 'page' : undefined } : {})} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onPress={() => router.navigate(href)} style={({ pressed }) => [s.navItem, selected && s.selected, focused && s.focus, pressed && { opacity: 0.7 }]}><Text style={s.navIcon}>{icon}</Text><Text style={s.navLabel}>{title}</Text></Pressable>;
}
export function Page({ title, eyebrow = 'TRAILBOOK · 路书', children, back = false, footer }: { title: string; eyebrow?: string; children: ReactNode; back?: boolean; footer?: ReactNode }) {
  const { storageError } = useTravel();
  return <SafeAreaView style={s.root} edges={['top', 'bottom']}><KeyboardAvoidingView style={s.app} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
    {back && <View style={{ alignSelf: 'flex-start' }}><Button title="‹ 返回上一页" secondary onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /></View>}
    <Text style={s.eyebrow}>{eyebrow}</Text><Text accessibilityRole="header" style={s.title}>{title}</Text>
    {!!storageError && <Notice warning>{storageError}</Notice>}
    {children}
    <Text style={s.footnote}>前端演示 · 无真实规划、地图或天气服务</Text>
  </ScrollView>{footer && <View style={s.footer}>{footer}</View>}<BottomNav /></KeyboardAvoidingView></SafeAreaView>;
}
export function Card({ children }: { children: ReactNode }) { return <View style={s.card}>{children}</View>; }
export function Heading({ children }: { children: ReactNode }) { return <Text accessibilityRole="header" style={s.heading}>{children}</Text>; }
export function Body({ children }: { children: ReactNode }) { return <Text style={s.body}>{children}</Text>; }
export function Notice({ children, warning = false }: { children: ReactNode; warning?: boolean }) { return <View style={[s.notice, warning && s.warning]}><Text accessibilityRole={warning ? 'alert' : undefined} style={s.noticeText}>{children}</Text></View>; }
export function Field({ label, value, onChange, placeholder, error, multiline = false, maxLength = 120, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; error?: string; multiline?: boolean; maxLength?: number; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#89968c" multiline={multiline} maxLength={maxLength} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={[s.input, multiline && s.multiline, focused && s.inputFocus, !!error && s.invalid]} />{hint && <Text style={s.hint}>{hint}</Text>}{error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}</View>;
}
export function Choices({ values, selected, onSelect }: { values: readonly string[]; selected: readonly string[]; onSelect: (value: string) => void }) { return <View style={s.wrap}>{values.map(value => <Button key={value} title={value} secondary selected={selected.includes(value)} onPress={() => onSelect(value)} />)}</View>; }
export function Dialog({ title, children, onClose, onConfirm, confirmLabel = '确认' }: { title: string; children: ReactNode; onClose: () => void; onConfirm?: () => void; confirmLabel?: string }) {
  return <Modal transparent animationType="fade" onRequestClose={onClose}><View style={s.overlay}><Pressable accessibilityRole="button" accessibilityLabel="关闭对话框" onPress={onClose} style={StyleSheet.absoluteFill} /><View style={s.dialog}><ScrollView contentContainerStyle={s.dialogContent}><Heading>{title}</Heading>{children}{onConfirm && <Button title={confirmLabel} onPress={onConfirm} />}<Button title={onConfirm ? '取消' : '知道了'} secondary onPress={onClose} /></ScrollView></View></View></Modal>;
}
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ebece5', alignItems: 'center' }, app: { flex: 1, width: '100%', maxWidth: 440, backgroundColor: theme.bg },
  content: { padding: 22, gap: 16 }, eyebrow: { color: theme.green, fontSize: 10, letterSpacing: 1.8, fontWeight: '700', marginTop: 10 },
  title: { fontSize: 28, lineHeight: 37, fontWeight: '800', color: theme.ink }, heading: { color: theme.ink, fontSize: 18, lineHeight: 26, fontWeight: '700' },
  body: { color: theme.muted, fontSize: 13, lineHeight: 22 }, card: { borderWidth: 1, borderColor: theme.line, borderRadius: 20, padding: 18, backgroundColor: theme.paper, gap: 12 },
  notice: { padding: 14, borderRadius: 14, backgroundColor: '#e6eee2' }, warning: { backgroundColor: '#fff0dd' }, noticeText: { fontSize: 12, lineHeight: 20, color: '#465d4d' },
  button: { minHeight: 44, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.green, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  buttonText: { fontSize: 13, fontWeight: '600', color: '#fffdf8', textAlign: 'center' }, secondary: { backgroundColor: theme.paper, borderColor: theme.line }, secondaryText: { color: theme.green }, selected: { backgroundColor: '#dfeedd', borderColor: '#8bb79b' }, focus: { boxShadow: '0 0 0 3px #ea8a69' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, row: { flexDirection: 'row', gap: 12, alignItems: 'center' }, grow: { flex: 1 },
  field: { gap: 7 }, label: { color: theme.ink, fontSize: 13, fontWeight: '600' }, input: { backgroundColor: theme.paper, borderWidth: 1, borderColor: '#cbd7c9', borderRadius: 12, minHeight: 48, padding: 12, color: theme.ink, fontSize: 14 },
  multiline: { minHeight: 104, textAlignVertical: 'top' }, inputFocus: { borderColor: theme.green, borderWidth: 2 }, invalid: { borderColor: '#b35736' }, hint: { color: theme.muted, fontSize: 11, lineHeight: 18 }, error: { color: '#a54327', fontSize: 12, lineHeight: 19 },
  back: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center', paddingRight: 18, borderRadius: 8 }, link: { color: theme.green, fontSize: 14, fontWeight: '600' },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.line, backgroundColor: theme.paper, padding: 8, gap: 4 }, navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' }, navIcon: { fontSize: 24, color: theme.green }, navLabel: { fontSize: 10, color: theme.green },
  footer: { padding: 12, backgroundColor: theme.paper, borderTopWidth: 1, borderTopColor: theme.line }, footnote: { color: theme.muted, fontSize: 10, lineHeight: 17, textAlign: 'center', paddingVertical: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(22,43,32,0.46)', padding: 24, alignItems: 'center', justifyContent: 'center' }, dialog: { maxHeight: '85%', width: '100%', maxWidth: 380, borderRadius: 22, backgroundColor: theme.paper, overflow: 'hidden' }, dialogContent: { padding: 24, gap: 16 },
  photo: { width: '100%', height: 175, borderRadius: 15, backgroundColor: '#dce7d5' }, badge: { color: theme.green, fontSize: 11, fontWeight: '600' }, divider: { height: 1, backgroundColor: theme.line },
});
