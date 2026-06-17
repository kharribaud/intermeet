const DEMO_PROJECT_COVERS: Record<string, string> = {
  "demo-1":
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  "demo-2":
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80",
  "demo-3":
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80",
};

const EVENT_TYPE_COVERS: Record<string, string> = {
  Salon:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  Festival:
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80",
  Concert:
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80",
  Convention:
    "https://images.unsplash.com/photo-1505373877841-8d25f39d3f4e?auto=format&fit=crop&w=1200&q=80",
  Séminaire:
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  Spectacle:
    "https://images.unsplash.com/photo-1503099644809-5ad98325b002?auto=format&fit=crop&w=1200&q=80",
  Soirée:
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
};

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503099644809-5ad98325b002?auto=format&fit=crop&w=1200&q=80",
];

export function getProjectCoverImage(project: {
  id: string;
  event_type: string | null;
  cover_image_url?: string | null;
}): string {
  if (project.cover_image_url) {
    return project.cover_image_url;
  }

  if (DEMO_PROJECT_COVERS[project.id]) {
    return DEMO_PROJECT_COVERS[project.id];
  }

  if (project.event_type && EVENT_TYPE_COVERS[project.event_type]) {
    return EVENT_TYPE_COVERS[project.event_type];
  }

  const index = project.id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return FALLBACK_COVERS[index % FALLBACK_COVERS.length];
}
