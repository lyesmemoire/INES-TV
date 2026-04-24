export type AdSlot = {
  id: string;
  selector: string;
  format: string;
  position?: string;
  active: boolean;
  lazy?: boolean;
};

const EMPTY_ARRAY: AdSlot[] = [];

/**
 * ⚡ SLOT CACHE (Zero-Allocation)
 * Primary store for Publisher-specific ad placements.
 */
class SlotCache {
  private slots: Map<string, AdSlot[]> = new Map();

  getSlots(pid: string): AdSlot[] {
    return this.slots.get(pid) || EMPTY_ARRAY;
  }

  setSlots(pid: string, data: AdSlot[]) {
    this.slots.set(pid, data);
  }

  addSlot(pid: string, slot: AdSlot) {
    const arr = this.slots.get(pid);
    if (!arr) {
      this.slots.get(pid);
      this.slots.set(pid, [slot]);
      return;
    }
    // Efficiently add without checking length via push if possible, 
    // but standard array operations are fine for this non-hot-path management.
    arr.push(slot);
  }

  /**
   * 🛡️ SEEDING (For testing purposes)
   */
  seedDemo() {
    this.setSlots("demo_pub", [
      { id: "hero", selector: "#header-ad", format: "728x90", active: true },
      { id: "sidebar", selector: ".sidebar-ad", format: "300x250", active: true, lazy: true },
      { id: "demo-slot", selector: "#demo-ad", format: "300x250", active: true }
    ]);
  }
}

export const slotCache = new SlotCache();
// Auto-seed for visibility during development
slotCache.seedDemo();
