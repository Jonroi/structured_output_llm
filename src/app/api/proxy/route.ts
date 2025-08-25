export const runtime = "edge";
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";

/**
 * PROXY API - CORS-KIERTÄVÄ PALVELIN
 * ===================================
 *
 * Tämä API-route toimii proxyna ulkoisten verkkosivujen lataamiseen iframe:ssä.
 * Se kiertää CORS-rajoitukset ja injektoi JavaScript-koodin elementtien valintaa varten.
 *
 * Toiminnallisuudet:
 * - Hakee ulkoisia verkkosivuja
 * - Injektoi elementtien valintakoodin
 * - Korjaa suhteelliset URL:t absoluuttisiksi
 * - Estää ulkoiset API-kutsut iframe:ssä
 * - Käsittelee CORS-preflight pyynnöt
 */

/**
 * GET - Hakee verkkosivun ja injektoi elementtien valintakoodin
 *
 * @param request - Next.js request-objekti
 * @returns Response - Muokattu HTML sisältäen elementtien valintakoodin
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json(
      { error: "URL parameter required" },
      { status: 400 },
    );
  }

  try {
    // For internal URLs, fetch directly without headers
    let response;
    if (
      targetUrl.startsWith("http://localhost:") ||
      targetUrl.includes("/api/")
    ) {
      response = await fetch(targetUrl);
    } else {
      // Fetch the target website with proper headers for external sites
      response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Inject our element selection script and fix resource URLs
    const modifiedHtml = injectElementSelectionScript(html, targetUrl);

    return new NextResponse(modifiedHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch target URL" },
      { status: 500 },
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function injectElementSelectionScript(html: string, baseUrl: string): string {
  // Fix relative URLs to absolute URLs
  const baseUrlObj = new URL(baseUrl);
  const basePath = baseUrlObj.pathname.replace(/\/[^/]*$/, "/");

  // Replace relative URLs with absolute URLs
  const modifiedHtml = html
    .replace(/src="\//g, `src="${baseUrlObj.origin}/`)
    .replace(/href="\//g, `href="${baseUrlObj.origin}/`)
    .replace(/url\(['"]?\//g, `url(${baseUrlObj.origin}/`)
    .replace(/src="\.\//g, `src="${baseUrlObj.origin}${basePath}`)
    .replace(/href="\.\//g, `href="${baseUrlObj.origin}${basePath}`);

  const script = `
    <script>
      (function() {
        let hoveredElement = null;
        let selectedElement = null;
        let isSelectionMode = true;
        
        // Create highlight overlay
        const highlight = document.createElement('div');
        highlight.style.cssText = \`
          position: fixed;
          border: 2px solid #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          pointer-events: none;
          z-index: 10000;
          transition: all 0.2s ease;
          display: none;
        \`;
        document.body.appendChild(highlight);
        
        // Create selection overlay
        const selection = document.createElement('div');
        selection.style.cssText = \`
          position: fixed;
          border: 2px solid #10b981;
          background: rgba(16, 185, 129, 0.1);
          pointer-events: none;
          z-index: 10001;
          display: none;
        \`;
        document.body.appendChild(selection);
        
        // Create selection mode indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = \`
          position: fixed;
          top: 10px;
          right: 10px;
          background: #3b82f6;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 10002;
          font-family: Arial, sans-serif;
        \`;
        indicator.textContent = 'Element Selection Mode - Click to select';
        document.body.appendChild(indicator);
        
        function getElementSelector(element) {
          if (element.id) {
            return '#' + element.id;
          }
          
          let path = [];
          let current = element;
          
          while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.className) {
              const classes = current.className.split(' ').filter(c => c.trim());
              if (classes.length > 0) {
                selector += '.' + classes.join('.');
              }
            }
            
            const siblings = Array.from(current.parentNode?.children || []);
            const index = siblings.indexOf(current) + 1;
            if (siblings.length > 1) {
              selector += \`:nth-child(\${index})\`;
            }
            
            path.unshift(selector);
            current = current.parentNode;
          }
          
          return path.join(' > ');
        }
        
        function getElementContent(element) {
          if (element.tagName === 'IMG') {
            return {
              type: 'image',
              src: element.src,
              alt: element.alt || '',
              text: element.alt || ''
            };
          }
          
          const text = element.textContent?.trim() || '';
          const html = element.innerHTML;
          
          return {
            type: 'text',
            text: text,
            html: html
          };
        }
        
        function updateHighlight(element) {
          if (!element || !isSelectionMode) {
            highlight.style.display = 'none';
            return;
          }
          
          const rect = element.getBoundingClientRect();
          highlight.style.display = 'block';
          highlight.style.left = rect.left + 'px';
          highlight.style.top = rect.top + 'px';
          highlight.style.width = rect.width + 'px';
          highlight.style.height = rect.height + 'px';
        }
        
        function updateSelection(element) {
          if (!element) {
            selection.style.display = 'none';
            return;
          }
          
          const rect = element.getBoundingClientRect();
          selection.style.display = 'block';
          selection.style.left = rect.left + 'px';
          selection.style.top = rect.top + 'px';
          selection.style.width = rect.width + 'px';
          selection.style.height = rect.height + 'px';
        }
        
        // Mouse events
        document.addEventListener('mouseover', function(e) {
          if (!isSelectionMode || e.target === document.body || e.target === document.documentElement) return;
          
          hoveredElement = e.target;
          updateHighlight(hoveredElement);
        });
        
        document.addEventListener('mouseout', function(e) {
          if (hoveredElement === e.target) {
            hoveredElement = null;
            updateHighlight(null);
          }
        });
        
        document.addEventListener('click', function(e) {
          if (!isSelectionMode) return;
          
          e.preventDefault();
          e.stopPropagation();
          
          if (e.target === document.body || e.target === document.documentElement) return;
          
          selectedElement = e.target;
          updateSelection(selectedElement);
          
          const selector = getElementSelector(selectedElement);
          const content = getElementContent(selectedElement);
          
          // Send data to parent window
          window.parent.postMessage({
            type: 'ELEMENT_SELECTED',
            data: {
              selector: selector,
              content: content,
              tagName: selectedElement.tagName.toLowerCase(),
              className: selectedElement.className || '',
              id: selectedElement.id || ''
            }
          }, '*');
          
          // Visual feedback
          indicator.textContent = 'Element Selected!';
          indicator.style.background = '#10b981';
          setTimeout(() => {
            indicator.textContent = 'Element Selection Mode - Click to select';
            indicator.style.background = '#3b82f6';
          }, 2000);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            isSelectionMode = !isSelectionMode;
            if (!isSelectionMode) {
              updateHighlight(null);
              updateSelection(null);
              indicator.textContent = 'Selection Mode Disabled - Press ESC to enable';
              indicator.style.background = '#ef4444';
            } else {
              indicator.textContent = 'Element Selection Mode - Click to select';
              indicator.style.background = '#3b82f6';
            }
          }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
          if (hoveredElement) updateHighlight(hoveredElement);
          if (selectedElement) updateSelection(selectedElement);
        });
        
        // Disable all external scripts and tracking
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const url = args[0];
          if (typeof url === 'string' && (url.includes('/api/') || url.includes('/wp-admin/'))) {
            console.log('Blocked external API call:', url);
            return Promise.resolve(new Response('{}', { status: 200 }));
          }
          return originalFetch.apply(this, args);
        };
        
        // Block external AJAX calls
        if (window.XMLHttpRequest) {
          const originalOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...args) {
            if (typeof url === 'string' && (url.includes('/api/') || url.includes('/wp-admin/'))) {
              console.log('Blocked external XHR call:', url);
              return;
            }
            return originalOpen.apply(this, [method, url, ...args]);
          };
        }
        
        // Notify parent that script is loaded
        window.parent.postMessage({ type: 'PROXY_READY' }, '*');
      })();
    </script>
  `;

  // Insert script before closing body tag
  return modifiedHtml.replace("</body>", script + "</body>");
}
