// cart.js - 장바구니 기능을 위한 JavaScript

// 수량 업데이트 함수
function updateQuantity(menuId, change) {
    var quantityInput = document.querySelector('.cart-item[data-id="' + menuId + '"] .quantity-input');
    var newQuantity = parseInt(quantityInput.value) + change;
    
    if (newQuantity < 1) newQuantity = 1;
    
    updateCartItem(menuId, newQuantity);
  }
  
  // 직접 수량 입력 시 업데이트
  function updateQuantityDirect(menuId, newQuantity) {
    if (parseInt(newQuantity) < 1) newQuantity = 1;
    updateCartItem(menuId, parseInt(newQuantity));
  }
  
  // 장바구니 항목 업데이트 API 호출
  function updateCartItem(menuId, quantity) {
    fetch('/cart/update/' + menuId, {
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
        // 수량 및 소계 업데이트
        var item = document.querySelector('.cart-item[data-id="' + menuId + '"]');
        var quantityInput = item.querySelector('.quantity-input');
        var subtotalEl = item.querySelector('.cart-subtotal');
        var price = parseInt(item.dataset.price);
        
        quantityInput.value = quantity;
        subtotalEl.textContent = price * quantity + '원';
        
        // 총 가격 업데이트
        document.getElementById('total-price').textContent = data.total_price;
        
        // 헤더의 장바구니 카운트 업데이트
        var cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
          cartCountEl.textContent = data.cart_count;
        }
      }
    })
    .catch(error => console.error('장바구니 업데이트 오류:', error));
  }
  
  // 항목 삭제
  function removeItem(menuId) {
    if (!confirm('이 항목을 삭제하시겠습니까?')) {
      return;
    }
    
    updateCartItem(menuId, 0);
    
    // 아이템 애니메이션 및 제거
    var item = document.querySelector('.cart-item[data-id="' + menuId + '"]');
    item.style.transition = 'opacity 0.5s, transform 0.5s';
    item.style.opacity = '0';
    item.style.transform = 'translateX(20px)';
    
    // 애니메이션 후 제거
    setTimeout(function() {
      item.remove();
      
      // 장바구니가 비었는지 확인
      if (document.querySelectorAll('.cart-item').length === 0) {
        location.reload(); // 페이지 새로고침하여 빈 장바구니 표시
      }
    }, 500);
  }
  
  // 장바구니 비우기
  function clearCart() {
    if (!confirm('장바구니를 비우시겠습니까?')) {
      return;
    }
    
    fetch('/cart/clear', {
      method: 'POST'
    })
    .then(function(response) { 
      return response.json(); 
    })
    .then(function(data) {
      if (data.success) {
        location.reload(); // 페이지 새로고침
      }
    })
    .catch(error => console.error('장바구니 비우기 오류:', error));
  }