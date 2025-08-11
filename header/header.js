document.addEventListener("DOMContentLoaded", ()=>{
    document.body.insertAdjacentHTML("afterbegin", 
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
        <li><a href="projects.html">SEUS PROJETOS</a></li>
        <li><a href="sobre.html">SOBRE</a></li>
        <li><a href="tutorial.html">TUTORIAL</a></li>
    </ul>
</div>
`);
})