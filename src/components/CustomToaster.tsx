"use client";

import { Toaster, ToastBar } from 'react-hot-toast';

export default function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      containerClassName="!top-[50px] sm:!top-[75px] max-sm:![&>div]:justify-center max-sm:![&>div]:items-center overflow-hidden"
      toastOptions={{
        style: {
          background: '#facc15',
          color: '#111827',
          fontWeight: 600,
        },
        success: {
          iconTheme: {
            primary: '#388e3c',
            secondary: '#fef08a',
          },
        },
        className: '!text-[13px] sm:!text-[15px] !px-2.5 !py-1.5 sm:!px-3 sm:!py-2.5 max-w-[90vw] sm:!max-w-fit sm:whitespace-nowrap [&>div:first-child]:!mr-1.5 sm:[&>div:first-child]:!mr-3 [&>div:first-child]:scale-90 sm:[&>div:first-child]:scale-110 [&>div[role="status"]]:!m-0 max-sm:!mx-auto'
      }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            animation: t.visible ? 'slideInRight 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) forwards' : 'slideOutRight 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards'
          }}
        />
      )}
    </Toaster>
  );
}
