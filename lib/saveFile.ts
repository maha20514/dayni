/* eslint-disable @typescript-eslint/no-explicit-any */
// Saves/exports a file. On the website it triggers a normal download. Inside the
// Capacitor app WebView, blob/anchor downloads silently do nothing, so the file is
// written to the app cache and the system share sheet opens ("Save to Files/Drive",
// WhatsApp, email, open with...).
import { isNativeApp } from "@/lib/nativeAuth";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.readAsDataURL(blob);
  });
}

export async function saveBlob(blob: Blob, fileName: string): Promise<void> {
  if (isNativeApp()) {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import("@capacitor/filesystem"),
      import("@capacitor/share"),
    ]);
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: await blobToBase64(blob),
      directory: Directory.Cache,
    });
    try {
      await Share.share({ title: fileName, url: uri, dialogTitle: fileName });
    } catch {
      /* user dismissed the share sheet */
    }
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// `XLSX` is the xlsx module the caller already imports.
export function saveWorkbook(XLSX: any, wb: any, fileName: string): Promise<void> {
  const data = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return saveBlob(new Blob([data], { type: XLSX_MIME }), fileName);
}
