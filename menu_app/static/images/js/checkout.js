// checkout.js - 체크아웃 페이지 JavaScript 기능

// 알러지 선택에 따른 필터링
function filterItems() {
    // 선택된 알러지 목록 가져오기
    const selectedAllergies = Array.from(document.querySelectorAll('input[name="allergies"]:checked'))
      .map(checkbox => checkbox.value);
    
    // 장바구니 항목 필터링
    const cartItems = document.querySelectorAll('.cart-item');
    let totalPrice = 0;
    
    cartItems.forEach(item => {
      const itemAllergies = item.dataset.allergies.split(',').filter(a => a);
      const itemPrice = parseInt(item.querySelector('.item-total').dataset.price);
      
      // 선택된 알러지가 있는지 확인
      const hasAllergy = selectedAllergies.some(allergy => 
        itemAllergies.includes(allergy)
      );
      
      if (hasAllergy) {
        // 알러지가 있는 항목 페이드 아웃
        item.classList.add('fade-out');
      } else {
        // 알러지가 없는 항목 표시 및 가격 계산
        item.classList.remove('fade-out');
        totalPrice += itemPrice;
      }
    });
    
    // 총 가격 업데이트
    document.getElementById('total-price').textContent = totalPrice;
  }
  
  // 페이지 로드 시 초기화
  document.addEventListener('DOMContentLoaded', function() {
    // 알러지 체크박스 초기화
    const checkboxes = document.querySelectorAll('input[name="allergies"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // 총 가격 초기화
    const cartItems = document.querySelectorAll('.cart-item');
    let initialTotal = 0;
    
    cartItems.forEach(item => {
      const itemPrice = parseInt(item.querySelector('.item-total').dataset.price);
      initialTotal += itemPrice;
    });
    
    document.getElementById('total-price').textContent = initialTotal;
  });