export function isUnknownMessageError(error) {
  return Number(error?.code) === 10008 || Number(error?.rawError?.code) === 10008 ||
    (typeof error?.message === "string" && error.message.trim().toLowerCase() === "unknown message");
}

export async function ignoreUnknownMessage(label, operation, onUnknown = () => {}) {
  try {
    return await operation();
  } catch (error) {
    if (!isUnknownMessageError(error)) throw error;
    await onUnknown(error, label);
    return null;
  }
}
