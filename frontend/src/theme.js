import { createTheme } from '@mantine/core';

// Theme Mantine agar selaras dengan palet dark pdfLan (Zinc neutral + merah brand).
// Fase berikutnya warna brand bisa di-pixel-match ke #e2001a pakai custom color scale.
export const theme = createTheme({
  primaryColor: 'red',
  defaultRadius: 'md',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: { fontWeight: '700' },
});
