import { invoke } from '@tauri-apps/api/core';

export async function launchGame(mapPath: string): Promise<void> {
  await invoke('launch_game', { mapPath });
}
