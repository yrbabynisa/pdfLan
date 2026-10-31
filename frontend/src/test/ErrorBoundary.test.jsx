import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import ErrorBoundary from '../components/ErrorBoundary';

afterEach(() => {
  vi.restoreAllMocks();
});

const renderWithProvider = (ui) =>
  render(<MantineProvider defaultColorScheme="dark">{ui}</MantineProvider>);

// UI/UX test: ErrorBoundary fallback (sudah di-migrate ke komponen Mantine).
describe('ErrorBoundary — UI/UX', () => {
  it('merender children saat tidak ada error', () => {
    renderWithProvider(
      <ErrorBoundary>
        <p>konten normal</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('konten normal')).toBeInTheDocument();
    expect(screen.queryByText('Terjadi Kesalahan Tak Terduga')).not.toBeInTheDocument();
  });

  it('menampilkan fallback UI saat child throw error', () => {
    // Reduksi noise console.error dari React untuk error yang memang diharapkan.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Bomb() {
      throw new Error('kaboom');
    }
    renderWithProvider(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Terjadi Kesalahan Tak Terduga')).toBeInTheDocument();
    // Tombol reload ada & dapat diakses via role button (a11y).
    expect(screen.getByRole('button', { name: /Muat Ulang Halaman/i })).toBeInTheDocument();
    spy.mockRestore();
  });
});
