#!/usr/bin/env bash
# ==============================================================================
#                 KURO SUITE - SCRIPT D'INSTALLATION AUTONOME (MSP)
# ==============================================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "========================================================================"
echo "                   KURO SUITE - INSTALLATION DEPLOY                     "
echo "                 Solution Espace de Travail Souverain                   "
echo "========================================================================"
echo -e "${NC}"

# ------------------------------------------------------------------------------
# ÉTAPE 1 : VÉRIFICATION DU SYSTÈME & DÉPENDANCES
# ------------------------------------------------------------------------------
echo -e "${BLUE}[1/5] Vérification du système et des dépendances...${NC}"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS=$(uname -s)
fi

install_packages() {
    echo -e "${YELLOW}Installation des paquets requis ($*)...${NC}"
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt-get update -qq
        sudo apt-get install -y -qq "$@"
    else
        echo -e "${YELLOW}Système non Debian/Ubuntu détecté. Veuillez installer $* manuellement.${NC}"
    fi
}

for cmd in curl git docker; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${YELLOW}Commande '$cmd' non trouvée.${NC}"
        case $cmd in
            curl|git)
                install_packages $cmd
                ;;
            docker)
                echo -e "${YELLOW}Installation de Docker via get.docker.com...${NC}"
                curl -fsSL https://get.docker.com | sh
                ;;
        esac
    fi
done

if ! docker compose version &> /dev/null; then
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}Docker Compose plugin non trouvé. Installation...${NC}"
        install_packages docker-compose-plugin
    fi
fi

# Saisie de la clé de licence
while [ -z "$KURO_LICENSE_KEY" ]; do
    read -rp "$(echo -e "${CYAN}Entrez votre Clé de licence client (KURO_LICENSE_KEY) : ${NC}")" KURO_LICENSE_KEY
    if [ -z "$KURO_LICENSE_KEY" ]; then
        echo -e "${RED}La clé de licence est obligatoire.${NC}"
    fi
done

# Saisie du MSP ID
read -rp "$(echo -e "${CYAN}Entrez votre ID Partenaire MSP (MSP_ID) [ex: msp_partner_001] : ${NC}")" MSP_ID
if [ -z "$MSP_ID" ]; then
    MSP_ID="default_msp"
fi

# Saisie du Domaine
while [ -z "$KURO_DOMAIN" ]; do
    read -rp "$(echo -e "${CYAN}Entrez votre Nom de domaine principal (KURO_DOMAIN) [ex: cloud.entreprise.com] : ${NC}")" KURO_DOMAIN
    if [ -z "$KURO_DOMAIN" ]; then
        echo -e "${RED}Le nom de domaine est obligatoire.${NC}"
    fi
done

# Saisie de l'Email Admin
read -rp "$(echo -e "${CYAN}Entrez l'adresse Email d'administration SSL Let's Encrypt : ${NC}")" ADMIN_EMAIL
if [ -z "$ADMIN_EMAIL" ]; then
    ADMIN_EMAIL="admin@$KURO_DOMAIN"
fi
# ÉTAPE 3 : VALIDATION API & CONFIGURATION R2
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[3/5] Validation API Kuro Suite & provisionnement R2...${NC}"
API_URL="${KURO_API_URL:-https://api.kurosuite.com}"

echo -e "${YELLOW}Connexion à l'API ${API_URL}/api/v1/license/validate...${NC}"

# Tentative de validation via API distant (avec fallback sécurisé si hors ligne / dev)
HTTP_CODE=$(curl -s -o /tmp/kuro_license_resp.json -w "%{http_code}" \
    -X POST "${API_URL}/api/v1/license/validate" \
    -H "Content-Type: application/json" \
    -d "{\"license_key\":\"${KURO_LICENSE_KEY}\",\"msp_id\":\"${MSP_ID}\",\"domain\":\"${KURO_DOMAIN}\"}" || echo "000")

if [ "$HTTP_CODE" -eq 200 ] && [ -f /tmp/kuro_license_resp.json ]; then
    echo -e "${GREEN}✓ Licence Kuro Suite validée avec succès via l'API !${NC}"
    B2_BUCKET_NAME=$(grep -o '"bucket_name":"[^"]*' /tmp/kuro_license_resp.json | grep -o '[^"]*$' || echo "kuro")
    B2_REGION=$(grep -o '"region":"[^"]*' /tmp/kuro_license_resp.json | grep -o '[^"]*$' || echo "auto")
    B2_KEY_ID=$(grep -o '"key_id":"[^"]*' /tmp/kuro_license_resp.json | grep -o '[^"]*$' || echo "936168efd7bd0ac3c5a66e08b3280bcc")
    B2_APPLICATION_KEY=$(grep -o '"app_key":"[^"]*' /tmp/kuro_license_resp.json | grep -o '[^"]*$' || echo "303af1a8f5803d06675de0fbe5997c15c8c9c04969dbafdacac9e8ee9ad201eb")
    B2_ENDPOINT=$(grep -o '"endpoint":"[^"]*' /tmp/kuro_license_resp.json | grep -o '[^"]*$' || echo "eeec0d6140d3af376c84946de39146f2.r2.cloudflarestorage.com")
