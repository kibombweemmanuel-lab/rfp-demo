import { randomUUID } from 'node:crypto';

export function createQueueService(store) {
  async function list() {
    return store.read();
  }

  async function enqueue(input) {
    const queue = await store.read();
    const item = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
    queue.push(item);
    await store.write(queue);
    return item;
  }

  async function process() {
    await store.write([]);
    return { processed: true, pending: 0 };
  }

  async function remove(id) {
    const queue = await store.read();
    const remaining = queue.filter((item) => item.id !== id);
    if (remaining.length === queue.length) return false;
    await store.write(remaining);
    return true;
  }

  return { list, enqueue, process, remove };
}
