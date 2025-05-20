// index.js - 메인 페이지 JavaScript 기능

// 페이지 로드 시 장바구니 카운트 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 서버로부터 장바구니 카운트 가져오기 
    fetch('/cart/count')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          updateCartCount(data.count);
        }
      })
      .catch(error => console.error('장바구니 카운트 로드 오류:', error));
  });
  
  // 장바구니에 상품 추가 function
  function addToCart(menuId) {
    // 이벤트 전파 방지 (링크 클릭 방지)
    event.preventDefault();
    event.stopPropagation();
    
    // API 호출
    fetch('/cart/add/' + menuId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: 1 })
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.success) {
        // 장바구니 카운트 업데이트
        updateCartCount(data.count);
        
        // 성공 메시지 표시
        showAddToCartMessage(menuId);
      }
    })
    .catch(error => console.error('장바구니 추가 오류:', error));
  }
  
  // 장바구니 카운트 업데이트 function
  function updateCartCount(count) {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      cartCountEl.textContent = count;
    }
  }
  
  // 장바구니 담기 성공 메시지 표시
  function showAddToCartMessage(menuId) {
    // 메시지 요소 생성
    const messageEl = document.createElement('div');
    messageEl.className = 'cart-message';
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: rgba(40, 167, 69, 0.9);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      z-index: 1000;
      transform: translateY(-20px);
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
    `;
    
    // 장바구니에 추가되었다는 메시지 내용
    messageEl.innerHTML = `
      <i class="fa-solid fa-check" style="margin-right: 10px;"></i>
      장바구니에 추가되었습니다
      <a href="/cart" style="color: white; text-decoration: underline; margin-left: 10px; font-weight: bold;">
        장바구니 보기
      </a>
    `;
    
    // 메시지를 body에 추가
    document.body.appendChild(messageEl);
    
    // 애니메이션 시작 (서서히 나타나게)
    setTimeout(() => {
      messageEl.style.transform = 'translateY(0)';
      messageEl.style.opacity = '1';
    }, 10);
    
    // 3초 후 메시지 제거 (서서히 사라지게)
    setTimeout(() => {
      messageEl.style.transform = 'translateY(-20px)';
      messageEl.style.opacity = '0';
      
      setTimeout(() => {
        messageEl.remove();
      }, 300);
    }, 3000);
  }