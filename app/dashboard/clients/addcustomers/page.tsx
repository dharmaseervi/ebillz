import CustomerForm from '@/components/invoice/CustomerForm'
import React from 'react'

export default function page() {
  return (
    <div>
      <CustomerForm cancel={function (): void {
        throw new Error('Function not implemented.')
      } } />
    </div>
  )
}
