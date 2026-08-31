'use client';

import { useEffect } from 'react';

type Variant = 'signal' | 'split' | 'orbit';

const concepts = [
  { href: '/', label: '01 Signal' },
  { href: '/concept-2', label: '02 Split' },
  { href: '/concept-3', label: '03 Orbit' },
];

const services = [
  ['01', 'Recruit & Vet', 'Match each brand with publishers selected for category fit, audience quality and intent.'],
  ['02', 'Activate', 'Turn strong matches into campaigns with offers, assets and hands-on account support.'],
  ['03', 'Attribute', 'Connect every valid click, order and commission through one transparent performance layer.'],
  ['04', 'Optimize', 'Continuously tune partner mix, commission strategy and market investment.'],
];

const partnerMedia = [
  { src: '/legacy-media/publisher-01.jpg', label: 'Editorial / Lifestyle', name: 'Publisher Network 01' },
  { src: '/legacy-media/publisher-02.jpg', label: 'Content / Commerce', name: 'Publisher Network 02' },
  { src: '/legacy-media/publisher-03.jpg', label: 'Creator / Social', name: 'Publisher Network 03' },
];

const logos = [
  ['SHOKZ', '/brands/shokz.png'],
  ['DJI', '/brands/dji.ico'],
  ['Hisense', '/brands/hisense.ico'],
  ['JBL', '/brands/jbl.ico'],
  ['Anker', '/brands/anker.ico'],
  ['Govee', '/brands/govee.ico'],
];

const variantCopy = {
  signal: {
    tag: 'GLOBAL PERFORMANCE PARTNERSHIP NETWORK',
    title: <>Every partnership<br />should <em>perform.</em></>,
    copy: 'YeahPromos turns global affiliate relationships into a continuously managed growth system—from partner discovery to measurable revenue.',
  },
  split: {
    tag: 'BRANDS × PUBLISHERS',
    title: <>Two sides.<br /><em>One growth engine.</em></>,
    copy: 'A global platform where ambitious brands meet trusted publishers, supported by people who manage every detail in between.',
  },
  orbit: {
    tag: 'THE MANAGED NETWORK',
    title: <>Reach is global.<br /><em>Growth is personal.</em></>,
    copy: 'Technology connects the network. Our team makes it work—market by market, publisher by publisher, campaign by campaign.',
  },
};

