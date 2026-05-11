/**
 * Per-pet inventory management (pure logic, no I/O).
 */

export interface InventoryEntry {
  itemId: string;
  quantity: number;
}

export interface PetInventory {
  items: InventoryEntry[];
}

export function createEmptyInventory(): PetInventory {
  return { items: [] };
}

/** Get the quantity of a specific item in inventory. */
export function getItemCount(inventory: PetInventory, itemId: string): number {
  const entry = inventory.items.find(e => e.itemId === itemId);
  return entry ? entry.quantity : 0;
}

/** Add items to inventory. Returns a new inventory object. */
export function addItem(inventory: PetInventory, itemId: string, qty: number = 1): PetInventory {
  const items = [...inventory.items];
  const existing = items.findIndex(e => e.itemId === itemId);
  if (existing >= 0) {
    items[existing] = { ...items[existing], quantity: items[existing].quantity + qty };
  } else {
    items.push({ itemId, quantity: qty });
  }
  return { items };
}

/** Remove items from inventory. Returns null if insufficient quantity. */
export function removeItem(inventory: PetInventory, itemId: string, qty: number = 1): PetInventory | null {
  const existing = inventory.items.find(e => e.itemId === itemId);
  if (!existing || existing.quantity < qty) return null;

  const items = inventory.items
    .map(e => e.itemId === itemId ? { ...e, quantity: e.quantity - qty } : e)
    .filter(e => e.quantity > 0);
  return { items };
}
