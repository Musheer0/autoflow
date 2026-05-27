"use client"
import CreateCredentials from '@/features/credentials/components/create-credentials-dialog'
import SelectCredentialsDropDown from '@/features/credentials/components/select-credentials-dropdown'
import React from 'react'

const page = () => {
  return (
    <div>
      <CreateCredentials type='GMAIL'>
        <button>Test</button>
      </CreateCredentials>
      <SelectCredentialsDropDown type='GMAIL' />
    </div>
  )
}

export default page