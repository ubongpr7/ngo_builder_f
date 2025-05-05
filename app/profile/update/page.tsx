"use client"
import KYCFormContainer from "@/components/kyc/KYCFormContainer";
import { useGetLoggedInUserQuery } from "@/redux/features/users/userApiSlice";
export default function KYCPage() {
  const { data: loggedInUser } = useGetLoggedInUserQuery('');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <KYCFormContainer 
      userId={loggedInUser?.id} 
      userDisabled={loggedInUser?.disabled} 
      userDisability={loggedInUser?.disability}
      profileId={loggedInUser?.profile} 
      sex={loggedInUser?.sex}
      first_name={loggedInUser?.first_name} 
      last_name={loggedInUser?.last_name} />
    </div>
  )
}
