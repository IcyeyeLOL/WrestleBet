import { supabase } from '../../../../lib/supabase'

// Dynamic match ID generator - works for any wrestler names
const generateMatchId = (wrestler1, wrestler2) => {
  const cleanName = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2) // Take first two words max
      .join('')
      .substring(0, 10) // Limit length
  }
  
  const clean1 = cleanName(wrestler1)
  const clean2 = cleanName(wrestler2)
  
  // Always use alphabetical order for consistency
  const [first, second] = [clean1, clean2].sort()
  return `${first}-${second}`
}

// Dynamic match search that handles various input formats
const smartMatchFinder = async (searchInput) => {
  console.log('🧠 Smart match finder searching for:', searchInput)
  
  try {
    const { data: allMatches, error } = await supabase
      .from('matches')
      .select('*')
    
    if (error) throw error
    
    if (!allMatches || allMatches.length === 0) {
      console.log('📊 No matches in database')
      return { match: null, suggestions: [] }
    }
    
    console.log(`📊 Searching ${allMatches.length} matches for: "${searchInput}"`)
    
    // Create search variations
    const searchVariations = createSearchVariations(searchInput)
    console.log('🔍 Search variations:', searchVariations)
    
    // Try exact matches first
    for (const variation of searchVariations) {
      const exactMatch = allMatches.find(m => m.id === variation)
      if (exactMatch) {
        console.log('✅ Exact ID match found:', exactMatch.id)
        return { match: exactMatch, suggestions: [] }
      }
    }
    
    // Try fuzzy matching
    const fuzzyMatches = []
    
    for (const match of allMatches) {
      const score = calculateMatchScore(searchInput, match, searchVariations)
      if (score > 0) {
        fuzzyMatches.push({ match, score })
      }
    }
    
    // Sort by score and return best match
    fuzzyMatches.sort((a, b) => b.score - a.score)
    
    if (fuzzyMatches.length > 0 && fuzzyMatches[0].score >= 0.6) {
      console.log('✅ Fuzzy match found:', fuzzyMatches[0].match.id, 'score:', fuzzyMatches[0].score)
      return { 
        match: fuzzyMatches[0].match, 
        suggestions: fuzzyMatches.slice(1, 4).map(f => f.match) 
      }
    }
    
    console.log('❌ No suitable match found')
    return { 
      match: null, 
      suggestions: allMatches.slice(0, 5) // Return first 5 as suggestions
    }
    
  } catch (error) {
    console.error('❌ Smart match finder error:', error)
    throw error
  }
}

// Create various search patterns from input
const createSearchVariations = (input) => {
  const variations = new Set()
  const clean = input.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  
  // Original
  variations.add(input)
  variations.add(clean)
  
  // Hyphenated
  variations.add(clean.replace(/\s+/g, '-'))
  
  // No spaces
  variations.add(clean.replace(/\s+/g, ''))
  
  // Split on common separators
  const separators = [' vs ', ' v ', ' versus ', ' against ', 'vs', 'v']
  for (const sep of separators) {
    if (clean.includes(sep)) {
      const parts = clean.split(sep).map(p => p.trim()).filter(p => p.length > 0)
      if (parts.length === 2) {
        variations.add(`${parts[0]}-${parts[1]}`)
        variations.add(`${parts[1]}-${parts[0]}`) // Reverse order
        variations.add(`${parts[0]}${parts[1]}`)
        variations.add(`${parts[1]}${parts[0]}`)
      }
    }
  }
  
  // Try to split joined names intelligently
  const joinedSplits = intelligentNameSplit(clean)
  joinedSplits.forEach(split => variations.add(split))
  
  return Array.from(variations)
}

// Intelligent splitting of joined names
const intelligentNameSplit = (input) => {
  const results = []
  const commonFirstNames = ['kunle', 'ajani', 'david', 'hassan', 'roman', 'john', 'mike', 'alex', 'chris', 'steve', 'mark', 'paul']
  const commonLastNames = ['taylor', 'yazdani', 'reigns', 'punk', 'johnson', 'smith', 'brown', 'davis', 'wilson', 'moore']
  
  const allNames = [...commonFirstNames, ...commonLastNames]
  
  for (const name of allNames) {
    if (input.startsWith(name) && input.length > name.length) {
      const remainder = input.substring(name.length)
      if (remainder.length >= 3) { // Minimum 3 chars for second name
        results.push(`${name}-${remainder}`)
        results.push(`${remainder}-${name}`)
      }
    }
    
    if (input.endsWith(name) && input.length > name.length) {
      const remainder = input.substring(0, input.length - name.length)
      if (remainder.length >= 3) {
        results.push(`${remainder}-${name}`)
        results.push(`${name}-${remainder}`)
      }
    }
  }
  
  // Try splitting at common transition points
  for (let i = 3; i <= input.length - 3; i++) {
    const part1 = input.substring(0, i)
    const part2 = input.substring(i)
    results.push(`${part1}-${part2}`)
  }
  
  return results
}

