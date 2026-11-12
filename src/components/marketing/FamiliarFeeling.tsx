import { Line } from "./Line"

const PROBLEMS = [
  {
    title: "You read well and publish rarely.",
    body: "The piece landed at 8am and felt urgent. By the time you open the editor, all that's left is a vague sense that it was good and a blinking cursor.",
  },
  {
    title: "A summary is not a position.",
    body: "Every other tool hands you the same tidy recap of the same article. A recap is the one thing your reader can already get without you.",
  },
  {
    title: "You can hear the model in paragraph two.",
    body: "Generic drafting flattens the thing people followed you for: the rhythm of your sentences, the side you take, the words you refuse to use.",
  },
]

export function FamiliarFeeling() {
  return (
    <section aria-labelledby="feeling-heading" className="py-32 xl:py-36">
      <div className="grid lg:grid-cols-2 gap-14 lg:gap-24">
        <div data-stagger>
          <p data-reveal="fade" className="lp-overline flex items-center gap-3"><span className="num text-lp-muted">(01)</span><span className="rule" aria-hidden="true" />A familiar feeling</p>
          <h2 id="feeling-heading" data-reveal="lines" className="h-display text-[clamp(2.6rem,6vw,4.4rem)] mt-7 leading-[1.02]">
            <Line>You&apos;re full of ideas.</Line>
            <Line>Your feed is <span className="serif-i text-lp-blue">another story.</span></Line>
          </h2>
          <p data-reveal className="mt-7 text-[0.9375rem] leading-[1.65] text-lp-body max-w-[25rem]">
            Posting isn&apos;t a writing problem. It&apos;s a figuring-out-what-to-say problem. Threadda closes the distance between reading something good and saying something about it.
          </p>
        </div>
        <div data-stagger className="space-y-9 lg:pt-10">
          {PROBLEMS.map((p, i) => (
            <div key={p.title} data-reveal className="lp-topline pt-6 flex gap-5">
              <span className="num text-lp-blue pt-1">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="h-display text-[1.1875rem] font-semibold">{p.title}</h3>
                <p className="mt-2.5 text-[0.875rem] leading-[1.6] text-lp-body">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
