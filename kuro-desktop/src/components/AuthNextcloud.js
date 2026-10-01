/**
 * Service de connexion OAuth2 Nextcloud (Kuro Drive)
 * Permet de lier le client Desktop local au VPS client.
 */
class AuthNextcloud {
  constructor() {
    this.vpsUrl = localStorage.getItem('kuro_vps_url') || '';
    this.token = localStorage.getItem('kuro_vps_token') || '';
  }

  setVpsUrl(url) {
    this.vpsUrl = url.replace(/\/$/, '');
    localStorage.setItem('kuro_vps_url', this.vpsUrl);
  }

  getAuthorizeUrl() {
    if (!this.vpsUrl) throw new Error('URL du VPS client non renseignée');
    return `${this.vpsUrl}/index.php/apps/oauth2/authorize?response_type=code&client_id=kuro_desktop_client`;
  }

  async setToken(token) {
    this.token = token;
    localStorage.setItem('kuro_vps_token', token);
  }

  isConnected() {
    return !!this.token && !!this.vpsUrl;
  }

  renderForm(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="auth-card">
        <h3>🔗 Connexion au VPS Kuro Suite</h3>
        <p class="subtitle">Entrez l'URL de votre instance (ex: https://drive.client.com)</p>
        <div class="input-group">
          <input type="url" id="vps-url-input" placeholder="https://drive.votre-entreprise.com" value="${this.vpsUrl}" />
          <button id="vps-connect-btn">Se connecter via OAuth2</button>
        </div>
        <div id="auth-status" class="status-badge ${this.isConnected() ? 'connected' : 'disconnected'}">
          ${this.isConnected() ? '✅ Connecté au VPS Kuro' : '⚪ Non connecté'}
        </div>
      </div>
    `;

    document.getElementById('vps-connect-btn')?.addEventListener('click', () => {
      const url = document.getElementById('vps-url-input').value;
      if (url) {
        this.setVpsUrl(url);
        window.open(this.getAuthorizeUrl(), '_blank');
      }
    });
  }
}

if (typeof module !== 'undefined') module.exports = AuthNextcloud;
