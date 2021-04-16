let nome = "";
let logado = false;
let id2 = null;
let userSelected = "Todos";
let contatoAntigo = "";
let visibilidadeAntigo = "";
let msgType = "message";
let auto = false;

function logarEnter() {
    if (event.key === 'Enter') {
        logar();
    }
}

function logar() {
    nome = document.querySelector(".entrada-usuario").value;
    if (nome !== "") {
        const promisse = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants", { name: nome })
        promisse.then(entrarNaSala);
        promisse.catch(tratarErro);
        hideLogin();
    }
}

function tratarErro(erro) {
    novo = nome.trim();
    if (erro.response.status === 400 && novo === "") {
        alert("Error: 400 \n Nome de usuário inválido");
        showLogin();
        return;
    }
    if (erro.response.status === 400 && logado) {
        alert("Error: 400 \n Ocorreu um problema na conexão com o Servidor")
        window.location.reload();
    }
    if (erro.response.status === 400 && !logado) {
        alert("Error: 400 \n Esse nome de usuário já está em uso")
        window.location.reload();
    }
}

function entrarNaSala(resposta) {
    let elemento = document.querySelector(".login");
    elemento.classList.add("hidden");
    logado = true;
    const id = setInterval(manterConexão, 4500);
    buscarMsg(resposta);
}

function manterConexão() {
    const promisse = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/status", { name: nome })
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
}

function buscarMsg(resposta) {
    const promisse = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages');
    promisse.then(renderizarMsgAutoEnabled);
    promisse.catch(tratarErro);
}

function renderizarMsg(resposta) {
    const mensagens = resposta.data;
    const elemento = document.querySelector(".msg-feed");
    elemento.innerHTML = "";
    for (let i = 0; i < mensagens.length; i++) {
        if (mensagens[i].type === "status") {
            elemento.innerHTML += `<li class="msg-box ${mensagens[i].type}">
                                    <span class="time">(${mensagens[i].time})</span>
                                    <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong>&nbsp;${mensagens[i].text}</span>
                                </li>`;
        }
        if (mensagens[i].type === "message") {
            elemento.innerHTML += `<li class="msg-box">
                                        <span class="time">(${mensagens[i].time})</span>
                                        <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong> para <strong>${mensagens[i].to}</strong>: ${mensagens[i].text}</span>
                                    </li>`
        }
        if ((mensagens[i].type === "private_message") && ((mensagens[i].to === nome) || (mensagens[i].from === nome))) {
            elemento.innerHTML += `<li class="msg-box private">
                                        <span class="time">(${mensagens[i].time})</span>
                                        <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong> reservadamente para <strong>&nbsp;${mensagens[i].to}</strong>: ${mensagens[i].text}</span>
                                    </li>`
        }
    }
    document.querySelector(".msg-box:last-child").scrollIntoView();
}

function enviarEnter() {
    if (event.key === 'Enter') {
        enviarMsg();
    }
}

function enviarMsg(msg) {
    if (userSelected === "Todos" && msgType === "private_message") {
        alert("Impossivel mandar menssagens privadas para todos \n\nVisibilidade alterada para Público")
        let visibilidade = document.querySelector(".visivel");
        selecionarVisibilidade(visibilidade);
    }
    let elemento = document.querySelector(".text-bar input").value;
    if (document.querySelector(".text-bar input").value === "") return;
    if (document.querySelector(".text-bar input").value === "!bot=on") auto = true;
    if (document.querySelector(".text-bar input").value === "!bot=off") auto = false;
    const promisse = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages', { from: nome, to: userSelected, text: elemento, type: msgType });
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
    document.querySelector(".text-bar input").value = "";
}

function hideLogin() {
    let elemento = document.querySelector(".campo-insercao");
    elemento.classList.add("hidden");
    elemento = document.querySelector(".loading");
    elemento.classList.remove("hidden");
}

function showLogin() {
    let elemento = document.querySelector(".campo-insercao");
    elemento.classList.remove("hidden");
    elemento = document.querySelector(".loading");
    elemento.classList.add("hidden");
    document.querySelector(".entrada-usuario").value = "";
}

function mostrarMenu() {
    const elemento = document.querySelector(".tela-menu");
    elemento.classList.remove("hidden");
    buscarContatos();
    id2 = setInterval(buscarContatos, 5000);
}

function esconderMenu(elemento) {
    elemento.parentNode.classList.add("hidden");
    clearInterval(id2);
}

function buscarContatos() {
    const promisse = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants");
    promisse.then(renderizarContatos);
}

