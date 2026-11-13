const form = document.getElementById("form-item");
const inputNome = document.getElementById("nome");
const inputQuantidade = document.getElementById("quantidade");
const inputPreco = document.getElementById("preco");
const selectCategoria = document.getElementById("categoria");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const mensagem = document.getElementById("mensagem");

const lista = document.getElementById("lista");
const listaVazia = document.getElementById("lista-vazia");
const inputBusca = document.getElementById("busca");
const botoesFiltro = document.querySelectorAll(".filtro");

const totalItens = document.getElementById("total-itens");
const totalComprados = document.getElementById("total-comprados");
const valorTotal = document.getElementById("valor-total");
const progresso = document.getElementById("progresso");

const btnLimparComprados = document.getElementById("btn-limpar-comprados");
const btnLimparTudo = document.getElementById("btn-limpar-tudo");

let itens = carregarItens();
let filtroAtual = "todos";
let idEmEdicao = null;

function carregarItens() {
  try {
    const dados = localStorage.getItem("listaDeCompras");
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    return [];
  }
}

function salvarItens() {
  try {
    localStorage.setItem("listaDeCompras", JSON.stringify(itens));
  } catch (erro) {
    // Se o navegador bloquear o localStorage, a lista funciona só nesta sessão
  }
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mostrarMensagem(texto, sucesso = false) {
  mensagem.textContent = texto;
  mensagem.className = sucesso ? "mensagem sucesso" : "mensagem";
  setTimeout(() => (mensagem.textContent = ""), 2500);
}

function limparFormulario() {
  form.reset();
  inputQuantidade.value = 1;
  idEmEdicao = null;
  btnSalvar.textContent = "Adicionar";
  btnCancelar.classList.add("escondido");
  inputNome.focus();
}

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nome = inputNome.value.trim();
  const quantidade = parseInt(inputQuantidade.value) || 1;
  const preco = parseFloat(inputPreco.value) || 0;
  const categoria = selectCategoria.value;

  if (nome === "") {
    mostrarMensagem("Digite o nome do produto.");
    return;
  }

  if (idEmEdicao !== null) {
    const item = itens.find((i) => i.id === idEmEdicao);
    item.nome = nome;
    item.quantidade = quantidade;
    item.preco = preco;
    item.categoria = categoria;
    mostrarMensagem("Item atualizado!", true);
  } else {
    const repetido = itens.some(
      (i) => i.nome.toLowerCase() === nome.toLowerCase(),
    );
    if (repetido) {
      mostrarMensagem("Esse produto já está na lista.");
      return;
    }

    itens.push({
      id: Date.now(),
      nome: nome,
      quantidade: quantidade,
      preco: preco,
      categoria: categoria,
      comprado: false,
    });
    mostrarMensagem("Item adicionado!", true);
  }

  salvarItens();
  limparFormulario();
  renderizar();
});

btnCancelar.addEventListener("click", limparFormulario);

function alternarComprado(id) {
  const item = itens.find((i) => i.id === id);
  item.comprado = !item.comprado;
  salvarItens();
  renderizar();
}

