import { supabase } from '../../../lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (matchId) {
      // Get votes for specific match
      const { data: votes, error } = await supabase
        .from('votes')
        .select('wrestler_choice')
        .eq('match_id', matchId)

      if (error) throw error

      // Count votes for each wrestler
      const voteCounts = votes.reduce((acc, vote) => {
        acc[vote.wrestler_choice] = (acc[vote.wrestler_choice] || 0) + 1
        return acc
      }, {})

      return Response.json({
        success: true,
        votes: voteCounts,
        totalVotes: votes.length
      })
    } else {
      // Get all matches with vote counts
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          votes (wrestler_choice)
        `)

      if (error) throw error

      const matchesWithVotes = matches.map(match => {
        // Ensure votes is an array, handle null/undefined case
        const votes = Array.isArray(match.votes) ? match.votes : [];
        
        const voteCounts = votes.reduce((acc, vote) => {
          if (vote && vote.wrestler_choice) {
            acc[vote.wrestler_choice] = (acc[vote.wrestler_choice] || 0) + 1;
          }
          return acc;
        }, {});

        return {
          ...match,
          votes: votes, // Keep as array for frontend
          voteCounts: voteCounts, // Add processed counts
          totalVotes: votes.length
        };
      });

      return Response.json({
        success: true,
        matches: matchesWithVotes
      })
    }
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
