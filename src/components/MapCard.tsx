import type { MapSummary } from '../lib/api';

type Props = {
  map: MapSummary;
  onPlay: (map: MapSummary) => void;
};

export function MapCard({ map, onPlay }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-mortar-600/50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-100">{map.title}</h3>
          <p className="text-sm text-gray-500">by {map.author_name}</p>
        </div>
        <span className="text-xs text-gray-500">{map.likes} likes</span>
      </div>
      {map.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{map.description}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onPlay(map)}
          className="flex-1 bg-mortar-600 hover:bg-mortar-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Play
        </button>
        <a
          href={`https://editor.ctx.gg/?map=${map.slug}`}
          target="_blank"
          rel="noopener"
          className="px-3 py-2 text-sm text-gray-400 hover:text-gray-200 border border-gray-700 rounded-lg transition-colors"
        >
          Edit
        </a>
      </div>
    </div>
  );
}
