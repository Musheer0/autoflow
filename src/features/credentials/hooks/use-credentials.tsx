"use client"
import { NodeType } from '@/generated/prisma/enums'
import { useTRPC } from '@/trpc/client'
import { useQueries, useQuery } from '@tanstack/react-query'
import React from 'react'

const UseCredentials = (type:NodeType) => {
    const trpc = useTRPC()
    return useQuery(trpc.credentials.getCredentials.queryOptions({type}))
}

export default UseCredentials