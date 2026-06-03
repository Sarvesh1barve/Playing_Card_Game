function TextList({ items }) {
  return (
    <ul className="guide-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function GameGuides({ copy, language, games }) {
  const labels = copy.guideSections

  return (
    <section className="content-stack">
      <div className="section-heading">
        <p className="eyebrow">{copy.nav.guides}</p>
        <h1>{copy.actions.gameGuides}</h1>
        <p>{copy.disclaimer}</p>
      </div>

      <div className="guides-grid">
        {games.map((game, index) => {
          const guide = game.guide[language]

          return (
            <details className="guide-card" key={game.id} open={index === 0}>
              <summary>
                <span>{game.name.en}</span>
                <strong>{game.name.mr}</strong>
              </summary>
              <div className="guide-body">
                <section>
                  <h3>{labels.overview}</h3>
                  <p>{guide.overview}</p>
                </section>
                <section>
                  <h3>{labels.players}</h3>
                  <p>{guide.players}</p>
                </section>
                <section>
                  <h3>{labels.cardsUsed}</h3>
                  <p>{guide.cardsUsed}</p>
                </section>
                <section>
                  <h3>{labels.objective}</h3>
                  <p>{guide.objective}</p>
                </section>
                <section>
                  <h3>{labels.basicRules}</h3>
                  <TextList items={guide.basicRules} />
                </section>
                <section>
                  <h3>{labels.turnFlow}</h3>
                  <TextList items={guide.turnFlow} />
                </section>
                <section>
                  <h3>{labels.winningCondition}</h3>
                  <p>{guide.winningCondition}</p>
                </section>
                <section>
                  <h3>{labels.difficulty}</h3>
                  <p>{guide.difficulty}</p>
                </section>
                <section>
                  <h3>{labels.localNotes}</h3>
                  <p>{guide.localNotes}</p>
                </section>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}

export default GameGuides
