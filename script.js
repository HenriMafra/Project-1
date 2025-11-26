document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------
    // Variáveis Globais e Inicialização do Carrinho
    // ----------------------------------
    let cart = [];
    const CART_STORAGE_KEY = 'saberSimplesCart';
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalValue = document.getElementById('cart-total-value');
    const cartCounter = document.getElementById('cart-counter');
    const checkoutBtn = document.getElementById('checkout-btn');
    const guideCards = document.querySelectorAll('.guide-card');
    
    /**
     * Carrega o carrinho do localStorage e o inicializa.
     */
    function loadCart() {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
        updateCartUI();
    }

    /**
     * Salva o estado atual do carrinho no localStorage.
     */
    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    /**
     * Adiciona um guia ao carrinho ou incrementa sua quantidade.
     * @param {string} id - ID único do guia.
     * @param {string} name - Nome do guia.
     * @param {number} price - Preço unitário.
     */
    function adicionarAoCarrinho(id, name, price) {
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            // Se o preço é fixo de R$1, a quantidade é sempre 1 no nosso modelo (1 compra por guia).
            // A menos que queiramos permitir a compra de mais de 1 cópia, o que não parece ser o caso.
            // Para este modelo (R$1 fixo, sem descontos), a lógica é apenas adicionar/remover o guia.
            // Para fins de simplicidade e aderência ao modelo 'cada guia a 1 real', mantemos a quantidade em 1.
            alert(`O guia "${name}" já está no seu carrinho.`);
            return;
        } else {
            cart.push({ id, name, price, quantity: 1 });
            // Animação de Feedback (microinteração)
            const cartBtn = document.querySelector('.cart-button');
            cartBtn.classList.add('pulse-effect');
            setTimeout(() => cartBtn.classList.remove('pulse-effect'), 500);
            
            // Exibe mensagem de sucesso
            alert(`"${name}" adicionado ao carrinho!`);
        }

        saveCart();
        updateCartUI();
        toggleCartSidebar(true); // Abre o carrinho
    }

    /**
     * Remove um guia do carrinho.
     * @param {string} id - ID do guia a ser removido.
     */
    function removerDoCarrinho(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
    }

    /**
     * Limpa todo o carrinho.
     */
    function limparCarrinho() {
        if (confirm("Tem certeza que deseja limpar todo o carrinho?")) {
            cart = [];
            saveCart();
            updateCartUI();
        }
    }

    /**
     * Calcula o total do carrinho.
     * @returns {number} O valor total.
     */
    function calcularTotalCarrinho() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * Atualiza a interface do carrinho (lista de itens, total e contador).
     */
    function updateCartUI() {
        const total = calcularTotalCarrinho();
        cartTotalValue.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

        // Atualiza Contador Fixo
        const totalItems = cart.length; // Quantidade de guias distintos
        cartCounter.textContent = totalItems;
        cartCounter.classList.toggle('active', totalItems > 0);

        // Atualiza a Lista de Itens
        cartItemsContainer.innerHTML = ''; // Limpa antes de reconstruir
        
        if (totalItems === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Seu carrinho está vazio.</p>';
            checkoutBtn.disabled = true;
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>1 x R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <button class="remove-item" aria-label="Remover ${item.name}" data-id="${item.id}">×</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
            checkoutBtn.disabled = false;
        }
    }

    /**
     * Abre ou fecha a sidebar do carrinho.
     * @param {boolean} [forceOpen] - Força a abertura.
     */
    window.toggleCartSidebar = (forceOpen = false) => {
        const isOpen = cartSidebar.classList.contains('open');
        if (forceOpen || !isOpen) {
            cartSidebar.classList.add('open');
            cartSidebar.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Bloqueia scroll do body
        } else {
            cartSidebar.classList.remove('open');
            cartSidebar.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };
    
    // Adiciona o listener para remover itens
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const idToRemove = e.target.getAttribute('data-id');
            removerDoCarrinho(idToRemove);
        }
    });

    // ----------------------------------
    // Event Listeners (Adicionar ao Carrinho)
    // ----------------------------------

    guideCards.forEach(card => {
        const addButton = card.querySelector('.add-to-cart');
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const price = parseFloat(card.getAttribute('data-price'));

        // Transição suave no hover para feedback
        card.addEventListener('mouseenter', () => card.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)');
        card.addEventListener('mouseleave', () => card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)');

        addButton.addEventListener('click', (e) => {
            e.preventDefault();
            adicionarAoCarrinho(id, name, price);
        });
    });

    window.limparCarrinho = limparCarrinho; // Expõe para o botão HTML

    // ----------------------------------
    // Finalizar Compra
    // ----------------------------------
    window.finalizarCompra = () => {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione guias antes de finalizar a compra!');
            return;
        }

        const total = calcularTotalCarrinho().toFixed(2).replace('.', ',');
        const itemsList = cart.map(item => `- ${item.name} (R$ ${item.price.toFixed(2).replace('.', ',')})`).join('\n');
        
        const confirmationMessage = `
            Resumo da Compra:
            ${itemsList}
            
            Total a Pagar: R$ ${total}
            
            Confirma a finalização da compra? (Simulação)
        `;

        if (confirm(confirmationMessage)) {
            // Simulação de processamento de pagamento
            alert('✅ Pedido finalizado com sucesso! (Simulação de pagamento). Você receberá os guias em seu e-mail.');
            
            // Limpa o carrinho após a simulação
            cart = [];
            saveCart();
            updateCartUI();
            toggleCartSidebar(false);
        }
    };

    // ----------------------------------
    // Animações de Scroll (IntersectionObserver)
    // ----------------------------------
    
    // Verifica a disponibilidade do IntersectionObserver
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Para de observar após a animação
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in, .slide-up').forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback: garante a visibilidade dos elementos se o Observer não for suportado
        document.querySelectorAll('.fade-in, .slide-up').forEach(element => {
            element.classList.add('visible');
        });
    }

    // ----------------------------------
    // Rolagem Suave (Smooth Scroll)
    // ----------------------------------
    document.querySelectorAll('.main-nav a, .logo, .btn-cta').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - (document.querySelector('.main-header').offsetHeight),
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ----------------------------------
    // Formulário de Contato (Validação Básica)
    // ----------------------------------
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulação de validação e envio
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();

        if (name === "" || email === "") {
            formFeedback.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            formFeedback.style.color = '#d32f2f';
            return;
        }

        // Simulação de sucesso
        formFeedback.textContent = '📧 Mensagem enviada com sucesso! Em breve entraremos em contato.';
        formFeedback.style.color = var(--color-accent); // Usa a cor de acento para feedback positivo
        
        contactForm.reset();
        
        // Limpa a mensagem após 5 segundos
        setTimeout(() => {
            formFeedback.textContent = '';
        }, 5000);
    });

    // ----------------------------------
    // Inicialização
    // ----------------------------------
    loadCart();
});