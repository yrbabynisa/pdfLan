import { useState } from 'react';
import { PasswordInput } from '@mantine/core';
import ToolLayout from '../../components/ToolLayout';
import useToolStore from '../../store/useToolStore';
import { apiUnlock } from '../../utils/api';

export default function UnlockPdf() {
  const { startProcess, setUploadProgress, setResult, setError } = useToolStore();
  const [password, setPassword] = useState('');

  const handleProcess = async (files) => {
    try {
      const file = files[0];
      const totalMb = file?.size ? (file.size / (1024 * 1024)).toFixed(1) : 0;
      startProcess('Menyiapkan file...', `Ukuran dokumen: ${totalMb} MB`);

      const res = await apiUnlock(file, password, (e) => {
        if (e.total) {
          const percent = Math.round((e.loaded * 100) / e.total);
          const loadedMb = (e.loaded / (1024 * 1024)).toFixed(1);
          setUploadProgress(percent, percent < 100
            ? `Mengunggah: ${loadedMb} MB / ${totalMb} MB`
            : 'File terunggah! Membuka enkripsi PDF...');
        }
      });

      const { fileId, filename } = res.data;
      const finalFilename = filename || file.name;
      setResult({ url: `${import.meta.env.VITE_API_BASE_URL}/download/${fileId}?filename=${encodeURIComponent(finalFilename)}`, filename: finalFilename });
    } catch (err) {
      setError(err.message || 'Gagal membuka kunci PDF. Password mungkin salah.');
    }
  };

  return (
    <ToolLayout
      title="Unlock PDF"
      description="Hapus password dan enkripsi dari PDF yang terproteksi."
      accept={{ 'application/pdf': ['.pdf'] }}
      multiple={false}
      onProcess={handleProcess}
      actionLabel="Buka Kunci PDF"
      options={
        <PasswordInput label="Password PDF" placeholder="Masukkan password..." value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
      }
    />
  );
}

