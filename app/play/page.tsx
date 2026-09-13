import UnityHost from "./UnityHost";

export default function PlayPage() {
  return <main>
    <header className="topbar">
      <a className="brand" href="/"><img src="/assets/logo.png" alt="Clash of Errors" /></a>
      <nav aria-label="Game navigation"><a className="profile-link" href="/">Return home</a><a className="profile-link" href="/dashboard">Coding arenas</a></nav>
    </header>
    <UnityHost />
  </main>;
}
