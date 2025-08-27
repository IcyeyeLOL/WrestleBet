import { supabase } from '../../../lib/supabase'

const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Merge admin-demo matches from localStorage via cookie-less approach is not possible on server.
// To allow quick demo sync, also read from an in-memory env var string if provided.
// Developers can set NEXT_PUBLIC_ADMIN_DEMO_MATCHES with JSON array.
const demoMatchesBase = [];

const getDemoMatches = () => {
  try {
    const injected = process.env.NEXT_PUBLIC_ADMIN_DEMO_MATCHES;
    if (injected) {
      const parsed = JSON.parse(injected);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return demoMatchesBase;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (matchId) {
      if (!supabaseConfigured) {
        const match = getDemoMatches().find(m => m.id === matchId);
        if (!match) {
          return Response.json({ success: false, error: 'Not found' }, { status: 404 })
        }
        return Response.json({ success: true, votes: match.voteCounts, totalVotes: match.totalVotes })
      }
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
      if (!supabaseConfigured) {
        return Response.json({ success: true, matches: getDemoMatches() })
      }
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
