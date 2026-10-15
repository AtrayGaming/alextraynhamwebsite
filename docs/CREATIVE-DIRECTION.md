# Alex Traynham: a working studio

## The idea

**Good experiences don’t happen by accident.**

Alex's connection is between noticing a human problem and making something useful. The homepage leads with that point of view, then demonstrates it through a real product, an editorial proposal, published creator work and research. Operations is the practical foundation, not a former identity to explain away.

The site should feel like opening the working portfolio of someone with ideas and the patience to finish them. It borrows the clarity of an editorial feature and the tactile details of a creative workbench. It does not borrow a park's visual identity, logos, fantasy architecture or proprietary language.

## Visual system

| Element | Choice | Purpose |
|---|---|---|
| Paper | `#f5f3ec` | Warmer, less clinical reading surface |
| Ink | `#202723` | Strong type and a grounded visual anchor |
| Lime | `#d9f36b` | One intentional accent for ideas, active choices and contact |
| Apricot | `#f3a978` | Guest-experience project identity |
| Type | System Arial/Helvetica display, Georgia italic, Courier New labels | Big confident statements, personal annotations, useful small labels; no font network requests |
| Layout | Shared 1280px container; 1160px reading pages | Expansive home composition and controlled case-study reading width |
| Shapes | Rules, rectangles, a print-like portrait, editorial diagrams | Avoid generic floating cards and gradients |
| Movement | Small hover changes and manual content selection | Feedback tied to an action; no loading theater or scroll traps |
| Navigation | Work, person, résumé, contact | Familiar paths while the work provides the surprise |

## Visitor sequence

1. **First ten seconds:** bold thesis, Alex's name, a real portrait, park-opening and creator context, direct work button.
2. **First minute:** see an actual product interface, then the content concept. Every project has its evidence status before someone opens it.
3. **Deeper exploration:** read the decision, artifact, evaluation plan and limitations in each case. The storyboard allows a visitor to move through the proposed edit.
4. **Understand the connection:** the perspective switcher applies operations, editing and product thinking to one recognizable problem. It changes the explanation, rather than just decorating the page.
5. **Meet Alex and act:** personality, an uncluttered employment story, degree, direct résumé, email and LinkedIn.

## Copy choices

- “I’m Alex. I’ve helped open a theme park, made hundreds of videos, and built tools…” uses specific, supported activity.
- “Less ‘I could.’ More ‘I made this.’” introduces work rather than a promise about future potential.
- “Same trip. Different idea of fun.” makes a content strategy problem human before describing deliverables.
- “An education in hitting publish.” connects creator experience to practice, without a live subscriber-count boast.
- “Let’s make something matter.” invites a conversation about the team's challenge.

Existing case-study claims remain qualified: the survey had three respondents, the content proposal has not launched, the public learning demo uses fictional examples, and no training efficacy data is claimed. Rounded creator figures are user-provided experience, not a current analytics export.

## Architecture and maintenance

Keep the site's static HTML, CSS and JavaScript. There is no framework, bundle, account system, tracking SDK, animation dependency, runtime API or CMS to maintain. Shared CSS and a small progressive-enhancement script handle all pages. Semantic HTML remains the source of truth; the browser does not need JavaScript to discover the projects or read the cases.

Radio Ready is a separate application with a separate deployment. This portfolio presents and links it; it does not duplicate the app's backend or credentials. The screenshot is an actual public reconstruction capture, converted from 135,839-byte PNG to 68,672-byte WebP. The original assets remain in Git for provenance.

CI-only browser tools are installed outside the repository and never loaded by the website. The current Cloudflare Pages project can continue serving the root unchanged. Deployment remains an explicit approval step; this branch is for review.
