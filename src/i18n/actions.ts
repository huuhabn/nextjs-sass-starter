'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  defaultLocale,
  DIRECTION_COOKIE_NAME,
  directionForLocale,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  switchLocalePath
} from './locale';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 năm

/**
 * Server Action: lưu locale vào cookie và redirect về URL hiện tại
 * với locale prefix được điều chỉnh phù hợp:
 * - defaultLocale (en-US): không có prefix (ví dụ: /signin, /dashboard)
 * - non-default (vi-VN, ar-TN): có prefix (ví dụ: /vi-VN/signin, /vi-VN/dashboard)
 */
export async function setLocaleAction(locale: string): Promise<void> {
  const next = normalizeLocale(locale);
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, next, {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax'
  });

  cookieStore.set(DIRECTION_COOKIE_NAME, directionForLocale(next), {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax'
  });

  // Đọc referer để redirect lại đúng path
  const headerStore = await headers();
  const referer = headerStore.get('referer') ?? '';

  let newPath = next === defaultLocale ? '/' : `/${next}`;

  if (referer) {
    try {
      const url = new URL(referer);
      newPath = switchLocalePath(url.pathname, next) + (url.search || '');
    } catch {
      // referer không parse được → dùng default
    }
  }

  redirect(newPath);
}
