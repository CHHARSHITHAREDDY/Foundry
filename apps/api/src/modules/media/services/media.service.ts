export class MediaService {
  generateSvgBadge(label: string, value: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="28" viewBox="0 0 160 28">
      <rect width="160" height="28" fill="#111111" stroke="#F25C05" stroke-width="1.5"/>
      <text x="12" y="18" fill="#EDEDEA" font-family="monospace" font-size="11" font-weight="bold">${label}</text>
      <text x="90" y="18" fill="#F25C05" font-family="monospace" font-size="11" font-weight="bold">${value}</text>
    </svg>`;
  }
}

export const mediaService = new MediaService();

