const page = location.pathname.split('/').pop() || 'index.html';
const publicPages = ['login.html', 'register.html'];
if (!publicPages.includes(page) && localStorage.getItem('giftgenie-auth') !== 'true') {
	location.replace(`login.html?return=${encodeURIComponent(location.pathname + location.search)}`);
}
const backgroundStyles = document.createElement('link');
backgroundStyles.rel = 'stylesheet';
backgroundStyles.href = 'background.css';
document.head.appendChild(backgroundStyles);
if (page === 'recommend.html') {
	const finderStyles = document.createElement('link');
	finderStyles.rel = 'stylesheet';
	finderStyles.href = 'finder-theme.css';
	document.head.appendChild(finderStyles);
}
const nav = [['index.html','⌂ Home'],['recommend.html','♧ Gift Finder'],['gifts.html','▣ Products'],['about.html','ⓘ About Us'],['contact.html','✉ Contact Us']];
const header = `<div class="top-strip">✦ Free shipping on orders above ₹999 <span><a href="orders.html">Track Order</a><a href="products.html#saved">♡ Wishlist <b data-saved-count>(0)</b></a></span></div><header class="site-header"><a href="index.html" class="brand"><span class="gift-icon">▥</span><span><strong>GiftGenie</strong><small>Find the Perfect Gift</small></span></a><form class="search" data-search-form><input name="q" placeholder="Search for gifts, occasions..." aria-label="Search gifts"><button>⌕</button></form><div class="header-actions"><a href="products.html#saved">♡ <span>Wishlist <b data-saved-count>(0)</b></span></a><a href="cart.html">▣ <span>Cart <b data-cart-count>(0)</b></span></a><a href="login.html">♙ <span>Login / Signup</span></a></div></header><nav class="nav-bar">${nav.map(([href,label]) => `<a class="${href.split('.')[0] === page.split('.')[0] ? 'active' : ''}" href="${href}">${label}</a>`).join('')}</nav>`;
document.body.insertAdjacentHTML('afterbegin', header);
document.querySelector('.nav-bar')?.insertAdjacentHTML('beforeend', '<a class="feedback-nav" style="background:#ed2372;color:#fff;padding:8px 13px;border-radius:5px;font-weight:700" href="https://docs.google.com/forms/d/e/1FAIpQLSfT2VvHtaSVS4wPSpVhzDhgC1ffnagvzoXKYDuilmLrV0Za9g/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer">✦ Feedback</a>');
document.addEventListener('DOMContentLoaded', () => { const appLoader = document.createElement('script'); appLoader.src = 'app.js'; document.body.appendChild(appLoader);
 document.body.insertAdjacentHTML('beforeend', `<footer><div class="footer-brand">▥ <strong>GiftGenie</strong><small>Find the Perfect Gift</small></div><div><b>Quick Links</b><a href="index.html">Home</a><a href="recommend.html">Gift Finder</a><a href="gifts.html">Browse Gifts</a></div><div><b>Customer Service</b><a href="orders.html">My Orders</a><a href="contact.html">Contact Us</a><a href="about.html">About Us</a></div><div><b>Join Our Newsletter</b><p>Get extra gifting inspiration.</p><form data-newsletter><input type="email" placeholder="Your email address" required><button>Subscribe</button></form></div></footer>`); document.querySelectorAll('[data-newsletter]').forEach(form => form.addEventListener('submit', event => { event.preventDefault(); form.reset(); const node = document.querySelector('[data-toast]'); if (node) { node.textContent = 'You are on the gifting list'; node.classList.add('show'); setTimeout(() => node.classList.remove('show'), 2200); } })); });
document.addEventListener('DOMContentLoaded', () => { document.querySelector('footer')?.insertAdjacentHTML('beforeend', '<a class="footer-feedback" href="https://docs.google.com/forms/d/e/1FAIpQLSfT2VvHtaSVS4wPSpVhzDhgC1ffnagvzoXKYDuilmLrV0Za9g/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer">Open Feedback Form ↗</a>'); });
