export function LandingFAQ() {
  const faqs = [
    { q: "How quickly can we integrate?", a: "Most teams connect their databases and webhooks within 10 minutes." },
    { q: "Is our data encrypted?", a: "Yes, all data is encrypted at rest with AES-256 and in transit with TLS 1.3." },
    { q: "Can we cancel anytime?", a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time without penalty." },
  ];

  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="p-5 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <h3 className="font-semibold text-zinc-200 text-sm">{f.q}</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
