"use client"
import CreateCredentials from '@/features/credentials/components/create-credentials-dialog'
import React from 'react'

const page = () => {
  return (
    <div>
      <CreateCredentials type='GMAIL'>
        <button>Test</button>
      </CreateCredentials>
    </div>
  )
}

export default page