import { StudioNav } from "@/components/studio/StudioNav";

export const metadata = { title: "Studio · NatureMe" };

/** The Creator view: one app with the Listener view, wider and without the listener dock. */
export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return (
    <div className="studio">
      <StudioNav />
      <main className="studio-main">{children}</main>
    </div>
  );
}
