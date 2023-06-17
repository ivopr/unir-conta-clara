import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/libs/prisma'

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  const { description, value, type } = await request.json()

  if (type !== 'debit' && type !== 'credit') {
    return NextResponse.json({
      data: {
        status: 'error',
        error: 'type value is invalid our empty',
        object: {
          transactionId: id,
          updated: 'false',
        },
      },
    })
  }

  try {
    const transaction = await db.transaction.findUnique({
      where: {
        id: id?.toString(),
      },
    })

    console.log(transaction)

    const transactionUpdated = await db.transaction.update({
      where: {
        id: id?.toString(),
      },
      data: {
        description: description || transaction?.description,
        type: type || transaction?.type,
        value: value || transaction?.value,
      },
    })

    return NextResponse.json({
      data: {
        status: 'success',
        object: {
          transactionId: id,
          transaction: transactionUpdated,
          updated: 'true',
        },
      },
    })
  } catch (err) {
    return NextResponse.json({
      data: {
        status: 'error',
        error: err,
        object: {
          transactionId: id,
          updated: 'false',
        },
      },
    })
  }
}