'use client';


import { Suspense } from 'react';
import { PaymentResultLoading } from '@/components/student/payment/transaction/TransactionLoading';
import PaymentResult from '@/components/student/payment/transaction/TransactionResult';

// result page
export default async function PaymentResultPage()  {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Suspense fallback={<PaymentResultLoading />}>
        <PaymentResult/>
      </Suspense>
    </div>
  );
}