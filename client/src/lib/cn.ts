/**
 * Helper untuk menggabungkan className secara kondisional.
 *
 * Tanpa dependency eksternal — versi minimal dari clsx.
 * Menerima string, object {class: bool}, atau array dari kombinasi keduanya.
 *
 * Contoh:
 *   cn('px-4', isActive && 'bg-primary-500', { 'opacity-50': disabled })
 */

type ClassValue = string | number | null | undefined | false | ClassValue[] | Record<string, unknown>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) out.push(key);
      }
    }
  }

  return out.join(' ');
}
