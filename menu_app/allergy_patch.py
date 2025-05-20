"""
알러지 필터링 몽키 패치 모듈

이 모듈은 기존 앱에 알러지 필터링 기능을 자동으로 주입합니다.
기존 코드를 수정하지 않고 앱 시작 시 이 모듈만 import 하면 됩니다.
"""

import sys
import types
import inspect
import functools
from flask import request, render_template, Flask

# 알러지 필터 클래스 정의
class AllergyFilter:
    """알러지 필터링을 처리하는 클래스."""
    
    def __init__(self, menu_items=None):
        self.menu_items = menu_items or []
    
    def get_all_allergies(self):
        """모든 알러지 항목 목록 반환"""
        if not self.menu_items:
            return []
        allergies = {a for item in self.menu_items for a in item.get('allergies', [])}
        return sorted(allergies)
    
    def filter_menu_by_allergies(self, selected_allergies):
        """선택한 알러지가 있는 메뉴 제외"""
        if not selected_allergies or not self.menu_items:
            return self.menu_items.copy()
        
        filtered_menu = [
            item for item in self.menu_items 
            if not any(allergy in item.get('allergies', []) for allergy in selected_allergies)
        ]
        
        return filtered_menu
    
    def find_menu_by_id(self, menu_id):
        """ID로 메뉴 찾기"""
        for item in self.menu_items:
            if item.get('id') == menu_id:
                return item
        return None

def patch_index_route(app, allergy_filter):
    """인덱스 라우트 패치하기"""
    # 원래 index 함수 가져오기
    original_index = app.view_functions.get('index')
    if not original_index:
        print("인덱스 라우트를 찾을 수 없습니다.")
        return False
    
    # 새로운 인덱스 함수 정의
    @functools.wraps(original_index)
    def patched_index(*args, **kwargs):
        # 알러지 파라미터 가져오기
        selected_allergies = request.args.getlist('allergy')
        
        # 모든 알러지 목록 가져오기
        allergies = allergy_filter.get_all_allergies()
        
        # 필터링된 메뉴 가져오기
        if selected_allergies:
            # 메인 모듈에서 menu_items 가져오기
            main_module = sys.modules['__main__']
            if hasattr(main_module, 'menu_items'):
                original_menu = main_module.menu_items
                filtered_menu = allergy_filter.filter_menu_by_allergies(selected_allergies)
                
                # 일시적으로 menu_items 변경
                main_module.menu_items = filtered_menu
                
                # 원래 함수 실행
                result = original_index(*args, **kwargs)
                
                # menu_items 복원
                main_module.menu_items = original_menu
                
                # 템플릿 컨텍스트에 알러지 정보 추가
                if hasattr(result, '_render_template'):
                    # 이미 렌더링된 템플릿 대신 새로 렌더링
                    template = result._render_template
                    
                    # 원래 컨텍스트에서 필요한 변수 추출
                    original_context = {}
                    for key in ['menu_items']:
                        if hasattr(main_module, key):
                            original_context[key] = getattr(main_module, key)
                    
                    # 새 컨텍스트에 알러지 정보 추가
                    context = {
                        'menu_items': filtered_menu,
                        'allergies': allergies,
                        'selected_allergies': selected_allergies
                    }
                    
                    # 최종 결합된 컨텍스트
                    combined_context = {**original_context, **context}
                    
                    # 새로운 템플릿 렌더링
                    return render_template('index.html', **combined_context)
                
                return result
            else:
                print("menu_items를 찾을 수 없습니다.")
                return original_index(*args, **kwargs)
        else:
            # 알러지 선택이 없으면 원래 함수 실행하되 알러지 목록 추가
            result = original_index(*args, **kwargs)
            
            # 템플릿 컨텍스트에 알러지 정보 추가 (복잡한 방식으로)
            # 주의: 이 부분은 모든 Flask 버전에서 작동하지 않을 수 있음
            if hasattr(result, '_render_template'):
                # 기존 템플릿 네임과 컨텍스트 추출 시도
                template = result._render_template
                context = {}
                
                # 메인 모듈에서 menu_items 가져오기
                main_module = sys.modules['__main__']
                if hasattr(main_module, 'menu_items'):
                    context['menu_items'] = main_module.menu_items
                    
                # 추가 정보 넣기
                context['allergies'] = allergies
                context['selected_allergies'] = selected_allergies
                
                # 새로운 템플릿 렌더링
                return render_template('index.html', **context)
            
            return result
    
    # 패치된 함수로 교체
    app.view_functions['index'] = patched_index
    print("인덱스 라우트에 알러지 필터링 기능이 패치되었습니다.")
    return True

