import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { ActionIcon } from '@mantine/core';
import { ToolIconBadge } from './ToolIcon';

/**
 * @param {{
 *   tool: { id, name, desc, icon, route, category, maintenance },
 *   viewMode?: 'grid' | 'list',
 *   isFavorite?: boolean,
 *   onToggleFavorite?: (id: string) => void
 * }} props
 */
export default function ToolCard({
  tool,
  viewMode = 'grid',
  isFavorite = false,
  onToggleFavorite,
}) {
  const isMaintenance = tool.maintenance;

  const FavoriteButton = (
    <ActionIcon
      variant="subtle"
      color={isFavorite ? 'yellow' : 'gray'}
      size="sm"
      aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleFavorite(tool.id);
      }}
    >
      <Star className="w-3.5 h-3.5" style={{ fill: isFavorite ? 'currentColor' : 'none' }} />
    </ActionIcon>
  );

  // ── List view row ────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        className={`group flex items-center justify-between p-3 rounded-lg bg-[#131622] border border-[#232738]
          transition-colors duration-150
          ${isMaintenance ? 'opacity-50' : 'hover:border-[#383e58] hover:bg-[#181c2b]'}`}
      >
        <Link
          to={isMaintenance ? '#' : tool.route}
          className="flex items-center gap-3 flex-1 min-w-0"
          onClick={(e) => isMaintenance && e.preventDefault()}
        >
          <ToolIconBadge tool={tool} size="sm" />
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-white">{tool.name}</span>
              {isMaintenance && (
                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono rounded">
                  Diperbaiki
                </span>
              )}
              <span className="text-[10px] font-mono text-[#8b90b0] uppercase tracking-wider bg-[#1c2030] border border-[#232738]/50 px-1.5 py-0.5 rounded">
                {tool.category}
              </span>
            </div>
            <p className="text-[11px] text-[#8b90b0] truncate mt-0.5">{tool.desc}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleFavorite && FavoriteButton}
          {!isMaintenance && (
            <Link
              to={tool.route}
              className="px-2.5 py-1 text-xs font-medium text-[#8b90b0] hover:text-white bg-[#1c2030] border border-[#232738] rounded hover:border-[#383e58] transition-colors"
            >
              Buka
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── Grid view card ───────────────────────────────────────────────
  // Wrapper div agar tombol favorit (ActionIcon) jadi *sibling* Link, bukan
  // nested di dalamnya — memperbaiki bug a11y button-inside-anchor.
  return (
    <div className="group relative">
      <Link
        to={isMaintenance ? '#' : tool.route}
        id={`tool-card-${tool.id}`}
        className={`relative flex flex-col justify-between p-4 rounded-lg bg-[#131622] border border-[#232738]
          transition-colors duration-150
          ${isMaintenance
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-[#383e58] hover:bg-[#181c2b] cursor-pointer'}`}
        onClick={(e) => isMaintenance && e.preventDefault()}
      >
        <div>
          {/* Icon */}
          <div className="mb-3">
            <ToolIconBadge tool={tool} size="md" className={isMaintenance ? 'grayscale opacity-50' : ''} />
          </div>

          {/* Content */}
          <div>
            <h3 className={`text-xs font-semibold mb-1 transition-colors pr-14
              ${isMaintenance ? 'text-[#8b90b0]' : 'text-white'}`}>
              {tool.name}
            </h3>
            <p className={`text-[11px] leading-relaxed line-clamp-2 ${isMaintenance ? 'text-[#4a5070]' : 'text-[#8b90b0]'}`}>
              {tool.desc}
            </p>
          </div>
        </div>

        {/* Footer / Arrow */}
        {!isMaintenance && (
          <div className="flex justify-end items-center mt-3 pt-2 border-t border-[#232738]/40">
            <ArrowRight className="w-3.5 h-3.5 text-[#4a5070] group-hover:text-[#8b90b0] transition-colors" />
          </div>
        )}
      </Link>

      {/* Top-right: badge maintenance + tombol favorit — sibling Link (a11y valid) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        {isMaintenance && (
          <div className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-medium rounded">
            Diperbaiki
          </div>
        )}
        {onToggleFavorite && (
          <div className={`${isFavorite ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100'}`}>
            {FavoriteButton}
          </div>
        )}
      </div>
    </div>
  );
}
