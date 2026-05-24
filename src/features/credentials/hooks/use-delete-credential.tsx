"use client"
import { NodeType } from '@/generated/prisma/enums'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'sonner'

const useDeleteCredential = (id:string,type:NodeType) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const {mutate:deleteCredential,...rest} = useMutation(trpc.credentials.remove.mutationOptions({
    onError: (err) => {
      toast.error(err.message)
    },
    onMutate: () => {      toast.loading("Deleting credential...", {
        id: "deleting-credential",
      })
    },
    onSuccess: () => {
      toast.dismiss("deleting-credential")
      toast.success("Credential deleted successfully")
      queryClient.setQueryData<Credential[]>(
        trpc.credentials.getCredentials.queryKey({
          type: type,
        }),
        (old) => old?.filter((cred) => cred.id !== id)
      )
    }
  }))
  return {deleteCredential,...rest}
}

export default useDeleteCredential