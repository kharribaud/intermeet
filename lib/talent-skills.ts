import type { TalentSkillGroups } from "@/types/database";

export const DEFAULT_SKILL_GROUPS: TalentSkillGroups = {
  technical: ["Régie FOH", "Sound design", "Mixage"],
  software: ["Grand MA2", "WYSIWIG", "Vectorworks"],
  certifications: ["CACES nacelle", "Permis PL", "Grand MA2"],
};

export function buildSkillGroups(
  skills: { name: string; category: string | null }[]
): TalentSkillGroups {
  const groups: TalentSkillGroups = {
    technical: [],
    software: [],
    certifications: [],
  };

  for (const skill of skills) {
    const cat = skill.category?.toLowerCase() ?? "";
    if (cat.includes("logiciel") || cat.includes("outil") || cat.includes("software")) {
      groups.software.push(skill.name);
    } else if (
      cat.includes("habilitation") ||
      cat.includes("certif") ||
      cat.includes("permis")
    ) {
      groups.certifications.push(skill.name);
    } else {
      groups.technical.push(skill.name);
    }
  }

  if (!groups.technical.length && !groups.software.length && !groups.certifications.length) {
    return DEFAULT_SKILL_GROUPS;
  }

  if (!groups.technical.length) groups.technical = [...DEFAULT_SKILL_GROUPS.technical];
  if (!groups.software.length) groups.software = [...DEFAULT_SKILL_GROUPS.software];
  if (!groups.certifications.length) {
    groups.certifications = [...DEFAULT_SKILL_GROUPS.certifications];
  }

  return groups;
}
