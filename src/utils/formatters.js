const DEFAULT_DATE_OPTIONS = Object.freeze({
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

const FA_LOCALE = 'fa-IR';

export function getPersianTimestamp(
  date = new Date(),
  options = DEFAULT_DATE_OPTIONS
) {
  try {
    return date.toLocaleString(FA_LOCALE, options);
  } catch (error) {
    console.error('[Formatter] Error formatting date:', error);
    return date.toLocaleString();
  }
}

export function truncatePassword(password, maxLength = 20) {
  if (!password || typeof password !== 'string') return '';
  if (password.length <= maxLength) return password;
  return `${password.slice(0, maxLength)}...`;
}
