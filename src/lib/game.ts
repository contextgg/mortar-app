import { Command } from '@tauri-apps/plugin-shell';

export async function launchGame(mapPath: string): Promise<void> {
  const command = Command.create('mortar', ['--map', mapPath]);

  command.on('error', (error) => {
    console.error('Game process error:', error);
  });

  command.stdout.on('data', (line) => {
    console.log('[mortar]', line);
  });

  command.stderr.on('data', (line) => {
    console.error('[mortar]', line);
  });

  const child = await command.spawn();
  console.log('Game launched, pid:', child.pid);
}
