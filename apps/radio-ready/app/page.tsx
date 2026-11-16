import Link from "next/link";
import { Radio, AudioLines, Check, Layers3, ArrowRight } from "lucide-react";

const homeModes = [
  {
    name: "Learn",
    description:
      "Flip through the set one card at a time, cue on the front and meaning on the back.",
  },
  {
    name: "Quick Match",
    description:
      "Match each cue to its meaning and clear the set. The ones you miss come back around.",
  },
  {
    name: "Scenarios",
    description:
      "Short situations where you pick the right call, with an explanation after every choice.",
  },
  {
    name: "Trainer Studio",
    description: "Lead a group round with answer reveals and team scoring.",
  },
];

export default function Home() {
  return (
    <main className="landing">
      <header className="public-nav">
        <Link className="brand" href="/">
          <span className="brand-icon">
            <Radio size={24} />
          </span>
          radio ready
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/case-study">Behind the build</Link>
          <a href="https://alextraynham.com">Alex Traynham</a>
          <Link className="button small dark" href="/practice">
            Start practicing
          </Link>
        </nav>
      </header>
      <section className="landing-hero">
        <div>
          <p className="eyebrow">A practice tool by Alex Traynham</p>
          <h1>Learn the codes until they are automatic.</h1>
          <p className="hero-copy">
            Radio Ready turns a set of call codes into flashcards and short
            recall sessions. Start with the cards, then match cues to meanings
            in sessions with a clear finish.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/practice">
              Start practicing
            </Link>
            <Link className="text-link" href="/case-study">
              How it was built
            </Link>
          </div>
          <p className="fine">
            Public demo · Fictional festival content · No account needed
          </p>
        </div>
        <div
          className="product-preview"
          aria-label="Fictional flashcard preview"
        >
          <div className="preview-top">
            <span>
              <AudioLines size={18} /> PRACTICE STUDIO
            </span>
            <span>01 / 45</span>
          </div>
          <div className="preview-card">
            <span className="micro">CREATIVE STUDIO</span>
            <Layers3 size={32} />
            <strong>DEMO–FERN</strong>
            <span className="card-line" />
            <p>Paper folding</p>
            <span className="micro">FICTIONAL LEARNING CONTENT</span>
          </div>
          <div className="preview-bottom">
            <span>
              <Check size={17} /> One concept at a time
            </span>
            <span>Recall. Reveal. Repeat.</span>
          </div>
        </div>
      </section>
      <section className="home-modes" aria-label="Ways to practice">
        <h2>Four ways to practice</h2>
        <ul>
          {homeModes.map((m) => (
            <li key={m.name}>
              <Link href="/practice">
                <span className="home-mode-name">{m.name}</span>
                <span className="home-mode-desc">{m.description}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <footer className="public-footer">
        <span>
          Radio Ready · Built by Alex Traynham
        </span>
        <p>
          All demonstration content is fictional. This is not an operational
          reference or an employer-endorsed training tool.
        </p>
      </footer>
    </main>
  );
}