function editarItem(id) {
  const item = itens.find((i) => i.id === id);
  inputNome.value = item.nome;
  inputQuantidade.value = item.quantidade;
  inputPreco.value = item.preco || "";
  selectCategoria.value = item.categoria;

  idEmEdicao = id;
  btnSalvar.textContent = "Salvar";
  btnCancelar.classList.remove("escondido");
  inputNome.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function removerItem(id) {
  itens = itens.filter((i) => i.id !== id);
  if (idEmEdicao === id) limparFormulario();
  salvarItens();
  renderizar();
}

botoesFiltro.forEach(function (botao) {
  botao.addEventListener("click", function () {
    botoesFiltro.forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    filtroAtual = botao.dataset.filtro;
    renderizar();
  });
});

inputBusca.addEventListener("input", renderizar);

btnLimparComprados.addEventListener("click", function () {
  const quantos = itens.filter((i) => i.comprado).length;
  if (quantos === 0) {
    mostrarMensagem("Nenhum item comprado para remover.");
    return;
  }
  itens = itens.filter((i) => !i.comprado);
  salvarItens();
  renderizar();
});

btnLimparTudo.addEventListener("click", function () {
  if (itens.length === 0) return;
  if (confirm("Tem certeza que deseja apagar toda a lista?")) {
    itens = [];
    limparFormulario();
    salvarItens();
    renderizar();
  }
});

function criarElementoItem(item) {
  const li = document.createElement("li");
  li.className = item.comprado ? "item comprado" : "item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = item.comprado;
  checkbox.title = "Marcar como comprado";
  checkbox.addEventListener("change", () => alternarComprado(item.id));

  const info = document.createElement("div");
  info.className = "item-info";

  const nome = document.createElement("div");
  nome.className = "item-nome";
  nome.textContent = item.nome;

  const detalhes = document.createElement("div");
  detalhes.className = "item-detalhes";
  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta";
  etiqueta.textContent = item.categoria;
  detalhes.appendChild(etiqueta);
  detalhes.append(
    item.quantidade +
      " un." +
      (item.preco > 0 ? " × " + formatarMoeda(item.preco) : ""),
  );

  info.appendChild(nome);
  info.appendChild(detalhes);

  const subtotal = document.createElement("span");
  subtotal.className = "item-subtotal";
  subtotal.textContent =
    item.preco > 0 ? formatarMoeda(item.preco * item.quantidade) : "—";

  const botoes = document.createElement("div");
  botoes.className = "item-botoes";

  const btnEditar = document.createElement("button");
  btnEditar.className = "btn-icone";
  btnEditar.setAttribute("aria-label", "Editar item");
  const iconeEditar = document.createElement("i");
  iconeEditar.setAttribute("data-lucide", "pencil");
  iconeEditar.setAttribute("aria-hidden", "true");
  btnEditar.appendChild(iconeEditar);
  btnEditar.title = "Editar";
  btnEditar.addEventListener("click", () => editarItem(item.id));

  const btnRemover = document.createElement("button");
  btnRemover.className = "btn-icone";
  btnRemover.setAttribute("aria-label", "Remover item");
  const iconeRemover = document.createElement("i");
  iconeRemover.setAttribute("data-lucide", "trash-2");
  iconeRemover.setAttribute("aria-hidden", "true");
  btnRemover.appendChild(iconeRemover);
  btnRemover.title = "Remover";
  btnRemover.addEventListener("click", () => removerItem(item.id));

  botoes.appendChild(btnEditar);
  botoes.appendChild(btnRemover);

  li.appendChild(checkbox);
  li.appendChild(info);
  li.appendChild(subtotal);
  li.appendChild(botoes);
  return li;
}

function atualizarResumo() {
  const comprados = itens.filter((i) => i.comprado).length;
  const total = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);

  totalItens.textContent = itens.length;
  totalComprados.textContent = comprados;
  valorTotal.textContent = formatarMoeda(total);

  const porcentagem = itens.length > 0 ? (comprados / itens.length) * 100 : 0;
  progresso.style.width = porcentagem + "%";
}

function renderizar() {
  lista.innerHTML = "";
  const termo = inputBusca.value.trim().toLowerCase();

  const filtrados = itens.filter(function (item) {
    if (filtroAtual === "pendentes" && item.comprado) return false;
    if (filtroAtual === "comprados" && !item.comprado) return false;
    return item.nome.toLowerCase().includes(termo);
  });

  filtrados.sort((a, b) => a.comprado - b.comprado);

  filtrados.forEach((item) => lista.appendChild(criarElementoItem(item)));

  if (itens.length === 0) {
    listaVazia.textContent = "Sua lista está vazia. Adicione um item acima!";
    listaVazia.style.display = "block";
  } else if (filtrados.length === 0) {
    listaVazia.textContent = "Nenhum item encontrado.";
    listaVazia.style.display = "block";
  } else {
    listaVazia.style.display = "none";
  }

  atualizarResumo();
  lucide.createIcons();
}

renderizar();
