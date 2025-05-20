// animations.js - 고급 애니메이션 및 인터랙션 효과 구현

document.addEventListener('DOMContentLoaded', function() {
    // 프리로더 표시 및 숨기기
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // 페이지 로드 후 프리로더 숨기기
        window.addEventListener('load', function() {
            setTimeout(function() {
                preloader.classList.add('fade-out');
                // 프리로더 제거 (트랜지션 완료 후)
                setTimeout(function() {
                    preloader.style.display = 'none';
                }, 500);
            }, 500);
        });
    }

    // 메뉴 아이템 순차적 등장 애니메이션
    const menuItems = document.querySelectorAll('.menu-item-container');
    if (menuItems.length > 0) {
        menuItems.forEach(function(item, index) {
            // 아이템마다 0.1초씩 지연 애니메이션
            item.style.animationDelay = (index * 0.1) + 's';
        });
    }

    // 스크롤 효과: 요소가 화면에 들어올 때 애니메이션 적용
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(function(element) {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            // 요소가 화면 안에 들어오면 애니메이션 클래스 추가
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animated');
            }
        });
    };

    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', animateOnScroll);
    // 초기 로드 시 한 번 실행
    animateOnScroll();

    // 장바구니 아이템 추가 애니메이션
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                // 버튼에 물결 효과 추가
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                button.appendChild(ripple);
                
                // 장바구니 아이콘 애니메이션
                const cartIcon = document.querySelector('.cart-button i');
                if (cartIcon) {
                    cartIcon.classList.add('pulse-animation');
                    setTimeout(function() {
                        cartIcon.classList.remove('pulse-animation');
                    }, 1000);
                }
                
                // 애니메이션 후 물결 효과 제거
                setTimeout(function() {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // 이미지 레이지 로딩
    const lazyImages = document.querySelectorAll('.lazy-image');
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // 알레르기 체크박스 애니메이션 효과
    const allergyCheckboxes = document.querySelectorAll('.allergy-checkbox input[type="checkbox"]');
    if (allergyCheckboxes.length > 0) {
        allergyCheckboxes.forEach(function(checkbox) {
            checkbox.addEventListener('change', function() {
                const label = checkbox.nextElementSibling;
                
                // 체크박스 상태 변경 시 애니메이션 클래스 토글
                if (checkbox.checked) {
                    label.classList.add('checkbox-animated');
                    setTimeout(function() {
                        label.classList.remove('checkbox-animated');
                    }, 500);
                }
            });
        });
    }

    // 숫자 카운팅 애니메이션
    const animateCounters = function() {
        const counters = document.querySelectorAll('.counter-animate');
        
        counters.forEach(function(counter) {
            const target = parseInt(counter.dataset.target);
            const duration = 1500; // 애니메이션 지속 시간 (ms)
            const step = target / (duration / 16); // 60fps 기준
            let current = 0;
            
            const updateCounter = function() {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            
            updateCounter();
        });
    };

    // 요소가 화면에 들어올 때 카운터 애니메이션 시작
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.disconnect();
            }
        });
    });
    
    const counterSection = document.querySelector('.counter-section');
    if (counterSection) {
        counterObserver.observe(counterSection);
    }

    // 헤더 스크롤 효과
    const header = document.querySelector('.page-title');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
    }

    // 모달 애니메이션
    const modals = document.querySelectorAll('.modal');
    if (modals.length > 0) {
        modals.forEach(function(modal) {
            // 모달 열기 버튼
            const modalTriggers = document.querySelectorAll('[data-modal="' + modal.id + '"]');
            modalTriggers.forEach(function(trigger) {
                trigger.addEventListener('click', function() {
                    modal.classList.add('modal-visible');
                    document.body.classList.add('modal-open');
                });
            });
            
            // 모달 닫기 버튼
            const closeButtons = modal.querySelectorAll('.close-modal, .btn-cancel');
            closeButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    modal.classList.remove('modal-visible');
                    document.body.classList.remove('modal-open');
                });
            });
            
            // 모달 외부 클릭 시 닫기
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('modal-visible');
                    document.body.classList.remove('modal-open');
                }
            });
        });
    }

    // 장바구니 메시지 표시 애니메이션
    const showCartMessage = function(message, type = 'success') {
        // 기존 메시지 삭제
        const existingMessages = document.querySelectorAll('.cart-message');
        existingMessages.forEach(function(msg) {
            msg.remove();
        });
        
        // 새 메시지 생성
        const messageElement = document.createElement('div');
        messageElement.className = 'cart-message cart-message-' + type;
        messageElement.innerHTML = `
            <div class="message-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            ${type === 'success' ? '<a href="/cart" class="view-cart-link">장바구니 보기</a>' : ''}
            <button class="close-message">&times;</button>
        `;
        
        document.body.appendChild(messageElement);
        
        // 애니메이션 시작
        setTimeout(function() {
            messageElement.classList.add('show');
        }, 10);
        
        // 닫기 버튼 이벤트
        const closeButton = messageElement.querySelector('.close-message');
        closeButton.addEventListener('click', function() {
            messageElement.classList.remove('show');
            setTimeout(function() {
                messageElement.remove();
            }, 300);
        });
        
        // 자동 닫기 (5초 후)
        setTimeout(function() {
            messageElement.classList.remove('show');
            setTimeout(function() {
                messageElement.remove();
            }, 300);
        }, 5000);
    };

    // 글로벌 스코프에 노출
    window.showCartMessage = showCartMessage;

    // 메뉴 타일 호버 효과
    const menuTiles = document.querySelectorAll('.menu-item');
    if (menuTiles.length > 0) {
        menuTiles.forEach(function(tile) {
            tile.addEventListener('mouseenter', function() {
                tile.classList.add('menu-item-hover');
            });
            
            tile.addEventListener('mouseleave', function() {
                tile.classList.remove('menu-item-hover');
            });
        });
    }

    // 장바구니 아이콘 효과
    const cartIcon = document.querySelector('.cart-button');
    if (cartIcon) {
        // 장바구니에 아이템 추가 시 효과
        const originalAddToCart = window.addToCart;
        if (typeof originalAddToCart === 'function') {
            window.addToCart = function(menuId) {
                originalAddToCart(menuId);
                
                // 장바구니 아이콘 애니메이션
                cartIcon.classList.add('cart-bump');
                setTimeout(function() {
                    cartIcon.classList.remove('cart-bump');
                }, 300);
            };
        }
    }
});

// 3D 효과를 위한 텍스트 처리
const create3DText = function(element) {
    const text = element.textContent;
    element.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        span.className = 'char3d';
        span.style.transitionDelay = (i * 0.05) + 's';
        element.appendChild(span);
    }
};

// 페이지 로드 후 3D 텍스트 적용
document.addEventListener('DOMContentLoaded', function() {
    const titles3D = document.querySelectorAll('.text-3d');
    if (titles3D.length > 0) {
        titles3D.forEach(create3DText);
    }
});