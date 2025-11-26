/* ========================================
   SABER SIMPLES - SCRIPT PRINCIPAL
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ========================================
    // VARIÁVEIS GLOBAIS
    // ========================================
    
    let cart = [];
    const CART_STORAGE_KEY = 'saberSimplesCart';
    
    // Elementos do DOM - Carrinho
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalValue = document.getElementById('cart-total-value');
    const cartCounter = document.getElementById('cart-counter');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Elementos do DOM - Guias
    const guideCards = document.querySelectorAll('.guide-card');
    
    // Elementos do DOM - Formulário
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    
    
    // ========================================
    // FUNÇÕES DO CARRINHO - STORAGE
    // ========================================
    
    /**
     * Carrega o carrinho do localStorage
     */
    function loadCart() {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
        updateCartUI();
    }
    
    /**
     * Salva o carrinho no localStorage
     */
    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
    
    /**
     * Calcula o total do carrinho
     * @returns {number} Valor total
     */
    function calcularTotalCarrinho() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    
    // ========================================
    // FUNÇÕES DO CARRINHO - MANIPULAÇÃO
    // ========================================
    
    /**
     * Adiciona um guia ao carrinho
     * @param {string} id - ID único do guia
     * @param {string} name - Nome do guia
     * @param {number} price - Preço unitário
     */
    function adicionarAoCarrinho(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            alert(`O guia "${name}" já está no seu carrinho.`);
            return;
        }
        
        // Adiciona novo item
        cart.push({ id, name, price, quantity: 1 });
        
        // Feedback visual
        const cartBtn = document.querySelector('.cart-button');
        cartBtn.classList.add('pulse-effect');
        setTimeout(() => cartBtn.classList.remove('pulse-effect'), 500);
        
        // Mensagem de sucesso
        alert(`"${name}" adicionado ao carrinho!`);
        
        // Atualiza e abre carrinho
        saveCart();
        updateCartUI();
        toggleCartSidebar(true);
    }
    
    /**
     * Remove um guia do carrinho
     * @param {string} id - ID do guia
     */
    function removerDoCarrinho(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
    }
    
    /**
     * Limpa todo o carrinho
     */
    function limparCarrinho() {
        if (confirm("Tem certeza que deseja limpar todo o carrinho?")) {
            cart = [];
            saveCart();
            updateCartUI();
        }
    }
    
    
    // ========================================
    // FUNÇÕES DO CARRINHO - UI
    // ========================================
    
    /**
     * Atualiza a interface do carrinho
     */
    function updateCartUI() {
        const total = calcularTotalCarrinho();
        const totalItems = cart.length;
        
        // Atualiza total
        cartTotalValue.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        // Atualiza contador
        cartCounter.textContent = totalItems;
        cartCounter.classList.toggle('active', totalItems > 0);
        
        // Atualiza lista de itens
        cartItemsContainer.innerHTML = '';
        
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
     * Abre ou fecha a sidebar do carrinho
     * @param {boolean} forceOpen - Força abertura
     */
    window.toggleCartSidebar = (forceOpen = false) => {
        const isOpen = cartSidebar.classList.contains('open');
        
        if (forceOpen || !isOpen) {
            cartSidebar.classList.add('open');
            cartSidebar.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        } else {
            cartSidebar.classList.remove('open');
            cartSidebar.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };
    
    /**
     * Finaliza a compra (simulação)
     */
    window.finalizarCompra = () => {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione guias antes de finalizar a compra!');
            return;
        }
        
        const total = calcularTotalCarrinho().toFixed(2).replace('.', ',');
        const itemsList = cart.map(item => 
            `- ${item.name} (R$ ${item.price.toFixed(2).replace('.', ',')})`
        ).join('\n');
        
        const confirmationMessage = `
Resumo da Compra:
${itemsList}

Total a Pagar: R$ ${total}

Confirma a finalização da compra? (Simulação)
        `;
        
        if (confirm(confirmationMessage)) {
            alert('✅ Pedido finalizado com sucesso! (Simulação de pagamento). Você receberá os guias em seu e-mail.');
            
            cart = [];
            saveCart();
            updateCartUI();
            toggleCartSidebar(false);
        }
    };
    
    // Expõe função para botão HTML
    window.limparCarrinho = limparCarrinho;
    
    
    // ========================================
    // EVENT LISTENERS - CARRINHO
    // ========================================
    
    // Remover itens do carrinho
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const idToRemove = e.target.getAttribute('data-id');
            removerDoCarrinho(idToRemove);
        }
    });
    
    
    // ========================================
    // EVENT LISTENERS - GUIAS
    // ========================================
    
    guideCards.forEach(card => {
        const addButton = card.querySelector('.add-to-cart');
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const price = parseFloat(card.getAttribute('data-price'));
        
        // Efeito hover
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
        });
        
        // Adicionar ao carrinho
        addButton.addEventListener('click', (e) => {
            e.preventDefault();
            adicionarAoCarrinho(id, name, price);
        });
    });
    
    
    // ========================================
    // ANIMAÇÕES DE SCROLL
    // ========================================
    
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
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.fade-in, .slide-up').forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback para navegadores antigos
        document.querySelectorAll('.fade-in, .slide-up').forEach(element => {
            element.classList.add('visible');
        });
    }
    
    
    // ========================================
    // ROLAGEM SUAVE
    // ========================================
    
    document.querySelectorAll('.main-nav a, .logo, .btn-cta').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.main-header').offsetHeight;
                    window.scrollTo({
                        top: targetElement.offsetTop - headerHeight,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    
    // ========================================
    // FORMULÁRIO DE CONTATO
    // ========================================
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        
        // Validação
        if (name === "" || email === "") {
            formFeedback.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            formFeedback.style.color = '#d32f2f';
            return;
        }
        
        // Sucesso
        formFeedback.textContent = '📧 Mensagem enviada com sucesso! Em breve entraremos em contato.';
        formFeedback.style.color = '#ffb300';
        
        contactForm.reset();
        
        // Limpa mensagem após 5 segundos
        setTimeout(() => {
            formFeedback.textContent = '';
        }, 5000);
    });
    
    
    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    
    loadCart();
});
