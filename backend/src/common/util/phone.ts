/**
 * Normalises a phone number to a comparable canonical form for duplicate
 * detection. Strips spaces, dashes, brackets and a leading `+`/`00`, and
 * collapses an Egyptian international prefix (20) with a national trunk `0`
 * to a single national form. This is deliberately lightweight (no libphonenumber
 * dependency) but covers the EG/GCC formats the site captures.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  let digits = raw.replace(/[^\d+]/g, '');
  digits = digits.replace(/^\+/, '').replace(/^00/, '');

  // Egypt: 20 10... (intl) and 010... (national) should match.
  if (digits.startsWith('20') && digits.length >= 11) {
    digits = digits.slice(2);
    if (!digits.startsWith('0')) {
      digits = '0' + digits;
    }
  }
  return digits || null;
}
