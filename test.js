const url = "https://www.youtube.com/watch?v=T5JglDcd54A";

const args = [
  "-f", "mp4/best",
  "-o", "-",
  "--no-playlist",
  "--cookies", "./cookies.txt",
  url
];

console.log(args);
