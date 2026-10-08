import Link from "next/link";
export default function NotFound() {
  return (
    <main className="case-study">
      <h1>This page is off the map.</h1>
      <p>Return to Radio Ready to choose a practice mode.</p>
      <Link className="button primary" href="/">
        Return home
      </Link>
    </main>
  );
}
