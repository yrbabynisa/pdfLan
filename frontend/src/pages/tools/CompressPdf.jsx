import ToolLayout from '../../components/ToolLayout';
import useToolStore from '../../store/useToolStore';
import { useState } from 'react';
import { Radio, Stack, Text } from '@mantine/core';
import { apiCompress } from '../../utils/api';
import { formatFileSize } from '../../utils/fileHelpers';

export default function CompressPdf() {
  const files = useToolStore((s) => s.files);
  const [level, setLevel] = useState('medium');

  const handleProcessFile = async (file, { setProgress }) => {
    const res = await apiCompress(file, level, (e) => {
      if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
    });
    const { fileId, filename } = res.data;
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/download/${fileId}?filename=${encodeURIComponent(filename)}`;

    let compressedBytes = 0;
    try {
      const head = await fetch(downloadUrl, { method: 'HEAD' });
      compressedBytes = Number(head.headers.get('content-length')) || 0;
    } catch { /* abaikan, statistik opsional */ }

    return { url: downloadUrl, filename, compressedBytes };
  };

  const LEVELS = [
    { v: 'low', label: 'Rendah', desc: 'Kualitas tinggi, ukuran sedikit berkurang' },
    { v: 'medium', label: 'Sedang', desc: 'Keseimbangan kualitas & ukuran' },
    { v: 'high', label: 'Tinggi', desc: 'Ukuran paling kecil, kualitas berkurang' },
  ];

  return (
    <ToolLayout
      title="Compress PDF"
      description="Kurangi ukuran file PDF menggunakan Ghostscript. Butuh backend berjalan."
      accept={{ 'application/pdf': ['.pdf'] }}
      multiple={true}
      batch={true}
      onProcessFile={handleProcessFile}
      actionLabel="Compress PDF"
      options={
        <Stack gap="xs">
          <Text size="xs" c="dimmed" mb={4}>Level Kompresi</Text>
          <Radio.Group value={level} onChange={setLevel} name="level">
            <Stack gap="xs">
              {LEVELS.map(({ v, label, desc }) => (
                <Radio key={v} value={v} label={label} description={desc} />
              ))}
            </Stack>
          </Radio.Group>
          {files[0] && <Text size="xs" c="dimmed" mt={4}>Ukuran asli: {formatFileSize(files[0].size)}</Text>}
        </Stack>
      }
    />
  );
}
