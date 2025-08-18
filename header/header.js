document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <header id="DefaultHeader">
        <img id="menu" src="header/menu.png" alt="Menu">
        <img id="logo" src="favicon.ico" alt="Logo" >
        <h1>Artephy</h1>
    </header>
    <div id="background-black"></div>
    <div id="BarraMenu">
        <img id="LogoMenu" src="favicon.ico" alt="Logo">
        <h1>Artephy</h1>
        <ul>
            <li><a href="home.html">HOME</a></li>
            <li><a href="home.html#sobre">SOBRE</a></li>
            <li><a href="projects.html">SEUS PROJETOS</a></li>
            <li><a href="tutorial.html">TUTORIAL</a></li>
        </ul>
    </div>
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
