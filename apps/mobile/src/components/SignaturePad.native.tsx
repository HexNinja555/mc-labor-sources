import { useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { signaturePadStyles as styles } from './signaturePadStyles';

const SIGNATURE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #fff; }
    canvas { display: block; width: 100%; height: 100%; touch-action: none; }
  </style>
</head>
<body>
  <canvas id="sig"></canvas>
  <script>
    const canvas = document.getElementById('sig');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let hasInk = false;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e293b';
    }

    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }

    function start(e) {
      e.preventDefault();
      drawing = true;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }

    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      hasInk = true;
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    function end() { drawing = false; }

    function clearPad() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
      resize();
    }

    function exportSig() {
      if (!hasInk) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Please sign before saving' }));
        return;
      }
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'signature', dataUrl: canvas.toDataURL('image/png') }));
    }

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);

    document.addEventListener('message', (e) => {
      const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg.action === 'clear') clearPad();
      if (msg.action === 'export') exportSig();
    });
    window.addEventListener('message', (e) => {
      const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg.action === 'clear') clearPad();
      if (msg.action === 'export') exportSig();
    });

    resize();
  </script>
</body>
</html>
`;

export type SignaturePadProps = {
  onSignature: (dataUrl: string) => void;
  onError?: (message: string) => void;
  height?: number;
};

export function SignaturePad({ onSignature, onError, height = 200 }: SignaturePadProps) {
  const webRef = useRef<WebView>(null);

  const postAction = useCallback((action: 'clear' | 'export') => {
    webRef.current?.postMessage(JSON.stringify({ action }));
  }, []);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as {
          type: string;
          dataUrl?: string;
          message?: string;
        };
        if (msg.type === 'signature' && msg.dataUrl) {
          onSignature(msg.dataUrl);
        } else if (msg.type === 'error' && msg.message) {
          onError?.(msg.message);
        }
      } catch {
        onError?.('Could not read signature');
      }
    },
    [onError, onSignature],
  );

  return (
    <View style={styles.wrap}>
      <View style={[styles.canvas, { height }]}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html: SIGNATURE_HTML }}
          onMessage={onMessage}
          scrollEnabled={false}
          bounces={false}
          style={styles.webview}
          javaScriptEnabled
        />
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.clearBtn} onPress={() => postAction('clear')}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={() => postAction('export')}>
          <Text style={styles.saveText}>Use signature</Text>
        </Pressable>
      </View>
    </View>
  );
}
