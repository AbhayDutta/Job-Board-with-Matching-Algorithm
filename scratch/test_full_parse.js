const sampleText = `
Samiran De
Full-Stack Developer building scalable, production-quality web applications with React, Next.js, Node.js, and modern UI engineering.
sam.de.721166@gmail.com | linkedin.com/in/samiran-de | github.com/Sam721166 | samworks.vercel.app | x.com/samirande_

EDUCATION
Adamas University Barasat, WB
Bachelor of Technology in Computer Science & Engineering Expected May 2029

EXPERIENCE
Content Creator — X (Twitter) 2025 – Present
• Grew an engaged audience of 13,000+ followers on X by consistently publishing content on software engineering, web development, and UI engineering.
• Built a recognizable personal brand through educational, technical content covering React, Next.js, and full-stack development.

PROJECTS
Timmo — Productivity SaaS Jun 2026
React • Node.js • Express • MongoDB • Google OAuth
Portfolio Website 2026
Next.js • Tailwind CSS • Framer Motion • GSAP

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, HTML5, CSS3
Frontend: React, Next.js, Tailwind CSS, Framer Motion, Shadcn UI, Recharts
Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Google OAuth, Zod, Multer
Tools: Git, GitHub, Postman, Vercel, Figma, VS Code
`;

function parseTestResume(text) {
  const skillsSet = new Set();
  const rawLines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // 1. Scan lines starting with Languages:, Frontend:, Backend:, Tools:, Skills:
  for (const line of rawLines) {
    if (/^(languages|frontend|backend|tools|skills|technical skills):/i.test(line)) {
      const parts = line.split(":")[1] || "";
      const tokens = parts.split(/[,•|]/).map(t => t.trim()).filter(Boolean);
      tokens.forEach(t => skillsSet.add(t));
    }
  }

  // 2. Scan Education
  const education = [];
  let inEdu = false;
  let currentEdu = [];

  for (let i = 0; i < rawLines.length; i++) {
    const l = rawLines[i];
    if (/^education/i.test(l)) {
      inEdu = true;
      continue;
    }
    if (inEdu && /^experience|projects|technical skills|skills/i.test(l)) {
      inEdu = false;
    }
    if (inEdu) {
      if (/adamas|university|college|bachelor|b\.tech|master|institute/i.test(l)) {
        currentEdu.push(l);
      }
    }
  }
  if (currentEdu.length > 0) {
    education.push(currentEdu.join(" - "));
  }

  // 3. Scan Experience
  const experience = [];
  let inExp = false;

  for (let i = 0; i < rawLines.length; i++) {
    const l = rawLines[i];
    if (/^experience|work history|internship/i.test(l)) {
      inExp = true;
      continue;
    }
    if (inExp && /^projects|technical skills|skills|education/i.test(l)) {
      inExp = false;
    }
    if (inExp && l.length > 5 && !l.startsWith("•")) {
      experience.push(l);
    }
  }

  return {
    skills: Array.from(skillsSet),
    education,
    experience
  };
}

console.log("Parsed result:", JSON.stringify(parseTestResume(sampleText), null, 2));
