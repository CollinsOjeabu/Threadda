const AUDIENCES = [
  {
    title: "Operators inside large companies",
    body: "You know more about your function than anyone publishing about it. The block has never been knowledge — it's the twenty minutes to shape it.",
  },
  {
    title: "Founders before their first round",
    body: "A body of thinking is the cheapest diligence you can hand an investor. Threadda turns the reading that informs your decisions into the writing that shows it.",
  },
  {
    title: "Investors and analysts",
    body: "You already form a view on everything you read. Publishing it is a distribution problem, not a thinking one.",
  },
  {
    title: "Consultants and advisors",
    body: "Every engagement produces a thesis you can't share. The parts you can share are worth more published than filed.",
  },
]

export function WhoItsFor() {
  return (
    <section id="who" aria-labelledby="who-heading" className="bg-lp-panel">
      <div className="mx-auto max-w-[80.4375rem] px-6 sm:px-10 py-28 xl:py-32">
        <div data-stagger className="lg:text-right lg:ml-auto lg:max-w-[42rem]">
          <p data-reveal="fade" className="lp-overline flex items-center gap-3 lg:justify-end"><span className="num text-lp-muted">(05)</span><span className="rule" aria-hidden="true" />A mind of your own</p>
          <h2 id="who-heading" data-reveal className="h-display text-[clamp(2.4rem,5.5vw,4.4rem)] mt-6 leading-[1.02]">
            For people with <span className="serif-i text-lp-ink">something to add.</span>
          </h2>
        </div>
        <div data-stagger className="grid md:grid-cols-2 gap-x-20 gap-y-11 mt-14">
          {AUDIENCES.map((a, i) => (
            <div key={a.title} data-reveal className="lp-topline pt-6 flex gap-5">
              <span className="num text-lp-blue pt-1">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="h-display text-[1.125rem] font-semibold">{a.title}</h3>
                <p className="mt-2.5 text-[0.875rem] leading-[1.6] text-lp-body">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
