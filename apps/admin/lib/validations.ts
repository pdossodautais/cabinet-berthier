import { z } from "zod";

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function optStr(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v || null;
}

function num(fd: FormData, key: string, fallback = 0): number {
  const v = fd.get(key);
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function optNum(fd: FormData, key: string): number | null {
  const v = fd.get(key);
  if (!v || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}

// ─── Agent ─────────────────────────────────────────

const agentSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  photo_url: z.string().nullable(),
  is_active: z.boolean(),
  role: z.enum(["admin", "agent"]),
});

export function parseAgentForm(fd: FormData) {
  return agentSchema.safeParse({
    first_name: str(fd, "first_name"),
    last_name: str(fd, "last_name"),
    email: str(fd, "email"),
    phone: optStr(fd, "phone"),
    bio: optStr(fd, "bio"),
    photo_url: optStr(fd, "photo_url"),
    is_active: bool(fd, "is_active"),
    role: str(fd, "role") || "agent",
  });
}

// ─── Property ──────────────────────────────────────

const propertySchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string(),
  type: z.string().min(1),
  transaction_type: z.string().min(1),
  price: z.number().min(0),
  surface: z.number().min(0),
  rooms: z.number().int().min(0),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  address: z.string(),
  city: z.string(),
  postal_code: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  energy_rating: z.string().nullable(),
  ghg_rating: z.string().nullable(),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  agent_id: z.string().uuid().nullable(),
  features: z.array(z.string()),
  construction_year: z.number().int().nullable(),
  heating_type: z.string().nullable(),
  energy_sources: z.array(z.string()),
  sold_at: z
    .string()
    .datetime({ offset: true })
    .nullish()
    .or(z.literal("").transform(() => null)),
});

function parseList(fd: FormData, key: string): string[] {
  const raw = str(fd, key);
  if (!raw) return [];
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const parseFeatures = (fd: FormData) => parseList(fd, "features");

export function parsePropertyForm(fd: FormData) {
  return propertySchema.safeParse({
    title: str(fd, "title"),
    description: str(fd, "description"),
    type: str(fd, "type") || "appartement",
    transaction_type: str(fd, "transaction_type") || "vente",
    price: num(fd, "price"),
    surface: num(fd, "surface"),
    rooms: num(fd, "rooms", 1),
    bedrooms: num(fd, "bedrooms"),
    bathrooms: num(fd, "bathrooms"),
    address: str(fd, "address"),
    city: str(fd, "city"),
    postal_code: str(fd, "postal_code"),
    latitude: optNum(fd, "latitude"),
    longitude: optNum(fd, "longitude"),
    energy_rating: optStr(fd, "energy_rating"),
    ghg_rating: optStr(fd, "ghg_rating"),
    is_featured: bool(fd, "is_featured"),
    is_published: bool(fd, "is_published"),
    agent_id: optStr(fd, "agent_id"),
    features: parseFeatures(fd),
    construction_year: optNum(fd, "construction_year"),
    heating_type: optStr(fd, "heating_type"),
    energy_sources: parseList(fd, "energy_sources"),
    sold_at: typeof fd.get("sold_at") === "string" ? (fd.get("sold_at") as string) : "",
  });
}

// ─── Document ──────────────────────────────────────

const documentSchema = z.object({
  property_id: z.string().uuid("ID de propriété invalide"),
  type: z.enum(["plan", "diagnostic", "document"]),
  name: z.string().min(1),
});

export function parseDocumentForm(fd: FormData, fileName: string) {
  return documentSchema.safeParse({
    property_id: str(fd, "property_id"),
    type: str(fd, "type") || "document",
    name: str(fd, "name") || fileName,
  });
}

// ─── Post ─────────────────────────────────────────

const postSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  excerpt: z.string(),
  content: z.string(),
  cover_url: z.string().nullable(),
  is_published: z.boolean(),
  author_id: z.string().uuid().nullable(),
});

export function parsePostForm(fd: FormData) {
  return postSchema.safeParse({
    title: str(fd, "title"),
    excerpt: str(fd, "excerpt"),
    content: str(fd, "content"),
    cover_url: optStr(fd, "cover_url"),
    is_published: bool(fd, "is_published"),
    author_id: optStr(fd, "author_id"),
  });
}

// ─── Testimonial ──────────────────────────────────

const testimonialSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  role: z.string(),
  content: z.string().min(1, "Le contenu est requis"),
  rating: z.number().int().min(1).max(5),
  url: z.string().url().nullable(),
  is_published: z.boolean(),
});

export function parseTestimonialForm(fd: FormData) {
  return testimonialSchema.safeParse({
    name: str(fd, "name"),
    role: str(fd, "role"),
    content: str(fd, "content"),
    rating: num(fd, "rating", 5),
    url: optStr(fd, "url"),
    is_published: bool(fd, "is_published"),
  });
}

export function formatZodError(result: z.ZodSafeParseError<unknown>): string {
  return result.error.issues.map((i) => i.message).join(", ");
}
