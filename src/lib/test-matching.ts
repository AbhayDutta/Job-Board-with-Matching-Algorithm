import { calculateMatchScore } from "./matching";

interface TestCase {
  name: string;
  candidateSkills: string[];
  mustHave: string[];
  niceToHave: string[];
  expectedScore: number;
}

const testCases: TestCase[] = [
  {
    name: "Perfect Match (Exact alignment, no extra candidate skills)",
    candidateSkills: ["TypeScript", "React", "PostgreSQL"],
    mustHave: ["TypeScript", "PostgreSQL"],
    niceToHave: ["React"],
    expectedScore: 96 // Math: Dot Product = 2*1 + 2*1 + 1*1 = 5. Job mag = 3. Cand mag = sqrt(3) = 1.732. Similarity = 5 / (3 * 1.732) = 96.22% -> 96%
  },
  {
    name: "Match with Extra Candidate Skills (Cosine normalization penalty)",
    candidateSkills: ["TypeScript", "React", "PostgreSQL", "TailwindCSS", "Node.js"],
    mustHave: ["TypeScript", "PostgreSQL"],
    niceToHave: ["React"],
    expectedScore: 75 // Math: Dot Product = 5. Job mag = 3. Cand mag = sqrt(5) = 2.236. Similarity = 5 / (3 * 2.236) = 74.54% -> 75%
  },
  {
    name: "Matches only Must-Haves",
    candidateSkills: ["TypeScript", "PostgreSQL"],
    mustHave: ["TypeScript", "PostgreSQL"],
    niceToHave: ["React"],
    expectedScore: 94 // Math: Dot Product = 4. Job mag = 3. Cand mag = sqrt(2) = 1.414. Similarity = 4 / (3 * 1.414) = 94.28% -> 94%
  },
  {
    name: "Matches only Nice-To-Haves",
    candidateSkills: ["React"],
    mustHave: ["TypeScript", "PostgreSQL"],
    niceToHave: ["React"],
    expectedScore: 33 // Math: Dot Product = 1. Job mag = 3. Cand mag = 1. Similarity = 1 / 3 = 33.33% -> 33%
  },
  {
    name: "Case and Space Insensitivity",
    candidateSkills: ["  typescript  ", "REACT"],
    mustHave: ["TypeScript"],
    niceToHave: ["react"],
    expectedScore: 95 // Math: Dot Product = 2*1 + 1*1 = 3. Job mag = sqrt(5) = 2.236. Cand mag = sqrt(2) = 1.414. Similarity = 3 / (2.236 * 1.414) = 94.87% -> 95%
  },
  {
    name: "Empty Candidate Profile",
    candidateSkills: [],
    mustHave: ["TypeScript"],
    niceToHave: ["React"],
    expectedScore: 0
  },
  {
    name: "No Job Requirements",
    candidateSkills: ["TypeScript"],
    mustHave: [],
    niceToHave: [],
    expectedScore: 0
  }
];

function runTests() {
  console.log("==========================================");
  console.log("RUNNING MATCHING ENGINE VECTOR MATH TESTS");
  console.log("==========================================\n");

  let passed = 0;
  for (const tc of testCases) {
    const score = calculateMatchScore(tc.candidateSkills, tc.mustHave, tc.niceToHave);
    const result = score === tc.expectedScore || Math.abs(score - tc.expectedScore) <= 1 ? "PASSED" : "FAILED";
    console.log(`Test: ${tc.name}`);
    console.log(`  Candidate Skills : [${tc.candidateSkills.join(", ")}]`);
    console.log(`  Job Must-Haves   : [${tc.mustHave.join(", ")}]`);
    console.log(`  Job Nice-To-Have : [${tc.niceToHave.join(", ")}]`);
    console.log(`  Calculated Score : ${score}%`);
    console.log(`  Expected Score   : ~${tc.expectedScore}%`);
    console.log(`  Result           : [${result}]\n`);
    if (result === "PASSED") passed++;
  }

  console.log(`Passed ${passed}/${testCases.length} tests.`);
}

runTests();
