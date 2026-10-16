var somClique = document.getElementById("clickMouse");
var botaoSom = document.getElementById("btnAudio");

function carregarPreferenciaSom() {
  try {
    return localStorage.getItem("somAtivo") !== "false";
  } catch {
    return true;
  }
}

function salvarPreferenciaSom() {
  try {
    localStorage.setItem("somAtivo", somAtivo);
  } catch {
    return;
  }
}

var somAtivo = carregarPreferenciaSom();

function atualizarBotaoSom() {
  if (!botaoSom) return;

  botaoSom.textContent = somAtivo ? "🔊" : "🔇";
  botaoSom.setAttribute("aria-label", somAtivo ? "Desativar som" : "Ativar som");
}

atualizarBotaoSom();
if (somClique) somClique.playbackRate = 1.5;

document.addEventListener("click", function(event) {
  if (!(event.target instanceof Element)) return;

  if (event.target.closest("#btnAudio")) {
    somAtivo = !somAtivo;
    salvarPreferenciaSom();
    atualizarBotaoSom();

    if (!somAtivo) {
      if (somClique) {
        somClique.pause();
        somClique.currentTime = 0;
      }
    }
    return;
  }

  var clicavel = event.target.closest(".card, #PlayBTN");
  if (!clicavel || !somAtivo || !somClique) return;

  var link = clicavel.closest("a");
  var aguardarAudio = link &&
    event.button === 0 &&
    !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey &&
    (!link.target || link.target.toLowerCase() === "_self") &&
    !link.hasAttribute("download") &&
    new URL(link.href, location.href).origin === location.origin;

  if (!aguardarAudio) {
    somClique.currentTime = 0;
    somClique.play().catch(function() {});
    return;
  }

  event.preventDefault();

  var navegou = false;
  var temporizador;
  var navegar = function() {
    if (navegou) return;
    navegou = true;
    clearTimeout(temporizador);
    somClique.removeEventListener("ended", navegar);
    location.assign(link.href);
  };

  somClique.addEventListener("ended", navegar);
  temporizador = setTimeout(navegar, 3000);
  somClique.currentTime = 0;
  somClique.play().catch(navegar);
}, true);