import { useState, type ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { prototypePhotos } from '../assets/prototype-photos';

const colors = {
  ink: '#20342c',
  green: '#246352',
  muted: '#78877d',
  background: '#f4f3ed',
  paper: '#fffdf8',
  line: '#e4e7db',
  coral: '#ea8a69',
};

const places = [
  { key: 'night', name: '洪崖洞夜景', caption: '晚间更适合 · 夜游', description: '把灯光亮起后的江岸留给夜晚，慢慢感受山城的层叠街景。' },
  { key: 'street', name: '山城街巷', caption: '白天慢逛 · 城市漫步', description: '留一段白天，沿街巷与台阶慢慢走。正式行程会结合步行能力和实际路线安排。' },
  { key: 'noodles', name: '重庆小面', caption: '午餐时段 · 地方风味', description: '在游览片区附近安排一碗小面。具体店铺、营业时间和饮食限制将在后续核验。' },
  { key: 'hotpot', name: '重庆火锅', caption: '晚餐安排 · 特色美食', description: '为一顿热气腾腾的火锅留出晚餐时间，也为排队与返程留些余量。' },
] as const;

type Notice = { title: string; body: string; image?: string };
type IconName = 'home' | 'route' | 'spark' | 'user' | 'search' | 'link';

function Icon({ name, color = colors.green }: { name: IconName; color?: string }) {
  if (name === 'search') {
    return (
      <View style={styles.icon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.searchCircle, { borderColor: color }]} />
        <View style={[styles.searchHandle, { backgroundColor: color }]} />
      </View>
    );
  }
  if (name === 'user') {
    return (
      <View style={styles.icon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.userHead, { borderColor: color }]} />
        <View style={[styles.userBody, { borderColor: color }]} />
      </View>
    );
  }
  const symbols = { home: '⌂', route: '⌁', spark: '✧', link: '↗' } as const;
  return <Text accessible={false} style={[styles.symbol, { color }]}>{symbols[name]}</Text>;
}

function Action({ children, label, onPress, style, selected }: {
  children: ReactNode;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [style, { opacity: pressed ? 0.78 : hovered ? 0.9 : 1 }, focused && styles.focused]}
    >
      {children}
    </Pressable>
  );
}

