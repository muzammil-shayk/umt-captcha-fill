// Copies the portal's plain-text captcha into the captcha field. Touches nothing else.
(() => {
  const VALID = /^[a-zA-Z0-9]{3,10}$/;
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  let lastFilled = '';

  function fill() {
    const form = document.getElementById('loginform');
    const span = form && form.querySelector('span.captcha');
    const input = form && form.querySelector('#SecurityCode');
    if (!span || !input) return false;
    // textContent, not innerText: CSS text-transform must not change the case.
    const code = span.textContent.trim();
    // Only fill an empty field or one still holding our own last fill; never overwrite the user's typing.
    if (!VALID.test(code) || code === input.value || (input.value && input.value !== lastFilled)) return true;
    setValue.call(input, code);
    lastFilled = code;
    for (const type of ['input', 'change', 'keyup']) input.dispatchEvent(new Event(type, { bubbles: true }));
    return true;
  }

  let found = fill();
  const observer = new MutationObserver(() => { found = fill() || found; });
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  // Give up if the login form never shows up (wrong page); keep watching for captcha refreshes once it has.
  setTimeout(() => { if (!found) observer.disconnect(); }, 15000);
})();
