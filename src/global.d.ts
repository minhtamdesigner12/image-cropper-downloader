declare module "pdfjs-dist/legacy/build/pdf" {
  export * from "pdfjs-dist/types/src/pdf";
  export const version: string;
  export const GlobalWorkerOptions: { workerSrc: string };
}

declare module "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url" {
  const src: string;
  export default src;
}