export function HomeScreen() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const showPending = (title: string, body: string) => setNotice({ title, body });
  const plan = () => showPending('从这里，开始下一程', '创建计划页面尚未实现。这一版先预览首页；后续会在这里填写城市、日期、住宿和出行偏好。');
  const trip = () => showPending('重庆三天两夜 · 示例', '这是原型中的演示行程，不是已保存的真实计划。每日时间线、地图和行程保存将在后续接入。');

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.app}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topbar}>
            <View style={styles.brand}>
              <View style={styles.brandMark} />
              <Text style={styles.brandName}>路书</Text>
              <Text style={styles.brandEnglish}>TRAILBOOK</Text>
            </View>
            <Action label="查看我的（功能待开发）" onPress={() => showPending('我的路书', '已保存行程、收藏和出行偏好将在后续接入。当前没有登录或保存个人信息。')} style={styles.avatar}>
              <Text style={styles.avatarText}>旅</Text>
            </Action>
          </View>

          <Text style={styles.eyebrow}>GO SOMEWHERE GOOD</Text>
          <Text accessibilityRole="header" style={styles.title}>想去哪儿，{'\n'}<Text style={styles.titleGreen}>就从这里出发。</Text></Text>

          <Action label="选择城市、日期和住处" onPress={plan} style={styles.search}>
            <Icon name="search" color={colors.muted} />
            <Text style={styles.searchText}>城市、日期、住处，一起定下来</Text>
            <Text style={styles.arrow}>↗</Text>
          </Action>

          <View style={styles.hero}>
            <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <View style={styles.sun} />
              <View style={[styles.hill, styles.hillBack]} />
              <View style={[styles.hill, styles.hillMiddle]} />
              <View style={[styles.hill, styles.hillFront]} />
              <View style={styles.trail}>
                {[0, 1, 2, 3, 4, 5].map((step) => <View key={step} style={[styles.trailDot, { marginLeft: step * 5 }]} />)}
              </View>
              <View style={styles.destination} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>YOUR TRIP, YOUR RHYTHM</Text>
              <Text accessibilityRole="header" style={styles.heroTitle}>攻略散落各处，{'\n'}行程替你排好。</Text>
              <Text style={styles.heroSubtitle}>从住宿出发 · 安排美食 · 看懂路线</Text>
              <Action label="开始规划旅行" onPress={plan} style={styles.heroButton}>
                <Text style={styles.heroButtonText}>开始规划旅行</Text>
                <Text style={styles.heroButtonArrow}>↗</Text>
              </Action>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>继续这趟旅程</Text>
            <Action label="查看示例行程" onPress={trip} style={styles.textAction}>
              <Text style={styles.textActionLabel}>查看行程 →</Text>
            </Action>
          </View>
          <Action label="重庆三天两夜，示例行程" onPress={trip} style={styles.tripCard}>
            <View style={styles.tripTop}>
              <View style={styles.tripDescription}>
                <Text style={styles.tripTitle}>重庆三天两夜</Text>
                <Text style={styles.tripDate}>9月26日—28日 · 示例行程</Text>
              </View>
              <View style={styles.roundArrow}><Text style={styles.arrow}>↗</Text></View>
            </View>
            <View style={styles.tags}>
              <View style={styles.tag}><Text style={styles.tagText}>⌁  从住处出发</Text></View>
              <View style={[styles.tag, styles.foodTag]}><Text style={[styles.tagText, styles.foodTagText]}>☾  夜景与地道美食</Text></View>
            </View>
          </Action>

          <View style={styles.sectionHeading}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>这座城，按时段去玩</Text>
            <Text style={styles.tinyLabel}>演示图片</Text>
          </View>
          <View style={styles.photoGrid}>
            {places.map((place) => (
              <Action
                key={place.key}
                label={`查看${place.name}示例介绍`}
                style={styles.photoCard}
                onPress={() => setNotice({ title: place.name, body: `${place.description}\n\n图片与说明为原型演示素材，不代表已核验的地点、营业信息或旅行建议。`, image: prototypePhotos[place.key] })}
              >
                <ImageBackground source={{ uri: prototypePhotos[place.key] }} style={styles.photo} resizeMode="cover">
                  <View style={styles.photoCaption}>
                    <Text style={styles.photoTitle}>{place.name}</Text>
                    <Text style={styles.photoSubtitle}>{place.caption}</Text>
                  </View>
                </ImageBackground>
              </Action>
            ))}
          </View>

          <View style={styles.sectionHeading}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>把喜欢的攻略带进来</Text>
          </View>
          <Action label="添加攻略线索（功能待开发）" onPress={() => showPending('把喜欢的攻略带进来', '攻略录入尚未接入。后续可填写你主动提供的文字或来源链接，并核验其中的地点信息。')} style={styles.inspiration}>
            <View style={styles.inspirationIcon}><Icon name="link" color="#aa764e" /></View>
            <View style={styles.inspirationCopy}>
              <Text style={styles.inspirationTitle}>加一条你收藏的攻略线索</Text>
              <Text style={styles.inspirationSubtitle}>之后可从链接或文字识别地点与时段</Text>
            </View>
            <Text style={styles.inspirationArrow}>›</Text>
          </Action>

          <View style={styles.demoNote}>
            <View style={styles.demoDot} />
            <Text style={styles.demoText}>首页预览 · 行程与图片均为演示内容</Text>
          </View>
        </ScrollView>

        <View style={styles.navigation}>
          {([
            { name: 'home', label: '首页' },
            { name: 'route', label: '行程' },
            { name: 'spark', label: '发现' },
            { name: 'user', label: '我的' },
          ] as const).map((tab) => (
            <Action
              key={tab.name}
              label={tab.label === '首页' ? '首页，当前页面' : `${tab.label}（功能待开发）`}
              selected={tab.name === 'home'}
              style={styles.navItem}
              onPress={() => {
                if (tab.name === 'home') setNotice(null);
                else if (tab.name === 'route') trip();
                else showPending(tab.name === 'spark' ? '发现一座城' : '我的路书', `${tab.label}页面尚未实现，当前版本仅提供首页预览。`);
              }}
            >
              <View style={[styles.navIcon, tab.name === 'home' && styles.navIconActive]}>
                <Icon name={tab.name} color={tab.name === 'home' ? colors.green : '#8a998e'} />
              </View>
              <Text style={[styles.navLabel, tab.name === 'home' && styles.navLabelActive]}>{tab.label}</Text>
            </Action>
          ))}
        </View>
      </View>

      <Modal visible={notice !== null} transparent animationType="fade" onRequestClose={() => setNotice(null)}>
        <View style={styles.modalOverlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="关闭预览提示" onPress={() => setNotice(null)} style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard} accessibilityViewIsModal>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalKicker}>TRAILBOOK · 首页预览</Text>
              <Text accessibilityRole="header" style={styles.modalTitle}>{notice?.title}</Text>
              {notice?.image && <Image source={{ uri: notice.image }} accessibilityLabel={`${notice.title}演示图片`} style={styles.modalImage} />}
              <Text style={styles.modalBody}>{notice?.body}</Text>
              <Action label="知道了，返回首页" onPress={() => setNotice(null)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>知道了，返回首页</Text>
              </Action>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ebece5', alignItems: 'center' },
  app: { flex: 1, width: '100%', maxWidth: 440, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 16 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 11, height: 11, backgroundColor: colors.coral, borderTopLeftRadius: 3, borderTopRightRadius: 7, borderBottomLeftRadius: 7, borderBottomRightRadius: 3, transform: [{ rotate: '-20deg' }] },
  brandName: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  brandEnglish: { color: '#93a092', fontSize: 9, letterSpacing: 1.7, marginLeft: 3 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dfe6d9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, color: colors.green, fontWeight: '700' },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '700', letterSpacing: 1.8 },
  title: { fontSize: 32, lineHeight: 42, fontWeight: '800', letterSpacing: -0.8, color: colors.ink, marginTop: 9, marginBottom: 22 },
  titleGreen: { color: colors.green },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 14 },
  searchText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
  arrow: { fontSize: 22, color: colors.green },
  icon: { width: 22, height: 24 },
  searchCircle: { position: 'absolute', top: 3, left: 1, width: 14, height: 14, borderWidth: 1.6, borderRadius: 7 },
  searchHandle: { position: 'absolute', top: 17, left: 13, width: 8, height: 1.6, transform: [{ rotate: '45deg' }] },
  userHead: { position: 'absolute', left: 7, top: 2, width: 9, height: 9, borderWidth: 1.5, borderRadius: 6 },
  userBody: { position: 'absolute', left: 3, top: 13, width: 17, height: 10, borderWidth: 1.5, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomWidth: 0 },
  symbol: { fontSize: 27, lineHeight: 29, textAlign: 'center', width: 26 },
  hero: { marginTop: 18, minHeight: 234, borderRadius: 24, backgroundColor: '#224f44', overflow: 'hidden' },
  heroCopy: { padding: 22, alignItems: 'flex-start' },
  heroKicker: { color: '#c7ddcd', fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  heroTitle: { color: '#fffdf8', fontSize: 27, lineHeight: 34, fontWeight: '800', marginTop: 14 },
  heroSubtitle: { color: '#deeadb', fontSize: 11, lineHeight: 18, marginTop: 8 },
  heroButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 20, borderRadius: 11, backgroundColor: '#edf4b2', paddingHorizontal: 15, marginTop: 18 },
  heroButtonText: { fontSize: 12, fontWeight: '700', color: '#274a3d' },
  heroButtonArrow: { fontSize: 20, color: '#274a3d' },
  sun: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#d9d99c', top: 24, right: 22 },
  hill: { position: 'absolute', width: '145%', height: 175, borderTopLeftRadius: 190, borderTopRightRadius: 160 },
  hillBack: { bottom: -70, left: -80, backgroundColor: '#3e735b', transform: [{ rotate: '-14deg' }] },
  hillMiddle: { bottom: -102, right: -75, backgroundColor: '#75a68a', transform: [{ rotate: '-19deg' }] },
  hillFront: { bottom: -148, right: -20, backgroundColor: '#b2caa5', transform: [{ rotate: '9deg' }] },
  trail: { position: 'absolute', right: 46, bottom: 0, gap: 9, transform: [{ rotate: '14deg' }] },
  trailDot: { width: 3, height: 5, backgroundColor: '#f6d9ab', borderRadius: 2 },
  destination: { position: 'absolute', right: 65, bottom: 74, width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff1cf' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 24, marginBottom: 12, minHeight: 28 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  textAction: { minHeight: 36, justifyContent: 'center', paddingLeft: 6 },
  textActionLabel: { color: colors.green, fontSize: 11, fontWeight: '600' },
  tripCard: { padding: 17, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  tripTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  tripDescription: { flex: 1 },
  tripTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  tripDate: { fontSize: 11, color: colors.muted, marginTop: 7 },
  roundArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#e5eee3', alignItems: 'center', justifyContent: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 16 },
  tag: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: '#eef4e9' },
  tagText: { fontSize: 10, color: '#5b7967' },
  foodTag: { backgroundColor: '#fff1e7' },
  foodTagText: { color: '#a96643' },
  tinyLabel: { color: colors.muted, fontSize: 10 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoCard: { width: '48%', flexGrow: 1, borderRadius: 17, overflow: 'hidden', backgroundColor: '#78917d' },
  photo: { width: '100%', aspectRatio: 1.35, justifyContent: 'flex-end' },
  photoCaption: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(12,31,25,0.64)' },
  photoTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  photoSubtitle: { color: '#edf0e8', fontSize: 10, lineHeight: 15, marginTop: 4 },
  inspiration: { backgroundColor: '#efe9da', borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  inspirationIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff7e8', alignItems: 'center', justifyContent: 'center' },
  inspirationCopy: { flex: 1 },
  inspirationTitle: { fontSize: 12, lineHeight: 18, fontWeight: '600', color: colors.ink },
  inspirationSubtitle: { fontSize: 10, lineHeight: 16, color: '#847c69', marginTop: 4 },
  inspirationArrow: { fontSize: 24, color: '#9f896f' },
  demoNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, marginBottom: 6 },
  demoDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#b1bdac' },
  demoText: { fontSize: 10, color: colors.muted, flexShrink: 1, lineHeight: 16 },
  navigation: { flexDirection: 'row', backgroundColor: colors.paper, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 7, paddingBottom: 10, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52, gap: 3, borderRadius: 10 },
  navIcon: { width: 38, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#e6f1e8' },
  navLabel: { fontSize: 10, color: '#7c8d81', fontWeight: '500' },
  navLabelActive: { color: colors.green, fontWeight: '700' },
  focused: { boxShadow: '0 0 0 3px #ea8a69' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(22,43,32,0.46)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 380, maxHeight: '85%', borderRadius: 24, overflow: 'hidden', backgroundColor: colors.paper },
  modalContent: { padding: 24 },
  modalKicker: { fontSize: 10, color: colors.green, letterSpacing: 1.3, fontWeight: '600' },
  modalTitle: { fontSize: 23, lineHeight: 32, color: colors.ink, fontWeight: '700', marginTop: 12, marginBottom: 15 },
  modalImage: { width: '100%', height: 180, borderRadius: 14, marginBottom: 16 },
  modalBody: { color: '#66796b', fontSize: 14, lineHeight: 24 },
  modalButton: { marginTop: 24, backgroundColor: colors.green, borderRadius: 13, minHeight: 46, alignItems: 'center', justifyContent: 'center', padding: 12 },
  modalButtonText: { color: '#fffdf8', fontSize: 13, fontWeight: '600' },
});
