import { supabase } from '../../../lib/supabase'
// Static export configuration for Next.js
export const dynamic = 'force-static';
export const revalidate = false;



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

export async function POST(request) {
  try {
    const { matchId, wrestlerChoice, userIp } = await request.json()

    // Check if Supabase is configured
    if (!supabaseConfigured) {
      // Return success response for demo mode
      return Response.json({
        success: true,
        votes: { [wrestlerChoice]: 1 },
        totalVotes: 1
      })
    }

    try {
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
    } catch (dbError) {
      console.log('⚠️ Database error, returning demo response:', dbError.message);
      // Return success response for demo mode when database fails
      return Response.json({
        success: true,
        votes: { [wrestlerChoice]: 1 },
        totalVotes: 1
      })
    }
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

    if (matchId) {
      if (!supabaseConfigured) {
        const match = getDemoMatches().find(m => m.id === matchId);
        if (!match) {
          return Response.json({ success: false, error: 'Not found' }, { status: 404 })
        }
        return Response.json({ success: true, votes: match.voteCounts, totalVotes: match.totalVotes })
      }
      
      try {
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
      } catch (dbError) {
        console.log('⚠️ Database error, falling back to demo data:', dbError.message);
        const match = getDemoMatches().find(m => m.id === matchId);
        if (!match) {
          return Response.json({ success: false, error: 'Not found' }, { status: 404 })
        }
        return Response.json({ success: true, votes: match.voteCounts, totalVotes: match.totalVotes })
      }
    } else {
      if (!supabaseConfigured) {
        return Response.json({ success: true, matches: getDemoMatches() })
      }
      
      try {
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
      } catch (dbError) {
        console.log('⚠️ Database error, falling back to demo data:', dbError.message);
        return Response.json({ success: true, matches: getDemoMatches() })
      }
    }
  } catch (error) {
    console.error('❌ Votes API error:', error);
    // Always return demo data on any error to prevent network failures
    return Response.json({ success: true, matches: getDemoMatches() })
  }
}
