import { createContext, createElement, useContext, type ElementType, type ReactNode } from "react";
import type { PageContent } from "@/lib/content.functions";

/**
 * Editable copy.
 *
 *   <Editable id="home.hero.headline" as="h1" className="hero-heading">
 *     Cleaner Today.
 *   </Editable>
 *
 * THE FALLBACK CHAIN
 *   preview mode  -> draft_value ?? published_value ?? children
 *   normal render -> published_value ?? children
 *
 * `children` is the hardcoded default copy living in the code. The resolved
 * map is prepared server-side (draft resolution already applied when the
 * preview token was valid), so if the table is empty, unreachable or the query
 * throws, the map is simply `{}` and every Editable renders its children —
 * i.e. the site renders exactly as it does today.
 *
 * The content is fetched ONCE per page in the route loader and shared here via
 * context; there is never a query per string. Because it comes from the loader
 * it is present during SSR, so there is no flash of default copy.
 */

const EMPTY: PageContent = { preview: false, strings: {} };

const ContentContext = createContext<PageContent>(EMPTY);

export function ContentProvider({
  value,
  children,
}: {
  value: PageContent | undefined | null;
  children: ReactNode;
}) {
  return <ContentContext.Provider value={value ?? EMPTY}>{children}</ContentContext.Provider>;
}

export function usePageContent(): PageContent {
  return useContext(ContentContext);
}

/** Resolved string for a key, or `null` to mean "use the hardcoded default". */
export function useContentValue(id: string): string | null {
  const { strings } = useContext(ContentContext);
  const v = strings[id];
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

/**
 * Plain-string variant, for places that need a string rather than an element
 * (aria-label, alt text, props passed into an existing component).
 */
export function useEditableText(id: string, fallback: string): string {
  return useContentValue(id) ?? fallback;
}

export type EditableProps = {
  id: string;
  /** Human label surfaced to the click-to-edit UI in step 3. */
  label?: string;
  /** Element to render. Defaults to a fragment-free <span>. */
  as?: ElementType;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>;

export function Editable({ id, label, as, className, children, ...rest }: EditableProps) {
  const { preview } = usePageContent();
  const value = useContentValue(id);
  const content: ReactNode = value ?? children;

  const previewAttrs = preview
    ? { "data-content-key": id, ...(label ? { "data-content-label": label } : {}) }
    : {};

  const Tag: ElementType = as ?? "span";
  return createElement(Tag, { className, ...previewAttrs, ...rest }, content);
}
