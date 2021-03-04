// Type-only circular import
// eslint-disable-next-line import/no-cycle
var internalSlotMap = new WeakMap();
export default function getInternalSlots(x) {
    var internalSlots = internalSlotMap.get(x);
    if (!internalSlots) {
        internalSlots = Object.create(null);
        internalSlotMap.set(x, internalSlots);
    }
    return internalSlots;
}
