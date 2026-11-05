// 'use client';

// import React, { useEffect, useState } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import { UserRepository } from '@/lib/storage/userRepository';

// // Sends every first-time visitor to the sign-in page. After they sign in,
// // register, or choose "Continue as Guest", they can open the rest of the site.
// export default function AuthGate({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [allowed, setAllowed] = useState(false);

//   const isAuthRoute = pathname?.startsWith('/auth');

//   useEffect(() => {
//     if (isAuthRoute || UserRepository.hasEntered()) {
//       setAllowed(true);
//     } else {
//       setAllowed(false);
//       router.replace('/auth/signin');
//     }
//   }, [pathname, isAuthRoute, router]);

//   if (!allowed && !isAuthRoute) return null; // avoid flashing the page before redirect
//   return <>{children}</>;
// }

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserRepository } from '@/lib/storage/userRepository';

// Only signed-in members can open the app. Everyone else is sent to the sign-in page.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  const isAuthRoute = pathname?.startsWith('/auth');

  useEffect(() => {
    const isSignedIn =
      UserRepository.hasEntered() && !UserRepository.getProfile().isGuest;

    if (isAuthRoute || isSignedIn) {
      setAllowed(true);
    } else {
      setAllowed(false);
      router.replace('/auth/signin');
    }
  }, [pathname, isAuthRoute, router]);

  if (!allowed && !isAuthRoute) return null; // avoid flashing the page before redirect
  return <>{children}</>;
}