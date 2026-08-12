import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import type { PageContent, SavedString } from "@/lib/content.functions";
import { ContentEditorOverlay } from "@/components/content/ContentEditorOverlay";

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
  const base = value ?? EMPTY;

  // Live edits made through the click-to-edit overlay. They are layered on top
  // of the loader data so the page updates the moment a draft is saved,
  // without a reload and without a refetch.
  const [edits, setEdits] = useState<Record<string, SavedString>>({});
  useEffect(() => setEdits({}), [value]);

  const merged = useMemo<PageContent>(() => {
    if (!base.preview || Object.keys(edits).length === 0) return base;

    const strings = { ...base.strings };
    const meta = { ...(base.meta ?? {}) };
    for (const [key, row] of Object.entries(edits)) {
      const resolved = row.draft ?? row.published;
      if (typeof resolved === "string" && resolved.length > 0) strings[key] = resolved;
      else delete strings[key];
      const m = meta[key];
      if (m) meta[key] = { ...m, draft: row.draft, published: row.published };
    }
    return { ...base, strings, meta };
  }, [base, edits]);

  const onSaved = useCallback((row: SavedString) => {
    setEdits((prev) => ({ ...prev, [row.key]: row }));
  }, []);

  // Photos read their edit state from a standalone context so `useSiteImage`
  // never has to import this module (that would be an import cycle).
  const imageEditState = useMemo(
    () => ({ preview: merged.preview === true, canPublish: merged.canPublish === true }),
    [merged.preview, merged.canPublish],
  );

  return (
    <ContentContext.Provider value={merged}>
      <ImageEditContext.Provider value={imageEditState}>
        {children}
        {merged.preview && merged.meta && (
          <ContentEditorOverlay
            meta={merged.meta}
            canPublish={merged.canPublish === true}
            onSaved={onSaved}
          />
        )}
      </ImageEditContext.Provider>
    </ContentContext.Provider>
  );
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
