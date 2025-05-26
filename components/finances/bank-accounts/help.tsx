
import { useGetFinancialInstitutionsQuery } from "@/redux/features/finance/financial-institutions"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import { useGetAdminUsersQuery } from "@/redux/features/profile/readProfileAPISlice"
import { useCreateBankAccountMutation, useUpdateBankAccountMutation } from "@/redux/features/finance/bank-accounts"

import type { BankAccount } from "@/types/finance"
