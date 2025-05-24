import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGetLoggedInUserQuery } from './userApiSlice';
import { UserData } from './userApiSlice';

export const publicRoutes = [
  "/",
  "/activate",
  "/accounts/verify",
  "/membership/portal",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/about",
  "/vision-mission",
  "/core-values",
  "/history",
  "/leadership",
  "/resources",
  "/resources/publications",
  "/resources/reports",
  "/resources/media",
  "/blog",
  "/blog/category",
  "/faqs",
  "/contact",
  "/donate",
  "/privacy-policy",
  "/terms-of-service",
  "/membership/benefits",
  "/membership/join",
  "/membership/tiers",
  "/membership/volunteer",
  "/membership/partner",
  "/kyc",
  "/admin/member-verification",
  "/membership/verification",
]

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = publicRoutes.includes(pathname);

  const { data: user, isLoading, isSuccess } = useGetLoggedInUserQuery('', {
    // skip: isPublic,
    refetchOnMountOrArgChange: true,
  });



  return {
    user: user as UserData | undefined,
    isLoading: isLoading && !isPublic,
    isAuthenticated: !!user,
    isPublic,
  };
};



