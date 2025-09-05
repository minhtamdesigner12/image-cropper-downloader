import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { join } from "path";
import fs from "fs/promises";
import YtDlpWrap from "yt-dlp-wrap";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const ytdlp = new YtDlpWrap();
    const outPath = join(tmpdir(), `video_${Date.now()}.mp4`);

    await ytdlp.execPromise([
      "-f",
      "best",
      "--no-check-certificate",
      "-o",
      outPath,
      url,
    ]);

    const buffer = await fs.readFile(outPath);
    await fs.unlink(outPath);

    // ✅ Convert Buffer → Uint8Array (safe BodyInit type)
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "attachment; filename=video.mp4",
      },
    });
  } catch (err) {
    console.error("yt-dlp error:", err);
    return NextResponse.json(
      { error: "Download failed", message: (err as Error).message },
      { status: 500 }
    );
  }
}
