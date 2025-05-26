import { apiSlice } from "../../services/apiSlice"
import type { ExchangeRate, PaginatedResponse } from "../../../types/finance"

const backend = "finance_api"

export const exchangeRatesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all exchange rates
    getExchangeRates: builder.query<
      PaginatedResponse<ExchangeRate>,
      {
        from_currency?: number
        to_currency?: number
        ordering?: string
        page?: number
        page_size?: number
      }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const queryString = queryParams.toString()
        return `/${backend}/exchange-rates/${queryString ? `?${queryString}` : ""}`
      },
    }),

    // Get exchange rate by ID
    getExchangeRateById: builder.query<ExchangeRate, number>({
      query: (id) => `/${backend}/exchange-rates/${id}/`,
    }),

    // Get latest rates
    getLatestExchangeRates: builder.query<ExchangeRate[], void>({
      query: () => `/${backend}/exchange-rates/latest_rates/`,
    }),

    // Create exchange rate
    createExchangeRate: builder.mutation<
      ExchangeRate,
      Partial<ExchangeRate> & {
        from_currency_id: number
        to_currency_id: number
      }
    >({
      query: (exchangeRate) => ({
        url: `/${backend}/exchange-rates/`,
        method: "POST",
        body: exchangeRate,
      }),
    }),

    // Update exchange rate
    updateExchangeRate: builder.mutation<
      ExchangeRate,
      {
        id: number
        data: Partial<ExchangeRate> & {
          from_currency_id?: number
          to_currency_id?: number
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/${backend}/exchange-rates/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete exchange rate
    deleteExchangeRate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${backend}/exchange-rates/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useGetExchangeRatesQuery,
  useGetExchangeRateByIdQuery,
  useGetLatestExchangeRatesQuery,
  useCreateExchangeRateMutation,
  useUpdateExchangeRateMutation,
  useDeleteExchangeRateMutation,
} = exchangeRatesApiSlice
