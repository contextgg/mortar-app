import { invoke } from '@tauri-apps/api/core';

export async function checkEngine(): Promise<string> {
  return invoke<string>('check_engine');
}

export async function getEnginePath(): Promise<string | null> {
  return invoke<string | null>('get_engine_path');
}
