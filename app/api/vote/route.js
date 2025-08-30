import { supabase } from '../../../lib/supabase'
// Dynamic export configuration for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;



export async function POST(request) {
  try {
    const { matchId, wrestlerChoice, userIp } = await request.json()

    // Check if user already voted for this match
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('match_id', matchId)
      .eq('user_ip', userIp)
      .single()

    if (existingVote) {
      // Update existing vote
      const { error } = await supabase
        .from('votes')
        .update({ wrestler_choice: wrestlerChoice })
        .eq('id', existingVote.id)

      if (error) throw error
    } else {
      // Create new vote
      const { error } = await supabase
        .from('votes')
        .insert({
          match_id: matchId,
          wrestler_choice: wrestlerChoice,
          user_ip: userIp
        })

      if (error) throw error
    }

    // Get updated vote counts
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('wrestler_choice')
      .eq('match_id', matchId)

    if (votesError) throw votesError

    const voteCounts = votes.reduce((acc, vote) => {
      acc[vote.wrestler_choice] = (acc[vote.wrestler_choice] || 0) + 1
      return acc
    }, {})

    return Response.json({
      success: true,
      votes: voteCounts,
      totalVotes: votes.length
    })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
