(function () {
  function initKalemlyAI() {
    var elem = document.querySelector('KalemlyAI, [chatbot-id]');
    var chatbotId = elem ? elem.getAttribute('chatbot-id') : 'demo-bot';
    
    if (document.getElementById('kalemly-ai-iframe-container')) return;

    var container = document.createElement('div');
    container.id = 'kalemly-ai-iframe-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999999';
    container.style.background = 'transparent';
    container.style.pointerEvents = 'none';

    var host = window.location.origin;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      host = 'http://localhost:3000';
    }

    var iframe = document.createElement('iframe');
    iframe.src = host + '/embed/' + chatbotId;
    iframe.style.width = '420px';
    iframe.style.height = '680px';
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';
    iframe.style.backgroundColor = 'transparent';
    iframe.style.colorScheme = 'normal';
    iframe.style.pointerEvents = 'auto';
    iframe.allowTransparency = 'true';
    iframe.setAttribute('allowtransparency', 'true');

    container.appendChild(iframe);
    document.body.appendChild(container);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initKalemlyAI();
  } else {
    document.addEventListener('DOMContentLoaded', initKalemlyAI);
  }
})();
