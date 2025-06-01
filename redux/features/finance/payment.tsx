import { apiSlice } from "../../services/apiSlice"

const backend = "finance_api"

export interface PaymentStatusUpdate {
  status: string
  transaction_data: {
    flutterwave_ref?: string
    transaction_id?: string
    tx_ref?: string
    amount?: number
    currency?: string
    payment_method?: string
    processed_at?: string
    error_message?: string
    failed_at?: string
    [key: string]: any
  }
}

export interface FlutterwaveVerification {
  transaction_id: string
}

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Update one-time donation payment status
    updateDonationPaymentStatus: builder.mutation<any, { id: number; data: PaymentStatusUpdate }>({
      query: ({ id, data }) => ({
        url: `/${backend}/donations/${id}/payment-status/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Update recurring donation payment status
    updateRecurringDonationPaymentStatus: builder.mutation<any, { id: number; data: PaymentStatusUpdate }>({
      query: ({ id, data }) => ({
        url: `/${backend}/recurring-donations/${id}/payment-status/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Update in-kind donation payment status
    updateInKindDonationPaymentStatus: builder.mutation<any, { id: number; data: PaymentStatusUpdate }>({
      query: ({ id, data }) => ({
        url: `/${backend}/in-kind-donations/${id}/payment-status/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Verify Flutterwave payment
    verifyFlutterwavePayment: builder.mutation<any, FlutterwaveVerification>({
      query: (data) => ({
        url: `/${backend}/verify-flutterwave-payment/`,
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const {
  useUpdateDonationPaymentStatusMutation,
  useUpdateRecurringDonationPaymentStatusMutation,
  useUpdateInKindDonationPaymentStatusMutation,
  useVerifyFlutterwavePaymentMutation,
} = paymentApiSlice
