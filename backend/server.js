// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn, execSync } = require("child_process");
const urlModule = require("url");
const crypto = require("crypto");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_DIR = __dirname;

// ----------------------------
// Paths
// ----------------------------
const ffmpegPath = path.join(BACKEND_DIR, "ffmpeg-bin");
const ytdlpPath = path.join(BACKEND_DIR, "yt-dlp");
const cookiesFile = path.join(BACKEND_DIR, "cookies.txt");
const hasCookies = fs.existsSync(cookiesFile);

// ----------------------------
// Middleware
// ----------------------------
app.use(cors({ origin: ["https://freetlo.com", "http://localhost:3000"], methods: ["GET","POST","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json({ limit: "50mb" }));
app.options("*", cors());

// ----------------------------
// Helpers
// ----------------------------
function shortId(len=6){ return crypto.randomBytes(len).toString("base64url").substring(0,len); }
function getPlatformOptions(url){
    const host = urlModule.parse(url).hostname || "";
    let referer = "";
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    if(host.includes("x.com")||host.includes("twitter.com")) referer = "https://x.com/";
    else if(host.includes("facebook.com")) referer = "https://www.facebook.com/";
    else if(host.includes("instagram.com")) referer = "https://www.instagram.com/";
    else if(host.includes("tiktok.com")) referer = "https://www.tiktok.com/";
    else return null;
    return { referer, ua };
}
function downloadFile(url, dest){
    return new Promise((resolve,reject)=>{
        const file = fs.createWriteStream(dest);
        https.get(url,res=>{
            res.pipe(file);
            file.on("finish",()=>{ file.close(resolve); });
        }).on("error",err=>{ fs.unlink(dest,()=>{}); reject(err); });
    });
}

// ----------------------------
// Auto-install binaries
// ----------------------------
async function ensureBinaries(){
    // yt-dlp
    if(!fs.existsSync(ytdlpPath)){
        console.log("⬆️ Downloading Linux yt-dlp...");
        await downloadFile("https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux", ytdlpPath);
        fs.chmodSync(ytdlpPath, 0o755);
        console.log("✅ yt-dlp ready");
    }
    // ffmpeg
    if(!fs.existsSync(ffmpegPath+"/ffmpeg")){
        console.log("⬆️ Downloading static ffmpeg...");
        fs.mkdirSync(ffmpegPath, {recursive:true});
        await downloadFile("https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz","/tmp/ffmpeg.tar.xz");
        const { execSync } = require("child_process");
        execSync(`tar -xJf /tmp/ffmpeg.tar.xz -C ${ffmpegPath} --strip-components=1`);
        fs.chmodSync(ffmpegPath+"/ffmpeg",0o755);
        console.log("✅ ffmpeg ready");
    }
}

// ----------------------------
// Health check
// ----------------------------
app.get("/ping",(_,res)=>res.json({status:"ok",message:"pong"}));

// ----------------------------
// Download route
// ----------------------------
app.post("/api/download", async (req,res)=>{
    let { url } = req.body;
    if(!url) return res.status(400).json({error:"No URL provided"});
    console.log("📥 Raw request body:",req.body);

    const platformOptions = getPlatformOptions(url);
    if(!platformOptions) return res.status(403).json({error:"Unsupported platform"});
    if(url.includes("facebook.com") && !hasCookies) return res.status(403).json({error:"Facebook downloads require cookies.txt"});

    const {referer,ua} = platformOptions;
    console.log("🎬 Starting download for:",url);

    const tmpFileTemplate = path.join("/tmp",`tmp_${Date.now()}.%(ext)s`);
    let baseFileName = "freetlo.com-video";
    let fileName = `${baseFileName}-${shortId()}.mp4`;

    // Step1: Metadata
    try{
        const metaProc = spawn(ytdlpPath, ["--dump-json","--no-playlist","--user-agent",ua,"--referer",referer,...(hasCookies?["--cookies",cookiesFile]:[]),url]);
        let jsonOut="";
        for await(const chunk of metaProc.stdout) jsonOut+=chunk.toString();
        await new Promise(r=>metaProc.on("close",r));
        if(jsonOut){
            const meta=JSON.parse(jsonOut);
            if(meta?.title){
                baseFileName="freetlo.com-"+meta.title.replace(/[^a-z0-9_\-]+/gi,"_").substring(0,80);
                fileName=`${baseFileName}-${shortId()}.mp4`;
            }
        }
    }catch{ console.warn("⚠️ Metadata fetch failed, using default filename:",fileName); }

    // Step2: Download
    const args=[
        "-f","b[ext=mp4]",
        "--merge-output-format","mp4",
        "--no-playlist",
        "--ffmpeg-location", ffmpegPath+"/ffmpeg",
        "--no-check-certificate",
        "--rm-cache-dir",
        "--user-agent",ua,
        "--referer",referer,
        ...(hasCookies?["--cookies",cookiesFile]:[]),
        url,
        "-o", tmpFileTemplate
    ];

    console.log("📥 Running yt-dlp:", ytdlpPath,args.join(" "));
    const proc = spawn(ytdlpPath,args);
    proc.stdout.on("data",d=>console.log("▶ yt-dlp:",d.toString().trim()));
    proc.stderr.on("data",d=>console.error("⚠️ yt-dlp:",d.toString().trim()));

    proc.on("close",(code)=>{
        if(code!==0){
            console.error("❌ yt-dlp exited with code:",code);
            if(!res.headersSent) return res.status(500).json({error:"yt-dlp failed: Video file not created"});
            return;
        }
        const files = fs.readdirSync("/tmp");
        const base = path.basename(tmpFileTemplate).split(".")[0];
        const outputFile = files.find(f=>f.startsWith(base));
        if(!outputFile) return res.status(500).json({error:"Video file not created"});

        const finalFile = path.join("/tmp",outputFile);
        res.setHeader("Content-Disposition",`attachment; filename="${encodeURIComponent(fileName)}"`);
        res.setHeader("Content-Type","video/mp4");
        const filestream = fs.createReadStream(finalFile);
        filestream.pipe(res);
        filestream.on("end",()=>fs.unlink(finalFile,()=>{}));
    });
});

// ----------------------------
// yt-dlp version
// ----------------------------
app.get("/yt-dlp-version",(_,res)=>{
    const proc=spawn(ytdlpPath,["--version"]);
    let out="";
    proc.stdout.on("data",d=>out+=d.toString());
    proc.on("close",()=>res.send(out));
});

// ----------------------------
// Cleanup
// ----------------------------
setInterval(()=>{
    try{
        const files=fs.readdirSync("/tmp");
        for(const f of files) if(f.startsWith("tmp_")&&f.endsWith(".mp4")) fs.unlink(path.join("/tmp",f),()=>console.log("🧹 Cleaned up leftover:",f));
    }catch(err){ console.error("⚠️ Cleanup job error:",err); }
},60*60*1000);

// ----------------------------
// Start server
// ----------------------------
(async ()=>{
    await ensureBinaries();
    app.listen(PORT,"0.0.0.0",()=>console.log(`🚀 Backend running on port ${PORT}`));
})();
