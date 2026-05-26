import type { TalentPastMission, TalentReview } from "@/types/database";

const MISSION_SKILLS = ["Mixage", "Régie FOH", "Sound design", "Travail d'équipe"];

const MISSION_TEMPLATE: Omit<TalentPastMission, "id"> = {
  job_title: "Ingénieur du son",
  event_title: "Concert Olympia",
  skills: MISSION_SKILLS,
  location: "Paris Expo Porte de Versailles",
  client: "S Group",
  date: "2025-03-15",
};

export const DEMO_MISSIONS_TOTAL = 42;

export function buildDemoMissions(total = DEMO_MISSIONS_TOTAL): TalentPastMission[] {
  return Array.from({ length: total }, (_, index) => ({
    id: `mission-${index + 1}`,
    ...MISSION_TEMPLATE,
  }));
}

export const DEMO_MISSIONS_PREVIEW = buildDemoMissions(4);

const REVIEW_TEMPLATES: Omit<TalentReview, "id">[] = [
  {
    rating: 4,
    title: "Très bien",
    body: "Intermittent extrêmement fiable et autonome, qui s'intègre parfaitement à l'équipe technique. Réactif, professionnel et force de proposition sur le terrain.",
    event_title: "Stand Engie Vivatech 2025",
    client: "S Group",
  },
  {
    rating: 5,
    title: "Excellent",
    body: "Intervention impeccable du début à la fin. Grande autonomie, excellent relationnel avec l'équipe technique et le client. Un vrai plus sur nos événements corporate.",
    event_title: "Festival de la Plage",
    client: "S Group",
  },
  {
    rating: 5,
    title: "Excellent",
    body: "Réactivité, rigueur et qualité sonore au rendez-vous. Maîtrise parfaite des environnements live exigeants. Collaboration fluide, nous recommandons vivement.",
    event_title: "Concert Olympia Véronique Sanson",
    client: "S Group",
  },
  {
    rating: 4,
    title: "Très bien",
    body: "Très bonne communication en amont et pendant l'événement. Respect des délais, du brief et des contraintes de production. Nous retravaillerons ensemble.",
    event_title: "Concert Olympia",
    client: "Live Nation",
  },
  {
    rating: 5,
    title: "Excellent",
    body: "Professionnel, calme sous pression et toujours à l'écoute des besoins artistiques. La qualité sonore était au rendez-vous du premier au dernier jour.",
    event_title: "Festival de la Plage",
    client: "S Group",
  },
];

export const DEMO_REVIEWS_TOTAL = 27;

export function buildDemoReviews(total = DEMO_REVIEWS_TOTAL): TalentReview[] {
  return Array.from({ length: total }, (_, index) => {
    const template = REVIEW_TEMPLATES[index % REVIEW_TEMPLATES.length];
    return {
      id: `review-${index + 1}`,
      ...template,
    };
  });
}

export const DEMO_REVIEWS_PREVIEW = buildDemoReviews(3);
