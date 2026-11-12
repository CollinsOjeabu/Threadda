const FAQS = [
  {
    q: "Is this just ChatGPT with a nicer editor?",
    a: "No. A general model writes from your prompt and starts from zero every time. Threadda starts from the full source — the study, the report, the thread — and from a model of your published voice. The angle is chosen before a single word of draft is written.",
  },
  {
    q: "Do I have to hand over my whole posting history?",
    a: "No. A handful of posts you're proud of is enough to start. The more you publish through Threadda, the closer the voice gets.",
  },
  {
    q: "Which platforms does it write for?",
    a: "LinkedIn and X — each with its own voice and format, not one draft reflowed into two boxes.",
  },
  {
    q: "What can I put in?",
    a: "An article URL, a PDF, or notes of your own. Threadda reads the whole thing, not the first three paragraphs.",
  },
  {
    q: "Will the draft sound like me?",
    a: "That's the whole point. Every draft starts from your voiceprint — your rhythm, your stance, the words you use and the ones you don't — then you edit from there.",
  },
  {
    q: "What does it cost?",
    a: "It's free for the length of the beta. No card to start.",
  },
]

/** Native <details> accordion — no client JS. */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="py-32">
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-14">
        <div>
          <p className="lp-overline flex items-center gap-3"><span className="num text-lp-muted">(06)</span><span className="rule" aria-hidden="true" />A few good questions</p>
          <h2 id="faq-heading" className="h-display text-[clamp(2.2rem,5vw,3.6rem)] mt-6 leading-[1.05]">
            Before you <span className="serif-i text-lp-blue">follow the thread.</span>
          </h2>
          <p className="mt-4 text-[14px] text-lp-body">Everything people ask before they join.</p>
        </div>
        <div>
          {FAQS.map((item, i) => (
            <details
              key={item.q}
              open={i === 0}
              className={`group border-t border-lp-line-2 py-5 ${i === FAQS.length - 1 ? "border-b" : ""}`}
            >
              <summary className="flex items-center justify-between gap-4 rounded-md">
                <h3 className="text-[15px] font-semibold">{item.q}</h3>
                <span aria-hidden="true" className="text-lp-blue text-xl transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[14px] leading-[1.6] text-lp-body">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
