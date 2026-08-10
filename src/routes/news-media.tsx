import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { breadcrumbListJsonLd } from "@/lib/seo/jsonLd";
import { usePublishedMedia, aspectRatio, type ResolvedMediaPost } from "@/lib/mediaPosts";

export const Route = createFileRoute("/news-media")({
  head: () => ({
    meta: [
      { title: "News & Media | CEVONS Environmental Services" },
      { name: "description", content: "Photos and announcements from CEVONS Environmental Services in Guyana." },
      { property: "og:title", content: "News & Media | CEVONS Environmental Services" },
      { property: "og:description", content: "Photos and announcements from CEVONS Environmental Services in Guyana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/news-media" },
    ],
    links: [{ rel: "canonical", href: "/news-media" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "News & Media", path: "/news-media" },
          ]),
        ),
      },
    ],
  }),
  component: NewsMediaPage,
});

function GalleryFigure({ item, index }: { item: ResolvedMediaPost; index: number }) {
  if (!item.url) return null;
  return (
    <figure className="mb-4 break-inside-avoid overflow-hidden card-cevons rounded-xl p-0">
      <img
        src={item.url}
        alt={item.title || "CEVONS Environmental Services photo"}
        width={item.image_w ?? undefined}
        height={item.image_h ?? undefined}
        loading={index < 2 ? "eager" : "lazy"}
        decoding="async"
        className="block w-full"
        style={{ aspectRatio: aspectRatio(item.image_w, item.image_h), objectFit: "cover" }}
      />
      {(item.title || item.caption) && (
        <figcaption className="px-4 py-3">
          {item.title && (
            <p className="text-sm font-semibold" style={{ color: "var(--brand-charcoal)" }}>
              {item.title}
            </p>
          )}
          {item.caption && (
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--brand-grey-dark)" }}>
              {item.caption}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

function NewsMediaPage() {
  const gallery = usePublishedMedia("gallery");
  const announcements = usePublishedMedia("announcement");

  const galleryItems = (gallery.data ?? []).filter((g) => !!g.url);
  const announcementItems = announcements.data ?? [];
  const loading = gallery.isLoading || announcements.isLoading;
  const isEmpty = !loading && galleryItems.length === 0 && announcementItems.length === 0;

  return (
    <SiteLayout>
      <main id="main-content">
        {/* Navy band — fixed colours, white on #000080 = 16:1 */}
        <section className="py-14" style={{ background: "#000080" }}>
          <div className="container-cevons">
            <h1 className="text-3xl font-bold md:text-4xl" style={{ color: "#FFFFFF" }}>
              News &amp; Media
            </h1>
          </div>
        </section>

        <div className="py-12" style={{ background: "var(--surface-page)" }}>
          <div className="container-cevons">
            {loading && (
              <p className="text-sm text-cevons-muted">Loading…</p>
            )}

            {isEmpty && (
              <p className="text-base text-cevons-muted">
                Nothing has been published here yet. Please check back soon.
              </p>
            )}

            {announcementItems.length > 0 && (
              <section aria-labelledby="announcements-heading" className="mb-14">
                <h2
                  id="announcements-heading"
                  className="mb-6 text-2xl font-bold text-cevons-dark"
                >
                  Announcements
                </h2>
                <ul className="grid gap-6 md:grid-cols-2">
                  {announcementItems.map((a, i) => (
                    <li
                      key={a.id}
                      className="overflow-hidden card-cevons rounded-xl p-0"
                    >
                      {a.url && (
                        <img
                          src={a.url}
                          alt={a.title || "CEVONS announcement"}
                          width={a.image_w ?? undefined}
                          height={a.image_h ?? undefined}
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className="block w-full"
                          style={{
                            aspectRatio: aspectRatio(a.image_w, a.image_h, "16 / 9"),
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <div className="p-5">
                        {a.title && (
                          <h3
                            className="text-lg font-semibold"
                            style={{ color: "var(--brand-charcoal)" }}
                          >
                            {a.title}
                          </h3>
                        )}
                        {a.caption && (
                          <p
                            className="mt-2 text-sm leading-relaxed"
                            style={{ color: "var(--brand-grey-dark)" }}
                          >
                            {a.caption}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {galleryItems.length > 0 && (
              <section aria-labelledby="gallery-heading">
                <h2
                  id="gallery-heading"
                  className="mb-6 text-2xl font-bold text-cevons-dark"
                >
                  Gallery
                </h2>
                <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                  {galleryItems.map((item, i) => (
                    <GalleryFigure key={item.id} item={item} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
