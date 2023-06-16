import { prisma } from '@/app/api/_base'
import { NextRequest, NextResponse } from 'next/server'
import { CalculateBalance } from './calculateBalance'
import { SortAction } from './sortAction'

type OrderBy = 'asc' | 'desc'
type SortBy = 'data' | 'value'

export async function GET(request: NextRequest) {
  try {
    const month = request.nextUrl.searchParams.get('month')
    const sort = request.nextUrl.searchParams.get('sort') as SortBy
    const order = request.nextUrl.searchParams.get('order') as OrderBy

    if (month) {
      const targetMonth = new Date()

      const startOfMonth = new Date(
        targetMonth.getFullYear(),
        parseInt(month) - 1,
        1,
      )
      const endOfMonth = new Date(
        targetMonth.getFullYear(),
        parseInt(month),
        0,
        0,
        0,
        0,
      )

      const listFiltered = await prisma.transaction.findMany({
        where: {
          transaction_date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      })

      const calculatedBalance = CalculateBalance(listFiltered)

      let listReturn = []
      if (sort && order) {
        listReturn = SortAction(sort, order, listFiltered)
      } else {
        listReturn = listFiltered
      }
      const listSorted = SortAction(sort, order, listFiltered)
      console.log(listSorted)

      return NextResponse.json({
        data: {
          status: 'success',
          object: {
            balance: calculatedBalance,
            list: listReturn,
          },
        },
      })
    }
  } catch (err) {
    console.log(err)
    return NextResponse.json({
      data: {
        status: 'error',
        error: err,
      },
    })
  }
}
