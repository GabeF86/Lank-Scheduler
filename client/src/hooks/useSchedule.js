import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { scheduleApi } from '../api/schedules'
import { setAuthToken } from '../api/client'

export function useSchedule(date) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['schedule', date],
    queryFn: async () => {
      const token = await getToken()
      setAuthToken(token)
      return scheduleApi.getByDate(date)
    },
    enabled: !!date,
  })

  const mutation = useMutation({
    mutationFn: async (data) => {
      const token = await getToken()
      setAuthToken(token)
      return scheduleApi.upsert(date, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', date] })
    },
  })

  return { ...query, save: mutation.mutate, isSaving: mutation.isPending }
}

export function useStaff() {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const token = await getToken()
      setAuthToken(token)
      const { staffApi } = await import('../api/staff')
      return staffApi.getAll()
    },
  })
}
