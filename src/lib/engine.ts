import { invoke } from '@tauri-apps/api/core';

export async function checkEngine(): Promise<string> {
  return invoke<string>('check_engine');
}

export async function getEnginePath(): Promise<string | null> {
  return invoke<string | null>('get_engine_path');
}

export async function launchMultiplayer(
  serverAddr: string,
  serverPort: number,
  token: string,
  mapPath: string,
): Promise<void> {
  await invoke('launch_multiplayer', { serverAddr, serverPort, token, mapPath });
}