// Calculate match score between input and database match
const calculateMatchScore = (input, match, variations) => {
  const inputClean = input.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Check against match ID
  const idScore = variations.includes(match.id) ? 1.0 : 0
  if (idScore > 0) return idScore
  
  // Check against wrestler names
  const wrestler1Clean = match.wrestler1.toLowerCase().replace(/[^a-z0-9]/g, '')
  const wrestler2Clean = match.wrestler2.toLowerCase().replace(/[^a-z0-9]/g, '')
  const combinedNames = `${wrestler1Clean}${wrestler2Clean}`
  const combinedReverse = `${wrestler2Clean}${wrestler1Clean}`
  
  // Exact name match
  if (inputClean === combinedNames || inputClean === combinedReverse) {
    return 0.9
  }
  
  // Partial name match
  if (inputClean.includes(wrestler1Clean) && inputClean.includes(wrestler2Clean)) {
    return 0.8
  }
  
  // Single name match
  if (inputClean.includes(wrestler1Clean) || inputClean.includes(wrestler2Clean)) {
    return 0.5
  }
  
  // Fuzzy string similarity
  const similarity1 = stringSimilarity(inputClean, combinedNames)
  const similarity2 = stringSimilarity(inputClean, combinedReverse)
  const maxSimilarity = Math.max(similarity1, similarity2)
  
  return maxSimilarity > 0.6 ? maxSimilarity : 0
}

// Simple string similarity function
const stringSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

// Levenshtein distance calculation
const levenshteinDistance = (str1, str2) => {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// GET endpoint - Search and list matches
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search')
    
    if (searchTerm) {
      const result = await smartMatchFinder(searchTerm)
      return Response.json({
        success: true,
        searchTerm,
        match: result.match,
        suggestions: result.suggestions,
        found: !!result.match
      })
    }
    
    // Return all matches
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return Response.json({
      success: true,
      matches: matches || [],
      count: matches?.length || 0
    })
    
  } catch (error) {
    console.error('❌ Dynamic matches GET error:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// POST endpoint - Create or manage matches
export async function POST(request) {
  try {
    const { action, ...data } = await request.json()
    
    switch (action) {
      case 'create':
        return await createMatch(data)
      case 'search':
        return await searchMatches(data)
      case 'auto-init':
        return await autoInitMatches()
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Dynamic matches API error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// Helper functions for API actions
const createMatch = async (data) => {
  const { wrestler1, wrestler2, eventName, eventDate } = data
  
  if (!wrestler1 || !wrestler2) {
    throw new Error('wrestler1 and wrestler2 are required')
  }
  
  const matchId = generateMatchId(wrestler1, wrestler2)
  
  const newMatch = {
    id: matchId,
    wrestler1,
    wrestler2,
    event_name: eventName || 'Wrestling Match',
    event_date: eventDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    odds_wrestler1: 1.5 + Math.random(),
    odds_wrestler2: 1.5 + Math.random(),
    status: 'active',
    created_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('matches')
    .insert([newMatch])
    .select()
    .single()
  
  if (error) throw error
  
  return Response.json({
    success: true,
    match: data,
    message: `Match created: ${wrestler1} vs ${wrestler2}`
  })
}

const searchMatches = async (data) => {
  const { searchTerm } = data
  
  if (!searchTerm) {
    throw new Error('searchTerm is required')
  }
  
  const result = await smartMatchFinder(searchTerm)
  
  return Response.json({
    success: true,
    searchTerm,
    match: result.match,
    suggestions: result.suggestions,
    found: !!result.match
  })
}

const autoInitMatches = async () => {
  const { data: existing, error } = await supabase
    .from('matches')
    .select('id')
  
  if (error) throw error
  
  if (existing && existing.length > 0) {
    return Response.json({
      success: true,
      message: `Database already has ${existing.length} matches`,
      count: existing.length
    })
  }
  
  const defaultMatches = [
    { wrestler1: 'Kunle Adeleye', wrestler2: 'Ajani Thompson', event: 'Nigeria Wrestling Championship' },
    { wrestler1: 'David Taylor', wrestler2: 'Hassan Yazdani', event: 'International Wrestling Series' },
    { wrestler1: 'Roman Reigns', wrestler2: 'CM Punk', event: 'WWE Championship' }
  ]
  
  const matches = defaultMatches.map(m => ({
    id: generateMatchId(m.wrestler1, m.wrestler2),
    wrestler1: m.wrestler1,
    wrestler2: m.wrestler2,
    event_name: m.event,
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    odds_wrestler1: 1.5 + Math.random(),
    odds_wrestler2: 1.5 + Math.random(),
    status: 'active',
    created_at: new Date().toISOString()
  }))
  
  const { data, error: insertError } = await supabase
    .from('matches')
    .insert(matches)
    .select()
  
  if (insertError) throw insertError
  
  return Response.json({
    success: true,
    message: `Auto-initialized ${data.length} matches`,
    matches: data
  })
}
