import YtDlpWrap from "yt-dlp-wrap"; // ✅ default import
import { tmpdir } from "os";
import { join } from "path";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ytDlpWrap = new YtDlpWrap();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return new NextResponse("Missing URL", { status: 400 });

    // 1️⃣ Get video title
    const titleRaw = (await ytDlpWrap.execPromise(["--get-title", url])).trim();
    const title = titleRaw.replace(/[\/\\?%*:|"<>]/g, "_") || "video";

    // 2️⃣ Temp file path
    const outPath = join(tmpdir(), `video_${Date.now()}.mp4`);

    // 3️⃣ Download video
    await ytDlpWrap.execPromise(["-f", "mp4", "-o", outPath, url]);

    // 4️⃣ Read video file
    const buffer = await fs.readFile(outPath);

    // 5️⃣ Delete temp file
    await fs.unlink(outPath);

    // 6️⃣ Return as downloadable response
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title)}.mp4"`,
      },
    });
  } catch (err: any) {
    console.error(err);
    return new NextResponse("Download failed: " + err.message, { status: 500 });
  }
}
