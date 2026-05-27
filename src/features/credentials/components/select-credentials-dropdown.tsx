"use client"

import { NodeType } from '@/generated/prisma/enums'
import React, { useState } from 'react'
import UseCredentials from '../hooks/use-credentials'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { MoreVerticalIcon, TrashIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DeleteCredentialDialog from './delete-credential-dialog'
interface props {
    onSelect?:(credentialId:string)=>void
    selected?:string
    type:NodeType
}
const SelectCredentialsDropDown:React.FC<props> = ({onSelect,selected,type}) => {
  const {data, isPending} = UseCredentials(type)
  const [deleteopen, setDeleteOpen] = useState(false)
 if(isPending && !data)
    return (
        <Skeleton className='w-full h-10 '/>
    )
    if(data)
    return (
    <>
     <Select>
  <SelectTrigger className='w-full max-w-sm'>
    <SelectValue placeholder="SMPT USERNAME" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
     {data?.map((credential)=>{
      return(
        <div key={credential.id} className='flex items-center justify-between'>
          <SelectItem value={credential.id} className='flex-1' >{credential.name}</SelectItem>
          <DeleteCredentialDialog 
             credentialId={credential.id}
             type={credential.type}
             credentialName={credential.name}
             >
              <Button variant={"ghost"}><TrashIcon className='text-destructive'/></Button>
             </DeleteCredentialDialog>
        </div>
      )
     })}
    </SelectGroup>
  </SelectContent>
</Select>
    </>
  )
}

export default SelectCredentialsDropDown