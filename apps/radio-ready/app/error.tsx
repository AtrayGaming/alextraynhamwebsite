"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="case-study">
      <h1>Something interrupted this page.</h1>
      <p>
        Your saved account progress stays in your account. Try loading the page
        again.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <a href="/">Return home</a>
    </main>
  );
}
