import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#24262f",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            border: "22px solid #ff1493",
            borderRadius: 112,
            color: "#ff1493",
            display: "flex",
            fontFamily: "sans-serif",
            fontSize: 250,
            fontWeight: 900,
            height: 344,
            justifyContent: "center",
            lineHeight: 1,
            width: 344,
          }}
        >
          C
        </div>
      </div>
    ),
    size,
  );
}