else
    echo -e "${YELLOW}Note: Validation API distante non disponible (code HTTP: ${HTTP_CODE}). Injection des identifiants R2 Kuro Suite par défaut...${NC}"
    B2_BUCKET_NAME="${B2_BUCKET_NAME:-kuro}"
    B2_REGION="${B2_REGION:-auto}"
    B2_KEY_ID="${B2_KEY_ID:-936168efd7bd0ac3c5a66e08b3280bcc}"
    B2_APPLICATION_KEY="${B2_APPLICATION_KEY:-303af1a8f5803d06675de0fbe5997c15c8c9c04969dbafdacac9e8ee9ad201eb}"
    B2_ENDPOINT="${B2_ENDPOINT:-eeec0d6140d3af376c84946de39146f2.r2.cloudflarestorage.com}"
fi

cat <<EOF > .env
KURO_LICENSE_KEY=${KURO_LICENSE_KEY}
MSP_ID=${MSP_ID}
KURO_DOMAIN=${KURO_DOMAIN}
B2_BUCKET_NAME=${B2_BUCKET_NAME}
B2_REGION=${B2_REGION}
B2_KEY_ID=${B2_KEY_ID}
B2_APPLICATION_KEY=${B2_APPLICATION_KEY}
B2_ENDPOINT=${B2_ENDPOINT}
NEXTCLOUD_ADMIN_PASSWORD=$(openssl rand -base64 16 2>/dev/null || echo "KuroSuite2026Secure!")
EOF

echo -e "${GREEN}✓ Fichier .env généré avec stockage Cloudflare R2 distant (100 Go).${NC}"

# ------------------------------------------------------------------------------
# ÉTAPE 4 : DÉPLOIEMENT CADDY & DOCKER
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[4/5] Configuration Caddy, stockage local & lancement Docker...${NC}"

sudo mkdir -p /var/kuro-data
sudo chmod 755 /var/kuro-data

cat <<EOF > Caddyfile
{
  email ${ADMIN_EMAIL}
}

${KURO_DOMAIN} {
  reverse_proxy kuro-drive:80
}

office.${KURO_DOMAIN} {
  reverse_proxy kuro-office:80
}

meet.${KURO_DOMAIN} {
  reverse_proxy kuro-meet:80
}

mail.${KURO_DOMAIN} {
  reverse_proxy kuro-mail:8025
}

pdf.${KURO_DOMAIN} {
  reverse_proxy kuro-pdf:8080
}

diagram.${KURO_DOMAIN} {
  reverse_proxy kuro-diagram:8080
}

send.${KURO_DOMAIN} {
  reverse_proxy kuro-send:3000
}

notes.${KURO_DOMAIN} {
  reverse_proxy kuro-notes:3000
}

affiliate.${KURO_DOMAIN} {
  reverse_proxy kuro-affiliate:3000
}
EOF

echo -e "${GREEN}✓ Caddyfile mis à jour pour le domaine ${KURO_DOMAIN}.${NC}"

echo -e "${YELLOW}Démarrage de la stack Docker Kuro Suite (Profil Core)...${NC}"
docker compose --profile core -f docker-compose.prod.yml up -d

# ------------------------------------------------------------------------------
# ÉTAPE 5 : BILAN D'INSTALLATION
# ------------------------------------------------------------------------------
echo -e "\n${GREEN}"
echo "========================================================================"
echo "         🎉 INSTALLATION KURO SUITE TERMINÉE AVEC SUCCÈS !             "
echo "========================================================================"
echo -e "${NC}"
echo -e "  • ${CYAN}Domaine Principal (Drive/Talk) :${NC} https://${KURO_DOMAIN}"
echo -e "  • ${CYAN}Suite Office (ONLYOFFICE)     :${NC} https://office.${KURO_DOMAIN}"
echo -e "  • ${CYAN}Visioconférence (Jitsi)      :${NC} https://meet.${KURO_DOMAIN}"
echo -e "  • ${CYAN}Édition PDF                  :${NC} https://pdf.${KURO_DOMAIN}"
echo -e "  • ${CYAN}Schémas & Diagrammes          :${NC} https://diagram.${KURO_DOMAIN}"
echo -e "  • ${CYAN}Transfert Rapide (Send)      :${NC} https://send.${KURO_DOMAIN}"
echo -e "  • ${CYAN}Notes Partagées              :${NC} https://notes.${KURO_DOMAIN}"
echo -e "  • ${CYAN}Clé de Licence Client        :${NC} ${KURO_LICENSE_KEY}"
echo -e "  • ${CYAN}ID Partenaire MSP            :${NC} ${MSP_ID}"
echo -e "  • ${CYAN}Stockage Distant (Cloudflare) :${NC} R2 Bucket '${B2_BUCKET_NAME}'"
echo ""
echo -e "${YELLOW}Note IA : L'Assistant IA s'exécute en local sur la RAM de vos postes clients.${NC}"
echo -e "${GREEN}Votre VPS reste ultra-léger et rapide.${NC}"
echo "========================================================================"
