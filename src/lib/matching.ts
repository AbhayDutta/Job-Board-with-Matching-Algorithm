/**
 * Normalizes a skill string by trimming it and converting it to lowercase.
 */
export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

/**
 * Calculates the match score (0-100) using weighted cosine similarity.
 * Must-have skills get a weight of 2.
 * Nice-to-have skills get a weight of 1.
 * Candidate skills are binary indicators (weight 1 if present, 0 if absent).
 *
 * @param candidateSkills List of skills the candidate has.
 * @param jobMustHave List of must-have skills required by the job.
 * @param jobNiceToHave List of nice-to-have skills preferred by the job.
 */
export function calculateMatchScore(
  candidateSkills: string[],
  jobMustHave: string[],
  jobNiceToHave: string[]
): number {
  const normCandidate = candidateSkills.map(normalizeSkill).filter(Boolean);
  const normMust = jobMustHave.map(normalizeSkill).filter(Boolean);
  const normNice = jobNiceToHave.map(normalizeSkill).filter(Boolean);

  // If the job specifies no skills, there's nothing to match against.
  if (normMust.length === 0 && normNice.length === 0) {
    return 0;
  }

  const candidateSet = new Set(normCandidate);
  if (candidateSet.size === 0) {
    return 0;
  }

  // The vocabulary is the union of candidate skills and job requirement skills.
  const vocabSet = new Set([...normMust, ...normNice, ...normCandidate]);
  const vocab = Array.from(vocabSet);

  let dotProduct = 0;
  let jobSumSquares = 0;
  let candidateSumSquares = 0;

  for (const skill of vocab) {
    // Determine job weight
    let w_j = 0;
    if (normMust.includes(skill)) {
      w_j = 2;
    } else if (normNice.includes(skill)) {
      w_j = 1;
    }

    // Determine candidate weight
    const w_c = candidateSet.has(skill) ? 1 : 0;

    dotProduct += w_j * w_c;
    jobSumSquares += w_j * w_j;
    candidateSumSquares += w_c * w_c;
  }

  if (jobSumSquares === 0 || candidateSumSquares === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(jobSumSquares) * Math.sqrt(candidateSumSquares));

  // Convert to 0-100 percentage range and round to nearest integer
  return Math.round(similarity * 100);
}
