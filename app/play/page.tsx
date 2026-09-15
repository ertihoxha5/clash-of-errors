import BugHunter from "./BugHunter";

export default function PlayPage() {
  return <main>
    <header className="topbar">
      <a className="brand" href="/"><img src="/assets/logo.png" alt="Clash of Errors" /></a>
      <nav aria-label="Game navigation"><a className="profile-link" href="/">Return home</a><a className="profile-link" href="/dashboard">Coding arenas</a><a className="profile-link" href="/rewards">Daily spin & badges</a><a className="profile-link" href="/play/breach">System Breach preview</a></nav>
    </header>
    <BugHunter />
  </main>;
}
