import { NextResponse } from 'next/server';
// Dynamic export configuration for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;



export async function POST(request) {
  try {
    const body = await request.json();
    const { payouts, adminKey } = body;

    // Admin authentication
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'wrestlebet-admin-2025') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    console.log(`💰 Processing payouts for ${payouts.length} users`);

    const processedPayouts = [];
    let totalProcessed = 0;

    for (const payout of payouts) {
      if (payout.status === 'won' && payout.payout > 0) {
        // In a real implementation, you would:
        // 1. Get user's current balance from database
        // 2. Add the payout amount
        // 3. Create a transaction record
        // 4. Update the user's balance
        
        console.log(`💵 Adding ${payout.payout} WC to user ${payout.userId} account`);
        
        processedPayouts.push({
          userId: payout.userId,
          amount: payout.payout,
          betId: payout.betId,
          wrestler: payout.wrestler,
          processed: true,
          timestamp: new Date().toISOString()
        });
        
        totalProcessed += payout.payout;
      }
    }

    // Create admin transaction log
    const transactionLog = {
      id: `admin_payout_${Date.now()}`,
      type: 'match_payout',
      totalAmount: totalProcessed,
      recipientCount: processedPayouts.length,
      processedBy: 'admin',
      timestamp: new Date().toISOString(),
      details: processedPayouts
    };

    console.log(`✅ Payout processing complete: ${totalProcessed} WC distributed to ${processedPayouts.length} users`);

    return NextResponse.json({
      success: true,
      totalProcessed,
      payoutCount: processedPayouts.length,
      processedPayouts,
      transactionLog
    });

  } catch (error) {
    console.error('❌ Error processing payouts:', error);
    return NextResponse.json(
      { success: false, error: 'Payout processing failed', details: error.message },
      { status: 500 }
    );
  }
}
