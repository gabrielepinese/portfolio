var english = document.getElementById("en"),
  italian = document.getElementById("it"),
  
  //Testo in inglese
  about = document.getElementById("about"),
  hi = document.getElementById("hi"),
  firstdesc = document.getElementById("firstdesc"),
  secdesc = document.getElementById("secdesc"),
  exp = document.getElementById("exp"),
  workexp = document.getElementById("workexp"),
  twow = document.getElementById("twow"),
  twoy = document.getElementById("twoy"),
  twodesc = document.getElementById("twodesc"),
  onew = document.getElementById("onew"),
  onedesc = document.getElementById("onedesc"),
  study = document.getElementById("study"),
  twostudy = document.getElementById("twostudy"),
  twostudyy = document.getElementById("twostudyy"),
  twostudydesc = document.getElementById("twostudydesc"),
  onestudy = document.getElementById("onestudy"),
  onestudyy = document.getElementById("onestudyy"),
  onestudydesc = document.getElementById("onestudydesc"),
  contactme = document.getElementById("contactme"),
  portfolio = document.getElementById("portfolio");
  
  //Testo in italiano
  
  
// declare some variables to catch the various HTML elements

//--------Identificare l'evento di click

english.addEventListener("click", function() {
    change(english, italian);
  }, false
);
// add an event listener to listen to when the user clicks on one of the language span tags
// this triggers our custom "change" function, which we will define later

italian.addEventListener("click", function() {
    change(italian, english);
  }, false
);

//--------Al click del bottone

function change(lang_on, lang_off1) {
  if (!lang_on.classList.contains("current_lang")) {
    // if the span that the user clicks on does not have the "current_lang" class
    lang_on.classList.add("current_lang");
    // add the "current_lang" class to it
    lang_off1.classList.remove("current_lang");
    // remove the "current_lang" class from the other span
  }

  if (lang_on.innerHTML == "EN") {
    about.classList.add("english");
    about.classList.remove("italian");

    about.innerHTML = "About Me";
    hi.innerHTML = "Hi!";
    firstdesc.innerHTML = "I am a guy who likes to program and always experiment with new things. During my training at the university, I had the opportunity to learn a fair number of languages but above all to learn about new types of programming.";
    secdesc.innerHTML = "Outside the university I had the opportunity to collaborate, on behalf of my high school, in the creation of websites and java applications; furthermore, working with java, I became passionate about the work of the mobile developer, learning the basics of android and frameworks like Flutter thus creating test-apps for fun.";
    exp.innerHTML = "My experiences";
    workexp.innerHTML = "Work experiences";
    twow.innerHTML = "ICT developer";
    twoy.innerHTML = "DoDifferent, 2022 - Present";
    twodesc.innerHTML = "I am currently working as a Java Backend developer and Tester in microservices development";
    onew.innerHTML = "Stage - Systems Engineer";
    onedesc.innerHTML= "I worked for a month as an intern on behalf of my school; my job consisted of repairing computers by removing any viruses and / or harmful programs, improving machine performance and installing new work sets";
    study.innerHTML = "Instruction";
    twostudy.innerHTML = "Bachelor's Degree in Computer Science and Technology";
    twostudyy.innerHTML = "University of Milan - 2016 - 2022";
    twostudydesc.innerHTML = "The university years helped me not only on an educational level but also on an emotional level; programming together with other students but also professors, I was able to discover new programming styles and code analysis techniques. Also, being in close contact with a small team of students while developing projects allows you to see things from a different perspective";
    onestudy.innerHTML = "Computer expert";
    onestudyy.innerHTML = "IIS Falcone-Righi - 2011 - 2016, Corsico, Milan, Italy";
    onestudydesc.innerHTML = "During my school years I was able to approach programming for the first time, learning what was my first programming language ... Java";
    contactme.innerHTML = "Contact Me!";
    portfolio.innerHTML = "Portfolio of Gabriele Pinese, 2022";
  }
  
  else if (lang_on.innerHTML == "IT") {
    about.classList.add("italian");
    // first line adds the corrent language class to the text
    about.classList.remove("english");
    // second and third line removes the other language classes
    // this allows you to apply CSS that is specific to each language
  
    about.innerHTML = "Qualcosa su di me";
    hi.innerHTML = "Ciao!";
    firstdesc.innerHTML = "Sono un ragazzo a cui piace programmare e sperimentare sempre cose nuove. Durante il mio percorso di formazione presso l'università, ho avuto modo di imparare un numero discreto di linguaggi ma soprattutto di conoscere nuovi tipi di programmazione.";
    secdesc.innerHTML = "Fuori dall'università ho avuto modo di collaborare, per conto della mia scuola superiore, nella creazione di siti web e applicativi java; inoltre lavorando con java mi sono appassionato al lavoro del mobile developer, imparando le basi di android e framework come Flutter creando così delle test-app per divertimento.";
    exp.innerHTML = "Le mie Esperienze";
    workexp.innerHTML = "Esperienze lavorative";
    twow.innerHTML = "Sviluppatore ICT";
    twoy.innerHTML = "DoDifferent, 2022 - Presente";
    twodesc.innerHTML = "Attualmente sto lavorando come sviluppatore Java Backend e Tester nello sviluppo di microservizi";
    onew.innerHTML = "Stage - Sistemista";
    onedesc.innerHTML= "Ho lavorato un mese come stagista per conto della mia scuola; il mio lavoro consisteva nel riparare computer rimuovendo eventuali virus e/o programmi dannosi, migliorare le performance della macchina e installare nuovi set lavorativi";
    study.innerHTML = "Istruzione";
    twostudy.innerHTML = "Laurea Triennale in Scienze e Tecnologie Informatiche";
    twostudyy.innerHTML = "Università degli Studi di Milano - 2016 - 2022";
    twostudydesc.innerHTML = "Gli anni universitari mi hanno aiutato non solo a livello formativo ma anche emotivo; programmando insieme ad altri studenti ma anche professori, ho avuto modo di scoprire nuovi stili di programmazione e tecniche di analisi del codice. Inoltre, stando a stretto contatto con un piccolo team di studenti sviluppando progetti permette di vedere le cose da una prospettiva diversa";
    onestudy.innerHTML = "Perito Informatico";
    onestudyy.innerHTML = "IIS Falcone-Righi - 2011 - 2016, Corsico, Milano, Italia";
    onestudydesc.innerHTML = "Nel corso dei miei anni scolastici ho avuto modo di avvicinarmi per la prima volta alla programmazione, imparando quello che è stato il mio primo linguaggio di programmazione... Java";
    contactme.innerHTML = "Contattami!";
    portfolio.innerHTML = "Portfolio di Gabriele Pinese, 2022";
  }
}
