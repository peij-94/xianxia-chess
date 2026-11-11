/**
 * 《山海问道录·天衍棋局》云笈天机 · 存档与天机索引系统 (Save System)
 * 支持：LocalStorage 自动存档、3 个多槽位手动归档、JSON 导出/导入、肉鸽冒险断点续玩
 */

class SaveManager {
  constructor() {
    this.STORAGE_KEY_RUN = 'shanhai_active_run_v1';
    this.STORAGE_KEY_SLOTS = 'shanhai_slots_v1';
    this.STORAGE_KEY_COMPENDIUM = 'shanhai_compendium_v1';
    this.STORAGE_KEY_SETTINGS = 'shanhai_settings_v1';

    this.initCompendiumIfEmpty();
  }

  // 1. 获取是否有正在进行的肉鸽冒险存档
  hasActiveRun() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_RUN);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return parsed && parsed.isActive && parsed.currentFloor > 0;
    } catch (e) {
      console.warn('读取肉鸽活跃存档失败:', e);
      return false;
    }
  }

  // 读取正在进行的肉鸽存档
  loadActiveRun() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_RUN);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('解析活跃肉鸽存档失败:', e);
      return null;
    }
  }

  // 保存当前肉鸽冒险状态
  saveActiveRun(runData) {
    try {
      const payload = {
        ...runData,
        timestamp: Date.now(),
        saveTimeStr: new Date().toLocaleString('zh-CN', { hour12: false })
      };
      localStorage.setItem(this.STORAGE_KEY_RUN, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('保存肉鸽存档失败:', e);
      return false;
    }
  }

  // 清除肉鸽活跃存档 (通关或兵解)
  clearActiveRun() {
    try {
      localStorage.removeItem(this.STORAGE_KEY_RUN);
    } catch (e) {
      console.error('清除肉鸽存档失败:', e);
    }
  }

  // 2. 多槽位管理 (Slot 1, Slot 2, Slot 3)
  getSlots() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_SLOTS);
      if (!data) return [null, null, null];
      const parsed = JSON.parse(data);
      while (parsed.length < 3) parsed.push(null);
      return parsed;
    } catch (e) {
      return [null, null, null];
    }
  }

  saveToSlot(slotIndex, runData, note = '手动封存') {
    try {
      const slots = this.getSlots();
      slots[slotIndex] = {
        ...runData,
        slotIndex,
        note,
        timestamp: Date.now(),
        saveTimeStr: new Date().toLocaleString('zh-CN', { hour12: false })
      };
      localStorage.setItem(this.STORAGE_KEY_SLOTS, JSON.stringify(slots));
      return true;
    } catch (e) {
      console.error('写入槽位失败:', e);
      return false;
    }
  }

  loadFromSlot(slotIndex) {
    const slots = this.getSlots();
    return slots[slotIndex] || null;
  }

  deleteSlot(slotIndex) {
    try {
      const slots = this.getSlots();
      slots[slotIndex] = null;
      localStorage.setItem(this.STORAGE_KEY_SLOTS, JSON.stringify(slots));
      return true;
    } catch (e) {
      return false;
    }
  }

  // 3. 图鉴收集进度
  initCompendiumIfEmpty() {
    if (!localStorage.getItem(this.STORAGE_KEY_COMPENDIUM)) {
      const initial = {
        unlockedCultivators: ['lingxu', 'baiqian', 'bifang'],
        unlockedBeasts: ['huodou', 'gudiao', 'taowu', 'xiangliu', 'qiongqi', 'zhujiuyin'],
        unlockedRelics: ['HETU_BOOK', 'ZHURONG_TOKEN', 'KUNLUN_JADE', 'JIANMU_ROOT', 'XINGTONG_AXE', 'CHENGHUANG_FUR'],
        unlockedEvents: ['EVENT_DANGKANG', 'EVENT_SWORD_TOMB', 'EVENT_TIANCHI_SPA'],
        bossKills: {
          taowu: 0,
          xiangliu: 0,
          qiongqi: 0,
          zhujiuyin: 0
        }
      };
      localStorage.setItem(this.STORAGE_KEY_COMPENDIUM, JSON.stringify(initial));
    }
  }

  getCompendium() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_COMPENDIUM);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  recordBossKill(bossId) {
    try {
      const comp = this.getCompendium();
      if (!comp.bossKills) comp.bossKills = {};
      comp.bossKills[bossId] = (comp.bossKills[bossId] || 0) + 1;
      localStorage.setItem(this.STORAGE_KEY_COMPENDIUM, JSON.stringify(comp));
    } catch (e) {
      console.warn('记录首领讨伐失败:', e);
    }
  }

  recordRelicUnlocked(relicId) {
    try {
      const comp = this.getCompendium();
      if (!comp.unlockedRelics) comp.unlockedRelics = [];
      if (!comp.unlockedRelics.includes(relicId)) {
        comp.unlockedRelics.push(relicId);
        localStorage.setItem(this.STORAGE_KEY_COMPENDIUM, JSON.stringify(comp));
      }
    } catch (e) {
      console.warn('记录遗宝解锁失败:', e);
    }
  }

  // 4. 导出与导入 JSON
  exportAllSaveJSON() {
    try {
      const allData = {
        activeRun: this.loadActiveRun(),
        slots: this.getSlots(),
        compendium: this.getCompendium(),
        exportTime: new Date().toISOString()
      };
      return JSON.stringify(allData, null, 2);
    } catch (e) {
      return null;
    }
  }

  importAllSaveJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.activeRun) {
        localStorage.setItem(this.STORAGE_KEY_RUN, JSON.stringify(parsed.activeRun));
      }
      if (parsed.slots) {
        localStorage.setItem(this.STORAGE_KEY_SLOTS, JSON.stringify(parsed.slots));
      }
      if (parsed.compendium) {
        localStorage.setItem(this.STORAGE_KEY_COMPENDIUM, JSON.stringify(parsed.compendium));
      }
      return true;
    } catch (e) {
      console.error('导入存档解析错误:', e);
      return false;
    }
  }

  resetAllData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY_RUN);
      localStorage.removeItem(this.STORAGE_KEY_SLOTS);
      localStorage.removeItem(this.STORAGE_KEY_COMPENDIUM);
      this.initCompendiumIfEmpty();
      return true;
    } catch (e) {
      return false;
    }
  }
}

window.saveManager = new SaveManager();