export default function Experience({ variant }: { variant: Variant }) {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;
    const updateScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      root.style.setProperty('--page-progress', String(window.scrollY / max));
      root.style.setProperty('--page-y', `${window.scrollY}px`);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    const onPointer = (event: PointerEvent) => {
      root.style.setProperty('--pointer-x', `${event.clientX / window.innerWidth - 0.5}`);
      root.style.setProperty('--pointer-y', `${event.clientY / window.innerHeight - 0.5}`);
    };
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting)),
      { threshold: 0.16 },
    );
    document.querySelectorAll('[data-reveal]').forEach((node) => observer.observe(node));
    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  const copy = variantCopy[variant];
  const activeHref = variant === 'signal' ? '/' : variant === 'split' ? '/concept-2' : '/concept-3';

  return (
    <main className={`exp exp-${variant}`}>
      <div className="progress-rail" aria-hidden="true"><span /></div>
      <div className="concept-switcher" aria-label="Design concepts">
        <span>Concept</span>
        {concepts.map((concept) => <a className={concept.href === activeHref ? 'active' : ''} href={concept.href} key={concept.href}>{concept.label}</a>)}
      </div>

      <section className="exp-hero" id="home">
        <header className="exp-header">
          <a href="#home" className="exp-logo" aria-label="YeahPromos home"><img src="/yeahpromos-logo.png" alt="YeahPromos" /></a>
          <nav aria-label="Main navigation"><a href="#network">Network</a><a href="#method">Method</a><a href="#partners">Partners</a><a href="#contact">Contact</a></nav>
          <a className="header-cta" href="#contact">Start a program <span>↗</span></a>
        </header>
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-copy-block">
          <div className="micro-label"><i />{copy.tag}</div>
          <h1>{copy.title}</h1>
          <p>{copy.copy}</p>
          <div className="hero-ctas"><a className="primary-cta" href="#contact">Grow your brand <span>↗</span></a><a className="text-cta" href="https://www.yeahpromos.com/index/login/signin">Join as publisher <span>→</span></a></div>
        </div>
        <div className="hero-stage" aria-label="Interactive partnership network visualization">
          <div className="stage-glow" />
          <div className="stage-rings ring-a" /><div className="stage-rings ring-b" /><div className="stage-rings ring-c" />
          <div className="stage-core"><img src="/yeahpromos-p-mark.png" alt="" /><span>PERFORMANCE<br />AT THE CORE</span></div>
          <div className="stage-card card-brand"><small>01 / INPUT</small><strong>Brands</strong><span>Ambition + product</span></div>
          <div className="stage-card card-publisher"><small>02 / NETWORK</small><strong>Publishers</strong><span>Trust + attention</span></div>
          <div className="stage-card card-growth"><small>03 / OUTPUT</small><strong>Growth</strong><span>Measured revenue</span></div>
          <div className="stage-signal signal-a" /><div className="stage-signal signal-b" /><div className="stage-signal signal-c" />
        </div>
        <div className="hero-index"><span>SCROLL TO EXPLORE</span><b>01</b><i /></div>
      </section>

      <section className="logo-band" aria-label="Selected brand partners"><span className="logo-band-label">TRUSTED BY 500+ ACTIVE BRANDS</span><div className="logo-track">{[...logos, ...logos].map(([name, src], index) => <span key={`${name}-${index}`}><img src={src} alt={index < logos.length ? name : ''} /></span>)}</div></section>

      <section className="exp-intro" id="network">
        <div className="intro-kicker" data-reveal><span>01 / THE NETWORK</span><p>Not another affiliate directory.</p></div>
        <div className="intro-statement" data-reveal><h2>Global reach is easy to promise.<br /><em>Relevant growth takes management.</em></h2><p>YeahPromos brings brands, creators, editorial publishers, shopping platforms and performance media into one managed ecosystem. Every relationship is selected, activated and optimized around a real commercial objective.</p></div>
        <div className="network-stats" data-reveal><div><strong>20+</strong><span>Countries & regions</span></div><div><strong>500+</strong><span>Active brands</span></div><div><strong>200+</strong><span>Global publishers</span></div><div><strong>CPS</strong><span>Performance model</span></div></div>
      </section>

      <section className="story" id="method">
        <div className="story-sticky"><span className="story-label">02 / FROM CONNECTION TO CONVERSION</span><h2>A network that<br /><em>moves with you.</em></h2><div className="story-orbit" aria-hidden="true"><i /><i /><i /><b>P</b></div></div>
        <div className="story-steps">{services.map(([no, title, description]) => <article key={no} data-reveal><span>{no}</span><h3>{title}</h3><p>{description}</p><i /></article>)}</div>
      </section>

      <section className="media-story" id="partners">
        <div className="media-heading" data-reveal><span>03 / PARTNER SIGNALS</span><h2>Real people.<br />Real context.<br /><em>Real influence.</em></h2></div>
        <div className="media-grid">{partnerMedia.map((item, index) => <figure className={`media-card media-${index + 1}`} key={item.src} data-reveal><img src={item.src} alt={item.name} loading="lazy" /><figcaption><span>{item.label}</span><strong>{item.name}</strong><i>↗</i></figcaption></figure>)}</div>
      </section>

      <section className="solution-split">
        <article className="solution-brand" data-reveal><span>FOR BRANDS</span><h2>Scale beyond<br />the obvious.</h2><p>Build a measurable off-site growth engine with one accountable team across recruitment, activation, attribution and optimization.</p><a href="#contact">Explore brand solutions <b>↗</b></a></article>
        <article className="solution-publisher" data-reveal><span>FOR PUBLISHERS</span><h2>Monetize the<br />trust you built.</h2><p>Access curated offers, clear commissions, useful campaign assets and responsive account support across global markets.</p><a href="https://www.yeahpromos.com/index/login/signin">Join the network <b>→</b></a></article>
      </section>

      <section className="performance-loop">
        <div className="loop-copy" data-reveal><span>04 / PERFORMANCE MODEL</span><h2>Lower risk.<br /><em>Higher accountability.</em></h2><p>Brands pay commission after a real sale is generated. Clear tracking connects investment, partner contribution and commercial outcome.</p></div>
        <div className="loop-visual" aria-label="Brands, publishers, consumers and commerce loop"><div className="loop-ring ring-one" /><div className="loop-ring ring-two" /><div className="loop-ring ring-three" /><div className="loop-center"><img src="/yeahpromos-p-mark.png" alt="" /></div><i className="loop-node node-brand">Brands</i><i className="loop-node node-publisher">Publishers</i><i className="loop-node node-commerce">Commerce</i><i className="loop-node node-consumer">Consumers</i></div>
      </section>

      <section className="exp-contact" id="contact"><div className="contact-aura" /><span>READY TO GROW?</span><h2>Your next market is<br /><em>closer than it looks.</em></h2><div className="contact-links"><a href="mailto:merchant@yeahpromos.com"><small>FOR MERCHANTS & BRANDS</small><strong>Launch your program</strong><span>merchant@yeahpromos.com ↗</span></a><a href="https://www.yeahpromos.com/index/login/signin"><small>FOR INFLUENCERS & PUBLISHERS</small><strong>Join the network</strong><span>Apply online ↗</span></a></div></section>

      <footer className="exp-footer"><div><img src="/yeahpromos-logo.png" alt="YeahPromos" /><span>Performance Partnership Network</span></div><p>© 2026 YeahPromos. All rights reserved.</p><div><a href="#network">Network</a><a href="#method">Method</a><a href="#partners">Partners</a></div></footer>
    </main>
  );
}
