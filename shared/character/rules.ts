export type SkillLike = {
  skill: string;
  base_attribute?: string;
  modifier: number;
};

export function passivePerception(skills: SkillLike[]): number | null {
  const perception = skills.find(
    (entry) => entry.skill.toLowerCase() === "perception",
  );
  return perception ? 10 + perception.modifier : null;
}
