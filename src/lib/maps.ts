import { invoke } from '@tauri-apps/api/core';

export type RotationMap = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  size: number;
  updated_at: string;
};

export type MapSyncStatus = {
  total: number;
  downloaded: number;
  maps: RotationMap[];
};

export async function getMapRotation(): Promise<RotationMap[]> {
  return invoke<RotationMap[]>('get_map_rotation');
}

export async function syncMaps(): Promise<MapSyncStatus> {
  return invoke<MapSyncStatus>('sync_maps');
}

export async function getMapPath(slug: string): Promise<string | null> {
  return invoke<string | null>('get_map_path', { slug });
}
