const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Cuisines", href: "#cuisines" },
  { label: "Contact", href: "#contact" },
];

const STATS = [
  { value: "12k+", label: "Restaurant partners" },
  { value: "25 min", label: "Average delivery time" },
  { value: "4.9★", label: "Average rating" },
  { value: "500k+", label: "Happy customers" },
];

const FEATURES = [
  {
    emoji: "⚡",
    title: "Lightning fast delivery",
    desc: "Real-time courier matching gets hot food to your door in under 30 minutes, on average.",
  },
  {
    emoji: "📍",
    title: "Live order tracking",
    desc: "Watch your order move from the kitchen to your doorstep with second-by-second tracking.",
  },
  {
    emoji: "🍽️",
    title: "Thousands of restaurants",
    desc: "From neighborhood favorites to citywide chains, discover a menu for every craving.",
  },
  {
    emoji: "🔒",
    title: "Secure payments",
    desc: "Pay your way with cards, wallets, or cash — every transaction is encrypted end to end.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Browse & choose",
    desc: "Explore restaurants near you and build your order in a few taps.",
  },
  {
    number: "02",
    title: "Track in real time",
    desc: "Follow your courier on the map from kitchen to doorstep.",
  },
  {
    number: "03",
    title: "Enjoy your meal",
    desc: "Get a knock at the door and dig in while it's still hot.",
  },
];

const CUISINES = [
  { emoji: "🍕", label: "Pizza" },
  { emoji: "🍣", label: "Sushi" },
  { emoji: "🍔", label: "Burgers" },
  { emoji: "🍜", label: "Noodles" },
  { emoji: "🌮", label: "Tacos" },
  { emoji: "🥗", label: "Salads" },
  { emoji: "🍛", label: "Curry" },
  { emoji: "🍩", label: "Desserts" },
];

export default function Home() {
  return (
    <div id="top" className="flex flex-1 flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2 text-xl font-bold">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-lg"
              aria-hidden
            >
              🍔
            </span>
            Foodly
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/70 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-dark"
          >
            Order Now
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute top-40 -left-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-20 text-center md:py-28">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-1.5 text-sm font-medium text-brand-dark">
              🔥 Now delivering in 40+ cities
            </span>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Delicious food,
              <br />
              delivered to your door.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-foreground/70">
              Foodly connects you with the best local restaurants — order in
              seconds, track in real time, and enjoy a meal that arrives hot,
              fresh, and fast.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#contact"
                className="rounded-full bg-brand px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Order Now
              </a>
              <a
                href="#how-it-works"
                className="rounded-full border border-foreground/15 px-8 py-3.5 text-base font-semibold transition-colors hover:bg-foreground/5"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="relative mx-auto max-w-5xl px-6 pb-20">
            <dl className="grid grid-cols-2 gap-6 rounded-3xl bg-foreground px-8 py-10 text-background sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-2xl font-bold sm:text-3xl">{stat.value}</dd>
                  <span className="text-xs text-background/70 sm:text-sm">
                    {stat.label}
                  </span>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Cuisines */}
        <section id="cuisines" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Craving something specific?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-foreground/60">
            Explore our most popular cuisines, all just a few taps away.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {CUISINES.map((cuisine) => (
              <span
                key={cuisine.label}
                className="flex items-center gap-2 rounded-full border border-foreground/10 bg-cream px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand/40 hover:bg-brand/10"
              >
                <span aria-hidden>{cuisine.emoji}</span>
                {cuisine.label}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-cream/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">
              Everything you need for the perfect meal
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-foreground/60">
              We built Foodly around speed, transparency, and the food you
              actually want.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col gap-4 rounded-2xl bg-background p-6 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl"
                    aria-hidden
                  >
                    {feature.emoji}
                  </span>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground/60">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Three steps to your next favorite meal
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="relative rounded-2xl border border-foreground/10 p-8">
                <span className="text-4xl font-extrabold text-brand/25">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-brand px-8 py-16 text-center text-white">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Hungry? Let&apos;s fix that.
            </h2>
            <p className="max-w-md text-white/90">
              Download the app or order from your browser — your favorite
              meal is just a few minutes away.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#top"
                className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-brand-dark transition-transform hover:-translate-y-0.5"
              >
                Get the App
              </a>
              <a
                href="#top"
                className="rounded-full border border-white/60 px-8 py-3.5 text-base font-semibold transition-colors hover:bg-white/10"
              >
                Order on the Web
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-sm text-foreground/60 sm:flex-row sm:justify-between">
          <a href="#top" className="flex items-center gap-2 font-semibold text-foreground">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm"
              aria-hidden
            >
              🍔
            </span>
            Foodly
          </a>
          <p>© {new Date().getFullYear()} Foodly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
