import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { copyTrip, decodeLibrary, emptyDraft, emptyLibrary, makeDemoTrip, updateActivity, type Draft, type Library, type Trip } from '../lib/travel';
import { storage } from '../lib/storage';
import type { ValidationReceipt } from '../lib/api';

function useTravelState() {
  const [draft, setDraft] = useState<Draft>({ ...emptyDraft, interests: [] });
  const [receipt, setReceipt] = useState<ValidationReceipt | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [previous, setPrevious] = useState<Trip | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [view, setView] = useState<'timeline' | 'map'>('timeline');
  const [library, setLibrary] = useState<Library>(emptyLibrary);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    try { const raw = storage.read(); if (raw) setLibrary(decodeLibrary(raw)); }
    catch { setStorageError('本机数据读取失败。为保护原数据，保存已暂停；可在“我的”中确认清除演示存储后重试。'); }
    setReady(true);
  }, []);
  const commit = (next: Library): boolean => {
    if (!ready || storageError) return false;
    try { storage.write(JSON.stringify(next)); setLibrary(next); return true; }
    catch { setStorageError('本机存储不可用或空间不足，本次操作未保存。已有数据未主动删除；可检查浏览器设置后刷新重试。'); return false; }
  };
  const newDemo = () => { setTrip(makeDemoTrip()); setPrevious(null); setDayIndex(0); setView('timeline'); };
  const openSaved = (id: string) => {
    const entry = library.saved.find(item => item.trip.id === id);
    if (!entry) return false;
    setTrip(copyTrip(entry.trip)); setPrevious(null); setDayIndex(0); setView('timeline'); return true;
  };
  const edit = (itemId: string, action: 'lock' | 'remove' | 'replace', placeId?: string) => {
    if (!trip) return false;
    const next = updateActivity(trip, dayIndex, itemId, action, placeId);
    if (!next) return false;
    setPrevious(copyTrip(trip)); setTrip(next); return true;
  };
  const savedVersion = library.saved.find(item => item.trip.id === trip?.id);
  const dirty = !!trip && (!savedVersion || JSON.stringify(savedVersion.trip) !== JSON.stringify(trip));
  const save = (): string => {
    if (!trip) return '没有可保存的演示行程。';
    if (!ready || storageError) return '保存未完成，请先处理本机存储提示。';
    if (!savedVersion && library.saved.length >= 20) return '最多保存 20 份演示行程，请先在“我的”中删除不需要的副本。';
    const saved = [{ trip: copyTrip(trip), savedAt: new Date().toISOString() }, ...library.saved.filter(item => item.trip.id !== trip.id)];
    return commit({ ...library, saved }) ? storage.persistent ? '已保存到此浏览器；未上传服务器，不支持跨设备同步。' : '已保留在本次运行内存中；关闭应用后会丢失。' : '保存失败，没有写入新的副本。';
  };
  return {
    draft, setDraft, receipt, setReceipt, trip, dayIndex, setDayIndex, view, setView, ready, library, storageError,
    persistent: storage.persistent, dirty, canUndo: !!previous, newDemo, openSaved, edit, save,
    undo: () => { if (previous) { setTrip(previous); setPrevious(null); } },
    toggleFavorite: (id: string) => commit({ ...library, favorites: library.favorites.includes(id) ? library.favorites.filter(value => value !== id) : [...library.favorites, id] }),
    deleteSaved: (id: string) => commit({ ...library, saved: library.saved.filter(item => item.trip.id !== id) }),
    clearLibrary: () => {
      try { storage.clear(); setLibrary(emptyLibrary()); setStorageError(''); return true; }
      catch { setStorageError('清除失败，请检查浏览器是否允许本地存储。'); return false; }
    },
  };
}
type TravelState = ReturnType<typeof useTravelState>;
const TravelContext = createContext<TravelState | null>(null);
export function TravelProvider({ children }: { children: ReactNode }) {
  const state = useTravelState();
  return <TravelContext.Provider value={state}>{children}</TravelContext.Provider>;
}
export function useTravel() {
  const value = useContext(TravelContext);
  if (!value) throw new Error('TravelProvider is required');
  return value;
}
