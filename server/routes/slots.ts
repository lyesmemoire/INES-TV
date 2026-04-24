import { Router } from "express";
import { slotCache } from "../core/memory/SlotCache.js";

const router = Router();

/**
 * 📡 SLOTS MANAGEMENT API
 * Zero-cost CRUD for Publisher Ad Placements.
 */

// GET slots for a specific publisher
router.get("/:pid", (req, res) => {
  const slots = slotCache.getSlots(req.params.pid);
  res.json(slots);
});

// CREATE a new ad slot
router.post("/:pid", (req, res) => {
  const { id, selector, format, lazy } = req.body;

  if (!selector || !format) {
    return res.status(400).json({ error: "Missing selector or format" });
  }

  slotCache.addSlot(req.params.pid, {
    id: id || Date.now().toString(),
    selector,
    format,
    active: true,
    lazy: !!lazy
  });

  res.json({ ok: true });
});

// TOGGLE slot active status
router.patch("/:pid/:id", (req, res) => {
  const slots = slotCache.getSlots(req.params.pid);

  for (let i = 0; i < slots.length; i++) {
    if (slots[i].id === req.params.id) {
      slots[i].active = !slots[i].active;
      break;
    }
  }

  res.json({ ok: true });
});

// DELETE a slot
router.delete("/:pid/:id", (req, res) => {
  const slots = slotCache.getSlots(req.params.pid);

  for (let i = 0; i < slots.length; i++) {
    if (slots[i].id === req.params.id) {
      slots.splice(i, 1);
      break;
    }
  }

  res.json({ ok: true });
});

export default router;
