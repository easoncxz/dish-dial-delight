
// A simple fuzzy search implementation
export const fuzzySearch = (search: string, text: string): boolean => {
  if (!search) return true;
  
  // Convert both strings to lowercase for case-insensitive matching
  const searchLower = search.toLowerCase();
  const textLower = text.toLowerCase();
  
  // If the search is a direct substring, return true immediately
  if (textLower.includes(searchLower)) return true;
  
  // For space-separated search terms, check if all match
  const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0);
  
  // If there are no valid search terms, return true
  if (searchTerms.length === 0) return true;
  
  // Check if all search terms exist in the text
  return searchTerms.every(term => {
    // For each term, look for all characters in sequence
    let lastFoundIndex = -1;
    
    for (const char of term) {
      // Find the next occurrence of the current character
      const foundIndex = textLower.indexOf(char, lastFoundIndex + 1);
      
      // If character not found, this term doesn't match
      if (foundIndex === -1) return false;
      
      // Update last found position
      lastFoundIndex = foundIndex;
    }
    
    // All characters were found in sequence
    return true;
  });
};
