import type { ComponentOutput, AtriumComponent, LovelaceCard } from "../types";

interface HeaderOptions {
  /** greeting text; `${greeting}` -> time-of-day, `${user}` -> resolved name. */
  greeting?: string;
  /** flat override for `${user}` — same name for everyone. */
  name?: string;
  /** per-viewer names, keyed by HA user name or id (e.g. { Tablet: "Everyone" }). */
  names?: Record<string, string>;
  /** fallback when no `names` match and no `name` (default: the HA user's name). */
  default_name?: string;
  /** show today's date under the greeting (default true). */
  show_date?: boolean;
  /** columns to span (default 3 = full width of the default 3-column layout). */
  column_span?: number;
}

const timeGreeting = (): string => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

// A full-width greeting/date band for the top of a screen. Markdown stretches to
// fill its section, so unlike a fixed card it can genuinely span the width.
export const headerComponent: AtriumComponent<HeaderOptions> = {
  id: "header",
  generate(ctx, options): ComponentOutput {
    // Resolve ${user} per viewer: a names map (by HA user name or id) wins, then
    // a flat override, then default_name, then the HA user's own name.
    const hUser = ctx.hass.user;
    const fromMap = (key?: string): string | undefined =>
      key && options.names ? (options.names[key] ?? options.names[key.toLowerCase()]) : undefined;
    const user =
      fromMap(hUser?.name) ??
      fromMap(hUser?.id) ??
      options.name ??
      options.default_name ??
      hUser?.name ??
      "";
    const text = (options.greeting ?? "${greeting}, ${user}")
      .replace(/\$\{greeting\}/g, timeGreeting())
      .replace(/\$\{user\}/g, user)
      .replace(/,\s*$/, "")
      .trim();
    const date = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const content = options.show_date === false ? `# ${text}` : `# ${text}\n${date}`;
    const card: LovelaceCard = { type: "markdown", content };
    return { sections: [{ type: "grid", column_span: options.column_span ?? 3, cards: [card] }] };
  },
};
