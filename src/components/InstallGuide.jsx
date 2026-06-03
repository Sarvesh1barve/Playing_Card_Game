function InstallGuide({ copy }) {
  return (
    <section className="content-stack">
      <div className="section-heading">
        <p className="eyebrow">{copy.actions.installApp}</p>
        <h1>{copy.actions.installApp}</h1>
        <p>{copy.disclaimer}</p>
      </div>

      <div className="install-grid">
        <article className="install-panel">
          <h2>{copy.install.androidTitle}</h2>
          <ol>
            {copy.install.androidSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="install-panel">
          <h2>{copy.install.iphoneTitle}</h2>
          <ol>
            {copy.install.iphoneSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  )
}

export default InstallGuide
