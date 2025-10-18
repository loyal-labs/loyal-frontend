import localFont from "next/font/local";
import Image from "next/image";

const instrumentSerif = localFont({
  src: [
    {
      path: "../../../public/fonts/InstrumentSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/InstrumentSerif-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
});

export default function LandingPage() {
  return (
    <main
      style={{
        margin: 0,
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
        }}
      >
        <Image
          src="/landing.png"
          alt="Landing"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div
          className={instrumentSerif.className}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "center",
            padding: "22vh 1.5rem 0",
            gap: "0.75rem",
            color: "#fff",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 4.25rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              maxWidth: "100%",
              whiteSpace: "nowrap",
            }}
          >
            <em>Private</em> intelligence for <em>private</em> people
          </h1>
          <p
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.6rem)",
              fontWeight: 400,
              maxWidth: "40rem",
              lineHeight: 1.45,
            }}
          >
            Loyal is built for those who want to ask questions with no
            reprucussions.
          </p>
        </div>
      </div>
    </main>
  );
}
