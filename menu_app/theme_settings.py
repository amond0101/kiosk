"""
테마 설정 모듈

이 모듈은 키오스크 디자인 테마 설정을 관리합니다.
테마 색상, 모양, 폰트 등의 디자인 요소를 설정하고 저장합니다.
"""

import os
import json
import time

# 설정 파일 경로
THEME_FILE = 'theme_settings.json'

# 기본 테마 설정 (라이트 모드)
DEFAULT_THEME = {
    'name': '라이트 모드',
    'primary_color': '#343a40',  # 메인 헤더 색상
    'secondary_color': '#dc3545',  # 강조색 (장바구니, 가격 등)
    'background_color': '#f5f5f5',  # 배경색
    'menu_background': '#ffffff',  # 메뉴 아이템 배경색
    'text_color': '#333333',  # 기본 텍스트 색상
    'button_radius': '5px',  # 버튼 둥근 모서리 설정
    'font_family': "'Nanum Gothic', Arial, sans-serif",  # 기본 폰트
    'box_shadow': '0 3px 10px rgba(0,0,0,0.1)',  # 그림자 효과
    'animation_speed': '0.3s'  # 애니메이션 속도
}

def load_theme():
    """현재 테마 설정을 로드합니다."""
    if not os.path.exists(THEME_FILE):
        save_theme(DEFAULT_THEME)
        return DEFAULT_THEME.copy()
    
    try:
        with open(THEME_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"테마 설정 로드 중 오류 발생: {e}")
        return DEFAULT_THEME.copy()

def save_theme(theme_settings):
    """테마 설정을 저장합니다."""
    try:
        with open(THEME_FILE, 'w', encoding='utf-8') as f:
            json.dump(theme_settings, f, ensure_ascii=False, indent=2)
        
        # 타임스탬프가 다르게 변경되도록 0.1초 대기
        time.sleep(0.1)
        return True
    except Exception as e:
        print(f"테마 설정 저장 중 오류 발생: {e}")
        return False

def get_css_variables():
    """CSS 변수로 변환된 테마 설정을 반환합니다."""
    theme = load_theme()
    css_vars = []
    
    # 기본 변수
    css_vars.append(f"--primary-color: {theme.get('primary_color', DEFAULT_THEME['primary_color'])};")
    css_vars.append(f"--secondary-color: {theme.get('secondary_color', DEFAULT_THEME['secondary_color'])};")
    css_vars.append(f"--background-color: {theme.get('background_color', DEFAULT_THEME['background_color'])};")
    css_vars.append(f"--menu-background: {theme.get('menu_background', DEFAULT_THEME['menu_background'])};")
    css_vars.append(f"--text-color: {theme.get('text_color', DEFAULT_THEME['text_color'])};")
    css_vars.append(f"--button-radius: {theme.get('button_radius', DEFAULT_THEME['button_radius'])};")
    css_vars.append(f"--font-family: {theme.get('font_family', DEFAULT_THEME['font_family'])};")
    css_vars.append(f"--box-shadow: {theme.get('box_shadow', DEFAULT_THEME['box_shadow'])};")
    css_vars.append(f"--animation-speed: {theme.get('animation_speed', DEFAULT_THEME['animation_speed'])};")
    
    # RGB 값 추출
    primary_hex = theme.get('primary_color', DEFAULT_THEME['primary_color'])
    secondary_hex = theme.get('secondary_color', DEFAULT_THEME['secondary_color'])
    
    # 16진수 색상을 RGB로 변환
    try:
        # #RRGGBB 형식에서 RGB 추출
        if primary_hex.startswith('#') and len(primary_hex) >= 7:
            r = int(primary_hex[1:3], 16)
            g = int(primary_hex[3:5], 16)
            b = int(primary_hex[5:7], 16)
            css_vars.append(f"--primary-color-rgb: {r}, {g}, {b};")
        
        if secondary_hex.startswith('#') and len(secondary_hex) >= 7:
            r = int(secondary_hex[1:3], 16)
            g = int(secondary_hex[3:5], 16)
            b = int(secondary_hex[5:7], 16)
            css_vars.append(f"--secondary-color-rgb: {r}, {g}, {b};")
    except ValueError:
        # 색상 변환 오류 시 기본값 사용
        css_vars.append("--primary-color-rgb: 52, 58, 64;")
        css_vars.append("--secondary-color-rgb: 220, 53, 69;")
    
    # 타임스탬프 추가 (캐싱 방지)
    css_vars.append(f"--theme-timestamp: '{int(time.time())}';")
    
    return "\n    " + "\n    ".join(css_vars)

def reset_to_default():
    """테마를 기본값으로 초기화합니다."""
    save_theme(DEFAULT_THEME)
    return DEFAULT_THEME.copy()

# 미리 정의된 테마 목록 (라이트 모드와 다크 모드)
PREDEFINED_THEMES = {
    'light': DEFAULT_THEME,
    'dark': {
        'name': '다크 모드',
        'primary_color': '#212529',
        'secondary_color': '#fd7e14',
        'background_color': '#121212',
        'menu_background': '#1e1e1e',
        'text_color': '#e0e0e0',
        'button_radius': '5px',
        'font_family': "'Nanum Gothic', Arial, sans-serif",
        'box_shadow': '0 3px 10px rgba(0,0,0,0.3)',
        'animation_speed': '0.3s'
    },
    'blue': {
        'name': '블루 테마',
        'primary_color': '#0d6efd',
        'secondary_color': '#20c997',
        'background_color': '#f0f8ff',
        'menu_background': '#ffffff',
        'text_color': '#333333',
        'button_radius': '8px',
        'font_family': "'Nanum Gothic', Arial, sans-serif",
        'box_shadow': '0 4px 12px rgba(13, 110, 253, 0.15)',
        'animation_speed': '0.3s'
    },
    'colorful': {
        'name': '컬러풀 테마',
        'primary_color': '#6610f2',
        'secondary_color': '#e83e8c',
        'background_color': '#f0f8ff',
        'menu_background': '#ffffff',
        'text_color': '#333333',
        'button_radius': '15px',
        'font_family': "'Nanum Gothic', Arial, sans-serif",
        'box_shadow': '0 5px 15px rgba(0,0,0,0.1)',
        'animation_speed': '0.4s'
    }
}

def apply_theme(theme_data):
    """테마 데이터를 적용합니다."""
    if not theme_data:
        return False
    
    save_theme(theme_data)
    return True

def apply_predefined_theme(theme_key):
    """미리 정의된 테마를 적용합니다."""
    if theme_key in PREDEFINED_THEMES:
        save_theme(PREDEFINED_THEMES[theme_key])
        return PREDEFINED_THEMES[theme_key].copy()
    return None