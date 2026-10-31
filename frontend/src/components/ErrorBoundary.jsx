import { Component } from 'react';
import { Button, Container, Stack, Text, ThemeIcon, Title } from '@mantine/core';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <Stack align="center" gap="md">
            <ThemeIcon color="red" variant="light" size={56} radius="xl">
              <span style={{ fontSize: 28 }}>⚠️</span>
            </ThemeIcon>
            <Title order={2}>Terjadi Kesalahan Tak Terduga</Title>
            <Text c="dimmed" size="sm" maw={420}>
              Aplikasi mengalami crash karena error pada komponen ini.
              {this.state.error && (<><br /><code>{this.state.error.toString()}</code></>)}
            </Text>
            <Button color="red" onClick={() => window.location.reload()}>Muat Ulang Halaman</Button>
          </Stack>
        </Container>
      );
    }
    return this.props.children;
  }
}
