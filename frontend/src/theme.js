import { createTheme } from '@mantine/core';

// Brand merah pdfLan (#e2001a) sebagai skala 10-shade Mantine.
const brand = [
  '#fff1f1', // 0
  '#ffe0e0', // 1
  '#ffc9c9', // 2
  '#ffa1a1', // 3
  '#ff6b6b', // 4
  '#ff3b3b', // 5
  '#e2001a', // 6  ← primary (pdfLan brand)
  '#c70018', // 7  ← hover
  '#a80016', // 8
  '#8f0014', // 9
];

// Netral dark selaras Zinc (pdfLan pakai Zinc 900/800/700). Di-override ke
// skala 'dark' Mantine agar surface komponen Mantine cocok dengan UI existing.
const zincDark = [
  '#fafafa', // 0  zinc-50
  '#f4f4f5', // 1  zinc-100
  '#e4e4e7', // 2  zinc-200
  '#d4d4d8', // 3  zinc-300
  '#a1a1aa', // 4  zinc-400
  '#71717a', // 5  zinc-500
  '#52525b', // 6  zinc-600
  '#3f3f46', // 7  zinc-700
  '#27272a', // 8  zinc-800
  '#18181b', // 9  zinc-900
];

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 6 },
  defaultRadius: 'md',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: { fontWeight: '700' },
  colors: { brand, dark: zincDark },
  components: {
    Button: { defaultProps: { color: 'brand', radius: 'md' } },
    ActionIcon: { defaultProps: { color: 'brand' } },
  },
});
