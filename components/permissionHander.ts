'use client'

import { useMemo } from 'react'

export interface UserProfileRoles {
  id: number
  user_id?: number
  kyc_status?: string
  is_superuser?: boolean
  is_executive?: boolean
  is_ceo?: boolean
  is_project_manager?: boolean
  is_donor?: boolean
  is_volunteer?: boolean
  is_partner?: boolean
  is_DB_staff?: boolean
  is_standard_member?: boolean
  is_DB_executive?: boolean
  is_DB_admin?: boolean
}

type PermissionCheckOptions = {
  requiredRoles?: Array<
    | 'is_superuser'
    | 'is_executive'
    | 'is_ceo'
    | 'is_project_manager'
    | 'is_donor'
    | 'is_volunteer'
    | 'is_partner'
    | 'is_DB_staff'
    | 'is_standard_member'
    | 'is_DB_executive'
    | 'is_DB_admin'
  >
  requireKYC?: boolean
  checkMode?: 'all' | 'any'
  customCheck?: (user: UserProfileRoles) => boolean
}

export function usePermissions(
  user: UserProfileRoles | null | undefined,
  options: PermissionCheckOptions = {}
): boolean {
  return useMemo(() => {
    if (!user) return false

    // Always allow superusers unless explicitly restricted
    if (user.is_superuser && options.requiredRoles?.includes('is_superuser') !== false) {
      return true
    }

    // KYC Verification Check
    const kycCheck = options.requireKYC ? user.kyc_status === 'approved' : true

    // Role Verification Check
    const roleCheck = () => {
      if (!options.requiredRoles?.length) return true
      
      return options.checkMode === 'all'
        ? options.requiredRoles.every(role => user[role as keyof UserProfileRoles])
        : options.requiredRoles.some(role => user[role as keyof UserProfileRoles])
    }

    // Custom comparison check (supports user_id or id comparison)
    const customCheckResult = options.customCheck?.(user) ?? true

    return kycCheck && roleCheck() && customCheckResult
  }, [user, options])
}