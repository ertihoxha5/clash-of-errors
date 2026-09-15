import BreachHost from "./BreachHost";

export default function BreachPage() {
  return <main>
    <header className="topbar">
      <a className="brand" href="/"><img src="/assets/logo.png" alt="Clash of Errors" /></a>
      <nav aria-label="Game navigation">
        <a className="profile-link" href="/play">Bug Hunter</a>
        <a className="profile-link" href="/dashboard">Coding arenas</a>
        <a className="profile-link" href="/">Return home</a>
      </nav>
    </header>
    <BreachHost />
  </main>;
}
