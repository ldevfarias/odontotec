import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'OdontoEhTec — Software de Gestão Odontológica';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '6px',
          background: '#41b883',
          borderRadius: '9999px',
          marginBottom: '32px',
        }}
      />
      <div
        style={{
          fontSize: '52px',
          fontWeight: 800,
          color: '#111827',
          letterSpacing: '-2px',
          marginBottom: '16px',
        }}
      >
        OdontoEhTec
      </div>
      <div
        style={{
          fontSize: '28px',
          color: '#6b7280',
          maxWidth: '720px',
          lineHeight: 1.4,
          marginBottom: '48px',
        }}
      >
        Software de Gestão Odontológica para Dentistas e Clínicas
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '9999px',
          padding: '12px 24px',
          fontSize: '18px',
          color: '#15803d',
          fontWeight: 600,
        }}
      >
        R$ 49,99/mês · Equipe ilimitada · 7 dias grátis
      </div>
    </div>,
    { ...size },
  );
}
