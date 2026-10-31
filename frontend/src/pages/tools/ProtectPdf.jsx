import { useState } from 'react';
import { Checkbox, Grid, PasswordInput, Stack, Text } from '@mantine/core';
import ToolLayout from '../../components/ToolLayout';
import useToolStore from '../../store/useToolStore';
import { apiProtect } from '../../utils/api';

export default function ProtectPdf() {
  const { startProcess, setUploadProgress, setResult, setError } = useToolStore();
  const [userPass, setUserPass] = useState('');
  const [ownerPass, setOwnerPass] = useState('');
  const [perms, setPerms] = useState({ print: true, copy: false, edit: false });

  const handleProcess = async (files) => {
    try {
      const file = files[0];
      const totalMb = file?.size ? (file.size / (1024 * 1024)).toFixed(1) : 0;
      startProcess('Menyiapkan file...', `Ukuran dokumen: ${totalMb} MB`);

      const permissions = Object.entries(perms).filter(([, v]) => v).map(([k]) => k);
      const res = await apiProtect(file, userPass, ownerPass || userPass, permissions, (e) => {
        if (e.total) {
          const percent = Math.round((e.loaded * 100) / e.total);
          const loadedMb = (e.loaded / (1024 * 1024)).toFixed(1);
          setUploadProgress(percent, percent < 100
            ? `Mengunggah: ${loadedMb} MB / ${totalMb} MB`
            : 'File terunggah! Mengenkripsi dokumen...');
        }
      });

      const { fileId, filename } = res.data;
      const finalFilename = filename || file.name;
      setResult({ url: `${import.meta.env.VITE_API_BASE_URL}/download/${fileId}?filename=${encodeURIComponent(finalFilename)}`, filename: finalFilename });
    } catch (err) {
      setError(err.message || 'Gagal mengenkripsi PDF. Pastikan backend berjalan.');
    }
  };

  return (
    <ToolLayout
      title="Protect PDF"
      description="Tambahkan password dan enkripsi 256-bit ke PDF menggunakan qpdf."
      accept={{ 'application/pdf': ['.pdf'] }}
      multiple={false}
      onProcess={handleProcess}
      actionLabel="Proteksi PDF"
      options={
        <Stack gap="md">
          <Grid>
            <Grid.Col span={6}>
              <PasswordInput label="Password User" withAsterisk placeholder="Password untuk membuka" value={userPass} onChange={(e) => setUserPass(e.currentTarget.value)} />
            </Grid.Col>
            <Grid.Col span={6}>
              <PasswordInput label="Password Owner (opsional)" placeholder="Password pemilik" value={ownerPass} onChange={(e) => setOwnerPass(e.currentTarget.value)} />
            </Grid.Col>
          </Grid>
          <div>
            <Text size="sm" c="dimmed" mb={6}>Izinkan pengguna untuk:</Text>
            <Stack gap={6}>
              {[{ k: 'print', label: 'Mencetak (Print)' }, { k: 'copy', label: 'Menyalin teks (Copy)' }, { k: 'edit', label: 'Mengedit konten' }].map(({ k, label }) => (
                <Checkbox key={k} label={label} checked={perms[k]} onChange={(e) => setPerms((p) => ({ ...p, [k]: e.currentTarget.checked }))} />
              ))}
            </Stack>
          </div>
        </Stack>
      }
    />
  );
}

