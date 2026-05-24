"use client"
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'sonner'

const useCreateCredential = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate: createCredential, ...rest } = useMutation(
    trpc.credentials.create.mutationOptions({
      onError: (err) => {
        toast.error(err.message)
      },

      onSuccess: (data) => {
        toast.dismiss("creating-credential")
        toast.success("Credential saved successfully")

        queryClient.setQueryData<Credential[]>(
          trpc.credentials.getCredentials.queryKey({
            type: data.type,
          }),
          (old) => [...(old ?? []), data]
        )
      },

      onMutate: () => {
        toast.loading("Saving credential...", {
          id: "creating-credential",
        })
      },
    })
  )

  return { createCredential, ...rest }
}

export default useCreateCredential