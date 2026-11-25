export function LandingHowItWorks() {
  const steps = [
    { num: "01", title: "Connect", desc: "Integrate your data pipelines and endpoints in seconds." },
    { num: "02", title: "Assert", desc: "Our engine continuously monitors data integrity and drift." },
    { num: "03", title: "Resolve", desc: "Instant automated remediation whenever anomalies occur." },
  ];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-white text-center mb-10">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s) => (
          <div key={s.num} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
            <span className="font-mono text-2xl font-bold text-indigo-400">{s.num}</span>
            <h3 className="text-base font-bold text-white mt-2">{s.title}</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
