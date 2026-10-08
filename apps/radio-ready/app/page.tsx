import Link from "next/link";
import {
  Radio,
  Layers3,
  AudioLines,
  Check,
  Users,
  Sparkles,
} from "lucide-react";
export default function Home() {
  return (
    <main className="landing">
      <header className="public-nav">
        <Link className="brand" href="/">
          <span className="brand-icon">
            <Radio size={24} />
          </span>
          radio ready<span className="version">2.0</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/case-study">Behind the build</Link>
          <a href="https://alextraynham.com">Alex Traynham</a>
          <Link className="button small dark" href="/practice">
            Try the demo
          </Link>
        </nav>
      </header>
      <section className="landing-hero">
        <div>
          <p className="eyebrow">
            <span className="pill-dot" /> A learning product by Alex Traynham
          </p>
          <h1>
            Turn information
            <br />
            <em>into practice.</em>
          </h1>
          <p className="hero-copy">
            A hands-on way to learn, connect ideas, and put knowledge into
            practice. Built from frontline training experience.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/practice">
              Explore the practice studio
            </Link>
            <Link className="text-link" href="/case-study">
              Read the case study
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
      <section className="landing-features" aria-label="Product capabilities">
        <article>
          <Layers3 />
          <h2>Find your rhythm</h2>
          <p>
            Start with cards, then test your recall in a session with a clear
            finish.
          </p>
        </article>
        <article>
          <Sparkles />
          <h2>Make it meaningful</h2>
          <p>
            Connect the concept to a situation, with an explanation after every
            choice.
          </p>
        </article>
        <article>
          <Users />
          <h2>Learn together</h2>
          <p>
            Bring a group into the conversation with answer reveals and team
            scoring.
          </p>
        </article>
      </section>
      <section className="landing-story">
        <p className="eyebrow">From the training room</p>
        <h2>
          A small learning problem.
          <br />A product worth getting right.
        </h2>
        <div>
          <p>
            Radio Ready began as an idea for making memorization more
            interactive. Trainee feedback led to finite practice sessions.
            Physical card testing revealed why real-world checks matter.
          </p>
          <Link className="text-link" href="/case-study">
            Explore the decisions behind Radio Ready
          </Link>
        </div>
      </section>
      <footer className="public-footer">
        <span>
          Radio Ready · Designed and developed with AI assistance by Alex
          Traynham
        </span>
        <p>
          All demonstration content is fictional. This is not an operational
          reference or an employer-endorsed training tool.
        </p>
      </footer>
    </main>
  );
}
