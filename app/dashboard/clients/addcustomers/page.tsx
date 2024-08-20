'use client'
import CustomerForm from '@/components/invoice/CustomerForm'
import React from 'react'

export default function page() {
  const handleCancel = () => {
   
  };
  const handleSuccess =()=>{

  }
  return (
    <div>
      <CustomerForm onSuccess={ handleSuccess} cancel={handleCancel} />
    </div>
  )
}
