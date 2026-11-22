'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  defaultLocale,
  DIRECTION_COOKIE_NAME,
  directionForLocale,
  LOCALE_COOKIE_NAME,
  normalizeLocale
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

  let newPath = next === defaultLocale ? '/dashboard' : `/${next}/dashboard`;

  if (referer) {
    try {
      const url = new URL(referer);
      const pathParts = url.pathname.split('/').filter(Boolean);

      // Kiểm tra nếu phần đầu là locale prefix (dạng xx-XX)
      const localePattern = /^[a-z]{2}-[A-Z]{2}$/;
      const hasLocalePrefix = pathParts.length > 0 && localePattern.test(pathParts[0]);

      if (next === defaultLocale) {
        // Ngôn ngữ mặc định: bỏ prefix khỏi URL
        if (hasLocalePrefix) {
          pathParts.shift();
        }
        newPath = '/' + pathParts.join('/');
      } else {
        // Ngôn ngữ phụ: thêm hoặc thay thế prefix
        if (hasLocalePrefix) {
          pathParts[0] = next;
        } else {
          pathParts.unshift(next);
        }
        newPath = '/' + pathParts.join('/');
      }

      if (!newPath || newPath === '') {
        newPath = '/';
      }
    } catch {
      // referer không parse được → dùng default
    }
  }

  redirect(newPath);
}
