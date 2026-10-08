export async function messagesSince(channel, cursor, pause = async () => {}) {
  const messages = [];
  let before = null;

  while (true) {
    const page = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) });
    if (!page.size) break;
    const batch = [...page.values()];
    messages.push(...batch.filter((message) => !cursor || BigInt(message.id) > BigInt(cursor)));
    if (page.size < 100 || (cursor && batch.some((message) => BigInt(message.id) <= BigInt(cursor)))) break;
    before = batch.reduce((oldest, message) => BigInt(message.id) < BigInt(oldest) ? message.id : oldest, batch[0].id);
    await pause();
  }

  return messages.sort((left, right) => BigInt(left.id) < BigInt(right.id) ? -1 : 1);
}