function renderizarContatos(resposta) {
    contatos = resposta.data;
    const elemento = document.querySelector(".contatos");
    elemento.innerHTML = "";
    for (let i = 0; i < contatos.length; i++) {
        if (userSelected === contatos[i].name) {
            elemento.innerHTML += `<li class="user-selected" onclick="selecionarContato(this)">
                            <ion-icon name="person-circle"></ion-icon>
                            <p>${contatos[i].name}</p>
                            <ion-icon class="check" name="checkmark"></ion-icon>
                         </li>`
        } else if (contatos[i].name === nome) {
            elemento.innerHTML += ``;
        } else {
            elemento.innerHTML += ` <li onclick="selecionarContato(this)">
                                        <ion-icon name="person-circle"></ion-icon>
                                        <p>${contatos[i].name}</p>
                                        <ion-icon class="check hidden" name="checkmark"></ion-icon>
                                    </li>`;
        }
    }
}

function selecionarContato(contato) {
    if (contatoAntigo === "") {
        contatoAntigo = document.querySelector(".user-selected");
    }
    contatoAntigo.classList.remove(".user-selected");
    contatoAntigo.querySelector(".check").classList.add("hidden");
    contato.classList.add("user-selected");
    contato.querySelector(".check").classList.remove("hidden");
    userSelected = contato.querySelector("p").innerHTML;
    contatoAntigo = contato;


}

function selecionarVisibilidade(visibilidade) {
    if (visibilidadeAntigo === "") {
        visibilidadeAntigo = document.querySelector(".selected");
    }
    visibilidadeAntigo.classList.remove("selected");
    visibilidadeAntigo.querySelector(".check").classList.add("hidden");
    visibilidade.classList.add("selected");
    visibilidade.querySelector(".check").classList.remove("hidden");
    if (document.querySelector(".selected").classList.contains("visivel")) {
        msgType = "message";
    }
    if (document.querySelector(".selected").classList.contains("privado")) {
        msgType = "private_message";
    }
    console.log(msgType);
    visibilidadeAntigo = visibilidade;
}

//daqui pra baixo chat-bot

function renderizarMsgAutoEnabled(resposta) {
    const mensagens = resposta.data;
    const elemento = document.querySelector(".msg-feed");
    elemento.innerHTML = "";
    for (let i = 0; i < mensagens.length; i++) {
        if (mensagens[i].type === "status") {
            elemento.innerHTML += `<li class="msg-box ${mensagens[i].type}">
                                    <span class="time">(${mensagens[i].time})</span>
                                    <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong>&nbsp;${mensagens[i].text}</span>
                                </li>`;
        }
        if (mensagens[i].type === "message") {
            elemento.innerHTML += `<li class="msg-box">
                                        <span class="time">(${mensagens[i].time})</span>
                                        <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong> para <strong>${mensagens[i].to}</strong>: ${mensagens[i].text}</span>
                                    </li>`
        }
        if ((mensagens[i].type === "private_message") && ((mensagens[i].to === nome) || (mensagens[i].from === nome))) {
            elemento.innerHTML += `<li class="msg-box private">
                                        <span class="time">(${mensagens[i].time})</span>
                                        <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong> reservadamente para <strong>&nbsp;${mensagens[i].to}</strong>: ${mensagens[i].text}</span>
                                    </li>`
        }
        // if (auto) {
        //     if (mensagens[i].from !== nome && mensagens[i].text === "entra na sala...") {
        //         enviarMsgAuto("Olá seja bem vindo " + mensagens[i].from, mensagens[i].from);
        //     }
        //     if (mensagens[i].from !== nome && (mensagens[i].text === "oi" || mensagens[i].text === "ola" || mensagens[i].text === "oii" || mensagens[i].text === "olá" || mensagens[i].text === "alo")) {
        //         enviarMsgAuto("Oii :D " + mensagens[i].from, mensagens[i].from);
        //         return;
        //     }
        // }

    }
    document.querySelector(".msg-box:last-child").scrollIntoView();
}

function enviarMsgAuto(msg, to) {
    if (userSelected === "Todos" && msgType === "private_message") {
        alert("Impossivel mandar menssagens privadas para todos \n\nVisibilidade alterada para Público")
        let visibilidade = document.querySelector(".visivel");
        selecionarVisibilidade(visibilidade);
    }
    const promisse = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages', { from: nome, to: to, text: msg, type: msgType });
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
    document.querySelector(".text-bar input").value = "";
}