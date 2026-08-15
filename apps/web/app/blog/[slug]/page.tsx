import { getBlogPost, getBlogSlugs, getBlogPosts } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { PropertyImage } from "@repo/ui/property-image";
import { BlogShareActions } from "@/components/blog-share-actions";
import { Reveal } from "@/components/reveal";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const slugs = await getBlogSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article non trouvé" };
  const authorName = post.agents
    ? `${post.agents.first_name} ${post.agents.last_name}`
    : undefined;
  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      type: "article",
      publishedTime: post.created_at,
      ...(authorName && { authors: [authorName] }),
      ...(post.cover_url && { images: [post.cover_url] }),
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readTime(content: string | null): number {
  if (!content) return 3;
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}

const POST_PALETTES = ["p-night", "p-stone", "p-warm", "p-cool", "p-dusk"];

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) notFound();

  const authorName = post.agents
    ? `${post.agents.first_name} ${post.agents.last_name}`
    : null;

  const allPosts = await getBlogPosts();
  const others = allPosts.filter((p) => p.slug !== slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    ...(post.excerpt && { description: post.excerpt }),
    ...(post.cover_url && { image: post.cover_url }),
    datePublished: post.created_at,
    ...(authorName && { author: { "@type": "Person", name: authorName } }),
  };

  // Parsing markdown minimal : ##/### → h2/h3, sinon paragraphe
  type Block =
    | { type: "h2" | "h3"; text: string }
    | { type: "p"; text: string };
  const blocks: Block[] = post.content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map<Block>((b) => {
      if (b.startsWith("### ")) return { type: "h3", text: b.slice(4).trim() };
      if (b.startsWith("## ")) return { type: "h2", text: b.slice(3).trim() };
      return { type: "p", text: b };
    });

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-10 pb-20">
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-3 h-eyebrow mb-10"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
          }}
        >
          <Link
            href="/blog"
            className="hover:text-[color:var(--cobalt)] transition-colors"
          >
            Journal
          </Link>
          <ChevronRight className="h-2.5 w-2.5" strokeWidth={1.5} />
          <span style={{ color: "var(--cobalt)" }}>Article</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 lg:col-start-3">
            <div className="chapter-mark mb-8 animate-eyebrow-in">Nº Article</div>
            <Reveal kind="mask-y">
              <h1
                className="h-display mb-10"
                style={{ fontSize: "clamp(40px, 6vw, 92px)", lineHeight: 1 }}
              >
                {post.title}
              </h1>
            </Reveal>
            {post.excerpt && (
              <Reveal kind="slide-up" delay={300}>
                <p
                  className="h-italic text-[22px] mb-12"
                  style={{
                    color: "color-mix(in oklch, var(--ink-raw) 78%, transparent)",
                    lineHeight: 1.4,
                  }}
                >
                  {post.excerpt}
                </p>
              </Reveal>
            )}
            <Reveal kind="slide-up" delay={200}>
              <div className="flex items-center justify-between pt-6 mb-12 rule flex-wrap gap-6">
                <div className="flex items-center gap-4">
                  {authorName && (
                    <>
                      <div
                        className="placeholder-photo p-dusk h-12 w-12 rounded-full overflow-hidden shrink-0"
                        data-label=""
                        style={
                          post.agents?.photo_url
                            ? {
                                backgroundImage: `url(${post.agents.photo_url})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : {}
                        }
                      />
                      <div>
                        <div
                          className="h-caps"
                          style={{ fontSize: 12, letterSpacing: "0.26em" }}
                        >
                          {authorName}
                        </div>
                        <div
                          className="h-eyebrow mt-1"
                          style={{
                            color:
                              "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                          }}
                        >
                          Cabinet Berthier
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div
                  className="h-eyebrow text-right"
                  style={{
                    color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                  }}
                >
                  {formatDate(post.created_at)}
                  <br />
                  <span style={{ color: "var(--cobalt)" }}>
                    {readTime(post.content)} min de lecture
                  </span>
                </div>
              </div>
            </Reveal>

            {post.cover_url ? (
              <Reveal kind="clip-x">
                <div
                  className="relative overflow-hidden mb-12"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  <PropertyImage
                    src={post.cover_url}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ) : (
              <Reveal kind="clip-x">
                <div
                  className={`placeholder-photo ${POST_PALETTES[0]} mb-12`}
                  style={{ aspectRatio: "16 / 9" }}
                  data-label="Article"
                />
              </Reveal>
            )}

            {/* Body */}
            <Reveal kind="slide-up" delay={400}>
              <div
                className="article-body space-y-6"
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 85%, transparent)",
                }}
              >
                {blocks.map((b, i) => {
                  if (b.type === "h2") {
                    return (
                      <h2
                        key={i}
                        className="h-display mt-12 mb-2"
                        style={{
                          fontSize: "clamp(26px, 3vw, 36px)",
                          lineHeight: 1.15,
                          color: "var(--ink-raw)",
                        }}
                      >
                        {b.text}
                      </h2>
                    );
                  }
                  if (b.type === "h3") {
                    return (
                      <h3
                        key={i}
                        className="h-display mt-8 mb-1"
                        style={{
                          fontSize: "clamp(20px, 2.2vw, 26px)",
                          lineHeight: 1.2,
                          color: "var(--ink-raw)",
                        }}
                      >
                        {b.text}
                      </h3>
                    );
                  }
                  return (
                    <p
                      key={i}
                      className="text-[17px] leading-[1.75] whitespace-pre-wrap"
                    >
                      {b.text}
                    </p>
                  );
                })}
              </div>
            </Reveal>

            {/* Sharing */}
            <Reveal kind="slide-left">
              <div className="flex items-center justify-between mt-16 pt-8 rule flex-wrap gap-4">
                <div
                  className="h-eyebrow"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Partager l&apos;article
                </div>
                <BlogShareActions title={post.title} />
              </div>
            </Reveal>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section
          className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20"
          style={{ borderTop: "1px solid var(--bone-raw)" }}
        >
          <Reveal kind="slide-up">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <h3
                className="h-display"
                style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}
              >
                Autres lectures.
              </h3>
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 link-underline-thick"
              >
                <ArrowLeft className="h-3 w-3 group-arrow rotate-180" strokeWidth={1.5} />
                Tous les articles
              </Link>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-10">
            {others.map((p, i) => {
              const palette = POST_PALETTES[(i + 1) % POST_PALETTES.length];
              const staggerDelay = Math.min(i, 5) * 80;
              return (
                <Reveal key={p.slug} kind="scale" delay={staggerDelay}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group grid grid-cols-12 gap-5 items-center"
                  >
                    <div
                      className={`col-span-5 placeholder-photo ${palette} relative overflow-hidden`}
                      style={{ aspectRatio: "4 / 3" }}
                      data-label="Article"
                    >
                      {p.cover_url && (
                        <div className="absolute inset-0 group-zoom">
                          <PropertyImage
                            src={p.cover_url}
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 42vw, 320px"
                          />
                        </div>
                      )}
                    </div>
                    <div className="col-span-7">
                      <div
                        className="h-eyebrow mb-2"
                        style={{ color: "var(--cobalt)" }}
                      >
                        Article
                      </div>
                      <h4
                        className="h-display mb-2 transition-colors group-hover:text-[color:var(--cobalt)]"
                        style={{ fontSize: 24, lineHeight: 1.15 }}
                      >
                        <span className="link-underline-anim">{p.title}</span>
                      </h4>
                      <div
                        className="h-eyebrow"
                        style={{
                          color:
                            "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                        }}
                      >
                        {readTime(p.content)} min · {formatDate(p.created_at)}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
