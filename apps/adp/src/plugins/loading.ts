/**
 * 将 16 进制颜色转换为 RGB 格式
 * @param {Object} params - 参数对象
 * @param {string} params.hex - 16 进制颜色字符串
 * @returns {{r: number, g: number, b: number} | null} RGB 颜色对象
 */
function hexToRgb(params: { hex: string }) {
  const { hex } = params;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * 初始化首屏 Loading 插件，在 Vue 挂载前向 `#app` 节点插入优雅的 Loading 动效与样式
 * @param {string} params.title - 系统加载时的标题名
 * @param {string} params.themeColor - 系统主题色
 */
export function setupLoading(params: { title: string; themeColor: string }) {
  const { title, themeColor } = params;
  const rgb = hexToRgb({ hex: themeColor });

  if (!rgb) {
    return;
  }

  const cssVars = `
    --primary-color-light: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6);
  `;

  const loadingStyle = `
    <style id="app-loading-style">
      :root {
        ${cssVars}
      }
      .app-loading-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #ffffff;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        transition: opacity 0.3s ease-out;
      }
      .app-loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .app-loading-logo {
        width: 80px;
        height: 80px;
        margin-bottom: 28px;
        animation: logo-bounce 2s infinite ease-in-out;
      }
      .app-loading-dots {
        position: relative;
        width: 40px;
        height: 40px;
        margin-bottom: 24px;
        animation: dots-rotate 2s infinite linear;
      }
      .app-loading-dots .dot {
        position: absolute;
        width: 12px;
        height: 12px;
        background-color: var(--primary-color);
        border-radius: 50%;
        animation: dot-pulse 1.6s infinite ease-in-out;
      }
      .app-loading-dots .dot-1 {
        top: 0;
        left: 0;
        animation-delay: 0s;
      }
      .app-loading-dots .dot-2 {
        top: 0;
        right: 0;
        animation-delay: 0.4s;
      }
      .app-loading-dots .dot-3 {
        bottom: 0;
        right: 0;
        animation-delay: 0.8s;
      }
      .app-loading-dots .dot-4 {
        bottom: 0;
        left: 0;
        animation-delay: 1.2s;
      }
      .app-loading-title {
        font-size: 22px;
        font-weight: 600;
        color: #1f2937;
        letter-spacing: 1px;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-light) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      @keyframes logo-bounce {
        0%, 100% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-8px) scale(0.98);
        }
      }
      @keyframes dots-rotate {
        100% {
          transform: rotate(360deg);
        }
      }
      @keyframes dot-pulse {
        0%, 100% {
          transform: scale(0.6);
          opacity: 0.35;
        }
        50% {
          transform: scale(1.15);
          opacity: 1;
        }
      }
    </style>
  `;

  const loadingHtml = `
    <div class="app-loading-wrapper">
      <div class="app-loading-content">
        <!-- SVG Logo: 科技感双环相切，带主色渐变 -->
        <div class="app-loading-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="80" height="80">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--primary-color)" />
                <stop offset="100%" stop-color="var(--primary-color-light)" />
              </linearGradient>
            </defs>
            <!-- 外环 -->
            <path d="M 40 100 A 60 60 0 1 1 160 100 A 60 60 0 0 1 40 100 Z" fill="none" stroke="url(#logoGrad)" stroke-width="12" stroke-dasharray="270 100" stroke-linecap="round" />
            <!-- 内环 -->
            <path d="M 60 100 A 40 40 0 1 0 140 100 A 40 40 0 0 0 60 100 Z" fill="none" stroke="url(#logoGrad)" stroke-width="8" stroke-dasharray="170 80" stroke-linecap="round" opacity="0.8" />
            <!-- 中心圆球 -->
            <circle cx="100" cy="100" r="16" fill="url(#logoGrad)" />
          </svg>
        </div>
        <!-- 4 dots loading -->
        <div class="app-loading-dots">
          <div class="dot dot-1"></div>
          <div class="dot dot-2"></div>
          <div class="dot dot-3"></div>
          <div class="dot dot-4"></div>
        </div>
        <!-- 标题 -->
        <div class="app-loading-title">${title}</div>
      </div>
    </div>
  `;

  // 将样式追加到 head 中
  document.head.insertAdjacentHTML('beforeend', loadingStyle);

  // 插入到应用根容器中
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = loadingHtml;
  }
}
