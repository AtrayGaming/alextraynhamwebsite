import Link from "next/link";
export default function CaseStudy() {
  return (
    <main className="case-study">
      <nav>
        <Link href="/">Radio Ready</Link>
        <a href="https://alextraynham.com">Alex’s portfolio</a>
      </nav>
      <p className="eyebrow">PRODUCT DESIGN / LEARNING EXPERIENCE</p>
      <h1>
        Making practice
        <br />
        feel purposeful.
      </h1>
      <p className="case-lead">
        Turning a frontline training idea into a physical learning tool and an
        interactive digital product.
      </p>
      <div className="case-meta">
        <span>
          My role
          <br />
          <strong>Concept, creative direction, testing</strong>
        </span>
        <span>
          Deliverables
          <br />
          <strong>Flashcards + learning application</strong>
        </span>
        <span>
          Process
          <br />
          <strong>AI-assisted design and development</strong>
        </span>
      </div>
      <section>
        <h2>The starting point</h2>
        <p>
          I wanted to give trainers a more interactive way to help people
          practice unfamiliar communication concepts. A prompt on one side of a
          card and a meaning on the other created a simple recall activity. The
          digital version expanded that idea into guided practice and group
          activities.
        </p>
      </section>
      <section>
        <h2>A session needs a finish line</h2>
        <p>
          During a supervised tryout, I noticed the matching activity kept
          revisiting material without a satisfying ending. I asked for a finite
          session: skip previously cleared concepts, return to missed questions,
          and show a completion screen. That observation became a core product
          decision.
        </p>
        <blockquote>
          Progress should help someone understand what remains and when they are
          done.
        </blockquote>
      </section>
      <section>
        <h2>The print test changed the design</h2>
        <p>
          My supervising lead and I printed a test sheet. The borders lined up,
          but the answers on the outside columns were reversed. I directed a
          correction to the answer-page arrangement across the deck. The
          correction swapped the outside answer columns while preserving the
          center column.
        </p>
        <p>
          The lesson was practical: visual alignment is only one part of
          correctness. A physical product needs a physical test.
        </p>
      </section>
      <section>
        <h2>From tool to product</h2>
        <p>
          The rebuild keeps the recall, matching, scenarios, and facilitation
          mechanics while giving each a clearer purpose. It separates fictional
          public content from any future approved internal environment. Typed
          learning logic, versioned content, role checks, and persistent account
          sessions form the backend design.
        </p>
        <p>
          Public visitors can practice without creating an account. Guest
          progress stays in their browser. Account functionality depends on a
          configured database and administrator-provisioned access.
        </p>
      </section>
      <section>
        <h2>What I contributed</h2>
        <p>
          I identified the learning need, chose the formats, directed the visual
          iterations, evaluated the generated work, and used testing feedback to
          make specific corrections. AI tools assisted with layout, code,
          production files, and testing. My role was defining the requirements
          and taking responsibility for the decisions and review.
        </p>
      </section>
      <section>
        <h2>What the evidence supports</h2>
        <p>
          A physical test print exposed a pairing problem, and the deck was
          corrected. A complete post-correction print check is not documented
          here. The original digital matching flow was revised in response to
          trainee use. I have not measured improved retention, reduced training
          time, or broad adoption, and I do not present practice scores as proof
          of operational competence.
        </p>
      </section>
      <section>
        <h2>What I would measure next</h2>
        <p>
          With permission and an appropriate study design: completion of
          practice sessions, repeated misses by concept, and whether learners
          can recall the material later. Those are evaluation questions, not
          claimed results.
        </p>
      </section>
      <div className="button-row">
        <Link className="button primary" href="/practice">
          Try the fictional demo
        </Link>
        <a className="button secondary" href="https://alextraynham.com">
          Back to my portfolio
        </a>
      </div>
      <footer>
        <p>
          All displayed content is invented for public presentation. Internal
          terminology, procedures, identities, and original materials are
          excluded. No employer endorsement is implied.
        </p>
      </footer>
    </main>
  );
}
