import CustomerForm from '@/components/invoice/CustomerForm'
import React from 'react'

export default function page() {
  const handleCancel = () => {
   
  };
  return (
    <div>
      <CustomerForm cancel={handleCancel} />
    </div>
  )
}
