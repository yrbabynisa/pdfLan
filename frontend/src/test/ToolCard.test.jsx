import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import ToolCard from '../components/ToolCard';

// Mock ToolIconBadge agar test fokus ke struktur a11y ToolCard, bukan ikon.
vi.mock('../components/ToolIcon', () => ({
  ToolIconBadge: () => <div data-testid="tool-icon" />,
}));

const tool = {
  id: 'merge-pdf',
  name: 'Merge PDF',
  desc: 'Gabungkan beberapa PDF menjadi satu.',
  icon: null,
  route: '/merge-pdf',
  category: 'organize',
};

const renderWith = (ui) =>
  render(
    <MantineProvider defaultColorScheme="dark">
      <MemoryRouter>{ui}</MemoryRouter>
    </MantineProvider>
  );

// UI/UX & a11y: tombol favorit harus jadi sibling Link (bukan nested),
// punya aria-label/aria-pressed, dan klik memanggil handler tanpa navigasi.
describe('ToolCard — UI/UX & a11y', () => {
  it('merender kartu sebagai link ke route tool', () => {
    renderWith(<ToolCard tool={tool} />);
    const link = screen.getByRole('link', { name: /Merge PDF/i });
    expect(link).toHaveAttribute('href', '/merge-pdf');
  });

  it('tombol favorit punya aria-label & aria-pressed=false saat belum favorit', () => {
    renderWith(<ToolCard tool={tool} isFavorite={false} onToggleFavorite={() => {}} />);
    const fav = screen.getByRole('button', { name: /Tambah ke favorit/i });
    expect(fav).toHaveAttribute('aria-pressed', 'false');
  });

  it('klik tombol favorit memanggil onToggleFavorite dengan id tool', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWith(<ToolCard tool={tool} isFavorite={false} onToggleFavorite={onToggle} />);
    await user.click(screen.getByRole('button', { name: /Tambah ke favorit/i }));
    expect(onToggle).toHaveBeenCalledWith('merge-pdf');
  });

  it('saat sudah favorit, tombol berlabel "Hapus dari favorit" & aria-pressed=true', () => {
    renderWith(<ToolCard tool={tool} isFavorite={true} onToggleFavorite={() => {}} />);
    const fav = screen.getByRole('button', { name: /Hapus dari favorit/i });
    expect(fav).toHaveAttribute('aria-pressed', 'true');
  });
});
