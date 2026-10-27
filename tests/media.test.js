import test from 'node:test';
import assert from 'node:assert/strict';

// Funciones de formateo y optimización para la mediateca y CDN
function getOptimizedImageUrl(
  publicIdOrUrl,
  width = 600,
  height,
  cloudName = 'zairen-lab'
) {
  if (!publicIdOrUrl) return '';

  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    if (publicIdOrUrl.includes('res.cloudinary.com')) {
      const transform = height
        ? `f_auto,q_auto,w_${width},h_${height},c_fill`
        : `f_auto,q_auto,w_${width}`;
      return publicIdOrUrl.replace('/upload/', `/upload/${transform}/`);
    }
    return publicIdOrUrl;
  }

  const transform = height
    ? `f_auto,q_auto,w_${width},h_${height},c_fill`
    : `f_auto,q_auto,w_${width}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicIdOrUrl}.webp`;
}

test('Cloudinary URL transformation injects f_auto and q_auto with dimensions', () => {
  const rawUrl = 'https://res.cloudinary.com/ds4qnoypm/image/upload/v12345/zairen/polera1.jpg';
  const optimized = getOptimizedImageUrl(rawUrl, 300, 400);

  assert.ok(optimized.includes('/upload/f_auto,q_auto,w_300,h_400,c_fill/'));
  assert.ok(optimized.includes('zairen/polera1.jpg'));
});

test('Public ID generates direct optimized WebP URL', () => {
  const publicId = 'zairen/polera_cyberpunk';
  const optimized = getOptimizedImageUrl(publicId, 600);

  assert.equal(
    optimized,
    'https://res.cloudinary.com/zairen-lab/image/upload/f_auto,q_auto,w_600/zairen/polera_cyberpunk.webp'
  );
});

test('Next cursor pagination query params builder works as expected', () => {
  const buildQueryParams = (limit, cursor, prefix) => {
    const params = new URLSearchParams({
      max_results: String(limit),
      type: 'upload',
    });
    if (cursor) params.set('next_cursor', cursor);
    if (prefix) params.set('prefix', prefix);
    return params.toString();
  };

  const q1 = buildQueryParams(30, 'cursor_abc123', 'zairen/');
  assert.ok(q1.includes('max_results=30'));
  assert.ok(q1.includes('next_cursor=cursor_abc123'));
  assert.ok(q1.includes('prefix=zairen%2F'));

  // Test when prefix is empty (all folders)
  const q2 = buildQueryParams(30, null, '');
  assert.ok(!q2.includes('prefix='));
  assert.ok(!q2.includes('next_cursor='));
});
