import avatarElena from '../assets/images/avatar_elena_1795851515709.jpg';
import avatarMarcus from '../assets/images/avatar_marcus_1795851515411.jpg';
import avatarAarav from '../assets/images/avatar_aarav_1795851516160.jpg';
import avatarSofia from '../assets/images/avatar_sofia_1795851516706.jpg';
import avatarClaire from '../assets/images/avatar_claire_1795851516483.jpg';
import avatarKenji from '../assets/images/avatar_kenji_1795851516827.jpg';

export const CUSTOMER_AVATAR_POOL = [
  avatarElena,
  avatarMarcus,
  avatarAarav,
  avatarSofia,
  avatarClaire,
  avatarKenji
];

export const CUSTOMER_AVATAR_PATHS = [
  '/src/assets/images/avatar_elena_1795851515709.jpg',
  '/src/assets/images/avatar_marcus_1795851515411.jpg',
  '/src/assets/images/avatar_aarav_1795851516160.jpg',
  '/src/assets/images/avatar_sofia_1795851516706.jpg',
  '/src/assets/images/avatar_claire_1795851516483.jpg',
  '/src/assets/images/avatar_kenji_1795851516827.jpg'
];

const PATH_TO_ASSET: Record<string, string> = {
  '/src/assets/images/avatar_elena_1795851515709.jpg': avatarElena,
  '/src/assets/images/avatar_marcus_1795851515411.jpg': avatarMarcus,
  '/src/assets/images/avatar_aarav_1795851516160.jpg': avatarAarav,
  '/src/assets/images/avatar_sofia_1795851516706.jpg': avatarSofia,
  '/src/assets/images/avatar_claire_1795851516483.jpg': avatarClaire,
  '/src/assets/images/avatar_kenji_1795851516827.jpg': avatarKenji
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Resolves a profile's avatarUrl to a bundled local portrait image.
 * Ensures every profile has a reliable, distinct portrait photo without sharing
 * a single fallback image.
 */
export function resolveAvatarUrl(avatarUrl?: string, seedId: string = ''): string {
  if (avatarUrl && PATH_TO_ASSET[avatarUrl]) {
    return PATH_TO_ASSET[avatarUrl];
  }
  if (avatarUrl && !avatarUrl.includes('images.unsplash.com')) {
    return avatarUrl;
  }
  const idx = hashSeed(seedId || avatarUrl || 'default') % CUSTOMER_AVATAR_POOL.length;
  return CUSTOMER_AVATAR_POOL[idx];
}
