import { STORAGE_KEYS } from '../lib/constants';

export async function getOrCreateBrowserId(): Promise<string> {
  const result = await browser.storage.local.get(STORAGE_KEYS.BROWSER_ID);
  if (result[STORAGE_KEYS.BROWSER_ID]) {
    return result[STORAGE_KEYS.BROWSER_ID] as string;
  }
  const id = crypto.randomUUID();
  await browser.storage.local.set({ [STORAGE_KEYS.BROWSER_ID]: id });
  return id;
}
