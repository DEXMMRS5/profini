import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ProFini',
    short_name: 'ProFini',
    description: 'Gestion de chantiers pour artisans',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F9FAFB',
    theme_color: '#15355B',
    categories: ['business', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
