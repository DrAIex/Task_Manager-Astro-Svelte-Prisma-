import type { APIRoute } from 'astro';

type PriorityColor = {
  background: string;
  text: string;
  border: string;
};

type PriorityColorMap = {
  high: PriorityColor;
  medium: PriorityColor;
  low: PriorityColor;
  default: PriorityColor;
};

const priorityColors: PriorityColorMap = {
  high: { background: '#FEE2E2', text: '#B91C1C', border: '#EF4444' },
  medium: { background: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  low: { background: '#DCFCE7', text: '#166534', border: '#22C55E' },
  default: { background: '#E0E7FF', text: '#3730A3', border: '#6366F1' }
};

type Priority = 'high' | 'medium' | 'low' | 'default';

function getPriorityName(priority: string): string {
  switch (priority) {
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return 'Стандартный';
  }
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const title = url.searchParams.get('title') || 'Задача';
    const priority = (url.searchParams.get('priority') || 'default') as Priority;
    const status = url.searchParams.get('status') || 'В процессе';

    const colorScheme = priorityColors[priority];

    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="${colorScheme.background}" />
        
        <rect width="12" height="630" fill="${colorScheme.border}" />
        
        <text x="50" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${colorScheme.text}">
          ${title.length > 40 ? title.substring(0, 40) + '...' : title}
        </text>
        
        <text x="50" y="300" font-family="Arial, sans-serif" font-size="32" fill="${colorScheme.text}">
          Приоритет: ${getPriorityName(priority)}
        </text>
        
        <text x="50" y="360" font-family="Arial, sans-serif" font-size="32" fill="${colorScheme.text}">
          Статус: ${status}
        </text>
        
        <text x="50" y="550" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${colorScheme.text}">
          Менеджер задач
        </text>
      </svg>
    `;

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error: unknown) {
    console.error('Error generating OG image:', error);

    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return new Response(`Error generating image: ${errorMessage}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}; 