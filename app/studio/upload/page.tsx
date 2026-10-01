import { Suspense } from "react";
import { UploadForm } from "@/components/studio/UploadForm";

export const metadata = { title: "Upload · NatureMe Studio" };

export default function UploadPage() {
  return (
    <>
      <div className="studio-head">
        <div className="eyebrow">Upload</div>
        <h1 style={{ marginTop: 6 }}>Add a piece</h1>
        <p>Four steps: the recording, what it is, where it belongs, and a quick automated check before it goes live.</p>
      </div>
      <Suspense>
        <UploadForm />
      </Suspense>
    </>
  );
}