def patch_app(app):
    """앱에 알러지 필터링 기능 패치하기"""
    # 메인 모듈에서 menu_items 가져오기
    main_module = sys.modules['__main__']
    if not hasattr(main_module, 'menu_items'):
        print("menu_items를 찾을 수 없습니다.")
        return False
    
    # menu_items 가져오기
    menu_items = main_module.menu_items
    
    # 알러지 필터 인스턴스 생성
    allergy_filter = AllergyFilter(menu_items)
    
    # index 라우트 패치
    if not patch_index_route(app, allergy_filter):
        return False
    
    # allergy_filter 인스턴스를 메인 모듈에 추가
    setattr(main_module, 'allergy_filter', allergy_filter)
    
    # 수정된 index.html 파일 생성
    create_modified_index_html()
    
    return True

def create_modified_index_html():
    """알러지 필터링을 지원하는 수정된 index.html 생성"""
    try:
        # 원래 index.html 파일 읽기
        with open('templates/index.html', 'r', encoding='utf-8') as f:
            original_html = f.read()
        
        # 백업 만들기
        with open('templates/index.html.bak', 'w', encoding='utf-8') as f:
            f.write(original_html)
        
        # 알러지 필터링 UI가 이미 있는지 확인
        if 'allergy-filter-form' in original_html:
            print("index.html에 이미 알러지 필터링 UI가 있습니다.")
            return
        
        # 컨테이너 시작 부분 찾기
        container_start = original_html.find('<div class="container">')
        if container_start == -1:
            print("컨테이너 요소를 찾을 수 없습니다.")
            return
        
        # 컨테이너 태그 다음 위치
        container_tag_end = original_html.find('>', container_start) + 1
        
        # 사이드바 HTML
        sidebar_html = '''
    <div class="sidebar">
      <div class="category-title">알레르기 필터링</div>
      
      <!-- 알레르기 필터 폼 추가 -->
      <form action="/" method="get" id="allergy-filter-form">
        <ul class="allergy-list">
          {% for allergy in allergies %}
            <li class="allergy-item{% if allergy in selected_allergies %} active{% endif %}">
              <div class="allergy-checkbox">
                <input type="checkbox" 
                      id="allergy-{{ loop.index }}" 
                      name="allergy" 
                      value="{{ allergy }}"
                      {% if allergy in selected_allergies %}checked{% endif %}
                      onchange="this.form.submit()">
                <label for="allergy-{{ loop.index }}">{{ allergy }}</label>
              </div>
            </li>
          {% endfor %}
        </ul>
        
        {% if selected_allergies %}
          <div class="filter-notice-enhanced">
            <span class="filter-label">
              {% if selected_allergies|length > 1 %}
                {{ selected_allergies|length }}개 항목 제외
              {% else %}
                "{{ selected_allergies[0] }}" 제외
              {% endif %}
            </span>
            <a href="/" class="clear-filter-enhanced">초기화</a>
          </div>
        {% endif %}
      </form>
    </div>
'''
        
        # 알러지 필터링 CSS
        css_additions = '''
    /* 알러지 필터링 스타일 */
    .sidebar {
      width: 250px;
      background: white;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .category-title {
      font-weight: bold;
      padding-bottom: 10px;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .allergy-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .allergy-item {
      margin-bottom: 8px;
    }
    
    .allergy-item.active {
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    
    .allergy-checkbox {
      display: block;
      position: relative;
    }
    
    .allergy-checkbox input[type="checkbox"] {
      position: absolute;
      opacity: 0;
    }
    
    .allergy-checkbox label {
      display: block;
      padding: 8px 15px;
      color: #495057;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.2s;
      padding-left: 35px;
    }
    
    .allergy-checkbox label:before {
      content: '';
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      border: 1px solid #ced4da;
      border-radius: 3px;
      background: #fff;
    }
    
    .allergy-checkbox input[type="checkbox"]:checked + label {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .allergy-checkbox input[type="checkbox"]:checked + label:before {
      background-color: #dc3545;
      border-color: #dc3545;
    }
    
    .allergy-checkbox input[type="checkbox"]:checked + label:after {
      content: '\\2714';
      position: absolute;
      left: 13px;
      top: 50%;
      transform: translateY(-50%);
      color: white;
      font-size: 12px;
    }
    
    .filter-notice-enhanced {
      margin-top: 20px;
      padding: 10px 15px;
      background-color: #f8d7da;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .filter-label {
      font-size: 14px;
      font-weight: bold;
      color: #721c24;
    }
    
    .clear-filter-enhanced {
      background-color: #dc3545;
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      text-decoration: none;
      font-size: 12px;
      font-weight: bold;
    }
    
    .allergy-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 10px;
    }
    
    .allergy-tag {
      background-color: #f8d7da;
      color: #721c24;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
    }
'''
        
        # 스타일 태그 찾기
        style_end = original_html.find('</style>')
        if style_end == -1:
            # 스타일 태그가 없으면 head 태그 찾기
            head_end = original_html.find('</head>')
            if head_end == -1:
                print("head 태그를 찾을 수 없습니다.")
                return
            
            # head 태그 안에 style 태그 추가
            modified_html = original_html[:head_end] + '\n<style>' + css_additions + '\n</style>\n' + original_html[head_end:]
        else:
            # 기존 스타일 태그에 추가
            modified_html = original_html[:style_end] + css_additions + original_html[style_end:]
        
        # 사이드바 추가
        container_start = modified_html.find('<div class="container">')
        if container_start == -1:
            print("수정된 HTML에서 컨테이너를 찾을 수 없습니다.")
            return
        
        container_tag_end = modified_html.find('>', container_start) + 1
        modified_html = modified_html[:container_tag_end] + sidebar_html + modified_html[container_tag_end:]
        
        # 알러지 태그 표시 추가
        menu_description_pattern = '<div class="menu-description">{{item.description}}</div>'
        allergy_tags_html = '''
                  <!-- 알러지 태그 표시 -->
                  {% if item.allergies %}
                  <div class="allergy-tags">
                    {% for allergy in item.allergies %}
                    <span class="allergy-tag">{{ allergy }}</span>
                    {% endfor %}
                  </div>
                  {% endif %}
'''
        modified_html = modified_html.replace(menu_description_pattern, menu_description_pattern + allergy_tags_html)
        
        # 수정된 HTML 저장
        with open('templates/index.html', 'w', encoding='utf-8') as f:
            f.write(modified_html)
        
        print("index.html이 성공적으로 수정되었습니다.")
        
    except Exception as e:
        print(f"index.html 수정 중 오류 발생: {e}")

def apply_to_flask_app():
    """
    Flask 앱을 찾아 패치 적용
    """
    # 메인 모듈에서 Flask 앱 찾기
    main_module = sys.modules['__main__']
    app = None
    
    # app 객체 직접 찾기
    if hasattr(main_module, 'app') and isinstance(main_module.app, Flask):
        app = main_module.app
    else:
        # 모든 객체 검사
        for name in dir(main_module):
            obj = getattr(main_module, name)
            if isinstance(obj, Flask):
                app = obj
                break
    
    if app:
        success = patch_app(app)
        if success:
            print("알러지 필터링 기능이 Flask 앱에 성공적으로 적용되었습니다.")
        else:
            print("알러지 필터링 기능 적용 실패.")
    else:
        print("현재 모듈에서 Flask 앱을 찾을 수 없습니다.")

# 모듈이 직접 실행될 때
if __name__ == "__main__":
    print("이 모듈은 직접 실행하지 않고, 메인 앱에서 import해야 합니다.")
    print("메인 앱의 if __name__ == '__main__': 블록 바로 위에 다음 코드를 추가하세요:")
    print("    import allergy_patch")
    print("    allergy_patch.apply_to_flask_app()")