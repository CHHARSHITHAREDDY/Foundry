export function LandingFeatures() {
  const features = [
    { title: "Continuous Monitoring", desc: "Automated assertion suites inspect data integrity 24/7." },
    { title: "Zero-Latency Failover", desc: "Instantly re-route failed tasks to standby workers." },
    { title: "Tamper-Proof Audit", desc: "Immutable logs verify every compliance change." },
  ];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <h3 className="text-base font-bold text-white">{f.title}</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
