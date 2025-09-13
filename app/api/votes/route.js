import { supabase } from '../../../lib/supabase'
// Dynamic export configuration for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const { matchId, wrestlerChoice, userIp } = await request.json()

    // Check if Supabase is configured
    if (!supabaseConfigured) {
      return Response.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      )
    }

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
    console.error('❌ Votes POST API error:', error);
    return Response.json(
      { success: false, error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!supabaseConfigured) {
      return Response.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      )
    }

    if (matchId) {
      // Get votes for specific match with optimized query
      const { data: votes, error } = await supabase
        .from('votes')
        .select('wrestler_choice')
        .eq('match_id', matchId.toString())

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
      // Get all matches without relationship queries to avoid 404 errors
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('created_at', { ascending: false })

      if (matchesError) throw matchesError

      // Get all votes separately to avoid relationship issues
      const { data: allVotes, error: votesError } = await supabase
        .from('votes')
        .select('match_id, wrestler_choice')

      if (votesError) throw votesError

      // Process matches with vote counts
      const matchesWithVotes = matches.map(match => {
        const matchVotes = allVotes.filter(vote => vote.match_id === match.id);
        
        const voteCounts = matchVotes.reduce((acc, vote) => {
          if (vote && vote.wrestler_choice) {
            acc[vote.wrestler_choice] = (acc[vote.wrestler_choice] || 0) + 1;
          }
          return acc;
        }, {});

        return {
          ...match,
          votes: matchVotes, // Keep as array for frontend
          voteCounts: voteCounts, // Add processed counts
          totalVotes: matchVotes.length
        };
      });

      return Response.json({
        success: true,
        matches: matchesWithVotes
      })
    }
  } catch (error) {
    console.error('❌ Votes API error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch votes' },
      { status: 500 }
    )
  }
}
