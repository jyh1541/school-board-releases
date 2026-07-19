# School Board favicon kit

## 파일 선택

- `schoolboard-icon-cream-1024.png`: 크림색 배경 원본 PNG
- `favicon.ico`: 크림색 배경 웹 브라우저 favicon (16/32/48px 포함)
- `favicon-16x16.png`, `favicon-32x32.png`: 크림색 배경 PNG favicon
- `icon-192.png`, `icon-512.png`: 크림색 배경 PWA 아이콘
- `apple-touch-icon.png`: iOS 홈 화면용 크림색 배경 아이콘
- `icon-maskable-512.png`: Android/PWA maskable용 크림색 배경 아이콘
- `google-oauth-logo-120.png`: Google OAuth 동의 화면용 120px 크림색 배경 아이콘
- `schoolboard-icon.ico`: 크림색 배경 Windows 앱용 다중 크기 ICO

모든 배포용 아이콘은 밝거나 어두운 화면에서 내부가 비어 보이지 않도록
정사각형 전체에 동일한 크림색(`#FFF7F2`) 배경을 사용한다.

## 웹사이트 적용

파일을 웹사이트의 public 루트에 복사하고 `<head>`에 아래 항목을 넣는다.

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

PWA manifest의 `icons`에는 아래 항목을 사용한다.

```json
[
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
  { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]
```

## Google OAuth 적용

Google Cloud Console의 `Google Auth Platform > Branding > App logo`에서
`google-oauth-logo-120.png`를 업로드한다. 외부 프로덕션 앱은 로고 변경 후
브랜드 재검증과 게시가 완료되어야 사용자 동의 화면에 새 로고가 표시된다.
