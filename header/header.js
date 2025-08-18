document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <header id="DefaultHeader">
        <img id="logo" src="favicon.ico" alt="Logo" onclick="window.location.href = 'home.html'">
        <h1>Artephy</h1>
        <a href="home.html">Home</a>
        <a href="home.html#sobre">Sobre</a>
        <a href="projects.html">Meus Projetos</a>
        <a href="tutorial.html">Tutorial</a>
    </header>
    `,
    document.body.querySelector("nav").insertAdjacentHTML(
      "beforeend",
      `
        <footer>
            <nav>
                <a href="home.html">Home</a> • 
                <a href="home.html#sobre">Sobre</a> • 
                <a href="projects.html">Meus Projetos</a> • 
                <a href="tutorial.html">Tutorial</a>
            </nav>
            <p>&copy; 2025 Artephy - Instituto Federal Catarinense</p>
        </footer>
        `
    )
  );
});
