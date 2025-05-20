// detail.js - 상세 페이지 JavaScript 기능

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 수량 입력 필드 이벤트 리스너 등록
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
      quantityInput.addEventListener('change', validateQuantity);
    }
  
    // +/- 버튼에 이벤트 리스너 등록
    const decreaseBtn = document.querySelector('.decrease');
    const increaseBtn = document.querySelector('.increase');
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', function() {
        changeQuantity(-1);
      });
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', function() {
        changeQuantity(1);
      });
    }
  });
  
  // 수량 변경 함수
  function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    let newQuantity = parseInt(quantityInput.value) + change;
    
    // 최소 1, 최대 10 제한
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;
    
    quantityInput.value = newQuantity;
  }
  
  // 수량 유효성 검사
  function validateQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    let value = parseInt(quantityInput.value);
    
    if (isNaN(value) || value < 1) value = 1;
    if (value > 10) value = 10;
    
    quantityInput.value = value;
  }
  
  // 장바구니에 상품 추가
  function addToCart(menuId) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    const quantity = parseInt(quantityInput.value);
    
    // API 호출
    fetch('/cart/add/' + menuId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: quantity })
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.success) {
        // 장바구니 카운트 업데이트 (헤더에 있을 경우)
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) cartCountEl.textContent = data.cart_count;
        
        // 성공 메시지 표시
        showSuccessMessage();
      }
    })
    .catch(error => console.error('장바구니 추가 오류:', error));
  }
  
  // 성공 메시지 표시
  function showSuccessMessage() {
    // 기존 메시지 제거
    const existingMsg = document.querySelector('.cart-message');
    if (existingMsg) existingMsg.remove();
    
    // 새 메시지 생성
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
    
    messageEl.innerHTML = `
      <i class="fa-solid fa-check" style="margin-right: 10px;"></i>
      상품이 장바구니에 추가되었습니다
      <a href="/cart" style="color: white; text-decoration: underline; margin-left: 10px; font-weight: bold;">
        장바구니 보기
      </a>
    `;
    
    // 메시지를 body에 추가
    document.body.appendChild(messageEl);
    
    // 애니메이션 시작
    setTimeout(() => {
      messageEl.style.transform = 'translateY(0)';
      messageEl.style.opacity = '1';
    }, 10);
    
    // 3초 후 자동으로 사라지게 함
    setTimeout(() => {
      messageEl.style.transform = 'translateY(-20px)';
      messageEl.style.opacity = '0';
      
      setTimeout(() => {
        messageEl.remove();
      }, 300);
    }, 3000);
  }