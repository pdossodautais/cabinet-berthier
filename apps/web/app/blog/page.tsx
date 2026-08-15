import { getBlogPosts } from "@/lib/data";
import Link from "next/link";
import type { Metadata } from "next";
import type { PostWithAuthor } from "@repo/shared/supabase/types";
import { clientConfig } from "@repo/shared/client-config";
import { ArrowRight } from "lucide-react";
import { PropertyImage } from "@repo/ui/property-image";
import { Reveal } from "@/components/reveal";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Journal",
  description: `Le journal du ${clientConfig.agencyName} — analyses, guides, lectures de quartier.`,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Journal · ${clientConfig.agencyFullName}`,
    description: "Analyses, guides pratiques, lectures de quartier.",
    type: "website",
    images: ["/opengraph-image"],
  },
};

const POST_PALETTES = ["p-night", "p-stone", "p-warm", "p-cool", "p-dusk", "p-roof"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readTime(content: string | null): number {
  if (!content) return 3;
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div>
      {/* Head */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-14 pb-14">
        <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 01 — Le Journal</div>
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <Reveal kind="mask-y" className="lg:col-span-7">
            <h1
              className="h-display"
              style={{ fontSize: "clamp(48px, 7vw, 108px)" }}
            >
              Lectures
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                du marché.
              </em>
            </h1>
          </Reveal>
          <Reveal kind="slide-up" delay={150} className="lg:col-span-5">
            <p
              className="text-[15px] leading-[1.7]"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
              }}
            >
              Analyses, guides pratiques, lectures de quartier. Les réflexions
              du {clientConfig.agencyName} sur l&apos;immobilier parisien.
            </p>
          </Reveal>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pb-28">
          <Reveal kind="slide-up">
            <div
              className="py-24 text-center"
              style={{ border: "1px solid var(--bone-raw)" }}
            >
              <div className="chapter-mark mb-4 justify-center inline-flex animate-eyebrow-in">
                Bientôt en ligne
              </div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
              >
                Les premiers articles{" "}
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  arrivent bientôt.
                </em>
              </h2>
            </div>
          </Reveal>
        </section>
      ) : (
        <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-14 pb-28">
          {/* Featured */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="grid md:grid-cols-12 gap-10 mb-20 group cursor-pointer"
            >
              <Reveal kind="clip-x" className="md:col-span-7">
                <div
                  className={`placeholder-photo ${POST_PALETTES[0]} relative overflow-hidden`}
                  style={{ aspectRatio: "16 / 10" }}
                  data-label="Article"
                >
                  {featured.cover_url && (
                    <div className="absolute inset-0 group-zoom">
                      <PropertyImage
                        src={featured.cover_url}
                        alt={featured.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 56vw"
                        priority
                      />
                    </div>
                  )}
                </div>
              </Reveal>
              <Reveal kind="slide-up" delay={200} className="md:col-span-5 flex flex-col justify-center">
                <div
                  className="flex items-center gap-3 h-eyebrow mb-5 flex-wrap"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  <span style={{ color: "var(--cobalt)" }}>Article</span>
                  <span>·</span>
                  <span>{formatDate(featured.created_at)}</span>
                  <span>·</span>
                  <span>{readTime(featured.content)} min de lecture</span>
                </div>
                <h2
                  className="h-display mb-5 transition-colors group-hover:text-[color:var(--cobalt)]"
                  style={{
                    fontSize: "clamp(32px, 4vw, 56px)",
                    lineHeight: 1.08,
                  }}
                >
                  <span className="link-highlight-cobalt">{featured.title}</span>
                </h2>
                {featured.excerpt && (
                  <p
                    className="text-[15px] leading-[1.7] mb-6"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
                    }}
                  >
                    {featured.excerpt}
                  </p>
                )}
                <span
                  className="link-under inline-flex items-center gap-2"
                  style={{ color: "var(--cobalt)" }}
                >
                  Lire l&apos;article
                  <ArrowRight
                    className="h-3 w-3 group-arrow"
                    strokeWidth={1.5}
                  />
                </span>
              </Reveal>
            </Link>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {rest.map((post: PostWithAuthor, i) => {
                const palette = POST_PALETTES[(i + 1) % POST_PALETTES.length];
                const staggerDelay = Math.min(i, 5) * 80;
                return (
                  <Reveal key={post.id} kind="scale" delay={staggerDelay}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="cursor-pointer group block"
                    >
                      <div
                        className={`placeholder-photo ${palette} relative overflow-hidden mb-5`}
                        style={{ aspectRatio: "4 / 3" }}
                        data-label="Article"
                      >
                        {post.cover_url && (
                          <div className="absolute inset-0 group-zoom">
                            <PropertyImage
                              src={post.cover_url}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        )}
                      </div>
                      <div
                        className="flex items-center gap-3 mb-3 h-eyebrow flex-wrap"
                        style={{
                          color:
                            "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                        }}
                      >
                        <span style={{ color: "var(--cobalt)" }}>Article</span>
                        <span>·</span>
                        <span>{formatDate(post.created_at)}</span>
                        <span>·</span>
                        <span>{readTime(post.content)} min</span>
                      </div>
                      <h3
                        className="h-display mb-3 transition-colors group-hover:text-[color:var(--cobalt)]"
                        style={{ fontSize: 28, lineHeight: 1.1 }}
                      >
                        <span className="link-highlight-cobalt">{post.title}</span>
                      </h3>
                      {post.excerpt && (
                        <p
                          className="text-[14px]"
                          style={{
                            color:
                              "color-mix(in oklch, var(--ink-raw) 70%, transparent)",
                          }}
                        >
                          {post.excerpt}
                        </p>
                      )}
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
