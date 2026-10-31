import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { CompressionOptions } from '../pages/tools/CompressPdf';

const renderWithProvider = (ui) =>
  render(<MantineProvider defaultColorScheme="dark">{ui}</MantineProvider>);

// UI/UX test: CompressionOptions (radio group level kompresi, di-migrate ke Mantine).
describe('CompressionOptions — UI/UX', () => {
  it('merender ketiga level kompresi', () => {
    renderWithProvider(<CompressionOptions level="medium" onChange={() => {}} />);
    expect(screen.getByText('Level Kompresi')).toBeInTheDocument();
    expect(screen.getByText('Rendah')).toBeInTheDocument();
    expect(screen.getByText('Sedang')).toBeInTheDocument();
    expect(screen.getByText('Tinggi')).toBeInTheDocument();
  });

  it('memanggil onChange dengan level yang dipilih saat radio diklik', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProvider(<CompressionOptions level="medium" onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: /Tinggi/i }));
    expect(onChange).toHaveBeenCalledWith('high');
  });

  it('menampilkan label ukuran asli saat originalSize diberikan', () => {
    renderWithProvider(
      <CompressionOptions level="medium" onChange={() => {}} originalSize={1048576} />
    );
    expect(screen.getByText(/Ukuran asli:/)).toBeInTheDocument();
  });

  it('tidak menampilkan label ukuran asli saat originalSize kosong', () => {
    renderWithProvider(<CompressionOptions level="medium" onChange={() => {}} />);
    expect(screen.queryByText(/Ukuran asli:/)).not.toBeInTheDocument();
  });
});
